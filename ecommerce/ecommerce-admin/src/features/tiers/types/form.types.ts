import type { Tier, TierLevel, TierStatus } from './domain.types';

/**
 * Component Props Interfaces
 */
export interface TierHierarchySectionProps {
  level: TierLevel;
  parentId: string | null;
  availableParents?: Tier[];
  onLevelChange: (level: TierLevel) => void;
  onParentChange: (parentId: string | null) => void;
  errors?: {
    level?: string;
    parentId?: string;
  };
  mode?: 'create' | 'edit';
  selectedParent?: Tier;
  breadcrumbTrail?: Tier[];
}

/**
 * Form Data Types
 */

export interface TierFormData {
  id?: string;
  name: string;
  code: string;
  description: string;
  level: TierLevel;
  parentId: string | null;
  status: TierStatus;
}
