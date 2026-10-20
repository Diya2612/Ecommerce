import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  index,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { invoices } from './invoice.schema';

/** Reasons for generating a new invoice version. */
export const invoiceReasons = ['INITIAL', 'CORRECTION', 'REFUND'] as const;
export type InvoiceReason = (typeof invoiceReasons)[number];

/**
 * Invoice Versions Table
 * Immutable snapshots of invoice data at a point in time.
 */
export const invoiceVersions = pgTable(
  'invoice_versions',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    invoice_id: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    version_number: integer('version_number').notNull(),
    customer_name: varchar('customer_name', { length: 255 }).notNull(),
    customer_email: varchar('customer_email', { length: 255 }).notNull(),
    customer_gstin: varchar('customer_gstin', { length: 20 }),
    billing_address: text('billing_address').notNull(),
    shipping_address: text('shipping_address').notNull(),
    place_of_supply: varchar('place_of_supply', { length: 255 }).notNull(),
    subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
    discount: decimal('discount', { precision: 15, scale: 2 }).default('0').notNull(),
    shipping: decimal('shipping', { precision: 15, scale: 2 }).default('0').notNull(),
    tax_amount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    grand_total: decimal('grand_total', { precision: 15, scale: 2 }).notNull(),
    cgst: decimal('cgst', { precision: 15, scale: 2 }).default('0').notNull(),
    sgst: decimal('sgst', { precision: 15, scale: 2 }).default('0').notNull(),
    igst: decimal('igst', { precision: 15, scale: 2 }).default('0').notNull(),
    tax_type: varchar('tax_type', { length: 20 }).default('cgst_sgst').notNull(),
    pdf_url: text('pdf_url'),
    pdf_path: text('pdf_path'),
    pdf_generated_at: timestamp('pdf_generated_at'),
    reason: text('reason').$type<InvoiceReason>().default('INITIAL').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    invoiceIdIdx: index('invoice_versions_invoice_id_idx').on(table.invoice_id),
    versionNumberIdx: index('invoice_versions_version_number_idx').on(table.version_number),
  }),
);

export type InvoiceVersion = typeof invoiceVersions.$inferSelect;
export type NewInvoiceVersion = typeof invoiceVersions.$inferInsert;
