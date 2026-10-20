import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  index,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { products } from './products.schema';

/** Stores variant options (e.g., Size, Color) for products. */
export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    product_id: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    option_name: varchar('option_name', { length: 100 }).notNull(),
    option_value: varchar('option_value', { length: 100 }).notNull(),

    sku: varchar('sku', { length: 100 }).unique().notNull(),
    barcode: varchar('barcode', { length: 50 }),

    cost_price: decimal('cost_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    selling_price: decimal('selling_price', { precision: 15, scale: 2 }).notNull(),
    compare_at_price: decimal('compare_at_price', { precision: 15, scale: 2 }),

    image_url: text('image_url'),
    is_default: boolean('is_default').default(false).notNull(),
    is_active: boolean('is_active').default(true).notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    created_by: uuid('created_by'),
    updated_by: uuid('updated_by'),

    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_at: timestamp('deleted_at'),
    deleted_by: uuid('deleted_by'),
  },
  (table) => ({
    activeIdx: index('product_variants_active_idx')
      .on(table.product_id, table.is_active)
      .where(sql`${table.is_deleted} = false and ${table.is_active} = true`),
    uq_variant_option: unique('uq_variant_option').on(
      table.product_id,
      table.option_name,
      table.option_value,
    ),
    costPriceCheck: check('product_variants_cost_price_check', sql`cost_price >= 0`),
    sellingPriceCheck: check('product_variants_selling_price_check', sql`selling_price >= 0`),
    compareAtPriceCheck: check(
      'product_variants_compare_at_price_check',
      sql`compare_at_price IS NULL OR compare_at_price >= selling_price`,
    ),
  }),
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
