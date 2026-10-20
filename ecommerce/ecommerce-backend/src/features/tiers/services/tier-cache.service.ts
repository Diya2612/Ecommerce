import { logger, redisClient, isRedisReady } from '../../../utils';
import { db } from '../../../database';
import { tiers } from '../shared/tiers.schema';
import { eq, and } from 'drizzle-orm';
import type { ITier, ICachedTier } from '../shared/interface';

const TIER_BY_ID_PREFIX = 'tier:id:';
const TIER_BY_CODE_PREFIX = 'tier:code:';
const CACHE_TTL = 60 * 60; // 1 hour

/**
 * Tiers Cache Service
 */
class TierCacheService {
  private memoryCache: Map<string, ICachedTier> = new Map();
  private readonly TTL = CACHE_TTL * 1000;

  async getTierById(id: string): Promise<ITier | undefined> {
    const cacheKey = `${TIER_BY_ID_PREFIX}${id}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const cachedStr = Buffer.isBuffer(cached) ? cached.toString() : cached;
          return JSON.parse(cachedStr);
        }
      } catch (error) {
        logger.warn(`Redis error in getTierById for ID ${id}:`, error);
      }
    }

    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) return memoryCached.tier;

    const tier = await this.fetchTierById(id);
    if (tier) await this.cacheTier(tier);
    return tier;
  }

  async getTierByCode(code: string): Promise<ITier | undefined> {
    const cacheKey = `${TIER_BY_CODE_PREFIX}${code}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const cachedStr = Buffer.isBuffer(cached) ? cached.toString() : cached;
          return JSON.parse(cachedStr);
        }
      } catch (error) {
        logger.warn(`Redis error in getTierByCode for code ${code}:`, error);
      }
    }

    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && Date.now() < memoryCached.expiresAt) return memoryCached.tier;

    const tier = await this.fetchTierByCode(code);
    if (tier) await this.cacheTier(tier);
    return tier;
  }

  private async cacheTier(tier: ITier): Promise<void> {
    const idKey = `${TIER_BY_ID_PREFIX}${tier.id}`;
    const codeKey = `${TIER_BY_CODE_PREFIX}${tier.code}`;
    const serialized = JSON.stringify(tier);

    if (isRedisReady()) {
      try {
        await Promise.all([
          redisClient.setEx(idKey, CACHE_TTL, serialized),
          redisClient.setEx(codeKey, CACHE_TTL, serialized),
        ]);
      } catch (error) {
        logger.warn(`Failed to cache tier ${tier.id} in Redis:`, error);
      }
    }

    const expiresAt = Date.now() + this.TTL;
    this.memoryCache.set(idKey, { tier, expiresAt });
    this.memoryCache.set(codeKey, { tier, expiresAt });
  }

  async invalidateTier(tierId: string, code?: string): Promise<void> {
    const idKey = `${TIER_BY_ID_PREFIX}${tierId}`;
    const keysToDelete = [idKey];
    if (code) keysToDelete.push(`${TIER_BY_CODE_PREFIX}${code}`);

    if (isRedisReady()) {
      try {
        await redisClient.del(keysToDelete);
      } catch (error) {
        logger.warn(`Failed to invalidate Redis cache for tier ${tierId}:`, error);
      }
    }

    this.memoryCache.delete(idKey);
    if (code) this.memoryCache.delete(`${TIER_BY_CODE_PREFIX}${code}`);
  }

  async invalidateAll(): Promise<void> {
    if (isRedisReady()) {
      try {
        const idKeys = await redisClient.keys(`${TIER_BY_ID_PREFIX}*`);
        const codeKeys = await redisClient.keys(`${TIER_BY_CODE_PREFIX}*`);
        const allKeys = [...idKeys, ...codeKeys];
        if (allKeys.length > 0) await redisClient.del(allKeys);
      } catch (error) {
        logger.warn('Failed to invalidate all tier caches in Redis:', error);
      }
    }
    this.memoryCache.clear();
  }

  private async fetchTierById(id: string): Promise<ITier | undefined> {
    const [tier] = await db
      .select()
      .from(tiers)
      .where(and(eq(tiers.id, id), eq(tiers.is_deleted, false)))
      .limit(1);
    return tier;
  }

  private async fetchTierByCode(code: string): Promise<ITier | undefined> {
    const [tier] = await db
      .select()
      .from(tiers)
      .where(and(eq(tiers.code, code), eq(tiers.is_deleted, false)))
      .limit(1);
    return tier;
  }
}

export const tierCacheService = new TierCacheService();
