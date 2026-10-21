'use client';

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/queries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, ExternalLink, Loader2, Trash2, MailOpen, Clock, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/utils';
import { useNotificationSocket } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDropdownProps {
    onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { setUnreadCount } = useNotificationSocket();
    const { data, isLoading } = useNotifications({ limit: 10 });
    const markAsReadMutation = useMarkAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();

    // Handle both wrapped and unwrapped response formats
    const notifications = (data as any)?.notifications || (data as any)?.data?.notifications || [];
    const unreadNotifications = notifications.filter((n: any) => !n.is_read);
    const hasUnread = unreadNotifications.length > 0;

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsReadMutation.mutateAsync(notificationId);
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsReadMutation.mutateAsync();
        setUnreadCount(0);
    };

    return (
        <div className="flex flex-col h-[550px] max-h-[80vh] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Bell className={cn("w-5 h-5 transition-colors", hasUnread ? "text-[#1C2A54] dark:text-blue-400" : "text-gray-400")} />
                        {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                        Notifications
                        {hasUnread && <span className="ml-1.5 text-sm font-normal text-gray-500">({unreadNotifications.length})</span>}
                    </h3>
                </div>

                {hasUnread && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="text-xs font-medium text-[#1C2A54] hover:text-[#1C2A54] dark:text-blue-400 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors h-8 px-3"
                    >
                        {markAllAsReadMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 min-h-0 w-full relative">
                <ScrollArea className="h-full w-full rounded-none">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-2">
                            <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                            <p className="text-sm text-gray-500">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <MailOpen className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">All caught up!</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
                                    No new notifications at the moment.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            <AnimatePresence initial={false}>
                                {notifications.map((notification: any, index: number) => {
                                    // Dynamic Icon helper inside map
                                    const getIcon = () => {
                                        const title = notification.title.toLowerCase();
                                        if (title.includes('order')) return <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><Package className="w-4 h-4" /></div>;
                                        if (title.includes('alert') || title.includes('urgent')) return <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></div>;
                                        if (title.includes('success') || title.includes('complete')) return <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400"><CheckCircle2 className="w-4 h-4" /></div>;
                                        return <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-500"><MailOpen className="w-4 h-4" /></div>;
                                    };

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="group relative"
                                        >
                                            <div
                                                onClick={() => {
                                                    if (!notification.is_read) handleMarkAsRead(notification.id);
                                                    if (notification.action_url) {
                                                        window.location.href = notification.action_url;
                                                        onClose();
                                                    }
                                                }}
                                                className={cn(
                                                    "relative p-3 rounded-lg transition-colors cursor-pointer",
                                                    "border",
                                                    !notification.is_read
                                                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                                )}
                                            >
                                                {/* Unread Indicator */}
                                                {!notification.is_read && (
                                                    <div className="absolute top-3 left-0 w-1 h-8 bg-[#1C2A54] dark:bg-blue-500 rounded-r" />
                                                )}

                                                <div className="flex gap-3 pl-2">
                                                    {/* Icon */}
                                                    <div className="shrink-0">
                                                        {getIcon()}
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className={cn(
                                                                "text-sm font-semibold leading-tight",
                                                                !notification.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                                            )}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[11px] flex gap-1 text-gray-400 whitespace-nowrap font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: false })}
                                                            </span>
                                                        </div>

                                                        <p className={cn(
                                                            "text-xs leading-relaxed line-clamp-2",
                                                            !notification.is_read ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"
                                                        )}>
                                                            {notification.message}
                                                        </p>

                                                        {/* Actions */}
                                                        {(notification.action_url || !notification.is_read) && (
                                                            <div className="flex items-center gap-2 pt-0.5">
                                                                {notification.action_url && (
                                                                    <span className="text-[11px] font-medium text-[#1C2A54] dark:text-blue-400 flex items-center gap-1">
                                                                        View details <ExternalLink className="w-3 h-3" />
                                                                    </span>
                                                                )}
                                                                {!notification.is_read && (
                                                                    <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Check className="w-3 h-3" /> Mark read
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
                <Link href="/profile/notifications" onClick={onClose} className="block group">
                    <Button variant="ghost" className="w-full justify-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-[#1C2A54] dark:hover:text-blue-400 transition-colors text-sm h-9">
                        <span className="font-medium">View all notifications</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}