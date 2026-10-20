import type { TierLevel, TierStatus } from './domain.types';

/**
 * Backend DTOs
 */

export interface TierResponseDTO {
  id: string;
  name: string;
  code: string;
  description: string | null;
  level: TierLevel;
  parent_id: string | null;
  status: TierStatus;
  usage_count: number;
  created_at: string;
  updated_at: string;
  children?: TierResponseDTO[];
}

export interface TierHierarchyResponse {
  tiers: TierResponseDTO[];
}

export interface TierImportResult {
  total: number;
  success: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; name: string; message: string }>;
}
