import { eq } from 'drizzle-orm';
import { db } from '../../../database';
import { userNotificationSettings } from '../shared/user-notification-settings.schema';
import { logger } from '../../../utils';

class SettingsService {
  /** Retrieves global notification settings for a user, initializing defaults if missing. */
  async getSettings(userId: string) {
    let [settings] = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.user_id, userId))
      .limit(1);

    if (!settings) {
      [settings] = await db
        .insert(userNotificationSettings)
        .values({ user_id: userId })
        .returning();
      logger.info('Notification settings initialized', { userId });
    }

    return settings;
  }

  /** Updates user's global notification settings. */
  async updateSettings(
    userId: string,
    data: {
      email_enabled?: boolean;
      in_app_enabled?: boolean;
      push_enabled?: boolean;
      sms_enabled?: boolean;
    },
  ) {
    const [result] = await db
      .insert(userNotificationSettings)
      .values({ user_id: userId, ...data })
      .onConflictDoUpdate({
        target: [userNotificationSettings.user_id],
        set: { ...data, updated_at: new Date() },
      })
      .returning();

    logger.info('Notification settings updated', { userId });
    return result;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
