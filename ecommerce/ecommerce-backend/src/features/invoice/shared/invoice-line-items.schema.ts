import { pgTable, uuid, varchar, integer, decimal, index, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { invoiceVersions } from './invoice-versions.schema';

/**
 * Invoice Line Items Table
 * Snapshot of line items for a specific invoice version.
 */
export const invoiceLineItems = pgTable(
  'invoice_line_items',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    invoice_version_id: uuid('invoice_version_id')
      .notNull()
      .references(() => invoiceVersions.id, { onDelete: 'cascade' }),
    product_name: varchar('product_name', { length: 255 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    hsn_code: varchar('hsn_code', { length: 10 }),
    quantity: integer('quantity').notNull(),
    unit_price: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
    tax_rate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
    cgst_amount: decimal('cgst_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    sgst_amount: decimal('sgst_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    igst_amount: decimal('igst_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    line_total: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    invoiceVersionIdIdx: index('invoice_line_items_invoice_version_id_idx').on(
      table.invoice_version_id,
    ),
  }),
);

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;
