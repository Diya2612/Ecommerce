import { pgEnum } from 'drizzle-orm/pg-core';

/** Categories for grouping and filtering notifications. */
export const notificationTypeEnum = pgEnum('notification_type', [
  'order_created',
  'order_paid',
  'order_shipped',
  'order_delivered',
  'order_cancelled',
  'payment_authorized',
  'payment_captured',
  'payment_failed',
  'payment_refunded',
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
]);

/** Severity/urgency levels. */
export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

/** Dispatch frequency. */
export const notificationFrequencyEnum = pgEnum('notification_frequency', ['immediate', 'never']);

/** Lifecycle status of a delivery attempt. */
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'sent',
  'delivered',
  'failed',
  'bounced',
]);
