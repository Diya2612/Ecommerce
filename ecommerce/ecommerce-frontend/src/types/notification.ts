export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    action_url?: string | null;
    action_text?: string | null;
    created_at: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}

export interface NotificationFilters {
    page?: number;
    limit?: number;
    type?: string;
    unreadOnly?: boolean;
}

export interface NotificationPreferences {
    userId: string;
    channels: {
        in_app: boolean;
        email: boolean;
        sms: boolean;
    };
    types: {
        ORDER_CREATED: boolean;
        ORDER_SHIPPED: boolean;
        ORDER_DELIVERED: boolean;
        PAYMENT_CAPTURED: boolean;
        LOW_STOCK_ALERT: boolean;
        USER_WELCOME: boolean;
    };
}

export interface PreferencesResponse {
    success: boolean;
    data: NotificationPreferences;
}
