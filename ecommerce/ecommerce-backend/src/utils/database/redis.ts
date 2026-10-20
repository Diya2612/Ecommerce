import { createClient } from 'redis';
import { logger } from '../logging/logger';
import { config } from '../config/validate-env';

// Determine connection parameters based on REDIS_MODE
const isCloudMode = config.REDIS_MODE === 'cloud';
const host = isCloudMode ? config.REDIS_CLOUD_HOST : config.REDIS_LOCAL_HOST;
const port = isCloudMode ? config.REDIS_CLOUD_PORT : config.REDIS_LOCAL_PORT;
const password = isCloudMode ? config.REDIS_CLOUD_PASSWORD : config.REDIS_LOCAL_PASSWORD;

// Redis configuration from environment variables
const redisUrl = config.REDIS_URL || `redis://${host}:${port}`;

// Create Redis client instance with URL format and bounded reconnect attempts
export const redisClient = createClient({
  url: redisUrl,
  password: password || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 2) {
        return false; // Stop retrying so the app can fallback to memory cache
      }
      return 500;
    },
    connectTimeout: 3000,
  },
});

export const redis = redisClient;

/** Track Redis connection state */
let isRedisConnected = false;

// Handle Redis connection events
redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis successfully');
});

redisClient.on('error', (error) => {
  isRedisConnected = false;
  logger.error('❌ Redis connection error:', error);
});

redisClient.on('ready', () => {
  isRedisConnected = true;
  logger.info('✅ Redis client is ready');
});

redisClient.on('end', () => {
  isRedisConnected = false;
  logger.warn('⚠️ Redis connection closed');
});

/**
 * Checks if Redis is currently connected and ready.
 */
export const isRedisReady = (): boolean => isRedisConnected && redisClient.isReady;

// Test Redis connectivity
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const isCloudMode = config.REDIS_MODE === 'cloud';
    const host = isCloudMode ? config.REDIS_CLOUD_HOST : config.REDIS_LOCAL_HOST;
    const port = isCloudMode ? config.REDIS_CLOUD_PORT : config.REDIS_LOCAL_PORT;
    logger.info(`🔄 Testing Redis connection to ${host}:${port}...`);

    if (!redisClient.isReady) {
      await redisClient.connect();
    }

    const result = await redisClient.ping();
    logger.info(`✅ Redis connection test passed: ${result}`);
    return true;
  } catch (error) {
    logger.error('❌ Redis connection test failed:', error);
    return false;
  }
};

export default redisClient;
