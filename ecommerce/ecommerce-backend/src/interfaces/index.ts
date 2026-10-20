/**
 * @module Interfaces
 * @description Centralized registry exporting domain, HTTP, and operational type boundaries.
 */

export type { default as Route } from './route.interface';

export type {
  RequestWithId,
  RequestWithUser,
  IAuthUser,
  IAuthUserWithToken,
  DataStoredInToken,
} from './request.interface';

// Ambient declarations (.d.ts files) live in src/types — including Express namespace extensions
