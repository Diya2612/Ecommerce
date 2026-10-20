import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class ProfileRoute implements Route {
  public path = '/profile';
  public router = Router();

  public async init() {
    try {
      // Dynamic imports avoid circular dependencies with middlewares
      const { default: getProfileSettingsRouter } = await import('./apis/get-profile-settings');
      const { default: updateProfileSettingsRouter } =
        await import('./apis/update-profile-settings');
      const { default: getSecuritySettingsRouter } = await import('./apis/get-security-settings');
      const { default: changePasswordRouter } = await import('./apis/change-password');
      const { default: enrollMfaRouter } = await import('./apis/enroll-mfa');
      const { default: verifyMfaRouter } = await import('./apis/verify-mfa');
      const { default: disableMfaRouter } = await import('./apis/disable-mfa');
      const { default: getNotificationPreferencesRouter } =
        await import('./apis/get-notification-preferences');
      const { default: updateNotificationPreferencesRouter } =
        await import('./apis/update-notification-preferences');
      const { default: logoutSessionRouter } = await import('./apis/logout-session');
      const { default: deleteAccountRouter } = await import('./apis/delete-account');

      this.router.use(this.path, getProfileSettingsRouter);
      this.router.use(this.path, updateProfileSettingsRouter);
      this.router.use(this.path, getSecuritySettingsRouter);
      this.router.use(this.path, changePasswordRouter);
      this.router.use(this.path, enrollMfaRouter);
      this.router.use(this.path, verifyMfaRouter);
      this.router.use(this.path, disableMfaRouter);
      this.router.use(this.path, logoutSessionRouter);
      this.router.use(this.path, getNotificationPreferencesRouter);
      this.router.use(this.path, updateNotificationPreferencesRouter);
      this.router.use(this.path, deleteAccountRouter);
    } catch (_error) {
      // Failed to initialize profile routes
    }
  }
}

export default ProfileRoute;

export * from './shared';
