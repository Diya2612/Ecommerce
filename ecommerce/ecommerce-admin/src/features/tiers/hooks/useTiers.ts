import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/utils';
import { tierService } from '../services/tierService';
import type { TierFormData } from '../types';

/**
 * React Query hooks for tier management
 */

export const QUERY_KEYS = {
    all: ['tiers'] as const,
    lists: () => [...QUERY_KEYS.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.lists(), filters] as const,
    details: () => [...QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
    hierarchy: () => [...QUERY_KEYS.all, 'hierarchy'] as const,
    parents: (level: number) => [...QUERY_KEYS.all, 'parents', level] as const,
};

/**
 * Get all tiers with optional filters
 */
export function useTiers(filters?: {
    status?: string;
    level?: string | number;
    search?: string;
    usage?: string;
}) {
    return useQuery({
        queryKey: QUERY_KEYS.list(filters),
        queryFn: () => tierService.getAllTiers(filters),
    });
}

/**
 * Get tier hierarchy (tree structure)
 */
export const useTierHierarchy = () => {
    return useQuery({
        queryKey: QUERY_KEYS.hierarchy(),
        queryFn: () => tierService.getTierHierarchy(),
    });
};

/**
 * Get a single tier by ID
 */
export function useTier(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.detail(id),
        queryFn: () => tierService.getTierById(id),
        enabled: !!id,
    });
}

/**
 * Get available parent tiers for a level
 */
export function useAvailableParents(level: 2 | 3 | 4) {
    return useQuery({
        queryKey: QUERY_KEYS.parents(level),
        queryFn: () => tierService.getAvailableParents(level),
        enabled: level > 1,
    });
}

/**
 * Create a new tier
 */
export function useCreateTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TierFormData) => tierService.createTier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            notifySuccess('Tier created successfully');
        },
        onError: (error: Error) => {
            notifyError(error.message || 'Failed to create tier');
        },
    });
}

/**
 * Update an existing tier
 */
export function useUpdateTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TierFormData> }) =>
            tierService.updateTier(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
            notifySuccess('Tier updated successfully');
        },
        onError: (error: Error) => {
            notifyError(error.message || 'Failed to update tier');
        },
    });
}

/**
 * Delete a tier
 * Note: Query invalidation is handled by the component after navigation
 */
export function useDeleteTier() {
    return useMutation({
        mutationFn: (id: string) => tierService.deleteTier(id),
        onError: (error: Error) => {
            notifyError(error.message || 'Failed to delete tier');
        },
    });
}

/**
 * Bulk delete tiers
 */
export function useBulkDeleteTiers() {
    return useMutation({
        mutationFn: (ids: string[]) => tierService.bulkDeleteTiers(ids),
    });
}
