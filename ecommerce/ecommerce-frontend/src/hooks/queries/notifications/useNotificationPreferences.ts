import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    resetNotificationPreferences,
} from '@/api/notifications';
import type { NotificationPreferences } from '@/types/notification';
import { toast } from 'sonner';

export const preferenceKeys = {
    all: ['notification-preferences'] as const,
    detail: () => [...preferenceKeys.all, 'detail'] as const,
};

/**
 * Hook to fetch notification preferences
 */
export const useNotificationPreferences = () => {
    return useQuery({
        queryKey: preferenceKeys.detail(),
        queryFn: getNotificationPreferences,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateNotificationPreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: preferenceKeys.all });
            toast.success('Preferences saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save preferences');
            console.error('Update preferences error:', error);
        },
    });
};

/**
 * Hook to reset notification preferences
 */
export const useResetNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: resetNotificationPreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: preferenceKeys.all });
            toast.success('Preferences reset to defaults');
        },
        onError: (error) => {
            toast.error('Failed to reset preferences');
            console.error('Reset preferences error:', error);
        },
    });
};
