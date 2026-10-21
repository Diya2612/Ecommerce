import { api } from './client';
import type {
    Notification,
    NotificationsResponse,
    UnreadCountResponse,
    NotificationFilters,
} from '@/types/notification';

/**
 * Get user notifications with optional filters
 */
export const getNotifications = async (
    filters?: NotificationFilters
): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');

    const url = `/notifications${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get(url, { auth: true });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
    return api.get('/notifications/unread/count', { auth: true });
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`, undefined, { auth: true });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.post('/notifications/mark-all-read', undefined, { auth: true });
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
    notificationId: string
): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`, { auth: true });
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (): Promise<import('@/types/notification').PreferencesResponse> => {
    return api.get('/notifications/preferences', { auth: true });
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
    preferences: Partial<import('@/types/notification').NotificationPreferences>
): Promise<import('@/types/notification').PreferencesResponse> => {
    return api.put('/notifications/preferences', preferences, { auth: true });
};

/**
 * Reset preferences to defaults
 */
export const resetNotificationPreferences = async (): Promise<import('@/types/notification').PreferencesResponse> => {
    return api.post('/notifications/preferences/reset', undefined, { auth: true });
};
