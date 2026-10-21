'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/queries';
import type { Notification } from '@/types/notification';
import { getUnreadCount } from '@/api/notifications';

interface NotificationContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const { session, user } = useAuth();
    const queryClient = useQueryClient();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch initial unread count
    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await getUnreadCount();

                // API client unwraps response, so check for direct count property
                // Also support legacy wrapped format just in case
                const count = (response as any).count ?? (response as any).data?.count;

                if (typeof count === 'number') {
                    setUnreadCount(count);
                } else {
                    console.warn('[NotificationSocket] Invalid unread count response structure:', response);
                    setUnreadCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                setUnreadCount(0); // Set to 0 on error
            }
        };

        fetchUnreadCount();
    }, [user]);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!session?.access_token || !user) {
            // Disconnect if logged out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
                setUnreadCount(0);
            }
            return;
        }

        // Connect to WebSocket server
        // IMPORTANT: Socket.IO connects to the base URL, NOT /api endpoint
        let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Remove /api suffix if  it exists (Socket.IO needs base URL only)
        if (backendUrl.endsWith('/api')) {
            backendUrl = backendUrl.slice(0, -4);
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('[NotificationSocket] Connecting to:', backendUrl);
            console.log('[NotificationSocket] Token exists:', !!session.access_token);
            console.log('[NotificationSocket] Token preview:', session.access_token ? session.access_token.substring(0, 30) + '...' : 'NONE');
            console.log('[NotificationSocket] User ID:', user?.id);
        }

        const newSocket = io(backendUrl, {
            auth: {
                token: session.access_token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection events
        newSocket.on('connect', () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('[NotificationSocket] ✅ Connected, Socket ID:', newSocket.id);
            }
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('[NotificationSocket] ❌ Disconnected:', reason);
            }
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[NotificationSocket] Connection error:', error.message);
            if (process.env.NODE_ENV === 'development') {
                console.error('[NotificationSocket] Full error:', error);
            }
            setIsConnected(false);
        });

        // Listen for new notifications
        newSocket.on('notification:new', (notification: Notification) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔔 [Frontend] RAW EVENT RECEIVED: notification:new', notification);
            }

            // Validate payload
            if (!notification || !notification.id) {
                console.error('❌ [Frontend] Invalid notification payload:', notification);
                return;
            }

            // Increment unread count
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ [Frontend] Incrementing unread count');
            }
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ [Frontend] Triggering toast:', notification.title);
            }
            toast(notification.title, {
                description: notification.message,
                action: notification.action_url ? {
                    label: notification.action_text || 'View',
                    onClick: () => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('🖱️ [Frontend] Notification action clicked');
                        }
                        if (notification.action_url) {
                            window.location.href = notification.action_url;
                        }
                    },
                } : undefined,
                duration: 5000,
            });

            // Invalidate React Query cache to refetch notifications
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ [Frontend] Invalidating query cache');
            }
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        });

        // Debug: Listen for ALL events (wildcard)
        newSocket.onAny((event, ...args) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`📡 [Frontend] Socket Event: ${event}`, args);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [session, user, queryClient]);

    const value = {
        socket,
        isConnected,
        unreadCount,
        setUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationSocket() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationSocket must be used within NotificationProvider');
    }
    return context;
}
