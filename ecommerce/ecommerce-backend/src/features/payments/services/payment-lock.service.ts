import { redis, isRedisReady } from '../../../utils';
import { logger } from '../../../utils';
import { HttpException } from '../../../utils';

/**
 * Manages distributed Redis locks to prevent race conditions in payment
 * operations like duplicate order creation or concurrent refunds.
 */
class PaymentLockServiceClass {
  private static readonly LOCK_PREFIX = 'payment_lock:';
  private static readonly DEFAULT_TTL = 30;

  /** Attempts to acquire a lock for a specific order. Fail-open if Redis is down. */
  async acquireLock(
    orderId: string,
    ttlSeconds: number = PaymentLockServiceClass.DEFAULT_TTL,
  ): Promise<boolean> {
    if (!isRedisReady()) {
      logger.warn('Redis unavailable, skipping payment lock', { orderId });
      return true;
    }

    const lockKey = `${PaymentLockServiceClass.LOCK_PREFIX}${orderId}`;
    try {
      const result = await redis.set(lockKey, Date.now().toString(), { EX: ttlSeconds, NX: true });
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire payment lock', { orderId, error });
      return true;
    }
  }

  /** Manually releases an acquired lock. */
  async releaseLock(orderId: string): Promise<void> {
    if (!isRedisReady()) return;

    const lockKey = `${PaymentLockServiceClass.LOCK_PREFIX}${orderId}`;
    try {
      await redis.del(lockKey);
    } catch (error) {
      logger.error('Failed to release payment lock', { orderId, error });
    }
  }

  /**
   * Wraps an async operation with lock protection.
   * Throws 429 if lock is already held.
   */
  async withLock<T>(orderId: string, operation: () => Promise<T>): Promise<T> {
    const acquired = await this.acquireLock(orderId);

    if (!acquired) {
      throw new HttpException(429, 'Payment operation in progress. Please wait.');
    }

    try {
      return await operation();
    } finally {
      await this.releaseLock(orderId);
    }
  }

  /** Checks if a lock is currently active for an order. */
  async isLocked(orderId: string): Promise<boolean> {
    if (!isRedisReady()) return false;

    const lockKey = `${PaymentLockServiceClass.LOCK_PREFIX}${orderId}`;
    try {
      const exists = await redis.exists(lockKey);
      return exists === 1;
    } catch (error) {
      logger.error('Failed to check payment lock', { orderId, error });
      return false;
    }
  }
}

export const PaymentLockService = new PaymentLockServiceClass();
export { PaymentLockServiceClass };
