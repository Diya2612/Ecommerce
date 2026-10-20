/**
 * Customer Cache Service
 * Layer for managing customer profile caching using Redis.
 */

import { redisClient, isRedisReady, logger } from '../../../utils';
import { customerService } from './customer.service';

class CustomerCacheService {
  private readonly TTL = 3600; // 1 hour
  private readonly CACHE_KEY_PREFIX = 'customer:';

  /** Retrieves a customer by ID from cache, falling back to database. */
  async getCustomerById(id: string): Promise<any> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        logger.warn(`Redis error in getCustomerById: ${JSON.stringify(error)}`);
      }
    }

    const customer = await customerService.getCustomerById(id);
    if (customer) void this.setCache(cacheKey, customer);

    return customer;
  }

  /** Updates the cache for a specific customer. */
  private async setCache(key: string, data: any) {
    if (!isRedisReady()) return;
    try {
      await redisClient.setEx(key, this.TTL, JSON.stringify(data));
    } catch (error) {
      logger.warn(`Failed to set cache for ${key}: ${JSON.stringify(error)}`);
    }
  }

  /** Removes a specific customer from the cache. */
  async invalidateCustomer(id: string): Promise<void> {
    if (!isRedisReady()) return;
    try {
      await redisClient.del(`${this.CACHE_KEY_PREFIX}${id}`);
    } catch (error) {
      logger.warn(`Failed to invalidate customer cache: ${JSON.stringify(error)}`);
    }
  }
}

export const customerCacheService = new CustomerCacheService();
