/**
 * Chatbot Database Queries
 * Reusable queries for chatbot documents, sessions, and messages.
 */

import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../../../database';
import {
  chatbotDocuments,
  chatbotSessions,
  chatbotMessages,
  ChatbotDocument,
  ChatbotSession,
  ChatbotMessage,
  NewChatbotDocument,
  NewChatbotSession,
  NewChatbotMessage,
  DocumentStatus,
} from './chatbot.schema';

/** Create a new chatbot document record. */
export async function createDocument(data: NewChatbotDocument): Promise<ChatbotDocument> {
  const [document] = await db.insert(chatbotDocuments).values(data).returning();
  return document;
}

/** Get a document by ID (excluding soft-deleted). */
export async function getDocumentById(id: number): Promise<ChatbotDocument | undefined> {
  const [document] = await db
    .select()
    .from(chatbotDocuments)
    .where(and(eq(chatbotDocuments.id, id), eq(chatbotDocuments.is_deleted, false)));
  return document;
}

/** List all documents with pagination. */
export async function listDocuments(
  page: number = 1,
  limit: number = 20,
): Promise<{ documents: ChatbotDocument[]; total: number }> {
  const offset = (page - 1) * limit;

  const [documents, countResult] = await Promise.all([
    db
      .select()
      .from(chatbotDocuments)
      .where(eq(chatbotDocuments.is_deleted, false))
      .orderBy(desc(chatbotDocuments.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatbotDocuments)
      .where(eq(chatbotDocuments.is_deleted, false)),
  ]);

  return {
    documents,
    total: countResult[0]?.count || 0,
  };
}

/** Update document status and mark completion. */
export async function updateDocumentStatus(
  id: number,
  status: DocumentStatus,
  updatedBy: string,
  errorMessage?: string,
): Promise<ChatbotDocument | undefined> {
  const updateData: any = {
    status,
    updated_by: updatedBy,
    updated_at: new Date(),
  };

  if (errorMessage !== undefined) updateData.error_message = errorMessage;
  if (status === 'completed') updateData.is_embedded = true;

  const [document] = await db
    .update(chatbotDocuments)
    .set(updateData)
    .where(eq(chatbotDocuments.id, id))
    .returning();

  return document;
}

/** Update document after successful processing. */
export async function updateDocumentProcessingResult(
  id: number,
  chunkCount: number,
  updatedBy: string,
): Promise<ChatbotDocument | undefined> {
  const [document] = await db
    .update(chatbotDocuments)
    .set({
      chunk_count: chunkCount,
      is_embedded: true,
      updated_by: updatedBy,
      updated_at: new Date(),
    })
    .where(eq(chatbotDocuments.id, id))
    .returning();

  return document;
}

/** Soft delete a document and mark as not embedded. */
export async function deleteDocument(
  id: number,
  deletedBy: string,
): Promise<ChatbotDocument | undefined> {
  const [document] = await db
    .update(chatbotDocuments)
    .set({
      is_deleted: true,
      is_embedded: false,
      deleted_by: deletedBy,
      deleted_at: new Date(),
    })
    .where(eq(chatbotDocuments.id, id))
    .returning();

  return document;
}

/** Get summary statistics for all non-deleted documents. */
export async function getDocumentStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalChunks: number;
}> {
  const allDocs = await db
    .select({
      status: chatbotDocuments.status,
      chunk_count: chatbotDocuments.chunk_count,
    })
    .from(chatbotDocuments)
    .where(eq(chatbotDocuments.is_deleted, false));

  const stats = {
    total: allDocs.length,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalChunks: 0,
  };

  for (const doc of allDocs) {
    if (doc.status === 'pending') stats.pending++;
    else if (doc.status === 'processing') stats.processing++;
    else if (doc.status === 'completed') stats.completed++;
    else if (doc.status === 'failed') stats.failed++;
    stats.totalChunks += doc.chunk_count || 0;
  }

  return stats;
}

/** Create a new chat session. */
export async function createSession(data: NewChatbotSession): Promise<ChatbotSession> {
  const [session] = await db.insert(chatbotSessions).values(data).returning();
  return session;
}

/** Get a specific session for a user. */
export async function getSessionByIdForUser(
  id: number,
  userId: string,
): Promise<ChatbotSession | undefined> {
  const [session] = await db
    .select()
    .from(chatbotSessions)
    .where(
      and(
        eq(chatbotSessions.id, id),
        eq(chatbotSessions.user_id, userId),
        eq(chatbotSessions.is_deleted, false),
      ),
    );
  return session;
}

/** List active sessions for a user with pagination. */
export async function listUserSessions(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ sessions: ChatbotSession[]; total: number }> {
  const offset = (page - 1) * limit;

  const sessions = await db
    .select()
    .from(chatbotSessions)
    .where(and(eq(chatbotSessions.user_id, userId), eq(chatbotSessions.is_deleted, false)))
    .orderBy(desc(chatbotSessions.updated_at))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(chatbotSessions)
    .where(and(eq(chatbotSessions.user_id, userId), eq(chatbotSessions.is_deleted, false)));

  return {
    sessions,
    total: countResult?.count || 0,
  };
}

/** Update session activity timestamp. */
export async function updateSessionTimestamp(id: number): Promise<ChatbotSession | undefined> {
  const [session] = await db
    .update(chatbotSessions)
    .set({ updated_at: new Date() })
    .where(eq(chatbotSessions.id, id))
    .returning();

  return session;
}

/** Update session title. */
export async function updateSessionTitle(
  id: number,
  title: string,
): Promise<ChatbotSession | undefined> {
  const [session] = await db
    .update(chatbotSessions)
    .set({ title, updated_at: new Date() })
    .where(eq(chatbotSessions.id, id))
    .returning();

  return session;
}

/** Soft delete a session and all its messages. */
export async function deleteSession(
  id: number,
  deletedBy: string,
): Promise<ChatbotSession | undefined> {
  await db
    .update(chatbotMessages)
    .set({
      is_deleted: true,
      deleted_by: deletedBy,
      deleted_at: new Date(),
    })
    .where(and(eq(chatbotMessages.session_id, id), eq(chatbotMessages.is_deleted, false)));

  const [session] = await db
    .update(chatbotSessions)
    .set({
      is_deleted: true,
      deleted_by: deletedBy,
      deleted_at: new Date(),
    })
    .where(eq(chatbotSessions.id, id))
    .returning();

  return session;
}

/** Create a new chat message. */
export async function createMessage(data: NewChatbotMessage): Promise<ChatbotMessage> {
  const [message] = await db.insert(chatbotMessages).values(data).returning();
  return message;
}

/** Get chronologically ordered messages for a session. */
export async function getSessionMessages(
  sessionId: number,
  page: number = 1,
  limit: number = 50,
): Promise<{ messages: ChatbotMessage[]; total: number }> {
  const offset = (page - 1) * limit;

  const [messages, countResult] = await Promise.all([
    db
      .select()
      .from(chatbotMessages)
      .where(and(eq(chatbotMessages.session_id, sessionId), eq(chatbotMessages.is_deleted, false)))
      .orderBy(asc(chatbotMessages.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatbotMessages)
      .where(and(eq(chatbotMessages.session_id, sessionId), eq(chatbotMessages.is_deleted, false))),
  ]);

  return {
    messages,
    total: countResult[0]?.count || 0,
  };
}

/** Get recent messages from the end of the session for conversation context. */
export async function getRecentMessages(
  sessionId: number,
  count: number = 10,
): Promise<ChatbotMessage[]> {
  const messages = await db
    .select()
    .from(chatbotMessages)
    .where(and(eq(chatbotMessages.session_id, sessionId), eq(chatbotMessages.is_deleted, false)))
    .orderBy(desc(chatbotMessages.created_at))
    .limit(count);

  return messages.reverse();
}
