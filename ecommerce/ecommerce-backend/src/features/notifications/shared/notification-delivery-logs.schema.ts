import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notifications } from './notifications.schema';
import { deliveryStatusEnum } from './notification-enums.schema';

/**
 * Notification Delivery Logs Table
 * Tracks delivery attempts and provider responses for each channel.
 */
export const notificationDeliveryLogs = pgTable('notification_delivery_logs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
  notification_id: uuid('notification_id')
    .notNull()
    .references(() => notifications.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 50 }).notNull(),
  status: deliveryStatusEnum('status').default('pending').notNull(),
  recipient: varchar('recipient', { length: 255 }),
  provider: varchar('provider', { length: 100 }),
  provider_message_id: varchar('provider_message_id', { length: 255 }),
  provider_response: jsonb('provider_response').$type<Record<string, any>>(),
  error_message: text('error_message'),
  error_code: varchar('error_code', { length: 50 }),
  retry_count: integer('retry_count').default(0),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  delivered_at: timestamp('delivered_at', { withTimezone: true }),
  failed_at: timestamp('failed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type NotificationDeliveryLog = typeof notificationDeliveryLogs.$inferSelect;
export type NewNotificationDeliveryLog = typeof notificationDeliveryLogs.$inferInsert;
export type DeliveryStatus = NotificationDeliveryLog['status'];
