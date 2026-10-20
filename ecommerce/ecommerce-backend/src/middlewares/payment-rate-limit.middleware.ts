/**
 * @module PaymentRateLimitMiddleware
 * @description Specialized operational throttling specifically calibrated for high-risk financial boundaries.
 * Enforces strict limits on payment intent creation and resolution to mitigate brute-force attacks on financial rails.
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../utils';
import { isDevelopment } from '../utils/config/validate-env';

/**
 * @description Restricts payment intent creation velocities to prevent fraudulent card testing attacks.
 */
export const paymentCreateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many payment attempts. Please wait 15 minutes before trying again.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      retry_after: 900,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return (req as { userId?: string }).userId || ipKeyGenerator(req.ip || 'unknown');
  },
  skip: () => {
    // Skip rate limiting in development environment
    return isDevelopment;
  },
  handler: (req, res) => {
    logger.warn('Payment rate limit exceeded', {
      userId: (req as { userId?: string }).userId,
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: 'Too many payment attempts. Please wait before trying again.',
      error: { code: 'RATE_LIMIT_EXCEEDED' },
    });
  },
});

/**
 * @description Guards payment callback resolution pathways.
 */
export const paymentVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many verification attempts.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string }).userId || ipKeyGenerator(req.ip || 'unknown'),
  skip: () => isDevelopment,
});

/**
 * @description Highly restrictive guard for financial outflow operations.
 */
export const refundRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many refund requests. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string }).userId || ipKeyGenerator(req.ip || 'unknown'),
  skip: () => isDevelopment,
});

/**
 * @description Infrastructure-level throughput allowance for external financial webhooks.
 */
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { status: 'error', message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
  skip: () => isDevelopment,
});
