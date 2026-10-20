/**
 * Custom React Query hooks for inventory feature
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/utils';
import {
    getInventory,
    getInventoryById,
    getInventoryHistory,
    adjustInventory,
    // adjustVariantInventory, // Phase 2A: Removed - use adjustInventory instead
    updateInventory,
} from '../services/inventoryApi.service';
import { mapApiToInventoryItem, mapApiToHistoryEntry } from '../services/inventoryMapper';
import type { InventoryFilters, AdjustInventoryRequest, UpdateInventoryRequest } from '../services/inventoryApi.types';

// Query keys
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
    history: (id: string) => [...inventoryKeys.all, 'history', id] as const,
};

/**
 * Hook to fetch inventory list with filters
 */
export const useInventory = (filters: InventoryFilters = {}) => {
    return useQuery({
        queryKey: inventoryKeys.list(filters),
        queryFn: async () => {
            try {
                const response = await getInventory(filters);
                
                // Debug logging in development
                if (import.meta.env.DEV) {
                    console.log('[useInventory] API Response:', response);
                    console.log('[useInventory] Items count:', response.data?.length);
                    console.log('[useInventory] Pagination:', response.meta?.pagination);
                }
                
                // Backend ResponseFormatter.paginated returns:
                // { success, data: items[], message, meta: { pagination } }
                // Transform to what components expect
                return {
                    data: {
                        inventory: response.data.map(mapApiToInventoryItem),
                        pagination: {
                            ...response.meta.pagination,
                            totalPages: Math.ceil(response.meta.pagination.total / response.meta.pagination.limit),
                        },
                    },
                };
            } catch (error: any) {
                console.error('[useInventory] Error fetching inventory:', error);
                console.error('[useInventory] Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                throw error;
            }
        },
        staleTime: 30 * 1000, // 30 seconds
        placeholderData: (previousData) => previousData,
        retry: 1, // Retry once on failure
    });
};

/**
 * Hook to fetch single inventory item
 */
export const useInventoryItem = (id: string) => {
    return useQuery({
        queryKey: inventoryKeys.detail(id),
        queryFn: async () => {
            const item = await getInventoryById(id);
            return mapApiToInventoryItem(item);
        },
        enabled: !!id,
    });
};

/**
 * Hook to fetch inventory history
 */
export const useInventoryHistory = (id: string, limit = 50) => {
    return useQuery({
        queryKey: inventoryKeys.history(id),
        queryFn: async () => {
            const history = await getInventoryHistory(id, limit);
            return history.map(mapApiToHistoryEntry);
        },
        enabled: !!id,
    });
};

/**
 * Hook to adjust inventory quantity
 */
export const useAdjustInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AdjustInventoryRequest }) => {
            // Phase 2A: Unified inventory system - both products and variants use same endpoint
            // id should be the inventory record ID (not variant ID)
            return adjustInventory(id, data);
        },
        onSuccess: (_, variables) => {
            notifySuccess('Inventory adjusted successfully');
            // Invalidate and refetch inventory queries
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.history(variables.id) });
        },
        onError: (error: any) => {
            notifyError(error?.response?.data?.message || 'Failed to adjust inventory');
        },
    });
};

/**
 * Hook to update inventory metadata
 */
export const useUpdateInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInventoryRequest }) =>
            updateInventory(id, data),
        onSuccess: (_, variables) => {
            notifySuccess('Inventory updated successfully');
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
        },
        onError: (error: any) => {
            notifyError(error?.response?.data?.message || 'Failed to update inventory');
        },
    });
};
