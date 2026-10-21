'use client';

/**
 * Auth Mutation Hooks
 *
 * TanStack Query hooks for auth operations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    requestPasswordReset,
    resetPassword,
    syncUser,
} from '@/queries/auth';
import { userKeys } from '@/queries/users';
import { cartKeys, clearCartSessionId, mergeCart } from '@/queries/cart';

/**
 * Request password reset email
 */
export function useRequestPasswordReset() {
    return useMutation({
        mutationFn: (email: string) => requestPasswordReset(email),

        onSuccess: () => {
            toast.success('Password reset email sent');
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send reset email');
        },
    });
}

/**
 * Reset password with new password
 */
export function useResetPassword() {
    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            resetPassword(token, password),

        onSuccess: () => {
            toast.success('Password updated successfully');
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reset password');
        },
    });
}

/**
 * Sync user with backend after login
 * Also handles cart merging
 */
export function useSyncUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, phone }: { name?: string; phone?: string } = {}) =>
            syncUser(name, phone),

        onSuccess: async () => {
            // Merge guest cart if exists
            try {
                await mergeCart();
            } catch {
                // Silently fail cart merge
            }

            // Invalidate user queries
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            // Invalidate cart (now merged)
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Handle user logout cleanup
 */
export function useLogoutCleanup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Clear local storage session
            clearCartSessionId();
            // Clear all cached queries
            queryClient.clear();
            return { success: true };
        },
    });
}
