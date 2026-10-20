import { Request } from 'express';

/**
 * @module RequestInterfaces
 * @description Augments the Express Request namespace to enforce compile-time guarantees
 * for invariants established by middleware operations (e.g., authentication, request tracing).
 */

/**
 * @description Enforces the presence of a tracing identifier injected by `requestIdMiddleware`.
 */
export interface RequestWithId extends Request {
  requestId: string;
}

/**
 * @description Enforces the presence of an authenticated identity.
 * Binds the resolved user identity to the request context post Authentication middleware.
 */
export interface RequestWithUser extends Request {
  userId: string;
  userAgent?: string;
  clientIP?: string;
}

/**
 * @description Core entity shape representing a successfully authenticated security principal.
 */
export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Security principal structure augmented with active session tokens for outbound distribution.
 */
export interface IAuthUserWithToken extends IAuthUser {
  token: string;
  refreshToken?: string;
}

/**
 * @description Internal schema describing the cryptographically signed claims inside the stateless authentication token.
 */
export interface DataStoredInToken {
  id: number;
  email?: string;
  name?: string;
}
