/**
 * Notification Shared Queries
 * Essential database operations reused across services and APIs.
 */

import { eq, and, count, isNull, lte } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { notifications, type Notification } from './notifications.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Finds a notification by ID, excluding soft-deleted records. */
export const findNotificationById = async (
  id: string,
  tx: Database = db,
): Promise<Notification | undefined> => {
  const [notification] = await tx
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, id), isNull(notifications.deleted_at)))
    .limit(1);
  return notification;
};

/** Finds a notification for a specific user to verify ownership. */
export const findNotificationByIdAndUser = async (
  id: string,
  userId: string,
  tx: Database = db,
): Promise<Notification | undefined> => {
  const [notification] = await tx
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.user_id, userId),
        isNull(notifications.deleted_at),
      ),
    )
    .limit(1);
  return notification;
};

/** Counts notifications that haven't been read or soft-deleted. */
export const countUnreadNotifications = async (
  userId: string,
  tx: Database = db,
): Promise<number> => {
  const [result] = await tx
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false),
        isNull(notifications.deleted_at),
      ),
    );
  return result?.count ?? 0;
};

/** Counts all un-deleted notifications for a user, with optional unread filter. */
export const countUserNotifications = async (
  userId: string,
  unreadOnly: boolean = false,
  tx: Database = db,
): Promise<number> => {
  const conditions = [eq(notifications.user_id, userId), isNull(notifications.deleted_at)];
  if (unreadOnly) conditions.push(eq(notifications.is_read, false));

  const [result] = await tx
    .select({ count: count() })
    .from(notifications)
    .where(and(...conditions));
  return result?.count ?? 0;
};

/** Marks a notification as read and records the timestamp. */
export const markNotificationAsRead = async (
  id: string,
  tx: Database = db,
): Promise<Notification | undefined> => {
  const [notification] = await tx
    .update(notifications)
    .set({ is_read: true, read_at: new Date() })
    .where(eq(notifications.id, id))
    .returning();
  return notification;
};

/** Marks all unread, un-deleted notifications for a user as read. */
export const markAllNotificationsAsRead = async (
  userId: string,
  tx: Database = db,
): Promise<number> => {
  const result = await tx
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
  return result.length;
};

/** Soft deletes a notification by setting its deleted_at timestamp. */
export const softDeleteNotification = async (
  id: string,
  tx: Database = db,
): Promise<Notification | undefined> => {
  const [notification] = await tx
    .update(notifications)
    .set({ deleted_at: new Date() })
    .where(eq(notifications.id, id))
    .returning();
  return notification;
};

/** Cleanup operation to soft delete all notifications past their expiration. */
export const deleteExpiredNotifications = async (tx: Database = db): Promise<number> => {
  const now = new Date();
  const result = await tx
    .update(notifications)
    .set({ deleted_at: now })
    .where(and(lte(notifications.expires_at, now), isNull(notifications.deleted_at)))
    .returning();
  return result.length;
};
