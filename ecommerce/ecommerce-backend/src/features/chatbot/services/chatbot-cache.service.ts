/**
 * Chatbot Cache Service
 * Manages Redis and in-memory caching for chatbot statistics, document lists, and user sessions.
 */

import { logger } from '../../../utils';
import { redisClient, isRedisReady } from '../../../utils';
import { db } from '../../../database';
import { chatbotDocuments, chatbotSessions } from '../shared/chatbot.schema';
import { eq, and, desc } from 'drizzle-orm';
import type { ChatbotDocument, ChatbotSession } from '../shared/chatbot.schema';

const STATS_KEY = 'chatbot:stats';
const DOCS_PREFIX = 'chatbot:docs:';
const SESSIONS_PREFIX = 'chatbot:sessions:';

const STATS_TTL = 120;
const DOCS_TTL = 60;
const SESSIONS_TTL = 60;

interface DocumentStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalChunks: number;
}

interface CachedStats {
  data: DocumentStats;
  expiresAt: number;
}

interface CachedDocs {
  documents: ChatbotDocument[];
  total: number;
  expiresAt: number;
}

interface CachedSessions {
  sessions: ChatbotSession[];
  total: number;
  expiresAt: number;
}

class ChatbotCacheService {
  private statsCache: CachedStats | null = null;
  private docsCache: Map<string, CachedDocs> = new Map();
  private sessionsCache: Map<string, CachedSessions> = new Map();

  /** Get document statistics with caching support. */
  async getDocumentStats(): Promise<DocumentStats> {
    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(STATS_KEY);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        logger.warn('Redis error in getDocumentStats:', error);
      }
    }

    if (this.statsCache && Date.now() < this.statsCache.expiresAt) {
      return this.statsCache.data;
    }

    const stats = await this.fetchDocumentStats();
    await this.cacheStats(stats);
    return stats;
  }

  private async fetchDocumentStats(): Promise<DocumentStats> {
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

  private async cacheStats(stats: DocumentStats): Promise<void> {
    if (isRedisReady()) {
      try {
        await redisClient.setEx(STATS_KEY, STATS_TTL, JSON.stringify(stats));
      } catch (error) {
        logger.warn('Failed to cache stats in Redis:', error);
      }
    }

    this.statsCache = {
      data: stats,
      expiresAt: Date.now() + STATS_TTL * 1000,
    };
  }

  /** Get paginated document list with caching. */
  async listDocuments(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ documents: ChatbotDocument[]; total: number }> {
    const cacheKey = `${DOCS_PREFIX}${page}:${limit}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        logger.warn('Redis error in listDocuments:', error);
      }
    }

    const memoryCached = this.docsCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) {
      return { documents: memoryCached.documents, total: memoryCached.total };
    }

    const result = await this.fetchDocuments(page, limit);
    await this.cacheDocuments(cacheKey, result);
    return result;
  }

  private async fetchDocuments(
    page: number,
    limit: number,
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
        .select({ id: chatbotDocuments.id })
        .from(chatbotDocuments)
        .where(eq(chatbotDocuments.is_deleted, false)),
    ]);

    return {
      documents,
      total: countResult.length,
    };
  }

  private async cacheDocuments(
    cacheKey: string,
    data: { documents: ChatbotDocument[]; total: number },
  ): Promise<void> {
    if (isRedisReady()) {
      try {
        await redisClient.setEx(cacheKey, DOCS_TTL, JSON.stringify(data));
      } catch (error) {
        logger.warn('Failed to cache documents in Redis:', error);
      }
    }

    this.docsCache.set(cacheKey, {
      ...data,
      expiresAt: Date.now() + DOCS_TTL * 1000,
    });
  }

  /** Get user's session list with caching. */
  async listUserSessions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ sessions: ChatbotSession[]; total: number }> {
    const cacheKey = `${SESSIONS_PREFIX}${userId}:${page}:${limit}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        logger.warn('Redis error in listUserSessions:', error);
      }
    }

    const memoryCached = this.sessionsCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) {
      return { sessions: memoryCached.sessions, total: memoryCached.total };
    }

    const result = await this.fetchUserSessions(userId, page, limit);
    await this.cacheSessions(cacheKey, result);
    return result;
  }

  private async fetchUserSessions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ sessions: ChatbotSession[]; total: number }> {
    const offset = (page - 1) * limit;

    const [sessions, countResult] = await Promise.all([
      db
        .select()
        .from(chatbotSessions)
        .where(and(eq(chatbotSessions.user_id, userId), eq(chatbotSessions.is_deleted, false)))
        .orderBy(desc(chatbotSessions.updated_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ id: chatbotSessions.id })
        .from(chatbotSessions)
        .where(and(eq(chatbotSessions.user_id, userId), eq(chatbotSessions.is_deleted, false))),
    ]);

    return {
      sessions,
      total: countResult.length,
    };
  }

  private async cacheSessions(
    cacheKey: string,
    data: { sessions: ChatbotSession[]; total: number },
  ): Promise<void> {
    if (isRedisReady()) {
      try {
        await redisClient.setEx(cacheKey, SESSIONS_TTL, JSON.stringify(data));
      } catch (error) {
        logger.warn('Failed to cache sessions in Redis:', error);
      }
    }

    this.sessionsCache.set(cacheKey, {
      ...data,
      expiresAt: Date.now() + SESSIONS_TTL * 1000,
    });
  }

  /** Invalidate document-related caches. */
  async invalidateDocuments(): Promise<void> {
    if (isRedisReady()) {
      try {
        await redisClient.del(STATS_KEY);
        const docKeys = await redisClient.keys(`${DOCS_PREFIX}*`);
        if (docKeys.length > 0) await redisClient.del(docKeys);
      } catch (error) {
        logger.warn('Failed to invalidate document caches in Redis:', error);
      }
    }

    this.statsCache = null;
    this.docsCache.clear();
  }

  /** Invalidate session caches for a user. */
  async invalidateUserSessions(userId: string): Promise<void> {
    if (isRedisReady()) {
      try {
        const sessionKeys = await redisClient.keys(`${SESSIONS_PREFIX}${userId}:*`);
        if (sessionKeys.length > 0) await redisClient.del(sessionKeys);
      } catch (error) {
        logger.warn(`Failed to invalidate session caches for user ${userId}:`, error);
      }
    }

    for (const key of this.sessionsCache.keys()) {
      if (key.startsWith(`${SESSIONS_PREFIX}${userId}:`)) {
        this.sessionsCache.delete(key);
      }
    }
  }

  /** Invalidate all chatbot-related caches. */
  async invalidateAll(): Promise<void> {
    if (isRedisReady()) {
      try {
        const allKeys = [
          ...(await redisClient.keys(`${DOCS_PREFIX}*`)),
          ...(await redisClient.keys(`${SESSIONS_PREFIX}*`)),
          STATS_KEY,
        ];
        if (allKeys.length > 0) await redisClient.del(allKeys);
      } catch (error) {
        logger.warn('Failed to invalidate all chatbot caches in Redis:', error);
      }
    }

    this.statsCache = null;
    this.docsCache.clear();
    this.sessionsCache.clear();
  }

  /** Get current cache status and health. */
  async getCacheStats(): Promise<{
    redisAvailable: boolean;
    memoryStatsCache: boolean;
    memoryDocsCacheSize: number;
    memorySessionsCacheSize: number;
  }> {
    return {
      redisAvailable: isRedisReady(),
      memoryStatsCache: this.statsCache !== null,
      memoryDocsCacheSize: this.docsCache.size,
      memorySessionsCacheSize: this.sessionsCache.size,
    };
  }
}

export const chatbotCacheService = new ChatbotCacheService();
export { ChatbotCacheService };
