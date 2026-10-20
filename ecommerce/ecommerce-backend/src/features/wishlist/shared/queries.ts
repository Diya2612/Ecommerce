import { eq, and, inArray, or, sql } from 'drizzle-orm';
import { db } from '../../../database';
import { wishlists, NewWishlist } from './wishlist.schema';
import { wishlistItems } from './wishlist-items.schema';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';
import { inventory } from '../../inventory/shared/inventory.schema';
import { reviews } from '../../reviews/shared/reviews.schema';
import { carts, NewCart } from '../../cart/shared/carts.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';

/**
 * Find wishlist by User ID
 */
export const baseFindWishlistByUserId = async (userId: string) => {
  const [wishlist] = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.user_id, userId), eq(wishlists.status, true)))
    .limit(1);
  return wishlist || null;
};

/**
 * Insert new wishlist
 */
export const baseInsertWishlist = async (data: NewWishlist) => {
  const [newWishlist] = await db.insert(wishlists).values(data).returning({ id: wishlists.id });
  return newWishlist;
};

/**
 * Find items with product details
 */
export const baseFindWishlistItemsWithProducts = async (wishlistId: string) => {
  return db
    .select({
      product_id: wishlistItems.product_id,
      notes: wishlistItems.notes,
      added_at: wishlistItems.added_at,
      added_to_cart_at: wishlistItems.added_to_cart_at,
      purchased_at: wishlistItems.purchased_at,
      product_name: products.product_title,
      product_image: products.primary_image_url,
      slug: products.slug,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      sku: products.sku,
      product_status: products.status,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.product_id, products.id))
    .where(eq(wishlistItems.wishlist_id, wishlistId));
};

/**
 * Get inventory for products
 */
export const baseGetInventoryRecords = async (productIds: string[]) => {
  if (productIds.length === 0) return [];
  return db
    .select({
      product_id: sql<string>`COALESCE(${inventory.product_id}, ${productVariants.product_id})`,
      available_quantity: sql<number>`COALESCE(SUM(${inventory.available_quantity}), 0)`,
      committed_quantity: sql<number>`COALESCE(SUM(${inventory.committed_quantity}), 0)`,
    })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(
      or(
        inArray(inventory.product_id, productIds),
        inArray(productVariants.product_id, productIds),
      ),
    )
    .groupBy(sql`COALESCE(${inventory.product_id}, ${productVariants.product_id})`);
};

/**
 * Get approved reviews for products
 */
export const baseGetReviewRecords = async (productIds: string[]) => {
  if (productIds.length === 0) return [];
  return db
    .select({
      product_id: reviews.product_id,
      rating: reviews.rating,
    })
    .from(reviews)
    .where(
      and(
        inArray(reviews.product_id, productIds),
        eq(reviews.status, 'approved'),
        eq(reviews.is_deleted, false),
      ),
    );
};

export const baseCheckProductInWishlist = async (wishlistId: string, productId: string) => {
  const [existingItem] = await db
    .select({ product_id: wishlistItems.product_id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.wishlist_id, wishlistId), eq(wishlistItems.product_id, productId)))
    .limit(1);
  return existingItem || null;
};

export const baseInsertWishlistItem = async (data: any) => {
  await db.insert(wishlistItems).values(data);
};

export const baseDeleteWishlistItem = async (wishlistId: string, productId: string) => {
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.wishlist_id, wishlistId), eq(wishlistItems.product_id, productId)));
};

export const baseUpdateWishlistTimestamp = async (wishlistId: string) => {
  await db.update(wishlists).set({ updated_at: new Date() }).where(eq(wishlists.id, wishlistId));
};

export const baseFindProductForWishlist = async (productId: string) => {
  const [product] = await db
    .select({
      id: products.id,
      product_title: products.product_title,
      primary_image_url: products.primary_image_url,
      sku: products.sku,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      status: products.status,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.is_deleted, false)))
    .limit(1);
  return product || null;
};

export const baseFindActiveCartByUserId = async (userId: string) => {
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(
      and(eq(carts.user_id, userId), eq(carts.cart_status, 'active'), eq(carts.is_deleted, false)),
    )
    .limit(1);
  return cart || null;
};

export const baseInsertCart = async (data: NewCart) => {
  const [newCart] = await db.insert(carts).values(data).returning({ id: carts.id });
  return newCart;
};

export const baseFindCartItem = async (cartId: string, productId: string) => {
  const [item] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cart_id, cartId),
        eq(cartItems.product_id, productId),
        eq(cartItems.is_deleted, false),
      ),
    )
    .limit(1);
  return item || null;
};

export const baseUpdateCartItem = async (itemId: string, data: any) => {
  await db
    .update(cartItems)
    .set({ ...data, updated_at: new Date() })
    .where(eq(cartItems.id, itemId));
};

export const baseInsertCartItem = async (data: any) => {
  await db.insert(cartItems).values(data);
};

export const baseGetCartLineItems = async (cartId: string) => {
  return db
    .select({
      line_total: cartItems.line_total,
      line_subtotal: cartItems.line_subtotal,
      discount_amount: cartItems.discount_amount,
    })
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
};

export const baseUpdateCartTotals = async (cartId: string, totals: any) => {
  await db
    .update(carts)
    .set({
      ...totals,
      last_activity_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

export const baseDeleteWishlistItemRaw = async (wishlistId: string, productId: string) => {
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.wishlist_id, wishlistId), eq(wishlistItems.product_id, productId)));
};

export const baseUpdateWishlistItemAddedToCart = async (wishlistId: string, productId: string) => {
  await db
    .update(wishlistItems)
    .set({ added_to_cart_at: new Date() })
    .where(and(eq(wishlistItems.wishlist_id, wishlistId), eq(wishlistItems.product_id, productId)));
};
