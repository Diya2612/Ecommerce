/**
 * Auth Feature
 * Central exports and route initialization for authentication.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class AuthRoute implements Route {
  public path = '/auth';
  public router = Router();

  public async init() {
    // Dynamic imports to avoid circular dependency
    const { default: refreshTokenRouter } = await import('./apis/refresh-token');
    const { default: requestPasswordResetRouter } = await import('./apis/request-password-reset');
    const { default: resetPasswordRouter } = await import('./apis/reset-password');
    const { default: syncUserRouter } = await import('./apis/sync-user');

    this.router.use(this.path, refreshTokenRouter);
    this.router.use(this.path, requestPasswordResetRouter);
    this.router.use(this.path, resetPasswordRouter);
    this.router.use(this.path, syncUserRouter);
  }
}

// Main route export
export default AuthRoute;

// Services
export * from './services/supabase-auth.service';

// Shared resources
export * from './shared/interface';
export * from './shared/queries';
