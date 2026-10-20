/**
 * Cart Item Service
 * Handles operations for individual cart items including stock reservation.
 */

import { db } from '../../../database';
import { sql, eq, and, isNull } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../../database';
import { HttpException } from '../../../utils';
import { CartItem, NewCartItem, cartItems } from '../shared/cart-items.schema';
import { ICartItemResponse } from '../shared/interface';
import { calculateItemPricing } from '../utils/pricing.util';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';
import {
  getCartItems,
  findCartItemByProduct,
  findCartItemById,
  createCartItem,
  updateCartItemQuantity,
  softDeleteCartItem,
  softDeleteAllCartItems,
  getProductDetailsForCart,
} from '../shared/queries';
import { reserveCartStock, releaseCartStock } from '../../inventory/services';
import { CART_RESERVATION_CONFIG } from '../config/cart-reservation.config';
import { inventory } from '../../inventory/shared/inventory.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Get cart items with product details for display. */
const getCartItemsWithProducts = async (cartId: string, tx: Database = db) => {
  return tx
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      variant_id: cartItems.variant_id,
      quantity: cartItems.quantity,
      cost_price: cartItems.cost_price,
      final_price: cartItems.final_price,
      discount_amount: cartItems.discount_amount,
      line_subtotal: cartItems.line_subtotal,
      line_total: cartItems.line_total,
      product_name: cartItems.product_name,
      product_image_url: cartItems.product_image_url,
      product_sku: cartItems.product_sku,
      saved_for_later: cartItems.saved_for_later,
      price_at_add: cartItems.price_at_add,
      created_at: cartItems.created_at,
      updated_at: cartItems.updated_at,
      current_price: products.selling_price,
      current_image: products.primary_image_url,
      product_status: products.status,
      max_order_quantity: products.max_order_quantity,
      variant_status: productVariants.is_active,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.product_id, products.id))
    .leftJoin(productVariants, eq(cartItems.variant_id, productVariants.id))
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
};

/** Get variant details for cart. */
const getVariantDetailsForCart = async (variantId: string, tx: Database = db) => {
  const [variant] = await tx
    .select({
      id: productVariants.id,
      product_id: productVariants.product_id,
      option_name: productVariants.option_name,
      option_value: productVariants.option_value,
      sku: productVariants.sku,
      selling_price: productVariants.selling_price,
      compare_at_price: productVariants.compare_at_price,
      image_url: productVariants.image_url,
      is_active: productVariants.is_active,
    })
    .from(productVariants)
    .where(and(eq(productVariants.id, variantId), eq(productVariants.is_deleted, false)))
    .limit(1);

  return variant;
};

/** Default low-stock threshold when per-SKU value is 0 or not set. */
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/** Get available stock AND low_stock_threshold for a product/variant. */
const getStockWithThreshold = async (
  productId: string,
  variantId: string | null,
  tx: Database = db,
): Promise<{ sellable: number; lowStockThreshold: number }> => {
  const filter = variantId
    ? eq(inventory.variant_id, variantId)
    : and(eq(inventory.product_id, productId), isNull(inventory.variant_id));

  if (!filter) {
    throw new Error('Invalid inventory filter parameters');
  }

  const [row] = await tx
    .select({
      sellable: sql<number>`${inventory.available_quantity} - ${inventory.committed_quantity}`,
      lowStockThreshold: inventory.low_stock_threshold,
    })
    .from(inventory)
    .where(filter)
    .limit(1);

  return {
    sellable: Number(row?.sellable) || 0,
    lowStockThreshold:
      row?.lowStockThreshold && row.lowStockThreshold > 0
        ? row.lowStockThreshold
        : DEFAULT_LOW_STOCK_THRESHOLD,
  };
};

export class CartItemService {
  /** Add item to cart with stock validation and reservation. */
  async addItem(
    cartId: string,
    data: {
      product_id: string;
      variant_id?: string;
      quantity: number;
    },
  ): Promise<CartItem> {
    const { product_id, variant_id, quantity } = data;

    // P1-1: Enforce max distinct line items per cart
    const existingItems = await getCartItems(cartId);
    const alreadyInCart = existingItems.some(
      (item) => item.product_id === product_id && item.variant_id === (variant_id || null),
    );
    if (!alreadyInCart && existingItems.length >= CART_RESERVATION_CONFIG.MAX_CART_ITEMS) {
      throw new HttpException(
        400,
        `Cart cannot have more than ${CART_RESERVATION_CONFIG.MAX_CART_ITEMS} items`,
      );
    }

    const product = await getProductDetailsForCart(product_id);
    if (!product) throw new HttpException(404, 'Product not found');
    if (product.status !== 'active')
      throw new HttpException(400, 'Product is not available for purchase');

    let variant = null;
    const actualVariantId = variant_id;

    if (actualVariantId) {
      variant = await getVariantDetailsForCart(actualVariantId);
      if (!variant) throw new HttpException(404, 'Variant not found');
      if (variant.product_id !== product_id)
        throw new HttpException(400, 'Variant does not belong to product');
      if (!variant.is_active) throw new HttpException(400, 'Variant is not available');
    }
    // When no variant_id is provided for a product that has variants, the caller intends
    // to add the BASE product (no variant).  The inventory check below uses
    // `variant_id IS NULL` in that case, so stock is validated correctly.

    return db.transaction(async (tx) => {
      const inventoryFilter = actualVariantId
        ? eq(inventory.variant_id, actualVariantId)
        : and(eq(inventory.product_id, product_id), isNull(inventory.variant_id));

      if (!inventoryFilter) throw new HttpException(500, 'Failed to create inventory filter');

      const [stockData] = await tx
        .select({
          id: inventory.id,
          totalStock: sql<number>`${inventory.available_quantity} - ${inventory.committed_quantity}`,
        })
        .from(inventory)
        .where(inventoryFilter)
        .for('update');

      if (!stockData) throw new HttpException(404, 'Product/Variant inventory not found');

      const totalStock = Number(stockData.totalStock) || 0;

      const existingItem = await findCartItemByProduct(
        cartId,
        product_id,
        actualVariantId || null,
        tx,
      );

      // Available stock for this user: totalStock already excludes committed qty,
      // but this user's own reservation (if any) is included in committed.
      // Add it back so the check reflects what's really available after release + re-reserve.
      const stockForUser = totalStock + (existingItem?.quantity ?? 0);

      if (stockForUser < quantity)
        throw new HttpException(400, `Insufficient stock. Only ${stockForUser} units available.`);

      // P1-2: Enforce per-product maximum order quantity
      const maxQty =
        product.max_order_quantity && product.max_order_quantity > 0
          ? product.max_order_quantity
          : CART_RESERVATION_CONFIG.MAX_QUANTITY_PER_PRODUCT;
      const resultingQty = existingItem ? existingItem.quantity + quantity : quantity;
      if (resultingQty > maxQty) {
        throw new HttpException(400, `Maximum ${maxQty} units allowed per order for this product`);
      }

      const sellingPrice = Number(variant ? variant.selling_price : product.selling_price);
      const compareAtPrice = Number(
        (variant ? variant.compare_at_price : product.compare_at_price) || sellingPrice,
      );

      const itemSku = variant ? variant.sku : product.sku;
      const itemName = variant
        ? `${product.product_title} - ${variant.option_value}`
        : product.product_title;
      const itemImage = variant?.image_url || product.primary_image_url;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (stockForUser < newQuantity)
          throw new HttpException(
            400,
            `Cannot add more items. Only ${stockForUser - existingItem.quantity} additional units available.`,
          );

        const {
          lineSubtotal,
          lineTotal,
          discountAmount: totalDiscountAmount,
        } = calculateItemPricing(sellingPrice, compareAtPrice, newQuantity);

        await updateCartItemQuantity(
          existingItem.id,
          newQuantity,
          {
            line_subtotal: lineSubtotal,
            line_total: lineTotal,
            discount_amount: totalDiscountAmount,
          },
          tx,
        );

        if (CART_RESERVATION_CONFIG.ENABLED) {
          await releaseCartStock(existingItem.id, tx);
          await reserveCartStock(
            product_id,
            newQuantity,
            existingItem.id,
            CART_RESERVATION_CONFIG.RESERVATION_TIMEOUT,
            tx,
            true,
            actualVariantId,
          );
        }

        const updatedItem = await findCartItemById(existingItem.id, tx);
        if (!updatedItem) throw new HttpException(404, 'Cart item not found after update');
        return updatedItem;
      } else {
        const {
          lineSubtotal,
          lineTotal,
          discountAmount: totalDiscountAmount,
        } = calculateItemPricing(sellingPrice, compareAtPrice, quantity);

        const newItem: NewCartItem = {
          cart_id: cartId,
          product_id,
          variant_id: actualVariantId || null,
          quantity,
          cost_price: compareAtPrice.toFixed(2),
          final_price: sellingPrice.toFixed(2),
          discount_amount: totalDiscountAmount,
          line_subtotal: lineSubtotal,
          line_total: lineTotal,
          product_name: itemName,
          product_image_url: itemImage,
          product_sku: itemSku,
          price_at_add: sellingPrice.toFixed(2),
        };

        const cartItem = await createCartItem(newItem, tx);

        if (CART_RESERVATION_CONFIG.ENABLED && cartItem) {
          await reserveCartStock(
            product_id,
            quantity,
            cartItem.id,
            CART_RESERVATION_CONFIG.RESERVATION_TIMEOUT,
            tx,
            true,
            actualVariantId,
          );
        }

        return cartItem;
      }
    });
  }

  /** Update cart item quantity with validation and reservation update. */
  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const cartItem = await findCartItemById(itemId);
    if (!cartItem) throw new HttpException(404, 'Cart item not found');
    if (!cartItem.product_id) throw new HttpException(400, 'Cart item has no associated product');

    const productId = cartItem.product_id;
    let currentPrice = Number(cartItem.final_price);
    let comparePrice = Number(cartItem.cost_price);

    // Fetch product once for status + max_order_quantity checks
    const product = await getProductDetailsForCart(cartItem.product_id);

    if (cartItem.variant_id) {
      const variant = await getVariantDetailsForCart(cartItem.variant_id);
      // P1-3: Re-check variant availability on quantity update
      if (!variant || !variant.is_active) {
        throw new HttpException(400, 'Variant is no longer available');
      }
      currentPrice = Number(variant.selling_price);
      comparePrice = variant.compare_at_price ? Number(variant.compare_at_price) : currentPrice;
    } else {
      // P1-3: Re-check product availability on quantity update
      if (!product || product.status !== 'active') {
        throw new HttpException(400, 'Product is no longer available for purchase');
      }
      currentPrice = Number(product.selling_price);
      comparePrice = product.compare_at_price ? Number(product.compare_at_price) : currentPrice;
    }

    // P1-2: Enforce per-product maximum order quantity on update
    const maxQty =
      product && product.max_order_quantity && product.max_order_quantity > 0
        ? product.max_order_quantity
        : CART_RESERVATION_CONFIG.MAX_QUANTITY_PER_PRODUCT;
    if (quantity > maxQty) {
      throw new HttpException(400, `Maximum ${maxQty} units allowed per order for this product`);
    }

    const {
      lineSubtotal,
      lineTotal,
      discountAmount: totalDiscountAmount,
    } = calculateItemPricing(currentPrice, comparePrice, quantity);

    return db.transaction(async (tx) => {
      // Lock cart item row
      await tx
        .select({ id: sql`${itemId}` })
        .from(sql`cart_items`)
        .where(sql`id = ${itemId}`)
        .for('update');

      const inventoryFilter = cartItem.variant_id
        ? eq(inventory.variant_id, cartItem.variant_id)
        : and(eq(inventory.product_id, productId), isNull(inventory.variant_id));

      if (!inventoryFilter) throw new HttpException(500, 'Failed to create inventory filter');

      // Lock inventory and check available stock
      const [stockData] = await tx
        .select({
          id: inventory.id,
          totalStock: sql<number>`${inventory.available_quantity} - ${inventory.committed_quantity}`,
        })
        .from(inventory)
        .where(inventoryFilter)
        .for('update');

      const totalStock = Number(stockData?.totalStock) || 0;
      // When updating quantity, we check if there's enough REMAINING stock PLUS what we already have
      const additionalNeeded = quantity - cartItem.quantity;
      if (additionalNeeded > 0 && totalStock < additionalNeeded)
        throw new HttpException(
          400,
          `Insufficient stock. Only ${totalStock} additional units available.`,
        );

      await updateCartItemQuantity(
        itemId,
        quantity,
        {
          line_subtotal: lineSubtotal,
          line_total: lineTotal,
          discount_amount: totalDiscountAmount,
        },
        tx,
      );

      if (CART_RESERVATION_CONFIG.ENABLED) {
        await releaseCartStock(itemId, tx);
        await reserveCartStock(
          productId,
          quantity,
          itemId,
          CART_RESERVATION_CONFIG.RESERVATION_TIMEOUT,
          tx,
          true,
          cartItem.variant_id || undefined,
        );
      }

      const updatedItem = await findCartItemById(itemId, tx);
      if (!updatedItem) throw new HttpException(404, 'Cart item not found after update');
      return updatedItem;
    });
  }

  /** Remove cart item and release reservation. */
  async removeItem(itemId: string): Promise<void> {
    const cartItem = await findCartItemById(itemId);
    if (!cartItem) throw new HttpException(404, 'Cart item not found');

    if (CART_RESERVATION_CONFIG.ENABLED) await releaseCartStock(itemId);
    await softDeleteCartItem(itemId);
  }

  /** Clear all items from cart and release reservations. */
  async clearAllItems(cartId: string): Promise<void> {
    const items = await getCartItems(cartId);
    if (CART_RESERVATION_CONFIG.ENABLED) {
      for (const item of items) await releaseCartStock(item.id);
    }
    await softDeleteAllCartItems(cartId);
  }

  /** Get basic cart items. */
  async getItems(cartId: string): Promise<CartItem[]> {
    return getCartItems(cartId);
  }

  /** Get cart items with enriched details and stock status for display. */
  async getItemsWithDetails(cartId: string): Promise<ICartItemResponse[]> {
    const items = await getCartItemsWithProducts(cartId);

    const enrichedItems: ICartItemResponse[] = await Promise.all(
      items.map(async (item) => {
        let availableStock = 0;
        let inStock = true;
        let lowStock = false;
        let stockMessage: string | null = null;

        if (item.product_id) {
          const { sellable, lowStockThreshold } = await getStockWithThreshold(
            item.product_id,
            item.variant_id || null,
          );
          availableStock = sellable;

          // totalAvailableForUser = sellable (Avail - Committed) + what IS already in this cart item
          const totalAvailableForUser = availableStock + item.quantity;

          const isProductActive = item.product_status === 'active';
          const isVariantActive = item.variant_id ? item.variant_status === true : true;

          inStock = totalAvailableForUser >= item.quantity && isProductActive && isVariantActive;
          availableStock = Math.max(0, totalAvailableForUser);

          // Low-stock warning when item is in stock but available qty is at or below threshold
          if (inStock && availableStock > 0 && availableStock <= lowStockThreshold) {
            lowStock = true;
            stockMessage = `Only ${availableStock} left in stock!`;
          }
        } else {
          inStock = false;
        }

        const priceChanged = item.current_price !== null && item.final_price !== item.current_price;

        const priceAtAdd = item.price_at_add || null;
        let priceChangeAmount: string | null = null;
        if (priceAtAdd && item.current_price !== null) {
          const diff = Number(item.current_price) - Number(priceAtAdd);
          if (diff !== 0) priceChangeAmount = diff.toFixed(2);
        }

        return {
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          cost_price: item.cost_price,
          final_price: item.final_price,
          discount_amount: item.discount_amount,
          line_subtotal: item.line_subtotal,
          line_total: item.line_total,
          product_name: item.product_name,
          product_image_url: item.current_image || item.product_image_url,
          product_sku: item.product_sku,
          inStock,
          availableStock,
          maxOrderQuantity:
            item.max_order_quantity && item.max_order_quantity > 0
              ? item.max_order_quantity
              : CART_RESERVATION_CONFIG.MAX_QUANTITY_PER_PRODUCT,
          lowStock,
          stockMessage,
          priceChanged,
          currentPrice: item.current_price,
          priceAtAdd,
          priceChangeAmount,
          saved_for_later: item.saved_for_later ?? false,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      }),
    );

    return enrichedItems;
  }

  /** Move an active cart item to "saved for later" — releases its reservation. */
  async saveForLater(cartItemId: string): Promise<void> {
    const item = await findCartItemById(cartItemId);
    if (!item) throw new HttpException(404, 'Cart item not found');
    if (item.saved_for_later) throw new HttpException(400, 'Item is already saved for later');

    // Release stock reservation
    await releaseCartStock(cartItemId);

    await db
      .update(cartItems)
      .set({ saved_for_later: true, updated_at: new Date() })
      .where(eq(cartItems.id, cartItemId));
  }

  /** Move a "saved for later" item back into the active cart — re-reserves stock. */
  async moveToCart(cartItemId: string): Promise<void> {
    const item = await findCartItemById(cartItemId);
    if (!item) throw new HttpException(404, 'Cart item not found');
    if (!item.saved_for_later) throw new HttpException(400, 'Item is already in the cart');

    // Check stock before re-reserving
    if (item.product_id) {
      const { sellable } = await getStockWithThreshold(item.product_id, item.variant_id || null);
      if (sellable < item.quantity) {
        throw new HttpException(
          409,
          `Only ${Math.max(0, sellable)} units available. Cannot move ${item.quantity} back to cart.`,
        );
      }
    }

    // Re-reserve stock
    if (item.product_id && CART_RESERVATION_CONFIG.ENABLED) {
      await reserveCartStock(
        item.product_id,
        item.quantity,
        cartItemId,
        CART_RESERVATION_CONFIG.RESERVATION_TIMEOUT,
        undefined,
        true,
        item.variant_id,
      );
    }

    await db
      .update(cartItems)
      .set({ saved_for_later: false, updated_at: new Date() })
      .where(eq(cartItems.id, cartItemId));
  }

  /**
   * Atomically switch a cart item from one variant to another.
   * Releases old reservation, validates new variant stock, creates new reservation.
   */
  async switchVariant(cartItemId: string, newVariantId: string): Promise<CartItem> {
    const item = await findCartItemById(cartItemId);
    if (!item) throw new HttpException(404, 'Cart item not found');
    if (!item.product_id) throw new HttpException(400, 'Cart item has no product');
    if (item.variant_id === newVariantId) throw new HttpException(400, 'Same variant selected');

    const product = await getProductDetailsForCart(item.product_id);
    if (!product) throw new HttpException(404, 'Product not found');

    const variant = await getVariantDetailsForCart(newVariantId);
    if (!variant) throw new HttpException(404, 'Variant not found');
    if (variant.product_id !== item.product_id)
      throw new HttpException(400, 'Variant does not belong to this product');
    if (!variant.is_active) throw new HttpException(400, 'Variant is not available');

    return db.transaction(async (tx) => {
      // Release old reservation
      await releaseCartStock(cartItemId, tx);

      // Check new variant stock
      const inventoryFilter = eq(inventory.variant_id, newVariantId);
      const [stockData] = await tx
        .select({
          id: inventory.id,
          totalStock: sql<number>`${inventory.available_quantity} - ${inventory.committed_quantity}`,
        })
        .from(inventory)
        .where(inventoryFilter)
        .for('update');

      if (!stockData) throw new HttpException(404, 'Variant inventory not found');
      const totalStock = Number(stockData.totalStock) || 0;
      if (totalStock < item.quantity)
        throw new HttpException(400, `Insufficient stock. Only ${totalStock} units available.`);

      // Recalculate pricing with new variant
      const sellingPrice = Number(variant.selling_price);
      const compareAtPrice = Number(variant.compare_at_price || sellingPrice);
      const {
        lineSubtotal,
        lineTotal,
        discountAmount: totalDiscountAmount,
      } = calculateItemPricing(sellingPrice, compareAtPrice, item.quantity);

      const itemName = `${product.product_title} - ${variant.option_value}`;
      const itemImage = variant.image_url || product.primary_image_url;
      const itemSku = variant.sku;

      // Update cart item
      await tx
        .update(cartItems)
        .set({
          variant_id: newVariantId,
          cost_price: compareAtPrice.toFixed(2),
          final_price: sellingPrice.toFixed(2),
          discount_amount: totalDiscountAmount,
          line_subtotal: lineSubtotal,
          line_total: lineTotal,
          product_name: itemName,
          product_image_url: itemImage,
          product_sku: itemSku,
          updated_at: new Date(),
        })
        .where(eq(cartItems.id, cartItemId));

      // Reserve stock for new variant
      if (CART_RESERVATION_CONFIG.ENABLED && item.product_id) {
        await reserveCartStock(
          item.product_id,
          item.quantity,
          cartItemId,
          CART_RESERVATION_CONFIG.RESERVATION_TIMEOUT,
          tx,
          true,
          newVariantId,
        );
      }

      const updatedItem = await findCartItemById(cartItemId, tx);
      if (!updatedItem) throw new HttpException(500, 'Failed to update cart item variant');
      return updatedItem;
    });
  }
}

export const cartItemService = new CartItemService();
