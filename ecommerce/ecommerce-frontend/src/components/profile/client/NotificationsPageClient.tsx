'use client';

import { useState } from 'react';
import { useNotifications, useMarkAllAsRead } from '@/queries';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotificationItem } from './NotificationItem';
import { NotificationPagination } from './NotificationPagination';

type FilterType = 'all' | 'unread' | 'order' | 'payment';

export function NotificationsPageClient() {
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // Determine query params based on filter
    const getQueryParams = () => {
        const params: { page: number; limit: number; unreadOnly?: boolean; type?: string } = {
            page,
            limit: 20,
        };

        if (filter === 'unread') {
            params.unreadOnly = true;
        } else if (filter === 'order' || filter === 'payment') {
            params.type = filter;
        }

        return params;
    };

    const { data, isLoading } = useNotifications(getQueryParams());
    const markAllAsReadMutation = useMarkAllAsRead();

    const notifications = data?.data?.notifications || [];
    const pagination = data?.data?.pagination;

    // Filter by search text (client-side)
    const filteredNotifications = notifications.filter(notification => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message.toLowerCase().includes(searchLower)
        );
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAllAsRead = async () => {
        await markAllAsReadMutation.mutateAsync();
    };

    // Reset page when filter changes
    const handleFilterChange = (value: string) => {
        setFilter(value as FilterType);
        setPage(1);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={filter} onValueChange={handleFilterChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                        Unread
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="order">Orders</TabsTrigger>
                    <TabsTrigger value="payment">Payments</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                            {search ? 'No notifications found' :
                                filter === 'unread' ? 'No unread notifications' :
                                    filter === 'order' ? 'No order notifications' :
                                        filter === 'payment' ? 'No payment notifications' :
                                            'No notifications yet'}
                        </p>
                        {search && (
                            <p className="text-sm mt-2">Try adjusting your search terms</p>
                        )}
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && !search && (
                <NotificationPagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
