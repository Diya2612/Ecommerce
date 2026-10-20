import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/**
 * Notifications Feature
 * Manages user notifications, preferences, and delivery templates.
 */
class NotificationRoute implements Route {
  public path = '/notifications';
  public router = Router();

  /** Initializes routes using dynamic imports to prevent circular dependencies. */
  public async init() {
    const [
      { default: getUserNotificationsRouter },
      { default: getUnreadCountRouter },
      { default: getNotificationPreferencesRouter },
      { default: updateNotificationPreferencesRouter },
      { default: markAllNotificationsReadRouter },
      { default: getNotificationByIdRouter },
      { default: markNotificationReadRouter },
      { default: deleteNotificationRouter },
      { default: adminBroadcastRouter },
      { default: adminGetStatsRouter },
      { default: adminGetTemplatesRouter },
      { default: adminCreateTemplateRouter },
      { default: adminUpdateTemplateRouter },
      { default: getNotificationSettingsRouter },
      { default: updateNotificationSettingsRouter },
    ] = await Promise.all([
      import('./apis/get-user-notifications'),
      import('./apis/get-unread-count'),
      import('./apis/get-notification-preferences'),
      import('./apis/update-notification-preferences'),
      import('./apis/mark-all-notifications-read'),
      import('./apis/get-notification-by-id'),
      import('./apis/mark-notification-read'),
      import('./apis/delete-notification'),
      import('./apis/admin-broadcast-notification'),
      import('./apis/admin-get-stats'),
      import('./apis/admin-get-templates'),
      import('./apis/admin-create-template'),
      import('./apis/admin-update-template'),
      import('./apis/get-notification-settings'),
      import('./apis/update-notification-settings'),
    ]);

    this.router.use(this.path, getUserNotificationsRouter);
    this.router.use(this.path, getUnreadCountRouter);
    this.router.use(this.path, getNotificationPreferencesRouter);
    this.router.use(this.path, updateNotificationPreferencesRouter);
    this.router.use(this.path, getNotificationSettingsRouter);
    this.router.use(this.path, updateNotificationSettingsRouter);
    this.router.use(this.path, markAllNotificationsReadRouter);
    this.router.use(this.path, getNotificationByIdRouter);
    this.router.use(this.path, markNotificationReadRouter);
    this.router.use(this.path, deleteNotificationRouter);

    const adminPath = `${this.path}/admin`;
    this.router.use(adminPath, adminBroadcastRouter);
    this.router.use(adminPath, adminGetStatsRouter);
    this.router.use(`${adminPath}/templates`, adminGetTemplatesRouter);
    this.router.use(`${adminPath}/templates`, adminCreateTemplateRouter);
    this.router.use(`${adminPath}/templates`, adminUpdateTemplateRouter);
  }
}

export * from './shared';
export * from './services';
export default NotificationRoute;
