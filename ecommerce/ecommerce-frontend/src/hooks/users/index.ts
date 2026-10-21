'use client';

/**
 * User Query & Mutation Hooks
 *
 * TanStack Query hooks for user profile and address operations.
 * Includes optimistic updates for address management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    userKeys,
    getCurrentUser,
    updateProfile,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from '@/queries/users';
import type { UserProfile, UserAddress, UpdateProfileData, AddressData } from '@/queries/users';

// ============================================================================
// Profile Hooks
// ============================================================================

interface UseProfileOptions {
    initialData?: UserProfile;
    enabled?: boolean;
}

/**
 * Fetch current user profile
 */
export function useProfile(options: UseProfileOptions = {}) {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: getCurrentUser,
        initialData: options.initialData,
        enabled: options.enabled ?? true,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileData) => updateProfile(data),

        onSuccess: (data) => {
            queryClient.setQueryData(userKeys.profile(), data);
            toast.success('Profile updated');
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update profile');
        },
    });
}

// ============================================================================
// Address Hooks
// ============================================================================

interface UseAddressesOptions {
    initialData?: UserAddress[];
    enabled?: boolean;
}

/**
 * Fetch user addresses
 */
export function useAddresses(options: UseAddressesOptions = {}) {
    return useQuery({
        queryKey: userKeys.addresses(),
        queryFn: getAddresses,
        initialData: options.initialData,
        enabled: options.enabled ?? true,
    });
}

/**
 * Create a new address
 */
export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddressData) => createAddress(data),

        onSuccess: (newAddress) => {
            // Add to cache optimistically
            queryClient.setQueryData<UserAddress[]>(userKeys.addresses(), (old) => {
                if (!old) return [newAddress];

                // If new address is default, update others
                if ((newAddress as any).isDefault || (newAddress as any).is_default) {
                    return [...old.map((a: any) => ({ ...a, isDefault: false, is_default: false })), newAddress];
                }
                return [...old, newAddress];
            });

            toast.success('Address added');
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add address');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });
}

/**
 * Update an address
 */
export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AddressData> }) =>
            updateAddress(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.addresses() });
            const previousAddresses = queryClient.getQueryData<UserAddress[]>(userKeys.addresses());

            if (previousAddresses) {
                queryClient.setQueryData<UserAddress[]>(userKeys.addresses(), (old) =>
                    old?.map((a) => (a.id === id ? { ...a, ...data } : a))
                );
            }

            return { previousAddresses };
        },

        onError: (_err, _vars, context) => {
            if (context?.previousAddresses) {
                queryClient.setQueryData(userKeys.addresses(), context.previousAddresses);
            }
            toast.error('Failed to update address');
        },

        onSuccess: () => {
            toast.success('Address updated');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });
}

/**
 * Delete an address
 */
export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteAddress(id),

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: userKeys.addresses() });
            const previousAddresses = queryClient.getQueryData<UserAddress[]>(userKeys.addresses());

            if (previousAddresses) {
                queryClient.setQueryData<UserAddress[]>(userKeys.addresses(), (old) =>
                    old?.filter((a) => a.id !== id)
                );
            }

            return { previousAddresses };
        },

        onError: (_err, _id, context) => {
            if (context?.previousAddresses) {
                queryClient.setQueryData(userKeys.addresses(), context.previousAddresses);
            }
            toast.error('Failed to delete address');
        },

        onSuccess: () => {
            toast.success('Address deleted');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });
}

/**
 * Set address as default
 */
export function useSetDefaultAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => setDefaultAddress(id),

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: userKeys.addresses() });
            const previousAddresses = queryClient.getQueryData<UserAddress[]>(userKeys.addresses());

            if (previousAddresses) {
                queryClient.setQueryData<UserAddress[]>(userKeys.addresses(), (old) =>
                    old?.map((a) => ({
                        ...a,
                        isDefault: a.id === id,
                    }))
                );
            }

            return { previousAddresses };
        },

        onError: (_err, _id, context) => {
            if (context?.previousAddresses) {
                queryClient.setQueryData(userKeys.addresses(), context.previousAddresses);
            }
            toast.error('Failed to set default address');
        },

        onSuccess: () => {
            toast.success('Default address updated');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });
}
