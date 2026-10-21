import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from '@/api/notifications';
import type { NotificationFilters } from '@/types/notification';
import { toast } from 'sonner';
import { useNotificationSocket } from '@/contexts/NotificationContext';

/**
 * Query keys for React Query cache management
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
    unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/**
 * Hook to fetch notifications with filters
 */
export const useNotifications = (filters?: NotificationFilters) => {
    return useQuery({
        queryKey: notificationKeys.list(filters || {}),
        queryFn: () => getNotifications(filters),
        staleTime: 30 * 1000, // Consider data stale after 30 seconds
    });
};

/**
 * Hook to fetch unread count
 */
export const useUnreadCount = () => {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: getUnreadCount,
        refetchInterval: 60 * 1000, // Refetch every minute
    });
};

/**
 * Hook to mark notification as read
 */
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    const { setUnreadCount } = useNotificationSocket();

    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });

            // Decrement unread count
            setUnreadCount(prev => Math.max(0, prev - 1));

            toast.success('Marked as read');
        },
        onError: (error) => {
            toast.error('Failed to mark as read');
            console.error('Mark as read error:', error);
        },
    });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success('All notifications marked as read');
        },
        onError: (error) => {
            toast.error('Failed to mark all as read');
            console.error('Mark all as read error:', error);
        },
    });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success('Notification deleted');
        },
        onError: (error) => {
            toast.error('Failed to delete notification');
            console.error('Delete notification error:', error);
        },
    });
};
