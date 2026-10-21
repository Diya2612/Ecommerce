/**
 * Tier Query Functions
 */

import { api } from '@/api';
import type { Tier, TierNode } from '@/types/tier';
import type { TierParams } from './keys';

interface TierHierarchyResponse {
    tiers: TierNode[];
}

/**
 * Get all tiers as a flat list
 */
export async function getAllTiers(params?: TierParams): Promise<Tier[]> {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.append('level', params.level.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.parentId) searchParams.append('parentId', params.parentId);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tiers?${queryString}` : '/tiers';

    return api<Tier[]>(endpoint);
}

/**
 * Get the full tier hierarchy (tree structure)
 */
export async function getTierHierarchy(): Promise<TierNode[]> {
    const response = await api<TierHierarchyResponse>('/tiers/hierarchy');
    return response.tiers;
}

/**
 * Get a specific tier by ID
 */
export async function getTierById(id: string): Promise<Tier> {
    return api<Tier>(`/tiers/${id}`);
}
