import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Stores raw Razorpay webhook payloads for debugging and audit compliance.
 * Supports idempotency checking and event replay capability.
 */
export const paymentWebhookLogs = pgTable(
  'payment_webhook_logs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Event Identification
    event_id: varchar('event_id', { length: 100 }).unique(),
    event_type: varchar('event_type', { length: 100 }).notNull(),

    // References
    razorpay_order_id: varchar('razorpay_order_id', { length: 50 }),
    razorpay_payment_id: varchar('razorpay_payment_id', { length: 50 }),
    raw_payload: jsonb('raw_payload').notNull(),

    // Status
    signature_verified: boolean('signature_verified').default(false).notNull(),
    processed: boolean('processed').default(false).notNull(),
    processed_at: timestamp('processed_at'),
    processing_error: varchar('processing_error', { length: 500 }),
    retry_count: integer('retry_count').default(0).notNull(),

    // Audit
    received_at: timestamp('received_at').defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index('webhook_logs_event_type_idx').on(table.event_type),
    razorpayOrderIdx: index('webhook_logs_rp_order_idx').on(table.razorpay_order_id),
    razorpayPaymentIdx: index('webhook_logs_rp_payment_idx').on(table.razorpay_payment_id),
    processedIdx: index('webhook_logs_processed_idx').on(table.processed),
    receivedAtIdx: index('webhook_logs_received_at_idx').on(table.received_at),
  }),
);

export type PaymentWebhookLog = typeof paymentWebhookLogs.$inferSelect;
export type NewPaymentWebhookLog = typeof paymentWebhookLogs.$inferInsert;
