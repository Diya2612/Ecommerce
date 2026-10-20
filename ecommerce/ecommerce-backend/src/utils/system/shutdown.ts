import { logger } from '../logging/logger';

/**
 * Graceful Shutdown Utility
 * Ensures proper cleanup of HTTP server, databases, and caches before exiting the process.
 */

interface ShutdownResources {
  server?: import('http').Server;
  database?: { end: () => Promise<void> };
  redis?: { isOpen: boolean; quit: () => Promise<string> };
}

/**
 * Wraps `server.close()` in a Promise for structured async/await handling.
 */
function closeServer(server: import('http').Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Graceful shutdown executor.
 * Safely drains and closes active connections to prevent data loss or hanging requests.
 *
 * @param signal The termination signal received
 * @param resources The active application resources to shut down
 */
export async function gracefulShutdown(signal: string, resources: ShutdownResources = {}) {
  logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close HTTP server first (stop accepting new connections)
    if (resources.server) {
      logger.info('🔌 Closing HTTP server...');
      await closeServer(resources.server);
      logger.info('✅ HTTP server closed');
    }

    // Close database connections
    if (resources.database) {
      logger.info('🔌 Closing database connections...');
      await resources.database.end();
      logger.info('✅ Database connections closed');
    }

    // Close Redis connection if connected
    if (resources.redis) {
      try {
        if (resources.redis.isOpen) {
          logger.info('🔌 Closing Redis connection...');
          await resources.redis.quit();
          logger.info('✅ Redis connection closed');
        }
      } catch (redisError) {
        logger.warn('⚠️ Error closing Redis connection:', redisError);
      }
    }

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

/**
 * Configures process event listeners for graceful shutdown signals and uncaught exceptions.
 *
 * @param resources The active application resources to track
 */
export function setupGracefulShutdown(resources: ShutdownResources = {}) {
  // Handle shutdown signals
  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM', resources));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT', resources));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    void gracefulShutdown('uncaughtException', resources);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    void gracefulShutdown('unhandledRejection', resources);
  });

  logger.info('🛡️ Graceful shutdown handlers configured');
}
