import { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpException } from '../utils';
import { logger } from '../utils';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * @module ValidationMiddleware
 * @description Binds Zod schemas to request lifecycles, ensuring type safety and enforcing API contracts at the boundary.
 */
const validationMiddleware = (
  schema: z.ZodSchema,
  target: ValidationTarget = 'body',
): RequestHandler => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');

        logger.info('Validation failed', {
          target,
          path: req.path,
          errors: result.error.issues,
          requestId: req.requestId,
        });

        return next(new HttpException(400, errorMessages));
      }

      try {
        Object.defineProperty(req, target, {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } catch (error) {
        logger.error(`Failed to apply validated data to req.${target}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          target,
          path: req.path,
          requestId: req.requestId,
        });
        return next(new HttpException(500, 'Validation application failed'));
      }

      next();
    } catch (error: any) {
      logger.error('Validation middleware error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        target,
        path: req.path,
        requestId: req.requestId,
      });

      next(new HttpException(500, 'Validation error occurred'));
    }
  };
};

export default validationMiddleware;
