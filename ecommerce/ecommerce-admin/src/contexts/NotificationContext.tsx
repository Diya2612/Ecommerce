/**
 * Notification Context
 *
 * Provides real-time notification functionality:
 * - Supabase Realtime (Postgres Changes) for live updates
 * - Unread count state management
 * - Toast notifications for new messages
 * - Cross-device sync for read status and deletions
 * - API integration for read/mark actions
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notifyInfo } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    type Notification,
} from '@/lib/api/notifications.api';

// ============================================
// TYPES
// ============================================

interface NotificationContextType {
    unreadCount: number;
    isConnected: boolean;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { session, user } = useAuth();
    const queryClient = useQueryClient();

    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Fetch initial unread count
    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setUnreadCount((prev) => Math.max(0, prev - 1));
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }, [queryClient]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await markAllNotificationsAsRead();
            setUnreadCount(0);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }, [queryClient]);

    // Subscribe to Supabase Realtime (Postgres Changes) when authenticated
    useEffect(() => {
        console.log('[NotificationContext] Effect triggered', {
            hasSession: !!session,
            hasUser: !!user,
            userId: user?.id,
            accessToken: session?.access_token ? 'Present (...)' : 'Missing'
        });

        if (!session?.access_token || !user?.id) {
            console.log('[NotificationContext] No session/user, skipping Realtime connection');
            // No session — cleanup and return
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        // Fetch initial unread count
        refreshUnreadCount();

        // Subscribe to real-time changes on the notifications table
        console.log('[NotificationContext] Attempting to subscribe to Supabase Realtime...');

        const channel = supabase
            .channel('user-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('[NotificationContext] Realtime INSERT event received:', payload);
                    
                    if (payload.errors) {
                        console.error('[NotificationContext] Realtime payload error:', payload.errors);
                        return;
                    }

                    // New notification received — show toast and update count
                    const notification = payload.new as Notification;
                    
                    if (!notification) {
                         console.warn('[NotificationContext] payload.new is null/undefined', payload);
                         return;
                    }

                    setUnreadCount((prev) => prev + 1);
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });

                    // Show toast notification
                    notifyInfo(notification.title, {
                        description: notification.message,
                        action: notification.action_url
                            ? {
                                label: notification.action_text || 'View',
                                onClick: () => {
                                    window.location.href = notification.action_url!;
                                },
                            }
                            : undefined,
                        duration: 5000,
                    });
                },
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('[NotificationContext] Realtime UPDATE event received:', payload);
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    refreshUnreadCount();
                },
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                     console.log('[NotificationContext] Realtime DELETE event received:', payload);
                    // Notification deleted — refresh count and list
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    refreshUnreadCount();
                },
            )
            .subscribe((status, err) => {
                console.log(`[NotificationContext] Realtime connection status: ${status}`, err ? { error: err } : '');
                
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                } else {
                     if (status === 'CHANNEL_ERROR') {
                         console.error('[NotificationContext] FAILED to connect: CHANNEL_ERROR', err);
                     } else if (status === 'TIMED_OUT') {
                         console.error('[NotificationContext] FAILED to connect: TIMED_OUT');
                     }
                    setIsConnected(false);
                }
            });

        channelRef.current = channel;

        // Cleanup on unmount or session change
        return () => {
            console.log('[NotificationContext] Cleaning up Realtime subscription');
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [session?.access_token, user?.id, queryClient, refreshUnreadCount]);

    const value: NotificationContextType = {
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
}

// Export context for direct use if needed
export { NotificationContext };

