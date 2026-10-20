/**
 * Notification Interfaces
 * Domain types, input contracts, and sanitization for notifications.
 */

import { Notification, NotificationType, NotificationPriority } from './notifications.schema';
import { NotificationTemplate } from './notification-templates.schema';
import { NotificationPreference } from './notification-preferences.schema';
import { NotificationDeliveryLog } from './notification-delivery-logs.schema';
import { omitFields } from '../../../utils';

export type INotification = Notification;
export type INotificationType = NotificationType;
export type INotificationPriority = NotificationPriority;
export type SanitizedNotification = Omit<INotification, 'deleted_at' | 'metadata'>;

export type INotificationTemplate = NotificationTemplate;
export type SanitizedNotificationTemplate = INotificationTemplate;

export type INotificationPreference = NotificationPreference;
export type SanitizedNotificationPreference = INotificationPreference;

export type INotificationDeliveryLog = NotificationDeliveryLog;
export type SanitizedNotificationDeliveryLog = Omit<INotificationDeliveryLog, 'provider_response'>;

/** Input contracts for service operations. */
export interface CreateFromTemplateInput {
  userId: string;
  templateCode: string;
  variables: Record<string, any>;
  priority?: INotificationPriority;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: INotificationType | string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: INotificationPriority;
  actionUrl?: string;
  actionText?: string;
  channels?: string[];
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  type?: INotificationType;
  category?: 'all' | 'unread' | 'orders' | 'payments' | 'system';
  isRead?: boolean;
}

export interface RenderTemplateResult {
  type: string;
  title: string;
  message: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
  smsMessage?: string;
}

export interface DeliveryResult {
  channel: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Data Sanitization
 * Removes internal/sensitive fields for API responses.
 */
export const sanitizeNotification = (notification: INotification): SanitizedNotification =>
  omitFields(notification, ['deleted_at', 'metadata']);

export const sanitizeNotifications = (notifications: INotification[]): SanitizedNotification[] =>
  notifications.map(sanitizeNotification);

export const sanitizeTemplate = (template: INotificationTemplate): SanitizedNotificationTemplate =>
  template;

export const sanitizeTemplates = (
  templates: INotificationTemplate[],
): SanitizedNotificationTemplate[] => templates;

export const sanitizePreference = (
  preference: INotificationPreference,
): SanitizedNotificationPreference => preference;

export const sanitizePreferences = (
  preferences: INotificationPreference[],
): SanitizedNotificationPreference[] => preferences;

export const sanitizeDeliveryLog = (
  log: INotificationDeliveryLog,
): SanitizedNotificationDeliveryLog => omitFields(log, ['provider_response']);

export const sanitizeDeliveryLogs = (
  logs: INotificationDeliveryLog[],
): SanitizedNotificationDeliveryLog[] => logs.map(sanitizeDeliveryLog);

export type { Notification, NotificationTemplate, NotificationPreference, NotificationDeliveryLog };
