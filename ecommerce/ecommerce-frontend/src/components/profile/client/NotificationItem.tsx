'use client';

import { useMarkAsRead, useDeleteNotification } from '@/queries';
import { Button } from '@/components/ui/button';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/utils';
import type { Notification } from '@/types/notification';
import { useNotificationSocket } from '@/contexts/NotificationContext';

interface NotificationItemProps {
    notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
    const { setUnreadCount } = useNotificationSocket();
    const markAsReadMutation = useMarkAsRead();
    const deleteMutation = useDeleteNotification();

    const handleMarkAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsReadMutation.mutateAsync(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteMutation.mutateAsync(notification.id);
    };

    const handleClick = () => {
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        if (notification.action_url) {
            window.location.href = notification.action_url;
        }
    };

    return (
        <div
            className={cn(
                "p-6 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                !notification.is_read
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
            )}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                        <h3 className="font-semibold text-base">{notification.title}</h3>
                        {notification.action_url && (
                            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                            {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                            })}
                        </span>
                        <span className="capitalize">{notification.priority} priority</span>
                        <span className="capitalize">{notification.type.replace(/_/g, ' ').toLowerCase()}</span>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    {!notification.is_read && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMarkAsRead}
                            disabled={markAsReadMutation.isPending}
                            title="Mark as read"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
