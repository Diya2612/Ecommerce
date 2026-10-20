/**
 * Customer Profiles Schema
 * Manages B2C-specific consumer data (preferences, opt-ins, account status).
 */

import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

export const customerAccountStatusEnum = pgEnum('customer_account_status', ['active', 'inactive']);

export const customerSegmentEnum = pgEnum('customer_segment', ['new', 'regular', 'vip', 'at_risk']);

/**
 * Customer profiles table.
 * Links to core users table for individual (B2C) consumers.
 */
export const customerProfiles = pgTable(
  'customer_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .unique()
      .notNull(),

    /** User categorization (e.g., 'new', 'vip'). */
    segments: text('segments')
      .array()
      .default(sql`ARRAY['new']::text[]`)
      .notNull(),

    marketing_opt_in: boolean('marketing_opt_in').default(false).notNull(),
    sms_opt_in: boolean('sms_opt_in').default(false).notNull(),
    email_opt_in: boolean('email_opt_in').default(true).notNull(),
    whatsapp_opt_in: boolean('whatsapp_opt_in').default(false).notNull(),
    push_notifications_opt_in: boolean('push_notifications_opt_in').default(true).notNull(),

    account_status: customerAccountStatusEnum('account_status').default('active').notNull(),

    risk_profile: varchar('risk_profile', { length: 20 }).default('low'),
    notes: text('notes'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    riskIdx: index('customer_profiles_risk_idx').on(table.risk_profile),
  }),
);

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type NewCustomerProfile = typeof customerProfiles.$inferInsert;
