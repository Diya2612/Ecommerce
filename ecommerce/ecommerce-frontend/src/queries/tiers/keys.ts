/**
 * Tier Query Keys
 */
export const tierKeys = {
    all: ['tiers'] as const,
    lists: () => [...tierKeys.all, 'list'] as const,
    list: (params?: TierParams) => [...tierKeys.lists(), params] as const,
    hierarchy: () => [...tierKeys.all, 'hierarchy'] as const,
    detail: (id: string) => [...tierKeys.all, 'detail', id] as const,
};

/**
 * Params for getAllTiers
 */
export interface TierParams {
    level?: number;
    status?: 'active' | 'inactive';
    parentId?: string;
}
