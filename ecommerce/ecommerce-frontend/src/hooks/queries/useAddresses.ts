"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    userKeys,
} from "@/queries";
import type { AddressData, UserAddress } from "@/queries/users";
import type { Address } from "@/lib/data/profile/types";
import { toast } from "sonner";

// Keys - use the canonical userKeys from queries
export const addressKeys = userKeys;

// Data Mapper: UserAddress (Backend) -> Address (Frontend)
export function mapAddressToFrontend(addr: UserAddress): Address {
    return {
        id: addr.id,
        type: addr.type,
        name: addr.name,
        phone: addr.phone,
        addressLine: `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefaultShipping,
    };
}

// Hook - Client-side only, no SSR hydration needed
export function useAddresses() {
    const queryClient = useQueryClient();

    // Query
    const query = useQuery({
        queryKey: userKeys.addresses(),
        queryFn: async () => {

            try {
                const data = await getAddresses();

                return data.map(mapAddressToFrontend);
            } catch (error) {
                console.error('[useAddresses] Error:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: AddressData) => createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
            toast.success("Address added successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add address");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AddressData> }) =>
            updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
            toast.success("Address updated successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update address");
        },
    });

    // Delete mutation with optimistic update
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAddress(id),
        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: userKeys.addresses() });

            // Snapshot current state
            const previousAddresses = queryClient.getQueryData<Address[]>(userKeys.addresses());

            // Optimistically remove the address
            queryClient.setQueryData<Address[]>(userKeys.addresses(), (old) =>
                old?.filter(addr => addr.id !== id) ?? []
            );

            return { previousAddresses };
        },
        onError: (err, id, context) => {
            // Rollback on error
            if (context?.previousAddresses) {
                queryClient.setQueryData(userKeys.addresses(), context.previousAddresses);
            }
            toast.error("Failed to delete address");
        },
        onSuccess: () => {
            toast.success("Address deleted successfully");
        },
        onSettled: () => {
            // Always refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });

    // Set default mutation with optimistic update
    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => setDefaultAddress(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: userKeys.addresses() });

            const previousAddresses = queryClient.getQueryData<Address[]>(userKeys.addresses());

            // Optimistically update default status
            queryClient.setQueryData<Address[]>(userKeys.addresses(), (old) =>
                old?.map(addr => ({
                    ...addr,
                    isDefault: addr.id === id
                })) ?? []
            );

            return { previousAddresses };
        },
        onError: (err, id, context) => {
            if (context?.previousAddresses) {
                queryClient.setQueryData(userKeys.addresses(), context.previousAddresses);
            }
            toast.error("Failed to set default address");
        },
        onSuccess: () => {
            toast.success("Default address updated");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
        },
    });

    return {
        addresses: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        createAddress: createMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,
        setDefaultAddress: setDefaultMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSettingDefault: setDefaultMutation.isPending,
    };
}
