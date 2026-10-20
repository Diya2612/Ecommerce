/**
 * Unit tests for PaymentLockService
 * Tests distributed locking logic with mocked Redis
 */

// Mock Redis and utilities
jest.mock('@/utils', () => ({
  redis: {
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  },
  isRedisReady: jest.fn(),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

import { redis, isRedisReady } from '@/utils';
import { PaymentLockServiceClass } from '@/features/payments/services/payment-lock.service';

const mockRedis = redis as jest.Mocked<typeof redis>;
const mockIsRedisReady = isRedisReady as jest.MockedFunction<typeof isRedisReady>;

describe('PaymentLockService', () => {
  let service: PaymentLockServiceClass;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentLockServiceClass();
    mockIsRedisReady.mockReturnValue(true);
  });

  describe('acquireLock', () => {
    it('should return true when lock is successfully acquired', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.acquireLock('order-123');

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith('payment_lock:order-123', expect.any(String), {
        EX: 30,
        NX: true,
      });
    });

    it('should return false when lock is already held', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue(null); // Redis returns null when NX fails

      const result = await service.acquireLock('order-123');

      expect(result).toBe(false);
    });

    it('should use custom TTL when provided', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');

      await service.acquireLock('order-123', 60);

      expect(mockRedis.set).toHaveBeenCalledWith('payment_lock:order-123', expect.any(String), {
        EX: 60,
        NX: true,
      });
    });

    it('should return true (fail-open) when Redis is unavailable', async () => {
      mockIsRedisReady.mockReturnValue(false);

      const result = await service.acquireLock('order-123');

      expect(result).toBe(true);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should return true (fail-open) when Redis throws an error', async () => {
      (mockRedis.set as jest.Mock).mockRejectedValue(new Error('Redis connection error'));

      const result = await service.acquireLock('order-123');

      expect(result).toBe(true);
    });
  });

  describe('releaseLock', () => {
    it('should delete the lock key', async () => {
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      await service.releaseLock('order-123');

      expect(mockRedis.del).toHaveBeenCalledWith('payment_lock:order-123');
    });

    it('should not throw when Redis is unavailable', async () => {
      mockIsRedisReady.mockReturnValue(false);

      await expect(service.releaseLock('order-123')).resolves.not.toThrow();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should not throw when Redis del fails', async () => {
      (mockRedis.del as jest.Mock).mockRejectedValue(new Error('Redis error'));

      await expect(service.releaseLock('order-123')).resolves.not.toThrow();
    });
  });

  describe('withLock', () => {
    it('should execute operation when lock is acquired', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      const mockOperation = jest.fn().mockResolvedValue('operation-result');

      const result = await service.withLock('order-123', mockOperation);

      expect(result).toBe('operation-result');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should throw 429 when lock cannot be acquired', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue(null);

      const mockOperation = jest.fn();

      await expect(service.withLock('order-123', mockOperation)).rejects.toMatchObject({
        status: 429,
      });
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('should release lock even if operation throws', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(service.withLock('order-123', mockOperation)).rejects.toThrow(
        'Operation failed',
      );
      expect(mockRedis.del).toHaveBeenCalledWith('payment_lock:order-123');
    });

    it('should release lock after successful operation', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      await service.withLock('order-123', async () => 'done');

      expect(mockRedis.del).toHaveBeenCalledWith('payment_lock:order-123');
    });
  });

  describe('isLocked', () => {
    it('should return true when lock exists', async () => {
      (mockRedis.exists as jest.Mock).mockResolvedValue(1);

      const result = await service.isLocked('order-123');

      expect(result).toBe(true);
    });

    it('should return false when lock does not exist', async () => {
      (mockRedis.exists as jest.Mock).mockResolvedValue(0);

      const result = await service.isLocked('order-123');

      expect(result).toBe(false);
    });

    it('should return false when Redis is unavailable', async () => {
      mockIsRedisReady.mockReturnValue(false);

      const result = await service.isLocked('order-123');

      expect(result).toBe(false);
      expect(mockRedis.exists).not.toHaveBeenCalled();
    });

    it('should return false when Redis throws', async () => {
      (mockRedis.exists as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await service.isLocked('order-123');

      expect(result).toBe(false);
    });
  });

  describe('lock key format', () => {
    it('should use correct prefix for lock keys', async () => {
      (mockRedis.set as jest.Mock).mockResolvedValue('OK');

      await service.acquireLock('my-order-id');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'payment_lock:my-order-id',
        expect.any(String),
        expect.any(Object),
      );
    });
  });
});
