/**
 * Notification API Service
 *
 * API functions for notification endpoints
 */

import { makeGetRequest, makeGetRequestWithParams, makePutRequest, makePatchRequest, makeDeleteRequest } from './baseApi';

// ============================================
// TYPES
// ============================================

export type NotificationType =
    | 'order_created'
    | 'order_paid'
    | 'order_shipped'
    | 'order_delivered'
    | 'order_cancelled'
    | 'payment_authorized'
    | 'payment_captured'
    | 'payment_failed'
    | 'payment_refunded'
    | 'inventory_low_stock'
    | 'inventory_out_of_stock'
    | 'inventory_restocked'
    | 'user_welcome'
    | 'account_updated'
    | 'password_changed'
    | 'admin_broadcast'
    | 'system_alert'
    | 'promotion'
    | 'newsletter';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    read_at: string | null;
    channels: string[];
    priority: NotificationPriority;
    action_url: string | null;
    action_text: string | null;
    created_at: string;
    expires_at: string | null;
    deleted_at: string | null;
    metadata: Record<string, any>;
}

export interface NotificationPreferences {
    user_id: string;
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
    digest_frequency: 'immediate' | 'daily' | 'weekly' | 'none';
    unsubscribed_types: string[];
}

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    unread_only?: boolean;
}

export interface GetNotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        pagination: {
            page: number;
            limit: number;
            hasMore: boolean;
        };
        unreadCount: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}

export interface NotificationResponse {
    success: boolean;
    data: {
        notification: Notification;
    };
}

export interface PreferencesResponse {
    success: boolean;
    data: {
        preferences: NotificationPreferences;
    };
}

export interface MarkAllReadResponse {
    success: boolean;
    data: {
        updated: number;
    };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all notifications for the current user
 */
export async function getNotifications(params?: GetNotificationsParams) {
    const response = await makeGetRequestWithParams<GetNotificationsResponse>(
        '/notifications',
        params || {}
    );
    return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    const response = await makeGetRequest<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(id: string) {
    const response = await makeGetRequest<NotificationResponse>(`/notifications/${id}`);
    return response.data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string) {
    const response = await makePatchRequest<NotificationResponse, {}>(`/notifications/${id}/read`, {});
    return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
    const response = await makePatchRequest<MarkAllReadResponse, {}>('/notifications/read-all', {});
    return response.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
    const response = await makeDeleteRequest<{ success: boolean }>(`/notifications/${id}`);
    return response.data;
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences() {
    const response = await makeGetRequest<PreferencesResponse>('/notifications/preferences');
    return response.data;
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
    const response = await makePutRequest<PreferencesResponse, Partial<NotificationPreferences>>(
        '/notifications/preferences',
        preferences
    );
    return response.data;
}
