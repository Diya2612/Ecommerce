/**
 * Cart Queries
 * Reusable database operations for carts and cart items.
 */

import { eq, and, sql, isNull, or } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { carts, type Cart, type NewCart } from './carts.schema';
import { cartItems, type CartItem, type NewCartItem } from './cart-items.schema';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';
import { inventory } from '../../inventory/shared/inventory.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Cart CRUD Operations */

/** Find active cart by user ID. */
export const findActiveCartByUserId = async (
  userId: string,
  tx: Database = db,
): Promise<Cart | undefined> => {
  const [cart] = await tx
    .select()
    .from(carts)
    .where(
      and(eq(carts.user_id, userId), eq(carts.cart_status, 'active'), eq(carts.is_deleted, false)),
    )
    .limit(1);

  return cart;
};

/** Find active cart by session ID (guest users). */
export const findActiveCartBySessionId = async (
  sessionId: string,
  tx: Database = db,
): Promise<Cart | undefined> => {
  const [cart] = await tx
    .select()
    .from(carts)
    .where(
      and(
        eq(carts.session_id, sessionId),
        eq(carts.cart_status, 'active'),
        eq(carts.is_deleted, false),
      ),
    )
    .limit(1);

  return cart;
};

/** Find cart by session ID (any status). */
export const findCartBySessionId = async (
  sessionId: string,
  tx: Database = db,
): Promise<Cart | undefined> => {
  const [cart] = await tx
    .select()
    .from(carts)
    .where(and(eq(carts.session_id, sessionId), eq(carts.is_deleted, false)))
    .limit(1);

  return cart;
};

/** Find cart by ID (any status). */
export const findCartById = async (
  cartId: string,
  tx: Database = db,
): Promise<Cart | undefined> => {
  const [cart] = await tx.select().from(carts).where(eq(carts.id, cartId)).limit(1);

  return cart;
};

/** Check if unmerged guest cart exists. */
export const hasUnmergedGuestCart = async (
  sessionId: string,
  tx: Database = db,
): Promise<boolean> => {
  const [cart] = await tx
    .select({ id: carts.id })
    .from(carts)
    .where(
      and(
        eq(carts.session_id, sessionId),
        eq(carts.cart_status, 'active'),
        eq(carts.is_deleted, false),
      ),
    )
    .limit(1);

  return !!cart;
};

/** Create new cart. */
export const createCart = async (data: NewCart, tx: Database = db): Promise<Cart> => {
  const [cart] = await tx.insert(carts).values(data).returning();
  return cart;
};

/** Update cart totals after item modifications. */
export const updateCartTotals = async (
  cartId: string,
  totals: {
    subtotal: string;
    discount_total: string;
    shipping_total?: string;
    tax_total?: string;
    grand_total: string;
  },
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({
      ...totals,
      last_activity_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/** Mark cart as converted after successful order. */
export const markCartAsConverted = async (cartId: string, tx: Database = db): Promise<void> => {
  await tx
    .update(carts)
    .set({
      cart_status: 'converted',
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/** Mark cart as abandoned. */
export const markCartAsAbandoned = async (cartId: string, tx: Database = db): Promise<void> => {
  await tx
    .update(carts)
    .set({
      cart_status: 'abandoned',
      abandoned_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/** Soft delete cart. */
export const softDeleteCart = async (
  cartId: string,
  deletedBy?: string,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy || null,
    })
    .where(eq(carts.id, cartId));
};

/** Transfer cart ownership from guest to user. */
export const transferCartOwnership = async (
  cartId: string,
  userId: string,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({
      user_id: userId,
      session_id: null,
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/** Cart Item CRUD Operations */

/** Get all active cart items. */
export const getCartItems = async (cartId: string, tx: Database = db): Promise<CartItem[]> => {
  return tx
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
};

/** Find cart item by product/variant. */
export const findCartItemByProduct = async (
  cartId: string,
  productId: string,
  variantId: string | null = null,
  tx: Database = db,
): Promise<CartItem | undefined> => {
  const conditions = [
    eq(cartItems.cart_id, cartId),
    eq(cartItems.product_id, productId),
    eq(cartItems.is_deleted, false),
  ];

  if (variantId) {
    conditions.push(eq(cartItems.variant_id, variantId));
  } else {
    conditions.push(isNull(cartItems.variant_id));
  }

  const [item] = await tx
    .select()
    .from(cartItems)
    .where(and(...conditions))
    .limit(1);

  return item;
};

/** Find cart item by ID. */
export const findCartItemById = async (
  itemId: string,
  tx: Database = db,
): Promise<CartItem | undefined> => {
  const [item] = await tx
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.is_deleted, false)))
    .limit(1);

  return item;
};

/** Create cart item. */
export const createCartItem = async (data: NewCartItem, tx: Database = db): Promise<CartItem> => {
  const [item] = await tx.insert(cartItems).values(data).returning();
  return item;
};

/** Update cart item quantity and line totals. */
export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number,
  lineTotals: {
    line_subtotal: string;
    line_total: string;
    discount_amount: string;
  },
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(cartItems)
    .set({
      quantity,
      ...lineTotals,
      updated_at: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

/** Update cart item. */
export const updateCartItem = async (
  itemId: string,
  data: Partial<CartItem>,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(cartItems)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

/** Update cart item pricing. */
export const updateCartItemPricing = async (
  itemId: string,
  pricing: {
    cost_price: string;
    final_price: string;
    discount_amount: string;
    line_subtotal: string;
    line_total: string;
  },
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(cartItems)
    .set({
      ...pricing,
      updated_at: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

/** Soft delete cart item. */
export const softDeleteCartItem = async (itemId: string, tx: Database = db): Promise<void> => {
  await tx
    .update(cartItems)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

/** Soft delete all cart items. */
export const softDeleteAllCartItems = async (cartId: string, tx: Database = db): Promise<void> => {
  await tx
    .update(cartItems)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .where(eq(cartItems.cart_id, cartId));
};

/** Stock & Product Utilities */

/** Get available stock for product/variant. */
export const getAvailableStock = async (
  productId: string,
  variantId: string | null = null,
  tx: Database = db,
): Promise<number> => {
  if (variantId) {
    // Specific variant check - directly get the net stock
    const [stockData] = await tx
      .select({
        totalStock: sql<number>`${inventory.available_quantity} - ${inventory.committed_quantity}`,
      })
      .from(inventory)
      .where(eq(inventory.variant_id, variantId))
      .limit(1);

    return Number(stockData?.totalStock) || 0;
  }

  // Product-wide check: standalone inventory row + all variant inventory rows for this product
  const [stockData] = await tx
    .select({
      totalStock: sql<number>`SUM(${inventory.available_quantity} - ${inventory.committed_quantity})`,
    })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(
      or(
        and(eq(inventory.product_id, productId), isNull(inventory.variant_id)),
        eq(productVariants.product_id, productId),
      ),
    );

  return Number(stockData?.totalStock) || 0;
};

/** Get product details for cart item enrichment. */
export const getProductDetailsForCart = async (productId: string, tx: Database = db) => {
  const [product] = await tx
    .select({
      id: products.id,
      product_title: products.product_title,
      primary_image_url: products.primary_image_url,
      sku: products.sku,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      status: products.status,
      has_variants: products.has_variants,
      max_order_quantity: products.max_order_quantity,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.is_deleted, false)))
    .limit(1);

  return product;
};
