/**
 * Cart Items Schema
 * Individual line items in a shopping cart.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { carts } from './carts.schema';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    cart_id: uuid('cart_id')
      .references(() => carts.id, { onDelete: 'cascade' })
      .notNull(),

    product_id: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    variant_id: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

    quantity: integer('quantity').default(1).notNull(),

    cost_price: decimal('cost_price', { precision: 12, scale: 2 }).notNull(),
    final_price: decimal('final_price', { precision: 12, scale: 2 }).notNull(),
    discount_amount: decimal('discount_amount', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),

    line_subtotal: decimal('line_subtotal', { precision: 12, scale: 2 }).notNull(),
    line_total: decimal('line_total', { precision: 12, scale: 2 }).notNull(),

    product_name: varchar('product_name', { length: 255 }),
    product_image_url: text('product_image_url'),
    product_sku: varchar('product_sku', { length: 100 }),

    reserved_at: timestamp('reserved_at'),
    reservation_id: uuid('reservation_id'),
    reservation_expires_at: timestamp('reservation_expires_at'),

    saved_for_later: boolean('saved_for_later').default(false).notNull(),
    price_at_add: decimal('price_at_add', { precision: 12, scale: 2 }),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    cartIdIdx: index('cart_items_cart_id_idx').on(table.cart_id),
    productIdIdx: index('cart_items_product_id_idx').on(table.product_id),
    quantityCheck: check('cart_items_quantity_check', sql`quantity > 0`),
  }),
);

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
