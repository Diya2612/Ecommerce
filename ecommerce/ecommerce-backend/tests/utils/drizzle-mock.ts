// Mock drizzle-orm before any test files load
jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm');
  return {
    ...actual,
    sql: jest.fn((template, ...values) => ({
      sql: template,
      values,
      toString: () => template,
    })),
  };
});

// Mock Redis utilities globally so the real Redis client is never initialized
// during unit tests. Individual tests can override these via
// (isRedisReady as jest.Mock).mockReturnValue(true/false).
jest.mock('@/utils/database/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    isOpen: false,
    isReady: false,
    disconnect: jest.fn().mockResolvedValue(undefined),
  },
  redis: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    isOpen: false,
    isReady: false,
    disconnect: jest.fn().mockResolvedValue(undefined),
  },
  isRedisReady: jest.fn().mockReturnValue(false),
  testRedisConnection: jest.fn().mockResolvedValue(false),
}));

// Mock logger globally so real logging modules don't initialize external libs
jest.mock('@/utils/logging/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
