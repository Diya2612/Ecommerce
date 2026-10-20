/**
 * User Schema
 * Database schema for the users table.
 */

import {
  pgTable,
  timestamp,
  boolean,
  varchar,
  uuid,
  date,
  index,
  pgEnum,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);

/**
 * Users table
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    auth_id: uuid('auth_id').unique(), // Supabase Auth ID
    display_id: varchar('display_id', { length: 20 }).unique(),

    // Basic info
    first_name: varchar('first_name', { length: 255 }).notNull(),
    middle_name: varchar('middle_name', { length: 255 }),
    last_name: varchar('last_name', { length: 255 }).notNull(),
    display_name: varchar('display_name', { length: 100 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }),
    email_verified: boolean('email_verified').default(false).notNull(),
    email_verified_at: timestamp('email_verified_at'),

    // Phone (E.164 format)
    phone_number: varchar('phone_number', { length: 20 }),
    phone_type: varchar('phone_type', { length: 20 }).default('mobile'),
    phone_verified: boolean('phone_verified').default(false).notNull(),
    phone_verified_at: timestamp('phone_verified_at'),

    // Secondary contact info
    secondary_email: varchar('secondary_email', { length: 255 }),
    email_type: varchar('email_type', { length: 20 }).default('personal'),
    secondary_email_type: varchar('secondary_email_type', { length: 20 }).default('work'),
    secondary_email_verified: boolean('secondary_email_verified').default(false).notNull(),
    secondary_phone_number: varchar('secondary_phone_number', { length: 20 }),
    secondary_phone_type: varchar('secondary_phone_type', { length: 20 }).default('work'),

    // Profile
    profile_image_url: varchar('profile_image_url', { length: 500 }),
    date_of_birth: date('date_of_birth'),
    gender: genderEnum('gender'),

    // Metadata
    tags: text('tags').array(),
    metadata: jsonb('metadata'),

    // Preferences
    preferred_language: varchar('preferred_language', { length: 10 }).default('en').notNull(),
    languages: text('languages').array(),
    preferred_currency: varchar('preferred_currency', { length: 3 }).default('INR').notNull(),
    timezone: varchar('timezone', { length: 50 }).default('Asia/Kolkata').notNull(),

    // Audit fields
    created_by: uuid('created_by'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_by: uuid('deleted_by'),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    emailIsDeletedIdx: index('users_email_is_deleted_idx').on(table.email, table.is_deleted),
    createdAtIdx: index('users_created_at_idx').on(table.created_at),
    authIdIdx: index('users_auth_id_idx').on(table.auth_id),
    displayIdIdx: index('users_display_id_idx').on(table.display_id),
    emailVerifiedIdx: index('users_email_verified_idx').on(table.email_verified, table.is_deleted),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
