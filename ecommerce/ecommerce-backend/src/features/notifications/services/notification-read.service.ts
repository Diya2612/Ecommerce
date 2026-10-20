import { eq, and, desc, count, isNull, inArray } from 'drizzle-orm';
import { db } from '../../../database';
import { notifications } from '../shared/notifications.schema';
import type { INotification, GetNotificationsOptions } from '../shared/interface';

const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

class NotificationReadService {
  /** Fetches paginated notifications for a user with optional type and read/unread filters. */
  async getUserNotifications(
    userId: string,
    options: GetNotificationsOptions = {},
  ): Promise<INotification[]> {
    const limit = Math.min(
      options.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT,
    );
    const offset = options.offset || 0;

    const whereConditions = [eq(notifications.user_id, userId), isNull(notifications.deleted_at)];

    if (options.category && options.category !== 'all') {
      if (options.category === 'unread') {
        whereConditions.push(eq(notifications.is_read, false));
      } else if (options.category === 'orders') {
        whereConditions.push(
          inArray(notifications.type, [
            'order_created',
            'order_paid',
            'order_shipped',
            'order_delivered',
            'order_cancelled',
          ]),
        );
      } else if (options.category === 'payments') {
        whereConditions.push(
          inArray(notifications.type, [
            'payment_authorized',
            'payment_captured',
            'payment_failed',
            'payment_refunded',
          ]),
        );
      } else if (options.category === 'system') {
        whereConditions.push(
          inArray(notifications.type, [
            'inventory_low_stock',
            'inventory_out_of_stock',
            'inventory_restocked',
            'user_welcome',
            'account_updated',
            'password_changed',
            'admin_broadcast',
            'system_alert',
            'promotion',
            'newsletter',
          ]),
        );
      }
    }

    if (options.type) whereConditions.push(eq(notifications.type, options.type));
    if (options.isRead !== undefined)
      whereConditions.push(eq(notifications.is_read, options.isRead));

    return await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);
  }

  /** Retrieves a single notification after verifying user ownership. */
  async getNotificationById(notificationId: string, userId: string): Promise<INotification | null> {
    const [result] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, userId),
          isNull(notifications.deleted_at),
        ),
      )
      .limit(1);

    return result || null;
  }

  /** Counts unread, active notifications for a user. */
  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
          isNull(notifications.deleted_at),
        ),
      );
    return result?.count || 0;
  }

  /** Counts all non-deleted notifications for a user, respecting category filters. */
  async getTotalCount(userId: string, category?: string): Promise<number> {
    const whereConditions = [eq(notifications.user_id, userId), isNull(notifications.deleted_at)];

    if (category && category !== 'all') {
      if (category === 'unread') {
        whereConditions.push(eq(notifications.is_read, false));
      } else if (category === 'orders') {
        whereConditions.push(
          inArray(notifications.type, [
            'order_created',
            'order_paid',
            'order_shipped',
            'order_delivered',
            'order_cancelled',
          ]),
        );
      } else if (category === 'payments') {
        whereConditions.push(
          inArray(notifications.type, [
            'payment_authorized',
            'payment_captured',
            'payment_failed',
            'payment_refunded',
          ]),
        );
      } else if (category === 'system') {
        whereConditions.push(
          inArray(notifications.type, [
            'inventory_low_stock',
            'inventory_out_of_stock',
            'inventory_restocked',
            'user_welcome',
            'account_updated',
            'password_changed',
            'admin_broadcast',
            'system_alert',
            'promotion',
            'newsletter',
          ]),
        );
      }
    }

    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(...whereConditions));
    return result?.count || 0;
  }

  /** Aggregates notification metrics (total, unread, by type/priority) for analytics. */
  async getStats(userId?: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const whereCondition = userId
      ? and(eq(notifications.user_id, userId), isNull(notifications.deleted_at))
      : isNull(notifications.deleted_at);

    const [totalRes] = await db
      .select({ count: count() })
      .from(notifications)
      .where(whereCondition);
    const [unreadRes] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(whereCondition, eq(notifications.is_read, false)));

    const byTypeRes = await db
      .select({ type: notifications.type, count: count() })
      .from(notifications)
      .where(whereCondition)
      .groupBy(notifications.type);

    const byPriorityRes = await db
      .select({ priority: notifications.priority, count: count() })
      .from(notifications)
      .where(whereCondition)
      .groupBy(notifications.priority);

    return {
      total: totalRes?.count || 0,
      unread: unreadRes?.count || 0,
      byType: byTypeRes.reduce(
        (acc, row) => ({ ...acc, [row.type]: row.count }),
        {} as Record<string, number>,
      ),
      byPriority: byPriorityRes.reduce(
        (acc, row) => ({ ...acc, [row.priority]: row.count }),
        {} as Record<string, number>,
      ),
    };
  }
}

export const notificationReadService = new NotificationReadService();
export default notificationReadService;
