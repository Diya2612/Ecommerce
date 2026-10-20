/**
 * User Cache Service
 * Redis-based caching for user lookups by ID and email.
 */

import { redisClient, isRedisReady } from '../../../utils/database/redis';
import { logger } from '../../../utils/logging/logger';
import { db } from '../../../database';
import { users } from '../shared/user.schema';
import { eq, and } from 'drizzle-orm';
import type { User } from '../shared/user.schema';

const USER_BY_ID_PREFIX = 'user:id:';
const USER_BY_EMAIL_PREFIX = 'user:email:';
const CACHE_TTL = 5 * 60;

interface CachedUser {
  user: User;
  expiresAt: number;
}

class UserCacheService {
  private memoryCache: Map<string, CachedUser> = new Map();
  private readonly TTL = CACHE_TTL * 1000;

  /**
   * Get user by ID from cache or database.
   */
  async getUserById(id: string): Promise<User | undefined> {
    const cacheKey = `${USER_BY_ID_PREFIX}${id}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug(`User cache hit for ID ${id}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        logger.warn(`Redis error in getUserById for ID ${id}:`, error);
      }
    }

    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) {
      logger.debug(`User memory cache hit for ID ${id}`);
      return memoryCached.user;
    }

    logger.debug(`User cache miss for ID ${id}`);
    const user = await this.fetchUserById(id);

    if (user) {
      await this.cacheUser(user);
    }

    return user;
  }

  /**
   * Get user by email from cache or database.
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase();
    const cacheKey = `${USER_BY_EMAIL_PREFIX}${normalizedEmail}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug(`User cache hit for email ${normalizedEmail}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        logger.warn(`Redis error in getUserByEmail for ${normalizedEmail}:`, error);
      }
    }

    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) {
      logger.debug(`User memory cache hit for email ${normalizedEmail}`);
      return memoryCached.user;
    }

    logger.debug(`User cache miss for email ${normalizedEmail}`);
    const user = await this.fetchUserByEmail(normalizedEmail);

    if (user) {
      await this.cacheUser(user);
    }

    return user;
  }

  /**
   * Cache a user object by both ID and email.
   */
  private async cacheUser(user: User): Promise<void> {
    const idKey = `${USER_BY_ID_PREFIX}${user.id}`;
    const emailKey = `${USER_BY_EMAIL_PREFIX}${user.email.toLowerCase()}`;
    const serialized = JSON.stringify(user);

    if (isRedisReady()) {
      try {
        await Promise.all([
          redisClient.setEx(idKey, CACHE_TTL, serialized),
          redisClient.setEx(emailKey, CACHE_TTL, serialized),
        ]);
        logger.debug(`Cached user ${user.id} in Redis`);
      } catch (error) {
        logger.warn(`Failed to cache user ${user.id} in Redis:`, error);
      }
    }

    const expiresAt = Date.now() + this.TTL;
    this.memoryCache.set(idKey, { user, expiresAt });
    this.memoryCache.set(emailKey, { user, expiresAt });
  }

  /**
   * Invalidate cache for a specific user.
   */
  async invalidateUser(userId: string, email?: string): Promise<void> {
    const idKey = `${USER_BY_ID_PREFIX}${userId}`;

    if (isRedisReady()) {
      try {
        const keysToDelete = [idKey];
        if (email) {
          keysToDelete.push(`${USER_BY_EMAIL_PREFIX}${email.toLowerCase()}`);
        }
        await redisClient.del(keysToDelete);
        logger.debug(`Invalidated Redis cache for user ${userId}`);
      } catch (error) {
        logger.warn(`Failed to invalidate Redis cache for user ${userId}:`, error);
      }
    }

    this.memoryCache.delete(idKey);
    if (email) {
      this.memoryCache.delete(`${USER_BY_EMAIL_PREFIX}${email.toLowerCase()}`);
    }
    logger.debug(`Invalidated cache for user ${userId}`);
  }

  /**
   * Invalidate all user caches.
   */
  async invalidateAll(): Promise<void> {
    if (isRedisReady()) {
      try {
        const idKeys = await redisClient.keys(`${USER_BY_ID_PREFIX}*`);
        const emailKeys = await redisClient.keys(`${USER_BY_EMAIL_PREFIX}*`);
        const allKeys = [...idKeys, ...emailKeys];

        if (allKeys.length > 0) {
          await redisClient.del(allKeys);
        }
        logger.info(`Invalidated ${allKeys.length} user cache entries in Redis`);
      } catch (error) {
        logger.warn('Failed to invalidate all user caches in Redis:', error);
      }
    }

    this.memoryCache.clear();
    logger.info('Invalidated all user caches');
  }

  /**
   * Get cache statistics.
   */
  async getCacheStats(): Promise<{
    redisAvailable: boolean;
    memoryCacheSize: number;
    redisCacheSize?: number;
  }> {
    const stats = {
      redisAvailable: isRedisReady(),
      memoryCacheSize: this.memoryCache.size,
      redisCacheSize: undefined as number | undefined,
    };

    if (isRedisReady()) {
      try {
        const idKeys = await redisClient.keys(`${USER_BY_ID_PREFIX}*`);
        stats.redisCacheSize = idKeys.length;
      } catch (error) {
        logger.warn('Failed to get Redis cache stats:', error);
      }
    }

    return stats;
  }

  private async fetchUserById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.is_deleted, false)))
      .limit(1);

    return user;
  }

  private async fetchUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.is_deleted, false)))
      .limit(1);

    return user;
  }
}

export const userCacheService = new UserCacheService();
export { UserCacheService };
