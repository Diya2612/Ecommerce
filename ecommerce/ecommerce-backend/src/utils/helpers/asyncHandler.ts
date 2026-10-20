import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to catch any rejected promises
 * and pass them to the global error middleware (next(err)).
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
