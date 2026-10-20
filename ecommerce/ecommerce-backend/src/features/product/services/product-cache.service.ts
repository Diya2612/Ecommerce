import { logger } from '../../../utils';
import { redisClient, isRedisReady } from '../../../utils';
import { findProductById, findProductBySku, findProductBySlug } from '../shared/queries';
import type { Product } from '../shared/products.schema';
import { CachedProduct } from '../shared/interface';

const PRODUCT_BY_ID_PREFIX = 'product:id:';
const PRODUCT_BY_SKU_PREFIX = 'product:sku:';
const PRODUCT_BY_SLUG_PREFIX = 'product:slug:';
const CACHE_TTL = 300; // 5 minutes

/** Product lookup caching using Redis with in-memory fallback. */
class ProductCacheService {
  private memoryCache: Map<string, CachedProduct> = new Map();
  private readonly TTL = CACHE_TTL * 1000;

  async getProductById(id: string): Promise<Product | undefined> {
    const key = `${PRODUCT_BY_ID_PREFIX}${id}`;
    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(key);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        logger.warn(`Cache hit failed (ID: ${id})`, e);
      }
    }
    const mem = this.memoryCache.get(key);
    if (mem && Date.now() < mem.expiresAt) return mem.product;
    const product = await findProductById(id);
    if (product) await this.cacheProduct(product);
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const normalized = sku.toUpperCase();
    const key = `${PRODUCT_BY_SKU_PREFIX}${normalized}`;
    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(key);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        logger.warn(`Cache hit failed (SKU: ${normalized})`, e);
      }
    }
    const mem = this.memoryCache.get(key);
    if (mem && Date.now() < mem.expiresAt) return mem.product;
    const product = await findProductBySku(normalized);
    if (product) await this.cacheProduct(product);
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const key = `${PRODUCT_BY_SLUG_PREFIX}${slug}`;
    if (isRedisReady()) {
      try {
        const cached = await redisClient.get(key);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        logger.warn(`Cache hit failed (Slug: ${slug})`, e);
      }
    }
    const mem = this.memoryCache.get(key);
    if (mem && Date.now() < mem.expiresAt) return mem.product;
    const product = await findProductBySlug(slug);
    if (product) await this.cacheProduct(product);
    return product;
  }

  async cacheProduct(product: Product): Promise<void> {
    const keys = {
      id: `${PRODUCT_BY_ID_PREFIX}${product.id}`,
      sku: `${PRODUCT_BY_SKU_PREFIX}${product.sku.toUpperCase()}`,
      slug: `${PRODUCT_BY_SLUG_PREFIX}${product.slug}`,
    };
    const data = JSON.stringify(product);
    if (isRedisReady()) {
      try {
        await Promise.all([
          redisClient.setEx(keys.id, CACHE_TTL, data),
          redisClient.setEx(keys.sku, CACHE_TTL, data),
          redisClient.setEx(keys.slug, CACHE_TTL, data),
        ]);
      } catch (e) {
        logger.warn('Redis cache store failed', e);
      }
    }
    const expiresAt = Date.now() + this.TTL;
    Object.values(keys).forEach((k) => this.memoryCache.set(k, { product, expiresAt }));
  }

  async invalidateProduct(id: string, sku?: string, slug?: string): Promise<void> {
    const idKey = `${PRODUCT_BY_ID_PREFIX}${id}`;
    if (isRedisReady()) {
      try {
        const keys = [idKey];
        if (sku) keys.push(`${PRODUCT_BY_SKU_PREFIX}${sku.toUpperCase()}`);
        if (slug) keys.push(`${PRODUCT_BY_SLUG_PREFIX}${slug}`);
        await redisClient.del(keys);
      } catch (e) {
        logger.warn('Redis invalidation failed', e);
      }
    }
    this.memoryCache.delete(idKey);
    if (sku) this.memoryCache.delete(`${PRODUCT_BY_SKU_PREFIX}${sku.toUpperCase()}`);
    if (slug) this.memoryCache.delete(`${PRODUCT_BY_SLUG_PREFIX}${slug}`);
  }

  async invalidateAll(): Promise<void> {
    if (isRedisReady()) {
      try {
        const keys = await Promise.all([
          redisClient.keys(`${PRODUCT_BY_ID_PREFIX}*`),
          redisClient.keys(`${PRODUCT_BY_SKU_PREFIX}*`),
          redisClient.keys(`${PRODUCT_BY_SLUG_PREFIX}*`),
        ]).then((ks) => ks.flat());
        if (keys.length) await redisClient.del(keys);
      } catch (e) {
        logger.warn('Redis full invalidation failed', e);
      }
    }
    this.memoryCache.clear();
  }

  async getCacheStats() {
    const stats = {
      redisAvailable: isRedisReady(),
      memoryCacheSize: this.memoryCache.size,
      redisCacheSize: 0,
    };
    if (isRedisReady()) {
      try {
        stats.redisCacheSize = (await redisClient.keys(`${PRODUCT_BY_ID_PREFIX}*`)).length;
      } catch (e) {
        logger.warn('Redis stats failed', e);
      }
    }
    return stats;
  }
}

export const productCacheService = new ProductCacheService();
export { ProductCacheService };
