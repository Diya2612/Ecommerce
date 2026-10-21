'use client';

import { useState } from 'react';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '@/hooks/queries/notifications/useNotifications';
import { useNotificationSocket } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/utils';
import type { Notification } from '@/types/notification';
import { NotificationPagination } from '@/components/profile/client/NotificationPagination';

interface NotificationListProps {
    limit?: number;
    unreadOnly?: boolean;
}

export function NotificationList({ limit = 10, unreadOnly = false }: NotificationListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { isConnected } = useNotificationSocket();
    const { data, isLoading, error } = useNotifications({
        page: currentPage,
        limit,
        unreadOnly,
    });

    const markAsReadMutation = useMarkAsRead();
    const deleteMutation = useDeleteNotification();

    // Handle both wrapped and unwrapped response formats
    const notificationsData = (data as any)?.data || data;
    const notifications = notificationsData?.notifications || [];

    // Handle different pagination formats
    const apiPagination = notificationsData?.pagination || {};
    const hasMore = apiPagination?.hasMore || false;

    const pagination = {
        page: apiPagination?.page || currentPage,
        limit: apiPagination?.limit || limit,
        total: apiPagination?.total || (hasMore ? (currentPage * limit) + 1 : notifications.length),
        totalPages: apiPagination?.totalPages || (hasMore ? currentPage + 1 : currentPage),
        hasMore: hasMore,
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">Failed to load notifications</p>
                <p className="text-sm text-red-500 dark:text-red-500 mt-1">Please try again later</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div>
            {/* Results Count */}
            {pagination.total > 0 && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                </div>
            )}

            <div className="space-y-3">
                {notifications.map((notification: Notification) => (
                    <div
                        key={notification.id}
                        className={cn(
                            "p-4 rounded-lg border transition-all hover:shadow-sm",
                            !notification.is_read
                                ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full flex-shrink-0" />
                                    )}
                                    <h4 className={cn(
                                        "font-semibold text-sm",
                                        !notification.is_read
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {notification.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </div>

                            <div className="flex gap-1 flex-shrink-0">
                                {!notification.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => markAsReadMutation.mutate(notification.id)}
                                        disabled={markAsReadMutation.isPending}
                                        title="Mark as read"
                                        className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMutation.mutate(notification.id)}
                                    disabled={deleteMutation.isPending}
                                    title="Delete"
                                    className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {notification.action_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => {
                                    window.location.href = notification.action_url!;
                                }}
                            >
                                {notification.action_text || 'View'}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination - Show if there's more than one page or hasMore is true */}
            {(pagination.hasMore || pagination.page > 1) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <NotificationPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            // Scroll to top of notifications
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
