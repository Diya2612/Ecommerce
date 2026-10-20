import http from 'http';
import App from './app';
import { logger, redisClient, testRedisConnection } from './utils';
import { connectWithRetry, pool } from './database';
import { isProduction, config } from './utils/config/validate-env';
import { setupGracefulShutdown } from './utils/system/shutdown';
import { initializeDiscountCron } from './features/discount/jobs/discount-status-updater';
import { startWorkers, stopWorkers } from './features/queue';

import UserRoute from './features/user';
import AddressRoute from './features/address';
import AdminRoute from './features/admin';
import CustomerRoute from './features/customer';
import AuthRoute from './features/auth';
import ProductRoute from './features/product';
import ChatbotRoute from './features/chatbot';
import RBACRoute from './features/rbac';
import CartRoute from './features/cart';
import WishlistRoute from './features/wishlist';
import OrdersRoute from './features/orders';
import ReviewRoute from './features/reviews';
import PaymentsRoute from './features/payments';
import TierRoute from './features/tiers';
import DiscountRoute from './features/discount';
import ProfileRoute from './features/profile';
import InventoryRoute from './features/inventory';
import DashboardRoute from './features/dashboard';
import QueueRoute from './features/queue';
import NotificationRoute from './features/notifications';
import InvoiceRoute from './features/invoice';
import AbandonedCartRoute from './features/abandoned-cart';

/**
 * Catch-all handlers to prevent silent process crashes from unhandled async
 * failures (e.g., in cron jobs, socket handlers, or event emitters).
 * uncaughtException is fatal by design — we log and exit to allow the process
 * manager (PM2/Docker) to restart cleanly.
 */
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — terminating process', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

let httpServer: http.Server;

/**
 * Bootstraps the application by establishing infrastructure connections,
 * mounting all route modules, starting background workers and cron jobs,
 * and binding the HTTP server. Exits the process on any critical failure
 * so the process manager can trigger a restart.
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Express Backend...');

    // --- Database ---
    const dbConnected = await connectWithRetry(5, 1000);
    if (!dbConnected) {
      throw new Error('Failed to connect to database after multiple retries');
    }
    logger.info('✅ Database connected');

    // --- Redis ---
    // Redis is required in production (used for caching, rate-limiting, and queues).
    // In development, the server degrades gracefully without it.
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      if (isProduction) {
        throw new Error('Redis connection required in production environment');
      }
      logger.warn('⚠️ Redis not available — falling back to in-memory caching');
    } else {
      logger.info('✅ Redis connected');
    }

    // --- Express App ---
    const app = new App([
      new AuthRoute(),
      new UserRoute(),
      new AddressRoute(),
      new AdminRoute(),
      new CustomerRoute(),
      new ProductRoute(),
      new ChatbotRoute(),
      new RBACRoute(),
      new CartRoute(),
      new WishlistRoute(),
      new OrdersRoute(),
      new ReviewRoute(),
      new PaymentsRoute(),
      new TierRoute(),
      new DiscountRoute(),
      new ProfileRoute(),
      new InventoryRoute(),
      new DashboardRoute(),
      new QueueRoute(),
      new NotificationRoute(),
      new InvoiceRoute(),
      new AbandonedCartRoute(),
    ]);

    // --- Cron Jobs ---
    initializeDiscountCron();

    const { startCartReservationCleanup } =
      await import('./features/cart/jobs/cleanup-expired-reservations');
    startCartReservationCleanup();

    const { startGuestSessionCleanup } =
      await import('./features/cart/jobs/cleanup-expired-guest-sessions');
    startGuestSessionCleanup();

    const { startStalePendingOrderCleanup } =
      await import('./features/orders/jobs/cancel-stale-orders');
    startStalePendingOrderCleanup();

    // --- Async Routes ---
    // Must complete before the server starts accepting traffic so that all
    // dynamically-imported route handlers are registered and ready.
    await app.initializeAsyncRoutes();
    logger.info('✅ Async routes initialized');

    // --- HTTP Server ---
    // The HTTP server wraps Express so that Socket.IO can share the same port.
    const expressApp = app.getServer();
    httpServer = http.createServer(expressApp);

    // --- Start Listening ---
    httpServer.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`🌐 Server running on port ${config.PORT}`);
      logger.info(`📍 Environment: ${isProduction ? 'production' : 'development'}`);
    });

    // --- Queue Workers ---
    // Workers are optional: skipped when explicitly disabled or when Redis is unavailable.
    const workersEnabled = config.QUEUE_WORKERS_ENABLED === 'true';
    if (workersEnabled && redisConnected) {
      try {
        await startWorkers();
      } catch (error) {
        logger.error('Failed to start queue workers', { error });
        logger.warn('⚠️ Server will continue without queue workers');
      }
    } else if (workersEnabled && !redisConnected) {
      logger.warn('⚠️ Queue workers require Redis — workers not started');
    }

    // --- Graceful Shutdown ---
    // Register cleanup handlers after all resources are fully initialised so
    // the shutdown routine has accurate references to close them.
    setupGracefulShutdown({
      server: httpServer,
      database: pool,
      redis: redisClient,
    });

    // Workers must be stopped before the HTTP server closes to avoid processing
    // jobs after the database connection has been torn down.
    const originalSigtermListeners = process.listeners('SIGTERM');
    const originalSigintListeners = process.listeners('SIGINT');

    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');

    const handleShutdown = async (signal: NodeJS.Signals): Promise<void> => {
      logger.info(`Received ${signal} — stopping workers before server shutdown`);

      if (workersEnabled) {
        try {
          await stopWorkers();
        } catch (error) {
          logger.error('Error stopping workers during shutdown', { error });
        }
      }

      // Delegate to the handlers registered by setupGracefulShutdown.
      // Signal listeners are synchronous (NodeJS.SignalsListener returns void),
      // so we invoke them directly rather than through Promise.all.
      const listeners = signal === 'SIGTERM' ? originalSigtermListeners : originalSigintListeners;
      for (const fn of listeners) {
        (fn as NodeJS.SignalsListener)(signal);
      }
    };

    process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
    process.on('SIGINT', () => void handleShutdown('SIGINT'));

    logger.info('✅ Express Backend started successfully!');
  } catch (error) {
    logger.error('Fatal error during startup — shutting down', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Best-effort cleanup before process exit. Errors here are logged but do
    // not change the exit code — the startup failure is the root cause.
    try {
      if (pool) {
        await pool.end();
        logger.info('Database connections closed');
      }
      if (redisClient?.isOpen) {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }
    } catch (cleanupError) {
      logger.error('Error during startup cleanup', { cleanupError });
    }

    process.exit(1);
  }
}

// top-level bootstrap — void operator acknowledges the returned Promise intentionally
void bootstrap();
