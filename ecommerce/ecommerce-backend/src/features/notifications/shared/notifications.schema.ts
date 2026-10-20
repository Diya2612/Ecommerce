import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';
import { notificationTypeEnum, notificationPriorityEnum } from './notification-enums.schema';

/**
 * Notifications Table
 * Stores all user-facing notifications across channels.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    data: jsonb('data').$type<Record<string, any>>().default({}),
    is_read: boolean('is_read').default(false).notNull(),
    read_at: timestamp('read_at', { withTimezone: true }),
    channels: jsonb('channels').$type<string[]>().default(['in_app']).notNull(),
    priority: notificationPriorityEnum('priority').default('normal').notNull(),
    action_url: varchar('action_url', { length: 500 }),
    action_text: varchar('action_text', { length: 100 }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  },
  (table) => ({
    idx_notifications_user_read: index('idx_notifications_user_read')
      .on(table.user_id, table.is_read)
      .where(sql`${table.deleted_at} is null`),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationType = Notification['type'];
export type NotificationPriority = Notification['priority'];
