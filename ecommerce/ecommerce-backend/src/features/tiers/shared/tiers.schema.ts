import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

export const tierStatusEnum = pgEnum('tier_status', ['active', 'inactive']);

/**
 * Tiers Schema
 */
export const tiers = pgTable(
  'tiers',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 255 }).unique().notNull(),
    description: text('description'),
    level: integer('level').notNull(), // 1=Root, 2=Sub, etc.
    parent_id: uuid('parent_id'),
    priority: integer('priority').default(0).notNull(),
    status: tierStatusEnum('status').default('active').notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    usage_count: integer('usage_count').default(0).notNull(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: 'tiers_parent_id_fk',
    }).onDelete('set null'),
    parentIdx: index('tiers_parent_id_idx').on(table.parent_id),
    levelIdx: index('tiers_level_idx').on(table.level),
    statusIdx: index('tiers_status_idx').on(table.status),
    activeLevelIdx: index('tiers_active_level_idx')
      .on(table.level, table.parent_id, table.priority)
      .where(sql`${table.is_deleted} = false and ${table.status} = 'active'`),
  }),
);

export type Tier = typeof tiers.$inferSelect;
export type NewTier = typeof tiers.$inferInsert;
