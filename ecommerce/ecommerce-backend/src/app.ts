import express from 'express';
import hpp from 'hpp';
import compression from 'compression';
import type { Route as Routes } from './interfaces';
import {
  authRateLimit,
  apiRateLimit,
  requestIdMiddleware,
  securityMiddleware,
  corsMiddleware,
  requestLoggerMiddleware,
  sanitizeInput,
  errorMiddleware,
} from './middlewares';
import { logger } from './utils';
import { config } from './utils/config/validate-env';
import { checkDatabaseHealth } from './database';
import { isRedisReady } from './utils';

class App {
  public app: express.Application;
  public port: number;
  public env: string;
  private routes: Routes[];

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = config.PORT;
    this.env = config.NODE_ENV;
    this.routes = routes;

    // Middleware and routes must be registered in this order:
    // middlewares → routes → error handler (Express processes them sequentially).
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSystemRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Returns the underlying Express application instance.
   * Used by `server.ts` to wrap it in an `http.Server` so that
   * Socket.IO can share the same port.
   */
  public getServer(): express.Application {
    return this.app;
  }

  /**
   * Calls the optional `init()` lifecycle hook on each route module.
   * Must be awaited before the HTTP server starts accepting traffic to
   * ensure all dynamically-imported handlers are fully registered.
   */
  public async initializeAsyncRoutes(): Promise<void> {
    await Promise.all(
      this.routes.map(async (route) => {
        if (route.init) {
          await route.init();
        }
      }),
    );
  }

  private initializeMiddlewares(): void {
    // Request ID must be first so every subsequent middleware and log entry
    // can reference a stable correlation ID for the lifecycle of the request.
    this.app.use(requestIdMiddleware);

    this.app.use(securityMiddleware);
    this.app.use(corsMiddleware);

    // hpp prevents HTTP parameter pollution attacks (e.g. ?sort=asc&sort=desc).
    this.app.use(hpp());

    this.app.use(requestLoggerMiddleware);
    this.app.use(compression());

    // Auth-related endpoints get a stricter rate limit than the general API
    // to slow credential-stuffing and brute-force attacks.
    this.app.use('/api/auth/login', authRateLimit);
    this.app.use('/api/auth/register', authRateLimit);
    this.app.use('/api/auth/refresh-token', authRateLimit);
    this.app.use('/api/', apiRateLimit);

    // Razorpay webhook signature verification requires the raw, unparsed
    // request body. This must be registered before express.json() so the
    // buffer is captured before it is consumed by the JSON parser.
    this.app.use(
      '/api/webhooks/razorpay',
      express.raw({
        type: 'application/json',
        limit: '1mb',
        verify: (req, _res, buf) => {
          (req as express.Request & { rawBody: string }).rawBody = buf.toString('utf8');
        },
      }),
      (req, _res, next) => {
        try {
          req.body = JSON.parse((req as express.Request & { rawBody: string }).rawBody);
        } catch {
          req.body = {};
        }
        next();
      },
    );

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // XSS sanitization runs after body parsing (so the body exists) but
    // before routes (so handlers always receive sanitized input).
    this.app.use(sanitizeInput);

  }

  private initializeRoutes(routes: Routes[]): void {
    // Each route module handles its own authentication via requireAuth,
    // allowing fine-grained per-endpoint access control.
    routes.forEach((route) => {
      this.app.use('/api/', route.router);
    });
  }

  /**
   * Registers infrastructure-level routes (root, health check).
   * Separated from feature routes so they are always present and easy to locate.
   */
  private initializeSystemRoutes(): void {
    this.app.get('/', (_req, res) => {
      res.send('Welcome to Anant Enterprises Backend API');
    });

    // The health check is consumed by load balancers and uptime monitors.
    // It returns 200 only when all critical dependencies (DB + Redis) are healthy,
    // allowing the orchestrator to route traffic away from a degraded instance.
    this.app.get('/health', async (_req, res) => {
      const startTime = Date.now();
      try {
        const dbHealth = await checkDatabaseHealth();
        const redisHealthy = isRedisReady();

        // Both DB and Redis are considered critical in production.
        const isHealthy = dbHealth.status === 'healthy' && redisHealthy;

        res.status(isHealthy ? 200 : 503).json({
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          environment: this.env,
          uptime: process.uptime(),
          responseTime: Date.now() - startTime,
          version: process.env.npm_package_version ?? 'unknown',
          memory: {
            usedMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            totalMb: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
            usagePercent: Math.round(
              (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
            ),
          },
          dependencies: {
            database: {
              status: dbHealth.status,
              poolStats: dbHealth.details.poolStats,
              latency: dbHealth.details.latency,
            },
            redis: {
              status: redisHealthy ? 'healthy' : 'unavailable',
            },
          },
        });
      } catch (error) {
        logger.error('Health check failed', { error });
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed',
          responseTime: Date.now() - startTime,
        });
      }
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default App;
