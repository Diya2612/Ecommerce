/**
 * User Feature
 * Central exports and routing for user management.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class UserRoute implements Route {
  public path = '/users';
  public router = Router();

  public async init() {
    // Dynamic imports to prevent circular dependencies with middlewares
    const { default: getAllUsersRouter } = await import('./apis/get-all-users');
    const { default: getCurrentUserRouter } = await import('./apis/get-current-user');
    const { default: getUserByIdRouter } = await import('./apis/get-user-by-id');
    const { default: updateUserRouter } = await import('./apis/update-user');
    const { default: deleteUserRouter } = await import('./apis/delete-user');

    const { default: getUserOrdersRouter } = await import('../orders/apis/get-user-orders');

    // Address routers
    const { default: getUserAddressesRouter } = await import('../address/apis/get-addresses');
    const { default: createUserAddressRouter } = await import('../address/apis/create-address');
    const { default: updateUserAddressRouter } = await import('../address/apis/update-address');
    const { default: deleteUserAddressRouter } = await import('../address/apis/delete-address');
    const { default: setDefaultAddressRouter } =
      await import('../address/apis/set-default-address');

    // OTP verification routers
    const { default: sendEmailOtpRouter } = await import('./apis/send-email-otp');
    const { default: verifyEmailOtpRouter } = await import('./apis/verify-email-otp');

    // Profile overview routers
    const { default: getUserStatsRouter } = await import('./apis/get-user-stats');
    const { default: getUserActivityRouter } = await import('./apis/get-user-activity');

    // Core user routes
    this.router.use(this.path, getAllUsersRouter);
    this.router.use(this.path, getCurrentUserRouter);

    // OTP verification
    this.router.use(this.path, sendEmailOtpRouter);
    this.router.use(this.path, verifyEmailOtpRouter);

    // Profile overview stats & activity (must come before dynamic :id routes)
    this.router.use(this.path, getUserStatsRouter);
    this.router.use(this.path, getUserActivityRouter);

    // Sub-resources
    this.router.use(this.path, getUserOrdersRouter);

    // Address sub-resources
    this.router.use(this.path, getUserAddressesRouter);
    this.router.use(this.path, createUserAddressRouter);
    this.router.use(this.path, setDefaultAddressRouter);
    this.router.use(this.path, updateUserAddressRouter);
    this.router.use(this.path, deleteUserAddressRouter);

    // User-specific dynamic routes
    this.router.use(this.path, getUserByIdRouter);
    this.router.use(this.path, updateUserRouter);
    this.router.use(this.path, deleteUserRouter);
  }
}

// Routes
export default UserRoute;

// Services
export { userCacheService, UserCacheService } from './services/user-cache.service';

// Shared resources
export * from './shared/user.schema';
export * from './shared/interface';
export * from './shared/queries';
export * from './shared/interface';
