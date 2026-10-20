/**
 * Domain Tier Types
 */

export type TierStatus = 'active' | 'inactive';
export type TierLevel = 1 | 2 | 3 | 4;

export interface Tier {
  id: string;
  name: string;
  code: string;
  description: string;
  level: TierLevel;
  parentId: string | null;
  status: TierStatus;
  usageCount: number;
  isDeleted?: boolean;
  children?: Tier[];
  createdAt?: string;
  updatedAt?: string;
}

export type TierViewMode = 'tree' | 'list';

export interface TierTreeProps {
  tiers: Tier[];
  selectedTier?: Tier | null;
  expandedTiers: Set<string>;
  onSelectTier: (tier: Tier) => void;
  onToggleExpand: (tierId: string) => void;
  onAddSubTier: (tier: Tier) => void;
}
