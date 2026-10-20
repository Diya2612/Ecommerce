import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * @module SecurityMiddleware
 * @description Hardens API endpoints by injecting fundamental security headers (via Helmet).
 * Intentionally omits Content-Security-Policy overhead since the API serves JSON, not HTML.
 */
export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  helmet({
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })(req, res, (err?: Error | null) => {
    if (err) {
      return next(err);
    }

    res.removeHeader('X-Powered-By');

    res.setHeader('X-API-Version', '1.0');

    next();
  });
};
