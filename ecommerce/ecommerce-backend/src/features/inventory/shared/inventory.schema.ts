/**
 * Inventory Schema
 * Tracks physical and committed stock levels for products and variants.
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
  index,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';
import { users } from '../../user/shared/user.schema';

export const inventoryConditionEnum = pgEnum('inventory_condition', [
  'sellable',
  'damaged',
  'quarantined',
  'expired',
]);

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'in_stock',
  'low_stock',
  'out_of_stock',
]);

/** Inventory database table definition. */
export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Link to product OR variant (mutually exclusive)
    product_id: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    variant_id: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),

    // Stock levels
    available_quantity: integer('available_quantity').default(0).notNull(),
    committed_quantity: integer('committed_quantity').default(0).notNull(),

    // P2-3: Per-SKU low stock threshold (0 = use system default of 5)
    low_stock_threshold: integer('low_stock_threshold').default(0).notNull(),

    location: varchar('location', { length: 100 }).default('Nashik').notNull(),
    condition: inventoryConditionEnum('condition').default('sellable').notNull(),
    status: inventoryStatusEnum('status').default('in_stock').notNull(),

    // Analytics
    total_sold: integer('total_sold').default(0).notNull(),
    total_fulfilled: integer('total_fulfilled').default(0).notNull(),
    last_stock_movement_at: timestamp('last_stock_movement_at'),
    last_sale_at: timestamp('last_sale_at'),

    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    productIdx: index('inventory_product_idx').on(table.product_id),
    variantIdx: index('inventory_variant_idx').on(table.variant_id),
    statusIdx: index('inventory_status_idx').on(table.status),

    availableQtyCheck: check('inventory_available_qty_check', sql`available_quantity >= 0`),
    committedQtyCheck: check('inventory_committed_qty_check', sql`committed_quantity >= 0`),
    totalSoldCheck: check('inventory_total_sold_check', sql`total_sold >= 0`),
    totalFulfilledCheck: check('inventory_total_fulfilled_check', sql`total_fulfilled >= 0`),

    checkProductOrVariant: check(
      'inventory_product_or_variant_check',
      sql`(product_id IS NOT NULL AND variant_id IS NULL) OR (product_id IS NULL AND variant_id IS NOT NULL)`,
    ),
    uq_inventory_product_variant: unique('uq_inventory_product_variant').on(
      table.product_id,
      table.variant_id,
    ),
  }),
);

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
