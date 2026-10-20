/**
 * Order Notification Service
 * Handles all order-related email and push notifications
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { eventPublisher } from '../../queue/services/event-publisher.service';
import { getAllAdminUserIds } from '../../rbac/shared/queries';
import { TEMPLATE_CODES } from '../../notifications/shared/constants';
import { logger } from '../../../utils';
import { config } from '../../../utils/config/validate-env';

// Get base URLs from validated environment config (no localhost fallbacks)
const FRONTEND_URL = config.FRONTEND_URL.replace(/\/+$/, '');
const ADMIN_URL = config.ADMIN_URL.replace(/\/+$/, '');

// Interfaces live in shared/interface.ts — re-exported here for backward compatibility
export type { OrderNotificationData, StatusChangeNotificationData } from '../shared/interface';
import type { StatusChangeNotificationData } from '../shared/interface';

class OrderNotificationService {
  /**
   * Queue customer email notification for new order
   *
   * Sends a confirmation email to the customer with order details and a link to view the order.
   * This function runs asynchronously and will not throw errors if notification fails.
   *
   * @param userId - Customer's user ID
   * @param orderId - Unique order ID (UUID)
   * @param orderNumber - Human-readable order number (e.g., "ORD-26-000123")
   * @param totalAmount - Order total amount as string
   * @param currency - Currency code (e.g., "INR", "USD")
   * @returns Promise that resolves when notification is queued (doesn't fail on error)
   *
   * @example
   * await orderNotificationService.queueCustomerOrderNotification(
   *   'user-123',
   *   'order-uuid',
   *   'ORD-26-000001',
   *   '1234.56',
   *   'INR'
   * );
   */
  async queueCustomerOrderNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    totalAmount: string,
    currency: string = 'INR',
  ): Promise<void> {
    try {
      const [customer] = await db
        .select({ name: users.first_name, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!customer) {
        logger.warn('Skipping customer notification: User not found', { userId, orderId });
        return;
      }

      await eventPublisher.publishNotification({
        userId,
        templateCode: TEMPLATE_CODES.ORDER_CREATED,
        variables: {
          userName: customer.name || 'Customer',
          orderNumber,
          total: Number(totalAmount).toFixed(2),
          currency,
          orderUrl: `${FRONTEND_URL}/profile/orders/${orderId}`,
        },
        options: {
          priority: 'high',
          actionUrl: `/profile/orders/${orderId}`,
          actionText: 'View Order',
        },
      });

      logger.info('Customer order notification queued', { userId, orderId, orderNumber });
    } catch (error) {
      logger.error('Failed to queue customer notification', { userId, orderId, error });
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Queue admin notification for new order to all admin users
   *
   * Sends batch notifications to all admin users alerting them of a new order.
   * Each admin receives a notification with order details and link to admin panel.
   * This function runs asynchronously and will not throw errors if notification fails.
   *
   * @param orderId - Unique order ID (UUID)
   * @param orderNumber - Human-readable order number (e.g., "ORD-26-000123")
   * @param customerName - Name of the customer who placed the order
   * @param totalAmount - Order total amount as string
   * @returns Promise that resolves when notifications are queued (doesn't fail on error)
   *
   * @example
   * await orderNotificationService.queueAdminOrderNotification(
   *   'order-uuid',
   *   'ORD-26-000001',
   *   'John Doe',
   *   '1234.56'
   * );
   */
  async queueAdminOrderNotification(
    orderId: string,
    orderNumber: string,
    customerName: string,
    totalAmount: string,
  ): Promise<void> {
    try {
      logger.info('Fetching admin user IDs for notification...');
      const adminUserIds = await getAllAdminUserIds();
      logger.info('Admin user IDs fetched', { count: adminUserIds.length, ids: adminUserIds });

      if (adminUserIds.length > 0) {
        await eventPublisher.publishBatchNotification({
          userIds: adminUserIds,
          templateCode: TEMPLATE_CODES.NEW_ORDER_RECEIVED,
          variables: {
            orderNumber,
            customerName,
            total: Number(totalAmount).toFixed(2),
            orderUrl: `${ADMIN_URL}/orders/${orderId}`,
          },
          options: {
            priority: 'normal',
            actionUrl: `/orders/${orderId}`,
            actionText: 'View Order',
          },
        });

        logger.info('Admin notifications queued', { count: adminUserIds.length, orderId });
      } else {
        logger.warn('No admin users found for order notification');
      }
    } catch (error) {
      logger.error('Failed to queue admin notification', { orderId, error });
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Queue notification for order status change
   *
   * @param data - Status change notification data
   */
  async queueOrderStatusChangeNotification(data: StatusChangeNotificationData): Promise<void> {
    try {
      const [customer] = await db
        .select({ name: users.first_name, email: users.email })
        .from(users)
        .where(eq(users.id, data.userId))
        .limit(1);

      if (!customer) {
        logger.warn('Skipping status notification: User not found', { userId: data.userId });
        return;
      }

      await eventPublisher.publishNotification({
        userId: data.userId,
        templateCode: TEMPLATE_CODES.ORDER_CONFIRMED,
        variables: {
          userName: customer.name || 'Customer',
          orderNumber: data.orderNumber,
          oldStatus: data.oldStatus,
          newStatus: data.newStatus,
          orderUrl: `${FRONTEND_URL}/profile/orders/${data.orderId}`,
        },
        options: {
          priority: 'normal',
          actionUrl: `/profile/orders/${data.orderId}`,
          actionText: 'View Order',
        },
      });

      logger.info('Order status notification queued', {
        userId: data.userId,
        orderId: data.orderId,
        newStatus: data.newStatus,
      });
    } catch (error) {
      logger.error('Failed to queue status notification', { orderId: data.orderId, error });
    }
  }

  /**
   * Queue notification for payment confirmation
   */
  async queuePaymentConfirmationNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    paymentMethod: string,
    amount: string,
  ): Promise<void> {
    try {
      const [customer] = await db
        .select({ name: users.first_name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!customer) {
        logger.warn('Skipping payment notification: User not found', { userId });
        return;
      }

      await eventPublisher.publishNotification({
        userId,
        templateCode: TEMPLATE_CODES.ORDER_PAID,
        variables: {
          userName: customer.name || 'Customer',
          orderNumber,
          paymentMethod,
          amount: Number(amount).toFixed(2),
          orderUrl: `${FRONTEND_URL}/profile/orders/${orderId}`,
        },
        options: {
          priority: 'high',
          actionUrl: `/profile/orders/${orderId}`,
          actionText: 'View Order',
        },
      });

      logger.info('Payment confirmation notification queued', { userId, orderId });
    } catch (error) {
      logger.error('Failed to queue payment notification', { userId, orderId, error });
    }
  }

  /**
   * Queue notification for order shipment
   */
  async queueShipmentNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    trackingNumber?: string,
    carrier?: string,
  ): Promise<void> {
    try {
      const [customer] = await db
        .select({ name: users.first_name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!customer) {
        logger.warn('Skipping shipment notification: User not found', { userId });
        return;
      }

      await eventPublisher.publishNotification({
        userId,
        templateCode: TEMPLATE_CODES.ORDER_SHIPPED,
        variables: {
          userName: customer.name || 'Customer',
          orderNumber,
          trackingNumber: trackingNumber || 'N/A',
          carrier: carrier || 'N/A',
          orderUrl: `${FRONTEND_URL}/profile/orders/${orderId}`,
        },
        options: {
          priority: 'normal',
          actionUrl: `/profile/orders/${orderId}`,
          actionText: 'Track Order',
        },
      });

      logger.info('Shipment notification queued', { userId, orderId, trackingNumber });
    } catch (error) {
      logger.error('Failed to queue shipment notification', { userId, orderId, error });
    }
  }

  /**
   * Queue notification for order cancellation
   */
  async queueCancellationNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    reason?: string,
  ): Promise<void> {
    try {
      const [customer] = await db
        .select({ name: users.first_name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!customer) {
        logger.warn('Skipping cancellation notification: User not found', { userId });
        return;
      }

      await eventPublisher.publishNotification({
        userId,
        templateCode: TEMPLATE_CODES.ORDER_CANCELLED,
        variables: {
          userName: customer.name || 'Customer',
          orderNumber,
          reason: reason || 'No reason provided',
          orderUrl: `${FRONTEND_URL}/profile/orders/${orderId}`,
        },
        options: {
          priority: 'high',
          actionUrl: `/profile/orders/${orderId}`,
          actionText: 'View Order',
        },
      });

      logger.info('Cancellation notification queued', { userId, orderId });
    } catch (error) {
      logger.error('Failed to queue cancellation notification', { userId, orderId, error });
    }
  }
}

export const orderNotificationService = new OrderNotificationService();
