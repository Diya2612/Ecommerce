import { Bell, ChevronRight, Loader2, Trash2, RefreshCw, ChevronLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabNavigation } from '@/components/ui/tab-navigation';
import { usePagination } from '@/hooks';
import useNotifications from '../hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/lib/api/notifications.api';

function IconForType({ type }: { type?: string }) {
  const base = "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold";
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

function formatTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function NotificationsListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const { page, rowsPerPage, setPage } = usePagination({ initialRowsPerPage: 20 });

  const { 
    items, 
    pagination,
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    isLoading, 
    isFetching,
    isMarkingAllAsRead,
    isDeleting,
    refetch,
    isConnected 
  } = useNotifications({ 
    page, 
    limit: rowsPerPage 
  });

  const unreadItems = useMemo(() => items.filter((n) => !n.is_read), [items]);
  const readItems = useMemo(() => items.filter((n) => n.is_read), [items]);

  const tabs = [
    { id: "all", label: "All", description: "All notifications" },
    { id: "unread", label: "Unread", description: "Unread notifications only" },
    { id: "read", label: "Read", description: "Read notifications only" }
  ];

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1); // Reset to first page when changing tabs
  };

  const totalPages = Math.ceil((pagination.page * pagination.limit) / pagination.limit) + (pagination.hasMore ? 1 : 0);

  const renderTabContent = () => {
    let currentItems: Notification[] = [];
    let emptyMessage = "";
    let emptyDescription = "";

    switch (activeTab) {
      case "all":
        currentItems = items;
        emptyMessage = "No notifications";
        emptyDescription = "You're all caught up!";
        break;
      case "unread":
        currentItems = unreadItems;
        emptyMessage = "No unread notifications";
        emptyDescription = "You're all caught up!";
        break;
      case "read":
        currentItems = readItems;
        emptyMessage = "No read notifications";
        emptyDescription = "Your read notifications will appear here";
        break;
      default:
        return null;
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{emptyMessage}</h3>
          <p className="text-slate-600">{emptyDescription}</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {currentItems.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group",
              !notification.is_read && "bg-blue-50/50"
            )}
            role="button"
            tabIndex={0}
          >
            <div className="shrink-0 mt-1">
              <IconForType type={notification.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  {notification.title}
                </h4>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatTime(notification.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {notification.type && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {formatTypeLabel(notification.type)}
                  </Badge>
                )}
                {notification.priority && notification.priority !== 'normal' && (
                  <Badge 
                    variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'} 
                    className="text-xs capitalize"
                  >
                    {notification.priority}
                  </Badge>
                )}
                {notification.action_url && (
                  <span className="text-xs text-indigo-600">
                    {notification.action_text || 'View details →'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!notification.is_read && (
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
              )}
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => window.history.back()}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Notifications</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <ChevronRight size={20} className="text-slate-600 rotate-180" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                  {isConnected && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected to real-time updates" />
                  )}
                </div>
                <p className="text-sm text-slate-600">Stay updated with your latest activities</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-slate-600"
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isFetching && "animate-spin")} />
                Refresh
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                {unreadCount} Unread
              </Badge>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {isMarkingAllAsRead && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="mt-6">
              {renderTabContent()}
            </div>

            {/* Pagination */}
            {!isLoading && items.length > 0 && (
              <div className="border-t border-slate-200 px-4 py-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing page {page} of {pagination.hasMore ? `${totalPages}+` : totalPages}
                  <span className="mx-2">•</span>
                  {items.length} {items.length === 1 ? 'notification' : 'notifications'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(page - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(page + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!pagination.hasMore}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}