/**
 * Carts Schema
 * Shopping cart container for users and guest sessions.
 */

import {
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

export const cartStatusEnum = pgEnum('cart_status', ['active', 'converted', 'abandoned']);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    session_id: varchar('session_id', { length: 100 }),

    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).default('0.00').notNull(),
    discount_total: decimal('discount_total', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    shipping_total: decimal('shipping_total', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    tax_total: decimal('tax_total', { precision: 12, scale: 2 }).default('0.00').notNull(),
    grand_total: decimal('grand_total', { precision: 12, scale: 2 }).default('0.00').notNull(),

    applied_discount_codes: jsonb('applied_discount_codes').default([]),
    applied_giftcard_codes: jsonb('applied_giftcard_codes').default([]),
    removed_discount_info: jsonb('removed_discount_info').default([]),

    cart_status: cartStatusEnum('cart_status').default('active').notNull(),

    last_activity_at: timestamp('last_activity_at').defaultNow().notNull(),
    session_expires_at: timestamp('session_expires_at'),
    abandoned_at: timestamp('abandoned_at'),
    recovery_email_sent: boolean('recovery_email_sent').default(false).notNull(),
    recovery_email_sent_at: timestamp('recovery_email_sent_at'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_at: timestamp('deleted_at'),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    userIdIdx: index('carts_user_id_idx').on(table.user_id),
    sessionIdIdx: index('carts_session_id_idx').on(table.session_id),
    statusActivityIdx: index('carts_status_activity_idx').on(
      table.cart_status,
      table.last_activity_at,
    ),
  }),
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
