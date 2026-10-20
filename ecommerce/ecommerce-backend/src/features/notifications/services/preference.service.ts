import { eq, and } from 'drizzle-orm';
import { db } from '../../../database';
import { notificationPreferences } from '../shared/notification-preferences.schema';
import { logger } from '../../../utils';
import type { NotificationType } from '../shared/notifications.schema';

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app',
  PUSH: 'push',
} as const;

class PreferenceService {
  /** Retrieves user settings for a notification type, falling back to defaults. */
  async getUserPreferences(userId: string, notificationType: string) {
    const [preference] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.user_id, userId),
          eq(notificationPreferences.notification_type, notificationType as any),
        ),
      )
      .limit(1);

    return preference || this.getDefaultPreferences();
  }

  /** Fetches all preference records for a user. */
  async getAllUserPreferences(userId: string) {
    return await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.user_id, userId));
  }

  /** Updates or creates a preference record for a specific notification type. */
  async updatePreference(
    userId: string,
    notificationType: string,
    settings: {
      channel_email?: boolean;
      channel_sms?: boolean;
      channel_in_app?: boolean;
      channel_push?: boolean;
      frequency?: 'immediate' | 'never';
      quiet_hours_enabled?: boolean;
      quiet_hours_start?: string;
      quiet_hours_end?: string;
    },
  ) {
    const [result] = await db
      .insert(notificationPreferences)
      .values({
        user_id: userId,
        notification_type: notificationType as any,
        ...settings,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.user_id, notificationPreferences.notification_type],
        set: { ...settings, updated_at: new Date() },
      })
      .returning();

    logger.info('Preference updated', { userId, notificationType });
    return result;
  }

  /** Seeds default preferences for a new user. */
  async initializeUserPreferences(userId: string) {
    const notificationTypes: NotificationType[] = [
      'order_created',
      'order_shipped',
      'order_delivered',
      'payment_captured',
      'user_welcome',
    ];

    const defaultSettings = this.getDefaultPreferences();
    const insertPromises = notificationTypes.map((type) =>
      db
        .insert(notificationPreferences)
        .values({ user_id: userId, notification_type: type, ...defaultSettings })
        .onConflictDoNothing(),
    );

    await Promise.all(insertPromises);
    logger.info('User preferences initialized', { userId });
  }

  /** Standard default settings for all notification types. */
  getDefaultPreferences() {
    return {
      channel_email: true,
      channel_sms: false,
      channel_in_app: true,
      channel_push: true,
      frequency: 'immediate' as const,
      quiet_hours_enabled: false,
      quiet_hours_start: null,
      quiet_hours_end: null,
    };
  }

  /** Validates if current time falls within a user's DND quiet hours. */
  isWithinQuietHours(preference: any): boolean {
    if (
      !preference.quiet_hours_enabled ||
      !preference.quiet_hours_start ||
      !preference.quiet_hours_end
    ) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { quiet_hours_start: start, quiet_hours_end: end } = preference;

    return start > end
      ? currentTime >= start || currentTime <= end
      : currentTime >= start && currentTime <= end;
  }

  /** Returns array of channel names enabled in the given preference record. */
  getActiveChannels(preference: any): string[] {
    const channels: string[] = [];
    if (preference.channel_in_app) channels.push('in_app');
    if (preference.channel_email) channels.push('email');
    if (preference.channel_sms) channels.push('sms');
    if (preference.channel_push) channels.push('push');
    return channels;
  }
}

export const preferenceService = new PreferenceService();
