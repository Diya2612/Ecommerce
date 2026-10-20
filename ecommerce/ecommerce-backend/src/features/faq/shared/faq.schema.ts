/**
 * FAQ Schema
 * Unified table for general and categorized frequently asked questions.
 */

import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  pgEnum,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

export const faqSectionEnum = pgEnum('faq_section', [
  'general',
  'account',
  'orders',
  'payments',
  'shipping',
  'returns',
  'products',
  'policies',
]);

/** FAQ database table definition. */
export const faqs = pgTable(
  'faqs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    question: text('question').notNull(),
    answer: text('answer').notNull(),

    section: faqSectionEnum('section').default('general').notNull(),
    position: integer('position').default(0).notNull(), // Display order
    status: boolean('status').default(true).notNull(), // Active visibility

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_at: timestamp('deleted_at'),
    deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    sectionIdx: index('faqs_section_idx').on(table.section),
    statusIdx: index('faqs_status_idx').on(table.status),
  }),
);

export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
