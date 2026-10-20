/**
 * Product Cache Service Unit Tests
 * Tests: ProductCacheService (getProductById, getProductBySku, getProductBySlug, cacheProduct, invalidateProduct)
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

// NOTE: jest.mock() is hoisted above imports, but `const` TDZ means variables
// declared in module scope can't be referenced inside the factory.
// Solution: create jest.fn() inside the factory and access them via the mocked module.

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
  isRedisReady: jest.fn(),
}));

jest.mock('@/features/product/shared/queries', () => ({
  findProductById: jest.fn(),
  findProductBySku: jest.fn(),
  findProductBySlug: jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { ProductCacheService } from '@/features/product/services/product-cache.service';
import { isRedisReady, redisClient } from '@/utils';
import {
  findProductById,
  findProductBySku,
  findProductBySlug,
} from '@/features/product/shared/queries';

// Convenience aliases typed as jest.Mock
const mockRedisGet = redisClient.get as jest.Mock;
const mockRedisSetEx = redisClient.setEx as jest.Mock;
const mockRedisDel = redisClient.del as jest.Mock;
const mockRedisKeys = redisClient.keys as jest.Mock;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct: any = {
  id: 'prod-uuid-1',
  sku: 'TEST-001',
  slug: 'test-product',
  product_title: 'Test Product',
  status: 'active',
  selling_price: '999.00',
  is_deleted: false,
  // Use ISO strings (not Date objects) so that toEqual() passes after JSON round-trip
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-10T00:00:00.000Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductCacheService', () => {
  let service: ProductCacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductCacheService();
    (isRedisReady as jest.Mock).mockReturnValue(false); // default: no Redis
  });

  // ── cacheProduct ────────────────────────────────────────────────────────────

  describe('cacheProduct', () => {
    it('should store in memory cache when Redis is not ready', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(false);

      await service.cacheProduct(mockProduct);

      // Should be retrievable from memory
      (findProductById as jest.Mock).mockResolvedValue(undefined);
      const result = await service.getProductById(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });

    it('should store in Redis when Redis is ready', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisSetEx.mockResolvedValue('OK');

      await service.cacheProduct(mockProduct);

      expect(mockRedisSetEx).toHaveBeenCalledTimes(3); // id, sku, slug keys
    });

    it('should still populate memory cache even if Redis fails', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisSetEx.mockRejectedValue(new Error('Redis error'));

      await expect(service.cacheProduct(mockProduct)).resolves.toBeUndefined();
    });
  });

  // ── getProductById ──────────────────────────────────────────────────────────

  describe('getProductById', () => {
    it('should return product from memory cache', async () => {
      await service.cacheProduct(mockProduct);
      (findProductById as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getProductById(mockProduct.id);
      expect(result).toEqual(mockProduct);
      expect(findProductById).not.toHaveBeenCalled();
    });

    it('should return product from Redis when available', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisGet.mockResolvedValue(JSON.stringify(mockProduct));

      const result = await service.getProductById(mockProduct.id);
      expect(result).toEqual(mockProduct);
      expect(findProductById).not.toHaveBeenCalled();
    });

    it('should fall through to DB when cache misses', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(false);
      (findProductById as jest.Mock).mockResolvedValue(mockProduct);
      mockRedisSetEx.mockResolvedValue('OK');

      const result = await service.getProductById('uncached-id');
      expect(result).toEqual(mockProduct);
      expect(findProductById).toHaveBeenCalledWith('uncached-id');
    });

    it('should return undefined when product not found in DB either', async () => {
      (findProductById as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getProductById('no-such-id');
      expect(result).toBeUndefined();
    });

    it('should gracefully handle Redis get failure and fall back to DB', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisGet.mockRejectedValue(new Error('Redis down'));
      (findProductById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getProductById(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });

  // ── getProductBySku ─────────────────────────────────────────────────────────

  describe('getProductBySku', () => {
    it('should normalise SKU to uppercase before lookup', async () => {
      (findProductBySku as jest.Mock).mockResolvedValue(mockProduct);

      await service.getProductBySku('test-001');

      expect(findProductBySku).toHaveBeenCalledWith('TEST-001');
    });

    it('should return product from memory cache', async () => {
      await service.cacheProduct(mockProduct);
      (findProductBySku as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getProductBySku(mockProduct.sku);
      expect(result).toEqual(mockProduct);
    });
  });

  // ── getProductBySlug ────────────────────────────────────────────────────────

  describe('getProductBySlug', () => {
    it('should return product from memory cache', async () => {
      await service.cacheProduct(mockProduct);
      (findProductBySlug as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getProductBySlug(mockProduct.slug);
      expect(result).toEqual(mockProduct);
    });

    it('should fall through to DB when slug not in cache', async () => {
      (findProductBySlug as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getProductBySlug('uncached-slug');
      expect(result).toEqual(mockProduct);
      expect(findProductBySlug).toHaveBeenCalledWith('uncached-slug');
    });
  });

  // ── invalidateProduct ───────────────────────────────────────────────────────

  describe('invalidateProduct', () => {
    it('should remove product from memory cache', async () => {
      await service.cacheProduct(mockProduct);

      await service.invalidateProduct(mockProduct.id, mockProduct.sku, mockProduct.slug);
      (findProductById as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getProductById(mockProduct.id);
      expect(result).toBeUndefined();
    });

    it('should delete Redis keys when Redis is ready', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisDel.mockResolvedValue(3);

      await service.invalidateProduct(mockProduct.id, mockProduct.sku, mockProduct.slug);

      expect(mockRedisDel).toHaveBeenCalled();
    });

    it('should not throw if Redis del fails', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisDel.mockRejectedValue(new Error('Redis error'));

      await expect(service.invalidateProduct(mockProduct.id)).resolves.toBeUndefined();
    });
  });

  // ── getCacheStats ───────────────────────────────────────────────────────────

  describe('getCacheStats', () => {
    it('should return stats with memoryCacheSize and redisAvailable', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(false);

      const stats = await service.getCacheStats();

      expect(stats).toHaveProperty('redisAvailable', false);
      expect(stats).toHaveProperty('memoryCacheSize');
      expect(stats).toHaveProperty('redisCacheSize');
    });

    it('should include redisCacheSize when Redis is ready', async () => {
      (isRedisReady as jest.Mock).mockReturnValue(true);
      mockRedisKeys.mockResolvedValue(['product:id:1', 'product:id:2']);

      const stats = await service.getCacheStats();

      expect(stats.redisAvailable).toBe(true);
      expect(stats.redisCacheSize).toBe(2);
    });
  });
});
