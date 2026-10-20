/**
 * useNotifications Hook
 *
 * React Query based hook for fetching and managing notifications.
 * Uses the notification API service and context for real-time updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    type GetNotificationsParams,
} from '@/lib/api/notifications.api';
import { useNotificationContext } from '@/contexts/NotificationContext';

// Query keys for cache management
export const notificationKeys = {
    all: ['notifications'] as const,
    list: (params?: GetNotificationsParams) => [...notificationKeys.all, 'list', params] as const,
    detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
};

interface UseNotificationsOptions {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    enabled?: boolean;
}

export default function useNotifications(options: UseNotificationsOptions = {}) {
    const { page = 1, limit = 20, unreadOnly = false, enabled = true } = options;
    const queryClient = useQueryClient();

    // Get context values for real-time state
    const { unreadCount, isConnected, markAsRead: contextMarkAsRead, markAllAsRead: contextMarkAllAsRead } = useNotificationContext();

    // Fetch notifications query
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: notificationKeys.list({ page, limit, unread_only: unreadOnly }),
        queryFn: () => getNotifications({ page, limit, unread_only: unreadOnly }),
        enabled,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime in v4)
    });

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    // Delete notification mutation
    const deleteNotificationMutation = useMutation({
        mutationFn: (id: string) => deleteNotification(id),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    // Use context methods that update both local state and API
    const markAsRead = async (id: string) => {
        await contextMarkAsRead(id);
    };

    const markAllAsRead = async () => {
        await contextMarkAllAsRead();
    };

    const removeNotification = async (id: string) => {
        await deleteNotificationMutation.mutateAsync(id);
    };

    return {
        // Data
        items: data?.data?.notifications ?? [],
        pagination: data?.data?.pagination ?? { page: 1, limit: 20, hasMore: false },
        unreadCount,

        // Loading states
        isLoading,
        isFetching,
        isError,
        error,

        // Connection status
        isConnected,

        // Actions
        markAsRead,
        markAllAsRead,
        removeNotification,
        refetch,

        // Mutation states (for UI feedback)
        isMarkingAsRead: markAsReadMutation.isPending,
        isMarkingAllAsRead: markAllAsReadMutation.isPending,
        isDeleting: deleteNotificationMutation.isPending,
    };
}

// Also export a simplified hook for just the popover (fewer options)
export function useNotificationsPopover() {
    return useNotifications({ limit: 5 });
}