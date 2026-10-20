/**
 * Wishlist Items Schema
 */

import { pgTable, uuid, text, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { wishlists } from './wishlist.schema';
import { products } from '../../product/shared/products.schema';
import { orders } from '../../orders/shared/orders.schema';

export const wishlistItems = pgTable(
  'wishlist_items',
  {
    wishlist_id: uuid('wishlist_id')
      .references(() => wishlists.id, { onDelete: 'cascade' })
      .notNull(),
    product_id: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    notes: text('notes'),
    added_to_cart_at: timestamp('added_to_cart_at'),
    purchased_at: timestamp('purchased_at'),
    order_id: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    added_at: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.wishlist_id, table.product_id] }),
    productIdIdx: index('wishlist_items_product_id_idx').on(table.product_id),
  }),
);

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
