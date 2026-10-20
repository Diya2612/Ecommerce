/**
 * Notification Types
 *
 * Re-exports types from API for use in components.
 * Provides backward compatibility with existing components.
 */

// Re-export all types from API
export type {
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationPreferences,
    GetNotificationsParams,
    GetNotificationsResponse,
} from '@/lib/api/notifications.api';

// Legacy type alias for backward compatibility with existing components
// Maps the old simple notification shape to new API shape
export interface LegacyNotification {
    id: string;
    title: string;
    body: string;
    time: string;
    unread: boolean;
    type?: string;
}