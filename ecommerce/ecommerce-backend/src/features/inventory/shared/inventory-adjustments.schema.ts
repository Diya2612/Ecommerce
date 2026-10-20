/**
 * Inventory Adjustments Schema
 * Audit trail for stock changes including before/after snapshots.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { inventory } from './inventory.schema';
import { users } from '../../user/shared/user.schema';

export const adjustmentTypeEnum = pgEnum('adjustment_type', [
  'increase',
  'decrease',
  'correction',
  'write-off',
]);

export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

/** Inventory adjustments database table definition. */
export const inventoryAdjustments = pgTable(
  'inventory_adjustments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    inventory_id: uuid('inventory_id')
      .references(() => inventory.id, { onDelete: 'cascade' })
      .notNull(),

    adjustment_type: adjustmentTypeEnum('adjustment_type').notNull(),
    quantity_change: integer('quantity_change').notNull(),
    reason: varchar('reason', { length: 500 }).notNull(),
    reference_number: varchar('reference_number', { length: 100 }),

    // Snapshots
    quantity_before: integer('quantity_before').notNull(),
    quantity_after: integer('quantity_after').notNull(),

    adjusted_by: uuid('adjusted_by')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),
    adjusted_at: timestamp('adjusted_at').defaultNow().notNull(),

    approved_by: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
    approved_at: timestamp('approved_at'),
    approval_status: approvalStatusEnum('approval_status').default('approved').notNull(),

    notes: text('notes'),
  },
  (table) => ({
    inventoryAdjustedIdx: index('inventory_adjustments_inventory_adjusted_idx').on(
      table.inventory_id,
      table.adjusted_at,
    ),
  }),
);

export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type NewInventoryAdjustment = typeof inventoryAdjustments.$inferInsert;
