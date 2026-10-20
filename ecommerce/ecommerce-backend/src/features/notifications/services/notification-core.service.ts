import { db } from '../../../database';
import { notifications } from '../shared/notifications.schema';
import { logger } from '../../../utils';
import { templateService } from './template.service';
import { preferenceService } from './preference.service';
import { deliveryService } from './delivery.service';
import type {
  CreateNotificationInput,
  CreateFromTemplateInput,
  INotification,
  INotificationType,
} from '../shared/interface';

export const NOTIFICATION_LIMITS = {
  MAX_TITLE_LENGTH: 255,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_ACTION_TEXT_LENGTH: 100,
} as const;

class NotificationCoreService {
  /** Maps template codes to valid database enum values. */
  private templateCodeToNotificationType(templateCode: string): string {
    const templateToTypeMap: Record<string, string> = {
      ORDER_CREATED: 'order_created',
      NEW_ORDER_RECEIVED: 'order_created',
      ORDER_SHIPPED: 'order_shipped',
      ORDER_DELIVERED: 'order_delivered',
      PAYMENT_CAPTURED: 'payment_captured',
      PAYMENT_CONFIRMED: 'payment_captured',
      LOW_STOCK_ALERT: 'inventory_low_stock',
      USER_WELCOME: 'user_welcome',
    };
    return templateToTypeMap[templateCode] || templateCode.toLowerCase();
  }

  /**
   * Orchestrates notification creation from a template.
   * Handles user preferences, quiet hours, rendering, and async delivery.
   */
  async createFromTemplate(input: CreateFromTemplateInput): Promise<INotification | null> {
    const { userId, templateCode, variables, priority, actionUrl, actionText } = input;

    try {
      const type = this.templateCodeToNotificationType(templateCode);
      const preference = await preferenceService.getUserPreferences(userId, type);

      if (preference.frequency === 'never') {
        logger.info('Notification skipped by user preference', { userId, templateCode });
        return null;
      }

      if (preferenceService.isWithinQuietHours(preference)) {
        logger.info('Notification delayed - within quiet hours', { userId, templateCode });
        // TODO: Implement queuing for later delivery
        return null;
      }

      const rendered = await templateService.renderTemplate(templateCode, variables);
      const activeChannels = preferenceService.getActiveChannels(preference);

      if (activeChannels.length === 0) {
        logger.warn('No active delivery channels for user', { userId, templateCode });
        return null;
      }

      const notification = await this.create({
        userId,
        type,
        title: rendered.title,
        message: rendered.message,
        data: variables,
        channels: activeChannels,
        priority,
        actionUrl,
        actionText,
      });

      // Async delivery to external channels
      setImmediate(() => {
        deliveryService
          .deliverNotification(
            notification.id,
            userId,
            activeChannels.filter((c) => c !== 'in_app'),
            {
              title: rendered.title,
              message: rendered.message,
              emailSubject: rendered.emailSubject,
              emailHtml: rendered.emailHtml,
              emailText: rendered.emailText,
              smsMessage: rendered.smsMessage,
            },
          )
          .catch((error) =>
            logger.error('Async delivery failed', { notificationId: notification.id, error }),
          );
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification from template', { userId, templateCode, error });
      throw error;
    }
  }

  /** Persists a manual notification record to the database. */
  async create(input: CreateNotificationInput): Promise<INotification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        user_id: input.userId,
        type: input.type as INotificationType,
        title: input.title,
        message: input.message,
        data: input.data || {},
        channels: input.channels || ['in_app'],
        priority: input.priority || 'normal',
        action_url: input.actionUrl,
        action_text: input.actionText,
      })
      .returning();

    return notification;
  }

  /** Sends a notification to multiple users simultaneously. */
  async broadcast(
    userIds: string[],
    data: {
      title: string;
      message: string;
      type?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      actionText?: string;
      channels?: string[];
    },
  ): Promise<INotification[]> {
    const notificationData = userIds.map((userId) => ({
      user_id: userId,
      type: (data.type || 'admin_broadcast') as INotificationType,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      action_url: data.actionUrl,
      action_text: data.actionText,
      channels: data.channels || ['in_app'],
      data: {},
    }));

    return await db.insert(notifications).values(notificationData).returning();
  }
}

export const notificationCoreService = new NotificationCoreService();
export default notificationCoreService;
