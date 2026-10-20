/**
 * Chatbot Database Schema
 * Tables for document training metadata, sessions, and AI messages.
 * Note: These tables are currently placeholders for future AI features.
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  index,
  varchar,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';

export const documentStatuses = ['pending', 'processing', 'completed', 'failed'] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export const messageRoles = ['user', 'assistant'] as const;
export type MessageRole = (typeof messageRoles)[number];

/** Stores uploaded document metadata and processing status. */
export const chatbotDocuments = pgTable(
  'chatbot_documents',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    file_url: text('file_url').notNull(),
    file_path: text('file_path').notNull(),
    file_size: bigint('file_size', { mode: 'number' }).notNull(),
    mime_type: varchar('mime_type', { length: 100 }).notNull(),
    status: text('status').$type<DocumentStatus>().default('pending').notNull(),
    chunk_count: integer('chunk_count').default(0).notNull(),
    is_embedded: boolean('is_embedded').default(false).notNull(),
    error_message: text('error_message'),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_by: uuid('deleted_by'),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    statusIsDeletedIdx: index('chatbot_documents_status_is_deleted_idx').on(
      table.status,
      table.is_deleted,
    ),
    createdAtIdx: index('chatbot_documents_created_at_idx').on(table.created_at),
  }),
);

/** Stores user chat sessions. */
export const chatbotSessions = pgTable(
  'chatbot_sessions',
  {
    id: serial('id').primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    created_by: uuid('created_by'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_by: uuid('deleted_by'),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    userIdIsDeletedIdx: index('chatbot_sessions_user_id_is_deleted_idx').on(
      table.user_id,
      table.is_deleted,
    ),
    createdAtIdx: index('chatbot_sessions_created_at_idx').on(table.created_at),
  }),
);

export interface MessageSource {
  documentId: number;
  documentName: string;
  relevance: number;
}

/** Stores chat messages within sessions. */
export const chatbotMessages = pgTable(
  'chatbot_messages',
  {
    id: serial('id').primaryKey(),
    session_id: integer('session_id')
      .notNull()
      .references(() => chatbotSessions.id, { onDelete: 'cascade' }),
    role: text('role').$type<MessageRole>().notNull(),
    content: text('content').notNull(),
    sources: jsonb('sources').$type<MessageSource[]>(),
    created_by: uuid('created_by'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_by: uuid('updated_by'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_by: uuid('deleted_by'),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    sessionIdIsDeletedIdx: index('chatbot_messages_session_id_is_deleted_idx').on(
      table.session_id,
      table.is_deleted,
    ),
    createdAtIdx: index('chatbot_messages_created_at_idx').on(table.created_at),
  }),
);

export type ChatbotDocument = typeof chatbotDocuments.$inferSelect;
export type NewChatbotDocument = typeof chatbotDocuments.$inferInsert;

export type ChatbotSession = typeof chatbotSessions.$inferSelect;
export type NewChatbotSession = typeof chatbotSessions.$inferInsert;

export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type NewChatbotMessage = typeof chatbotMessages.$inferInsert;
