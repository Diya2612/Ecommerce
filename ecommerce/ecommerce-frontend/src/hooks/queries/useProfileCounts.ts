"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { userKeys } from '@/queries/users/keys';
import { ORDER_KEYS } from '@/hooks/queries/orders/useOrders';
import type { Address } from '@/lib/data/profile/types';
import type { Order } from '@/types/order';

// ============================================================================
// Types
// ============================================================================

export interface ProfileCounts {
    orders: number;
    addresses: number;
    wishlist: number;
    amc: number;
    notifications: number;
}

// ============================================================================
// Query Keys
// ============================================================================

export const profileCountKeys = {
    all: ['profileCounts'] as const,
    counts: () => [...profileCountKeys.all, 'counts'] as const,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetches profile counts for sidebar/hero display.
 * 
 * Strategy:
 * - Orders: Fetch from /orders with limit=1 to get pagination.total
 * - Addresses: Use cached data from useAddresses or fetch if not available
 * - Wishlist/AMC: SSR for now, return 0 as placeholders
 */
export function useProfileCounts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: profileCountKeys.counts(),
        queryFn: async (): Promise<ProfileCounts> => {
            // Try to get cached data first
            const cachedAddresses = queryClient.getQueryData<Address[]>(userKeys.addresses());
            const cachedOrders = queryClient.getQueryData<Order[]>(ORDER_KEYS.lists());

            // Prepare fetches for missing data
            const fetchPromises: Promise<any>[] = [];
            let ordersCount = cachedOrders?.length;
            let addressesCount = cachedAddresses?.length;

            // Fetch orders count if not cached
            if (ordersCount === undefined) {
                fetchPromises.push(
                    api<{ orders: Order[]; pagination: { total: number } }>('/orders?limit=1', { auth: true })
                        .then(res => {
                            ordersCount = res.pagination?.total ?? res.orders?.length ?? 0;
                        })
                        .catch(() => {
                            ordersCount = 0;
                        })
                );
            }

            // Fetch addresses count if not cached
            if (addressesCount === undefined) {
                fetchPromises.push(
                    api<Address[]>(`/users/me/addresses`, { auth: true })
                        .then(res => {
                            addressesCount = res?.length ?? 0;
                        })
                        .catch(() => {
                            addressesCount = 0;
                        })
                );
            }

            // Wait for all fetches
            await Promise.all(fetchPromises);

            return {
                orders: ordersCount ?? 0,
                addresses: addressesCount ?? 0,
                wishlist: 0, // SSR for now
                amc: 0,      // SSR for now
                notifications: 0, // TODO: Implement notification count
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
    });

    return {
        counts: query.data ?? { orders: 0, addresses: 0, wishlist: 0, amc: 0, notifications: 0 },
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
