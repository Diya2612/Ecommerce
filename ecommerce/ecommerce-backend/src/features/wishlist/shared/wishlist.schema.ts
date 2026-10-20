/**
 * Wishlist Schema
 */

import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

export const wishlists = pgTable(
  'wishlists',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    access_token: varchar('access_token', { length: 255 }),
    status: boolean('status').default(true).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('wishlists_user_id_idx').on(table.user_id),
    tokenIdx: index('wishlists_access_token_idx').on(table.access_token),
    activeUserIdx: index('wishlists_active_user_idx')
      .on(table.user_id, table.updated_at)
      .where(sql`${table.status} = true`),
  }),
);

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
