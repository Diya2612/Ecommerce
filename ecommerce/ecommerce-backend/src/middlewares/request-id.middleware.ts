import { Request, Response, NextFunction } from 'express';
import { generateUUID } from '../utils';
import { RequestWithId } from '../interfaces';

/**
 * @module RequestIdMiddleware
 * @description Injects tracking identifiers. Fundamental for distributed tracing and correlating log events across microservices.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || generateUUID();

  (req as RequestWithId).requestId = requestId;

  res.setHeader('X-Request-ID', requestId);

  next();
};
