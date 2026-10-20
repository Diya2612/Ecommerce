/**
 * User Addresses Schema
 * Stores user shipping and billing addresses with international support.
 */

import {
  pgTable,
  varchar,
  text,
  boolean,
  uuid,
  timestamp,
  decimal,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

// Define the Postgres Enum for Address Type
export const addressTypeEnum = pgEnum('address_type_enum', ['home', 'office', 'other']);

// Table definition
/**
 * User addresses table.
 */
export const userAddresses = pgTable(
  'user_addresses',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    address_type: addressTypeEnum('address_type').default('home').notNull(),
    address_name: varchar('address_name', { length: 50 }), // Custom name if type is 'other'

    is_default_shipping: boolean('is_default_shipping').default(false).notNull(),
    is_default_billing: boolean('is_default_billing').default(false).notNull(),

    // Recipient info
    recipient_name: varchar('recipient_name', { length: 255 }).notNull(),
    phone_number: varchar('phone_number', { length: 20 }), // E.164 format

    // Address fields
    address_line1: varchar('address_line1', { length: 255 }).notNull(),
    address_line2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state_province: varchar('state_province', { length: 100 }).notNull(),
    postal_code: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    country_code: varchar('country_code', { length: 2 }).notNull(), // ISO 3166-1 alpha-2

    // Geo-coordinates
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),

    // Additional info
    delivery_instructions: text('delivery_instructions'),
    is_international: boolean('is_international').default(false).notNull(),
    tax_id: varchar('tax_id', { length: 50 }), // GST/VAT/Tax number

    // Audit fields
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
  },
  (table) => ({
    userIdIdx: index('user_addresses_user_id_idx').on(table.user_id, table.is_deleted),
    userDefaultShippingIdx: index('user_addresses_user_default_shipping_idx').on(
      table.user_id,
      table.is_default_shipping,
      table.is_deleted,
    ),
    userDefaultBillingIdx: index('user_addresses_user_default_billing_idx').on(
      table.user_id,
      table.is_default_billing,
      table.is_deleted,
    ),
    userDefaultIdx: index('user_addresses_user_default_idx').on(
      table.user_id,
      table.is_default_shipping,
      table.is_default_billing,
      table.is_deleted,
    ),
    countryIdx: index('user_addresses_country_idx').on(table.country_code),
    uniqueDefaultShippingIdx: uniqueIndex('user_addresses_unique_default_shipping_idx')
      .on(table.user_id)
      .where(sql`${table.is_default_shipping} = true and ${table.is_deleted} = false`),
    uniqueDefaultBillingIdx: uniqueIndex('user_addresses_unique_default_billing_idx')
      .on(table.user_id)
      .where(sql`${table.is_default_billing} = true and ${table.is_deleted} = false`),
  }),
);

// Types
export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
