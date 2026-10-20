// React import not required (JSX runtime)
import { Bell, Loader2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsPopover } from "../hooks/useNotifications";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/api/notifications.api";

function IconForType({ type }: { type?: string }) {
    const base = "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold";
    // Map notification types to icons
    if (type?.startsWith('order')) {
        return <div className={cn(base, "bg-green-500")}>O</div>;
    }
    if (type?.startsWith('payment')) {
        return <div className={cn(base, "bg-blue-500")}>P</div>;
    }
    if (type?.startsWith('inventory')) {
        return <div className={cn(base, "bg-amber-500")}>I</div>;
    }
    if (type?.startsWith('user') || type === 'account_updated' || type === 'password_changed') {
        return <div className={cn(base, "bg-purple-500")}>U</div>;
    }
    if (type === 'admin_broadcast' || type === 'system_alert') {
        return <div className={cn(base, "bg-red-500")}>S</div>;
    }
    return <div className={cn(base, "bg-slate-400")}>N</div>;
}

function formatTime(dateString: string): string {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
        return 'Just now';
    }
}

export default function NotificationsPopover() {
    const { items, unreadCount, markAsRead, markAllAsRead, isLoading, isMarkingAllAsRead } = useNotificationsPopover();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        if (notification.action_url) {
            setOpen(false);
            navigate(notification.action_url);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 hover:bg-[#251550] rounded-lg transition text-white" aria-label="Notifications">
                    <Bell className="w-5 h-5 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent side="bottom" align="end" sideOffset={8} className="w-96 rounded-xl shadow-xl border border-slate-200 p-4 mt-2">
                <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="font-semibold text-gray-900">Notifications</div>
                            <div className="text-xs text-slate-500">{unreadCount} unread</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => markAllAsRead()}
                                disabled={isMarkingAllAsRead || unreadCount === 0}
                                className="text-sm text-indigo-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {isMarkingAllAsRead && <Loader2 className="w-3 h-3 animate-spin" />}
                                Mark all as read
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100" onClick={() => setOpen(false)} aria-label="Close notifications">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        items.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition",
                                    !n.is_read ? "bg-slate-50" : "bg-white"
                                )}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="shrink-0">
                                    <IconForType type={n.type} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-medium text-slate-900 truncate">{n.title}</div>
                                        <div className="text-xs text-slate-400 whitespace-nowrap">{formatTime(n.created_at)}</div>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{n.message}</div>
                                </div>

                                <div className="flex items-center pl-2">
                                    {!n.is_read && <span className="w-2 h-2 bg-violet-500 rounded-full" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-center">
                    <button 
                        onClick={() => {
                            setOpen(false);
                            navigate(ROUTES.NOTIFICATIONS);
                        }}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        View all notifications
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
