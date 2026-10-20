import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';

/**
 * User Notification Settings Table
 * Global toggles for notification channels.
 */
export const userNotificationSettings = pgTable('user_notification_settings', {
  user_id: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  email_enabled: boolean('email_enabled').default(true).notNull(),
  in_app_enabled: boolean('in_app_enabled').default(true).notNull(),
  push_enabled: boolean('push_enabled').default(true).notNull(),
  sms_enabled: boolean('sms_enabled').default(false).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type UserNotificationSetting = typeof userNotificationSettings.$inferSelect;
export type NewUserNotificationSetting = typeof userNotificationSettings.$inferInsert;
