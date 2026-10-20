import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';
import { config } from '../utils/config/validate-env';

const getAllowedOrigins = (): string[] => {
  return config.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
};

/**
 * @description Configures CORS rules based on environment strictness, managing cross-origin access control.
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn(`CORS: Rejected origin ${origin}`, {
      origin,
      allowedOrigins,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
    });
  }

  const corsHandler = cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Session-ID'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  });

  corsHandler(req, res, next);
};
