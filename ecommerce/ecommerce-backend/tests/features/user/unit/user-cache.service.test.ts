/**
 * User Cache Service Tests
 *
 * Tests for the Redis-based user caching functionality.
 * The redis module is globally mocked in tests/utils/drizzle-mock.ts.
 * The service imports from '@/utils/database/redis' and '@/utils/logging/logger',
 * both of which are globally mocked, so this test file just imports them and
 * casts to jest.Mock for control.
 */

// ── Additional mocks needed by this file ──────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { UserCacheService } from '@/features/user/services/user-cache.service';
import { redisClient, isRedisReady } from '@/utils/database/redis';

// Typed shorthand references (these are already mocked globally in drizzle-mock.ts)
const rGet = redisClient.get as jest.Mock;
const rSetEx = redisClient.setEx as jest.Mock;
const rDel = redisClient.del as jest.Mock;
const rKeys = redisClient.keys as jest.Mock;
const rReady = isRedisReady as jest.Mock;

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_type: 'individual' as const,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  email_verified: true,
  phone_number: '1234567890',
  phone_verified: false,
  preferred_language: 'en',
  preferred_currency: 'USD',
  timezone: 'UTC',
  is_deleted: false,
  created_at: new Date('2025-12-22T14:48:47.607Z'),
  updated_at: new Date('2025-12-22T14:48:47.607Z'),
  created_by: null,
  updated_by: null,
  deleted_by: undefined,
  deleted_at: undefined,
};

const mockUserJSON = {
  ...mockUser,
  created_at: mockUser.created_at.toISOString(),
  updated_at: mockUser.updated_at.toISOString(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UserCacheService', () => {
  let cacheService: UserCacheService;

  beforeEach(() => {
    cacheService = new UserCacheService();
    jest.clearAllMocks();
    // Default: Redis is ready, no cached data
    rReady.mockReturnValue(true);
    rGet.mockResolvedValue(null);
    rKeys.mockResolvedValue([]);
  });

  describe('getUserById - Redis cache', () => {
    it('should return user from Redis cache when available', async () => {
      rGet.mockResolvedValue(JSON.stringify(mockUserJSON));

      const result = await cacheService.getUserById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockUserJSON);
      expect(rGet).toHaveBeenCalledWith('user:id:123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle Redis errors gracefully and fall back', async () => {
      rGet.mockRejectedValue(new Error('Redis error'));

      // Should not throw - will fall back to memory/database
      await expect(
        cacheService.getUserById('123e4567-e89b-12d3-a456-426614174000'),
      ).resolves.not.toThrow();
    });
  });

  describe('getUserByEmail', () => {
    it('should normalize email to lowercase', async () => {
      rGet.mockResolvedValue(JSON.stringify(mockUserJSON));

      await cacheService.getUserByEmail('TEST@EXAMPLE.COM');

      expect(rGet).toHaveBeenCalledWith('user:email:test@example.com');
    });

    it('should return user from Redis cache when available', async () => {
      rGet.mockResolvedValue(JSON.stringify(mockUserJSON));

      const result = await cacheService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUserJSON);
    });
  });

  describe('invalidateUser', () => {
    it('should clear user cache from Redis and memory', async () => {
      rDel.mockResolvedValue(1);

      await cacheService.invalidateUser('123e4567-e89b-12d3-a456-426614174000', 'test@example.com');

      expect(rDel).toHaveBeenCalledWith([
        'user:id:123e4567-e89b-12d3-a456-426614174000',
        'user:email:test@example.com',
      ]);
    });

    it('should handle Redis unavailable gracefully', async () => {
      rReady.mockReturnValue(false);

      await expect(
        cacheService.invalidateUser('123e4567-e89b-12d3-a456-426614174000', 'test@example.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('invalidateAll', () => {
    it('should clear all user caches from Redis', async () => {
      rKeys.mockResolvedValue([
        'user:id:123e4567-e89b-12d3-a456-426614174000',
        'user:id:123e4567-e89b-12d3-a456-426614174001',
      ]);
      rDel.mockResolvedValue(2);

      await cacheService.invalidateAll();

      expect(rKeys).toHaveBeenCalledWith('user:id:*');
      expect(rKeys).toHaveBeenCalledWith('user:email:*');
    });

    it('should handle Redis errors gracefully', async () => {
      rKeys.mockRejectedValue(new Error('Redis error'));

      await expect(cacheService.invalidateAll()).resolves.not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      rKeys.mockResolvedValue([
        'user:id:123e4567-e89b-12d3-a456-426614174000',
        'user:id:123e4567-e89b-12d3-a456-426614174001',
      ]);

      const stats = await cacheService.getCacheStats();

      expect(stats).toEqual({
        redisAvailable: true,
        memoryCacheSize: expect.any(Number),
        redisCacheSize: 2,
      });
    });

    it('should handle Redis unavailable', async () => {
      rReady.mockReturnValue(false);

      const stats = await cacheService.getCacheStats();

      expect(stats).toEqual({
        redisAvailable: false,
        memoryCacheSize: expect.any(Number),
        redisCacheSize: undefined,
      });
    });
  });
});
