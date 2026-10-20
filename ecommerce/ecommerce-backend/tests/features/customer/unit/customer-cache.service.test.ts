/**
 * CustomerCacheService Unit Tests
 *
 * Design note: jest.mock() factories are HOISTED before any variable
 * declarations, so variables defined outside the factory cannot be
 * referenced inside it. We work around this by:
 *   1. Creating a stable stub object INSIDE the factory and exposing it via
 *      a `__stub` property on the module.
 *   2. Obtaining the stub with `jest.requireMock()` after module registration
 *      so tests can set implementations on it.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/utils', () => ({
  redisClient: { get: jest.fn(), setEx: jest.fn(), del: jest.fn() },
  isRedisReady: jest.fn(),
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// customer.service mock: expose the singleton stub via __stub so tests can
// control getCustomerById without touching outer-scope variables in the factory.
jest.mock('@/features/customer/services/customer.service', () => {
  const stub = { getCustomerById: jest.fn() };
  return {
    CustomerService: jest.fn().mockImplementation(() => stub),
    customerService: stub,
    __stub: stub,
  };
});

jest.mock('@/database', () => ({ db: {} }));
jest.mock('@/features/user/services/user.service', () => ({ userService: {} }));
jest.mock('@/features/audit/services/audit.service', () => ({ auditService: {} }));
jest.mock('@/features/tags/services/tag-sync.service', () => ({}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { customerCacheService } from '@/features/customer/services/customer-cache.service';
import { redisClient, isRedisReady } from '@/utils';

// Grab the same stub instance that the cache service received at module-init.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const customerServiceMock = (
  jest.requireMock('@/features/customer/services/customer.service') as any
).__stub as {
  getCustomerById: jest.Mock;
};

// Typed shorthand references
const rGet = redisClient.get as jest.Mock;
const rSetEx = redisClient.setEx as jest.Mock;
const rDel = redisClient.del as jest.Mock;
const rReady = isRedisReady as jest.Mock;

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockCustomer = {
  id: 'user-uuid-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CustomerCacheService - getCustomerById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rReady.mockReturnValue(true);
    // Re-apply getCustomerById implementation since clearAllMocks resets it.
    customerServiceMock.getCustomerById = jest.fn();
  });

  it('should return cached value when Redis has the key', async () => {
    rGet.mockResolvedValue(JSON.stringify(mockCustomer));

    const result = await customerCacheService.getCustomerById('user-uuid-1');

    expect(rGet).toHaveBeenCalledWith('customer:user-uuid-1');
    expect(customerServiceMock.getCustomerById).not.toHaveBeenCalled();
    expect(result).toEqual(mockCustomer);
  });

  it('should fall back to DB on cache miss and set the cache', async () => {
    rGet.mockResolvedValue(null);
    customerServiceMock.getCustomerById.mockResolvedValue(mockCustomer);

    const result = await customerCacheService.getCustomerById('user-uuid-1');

    expect(customerServiceMock.getCustomerById).toHaveBeenCalledWith('user-uuid-1');
    expect(result).toEqual(mockCustomer);

    // Flush microtasks so the void setCache promise resolves
    await new Promise(process.nextTick);

    expect(rSetEx).toHaveBeenCalledWith('customer:user-uuid-1', 3600, JSON.stringify(mockCustomer));
  });

  it('should skip Redis and go to DB when Redis is not ready', async () => {
    rReady.mockReturnValue(false);
    customerServiceMock.getCustomerById.mockResolvedValue(mockCustomer);

    const result = await customerCacheService.getCustomerById('user-uuid-1');

    expect(rGet).not.toHaveBeenCalled();
    expect(result).toEqual(mockCustomer);
  });

  it('should fall back to DB if Redis.get throws', async () => {
    rGet.mockRejectedValue(new Error('Redis unavailable'));
    customerServiceMock.getCustomerById.mockResolvedValue(mockCustomer);

    const result = await customerCacheService.getCustomerById('user-uuid-1');

    expect(result).toEqual(mockCustomer);
  });

  it('should return null when customer is not in DB and not cache', async () => {
    rGet.mockResolvedValue(null);
    customerServiceMock.getCustomerById.mockResolvedValue(null);

    const result = await customerCacheService.getCustomerById('non-existent');

    expect(result).toBeNull();
    await new Promise(process.nextTick);
    expect(rSetEx).not.toHaveBeenCalled();
  });
});

describe('CustomerCacheService - invalidateCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rReady.mockReturnValue(true);
  });

  it('should delete the cache key when Redis is ready', async () => {
    rDel.mockResolvedValue(1);

    await customerCacheService.invalidateCustomer('user-uuid-1');

    // The implementation calls del with a plain string (not an array)
    expect(rDel).toHaveBeenCalledWith('customer:user-uuid-1');
  });

  it('should skip deletion when Redis is not ready', async () => {
    rReady.mockReturnValue(false);

    await customerCacheService.invalidateCustomer('user-uuid-1');

    expect(rDel).not.toHaveBeenCalled();
  });

  it('should not throw if Redis.del rejects', async () => {
    rDel.mockRejectedValue(new Error('Redis error'));

    await expect(customerCacheService.invalidateCustomer('user-uuid-1')).resolves.not.toThrow();
  });
});
