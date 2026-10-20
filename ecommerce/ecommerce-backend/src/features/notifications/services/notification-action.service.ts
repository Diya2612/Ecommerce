import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../database';
import { notifications } from '../shared/notifications.schema';
import { logger } from '../../../utils';
import type { INotification } from '../shared/interface';

class NotificationActionService {
  /** Marks a specific notification as read for the user. */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const result = await db
      .update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, userId),
          isNull(notifications.deleted_at),
        ),
      )
      .returning();

    if (result.length === 0) {
      logger.warn('Notification not found or access denied', { notificationId, userId });
      return null;
    }

    logger.info('Notification marked as read', { notificationId, userId });
    return result[0];
  }

  /** Marks all unread, active notifications for a user as read. */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
          isNull(notifications.deleted_at),
        ),
      )
      .returning();

    logger.info('All notifications marked as read', { userId, count: result.length });
    return result.length;
  }

  /** Soft deletes a notification by setting deleted_at. */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ deleted_at: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, userId),
          isNull(notifications.deleted_at),
        ),
      )
      .returning();

    if (result.length === 0) {
      logger.warn('Notification not found or access denied', { notificationId, userId });
      return false;
    }

    logger.info('Notification soft deleted', { notificationId, userId });
    return true;
  }
}

export const notificationActionService = new NotificationActionService();
export default notificationActionService;
