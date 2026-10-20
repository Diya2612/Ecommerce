/**
 * Chatbot Interfaces
 * TypeScript definitions for documents, sessions, and AI messaging.
 */

import {
  DocumentStatus,
  MessageRole,
  MessageSource as SchemaMessageSource,
} from './chatbot.schema';

export type MessageSource = SchemaMessageSource;

export interface IDocument {
  id: number;
  name: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  chunk_count: number;
  is_embedded: boolean;
  error_message: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface IDocumentCreate {
  name: string;
  description?: string;
  file_url: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_by: string;
}

export interface IDocumentUpdate {
  name?: string;
  description?: string;
  status?: DocumentStatus;
  chunk_count?: number;
  is_embedded?: boolean;
  error_message?: string;
  updated_by: string;
}

export interface ISession {
  id: number;
  user_id: string;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface ISessionCreate {
  user_id: string;
  title?: string;
  created_by: string;
}

export interface ISessionWithSummary extends ISession {
  message_count: number;
  last_message_at: Date | null;
  last_message_preview: string | null;
}

export interface IMessage {
  id: number;
  session_id: number;
  role: MessageRole;
  content: string;
  sources: MessageSource[] | null;
  created_at: Date;
  is_deleted: boolean;
}

export interface IMessageCreate {
  session_id: number;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
  created_by: string;
}

export interface IChatRequest {
  message: string;
  sessionId?: number;
}

export interface IChatResponse {
  sessionId: number;
  message: string;
  sources: MessageSource[];
}

export interface IVectorRecord {
  id: string;
  values: number[];
  metadata: IVectorMetadata;
}

export interface IVectorMetadata {
  documentId: number;
  documentName: string;
  chunkIndex: number;
  totalChunks: number;
  text: string;
  mimeType: string;
}

export interface ISearchResult {
  id: string;
  score: number;
  text: string;
  metadata: IVectorMetadata;
}

export interface IChunk {
  text: string;
  index: number;
  startPosition: number;
  endPosition: number;
}

export interface IChunkingResult {
  chunks: IChunk[];
  totalChunks: number;
  originalLength: number;
}

export interface ITrainingResult {
  documentId: number;
  chunkCount: number;
  vectorIds: string[];
  success: boolean;
  error?: string;
}

export interface IDocumentListResponse {
  documents: IDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ISessionListResponse {
  sessions: ISessionWithSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IChatHistoryResponse {
  sessionId: number;
  messages: Array<{
    role: MessageRole;
    content: string;
    sources: MessageSource[] | null;
    createdAt: Date;
  }>;
}
