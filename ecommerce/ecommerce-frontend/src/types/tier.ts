/**
 * Tier (Category) Types
 */

export type TierStatus = 'active' | 'inactive';

export interface Tier {
    id: string;
    name: string;
    code: string;
    description: string | null;
    level: number;
    parent_id: string | null;
    status: TierStatus;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

export interface TierNode extends Tier {
    children: TierNode[];
}

export interface TierHierarchyResponse {
    tiers: TierNode[];
}
