import { pgTable, uuid, timestamp, integer, text, index, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders } from '../../orders/shared/orders.schema';

/** Invoice lifecycle statuses. */
export const invoiceStatuses = ['draft', 'generated', 'sent', 'cancelled'] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

/**
 * Invoices Table
 * Links orders to their generated invoice metadata.
 */
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    order_id: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    invoice_number: varchar('invoice_number', { length: 50 }).notNull().unique(),
    latest_version: integer('latest_version').default(1).notNull(),
    status: text('status').$type<InvoiceStatus>().default('draft').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('invoices_order_id_idx').on(table.order_id),
    invoiceNumberIdx: index('invoices_invoice_number_idx').on(table.invoice_number),
    statusIdx: index('invoices_status_idx').on(table.status),
  }),
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
