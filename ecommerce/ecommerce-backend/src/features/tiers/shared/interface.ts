import { Tier, NewTier } from './tiers.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { omitFields } from '../../../utils';
import { schema } from '../../../database';
import {
  createTierSchema,
  updateTierSchema,
  tierImportSchema,
  importTiersRequestSchema,
  tierIdParamSchema,
  getTiersQuerySchema,
  bulkDeleteTiersSchema,
  tierStatusValues,
} from './validation';
import { z } from 'zod';

/**
 * Tier Domain Interfaces
 */

export type ITier = Tier;
export type INewTier = NewTier;
export type ITierStatus = (typeof tierStatusValues)[number];
export type ITiersDatabase = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

export type ICreateTierInput = z.infer<typeof createTierSchema>;
export type IUpdateTierInput = z.infer<typeof updateTierSchema>;
export type ITierImportInput = z.infer<typeof tierImportSchema>;
export type IImportTiersRequest = z.infer<typeof importTiersRequestSchema>;
export type ITierIdParam = z.infer<typeof tierIdParamSchema>;
export type IGetTiersQuery = z.infer<typeof getTiersQuerySchema>;
export type IBulkDeleteTiersInput = z.infer<typeof bulkDeleteTiersSchema>;

export interface ICreateTier extends Omit<
  ITier,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'created_by'
  | 'updated_by'
  | 'deleted_at'
  | 'deleted_by'
  | 'is_deleted'
  | 'usage_count'
> {
  parent_id: string | null;
}

export type IUpdateTier = Partial<
  Omit<
    ITier,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'created_by'
    | 'updated_by'
    | 'deleted_at'
    | 'deleted_by'
    | 'is_deleted'
  >
>;

export type ITierResponse = Omit<
  ITier,
  'created_by' | 'updated_by' | 'is_deleted' | 'deleted_at' | 'deleted_by'
>;

export function mapToTierResponse(tier: ITier): ITierResponse {
  return omitFields(tier, ['created_by', 'updated_by', 'is_deleted', 'deleted_at', 'deleted_by']);
}

export interface ITierHierarchyResponse extends ITierResponse {
  children: ITierHierarchyResponse[];
}

export function mapToTierHierarchyResponse(tier: any): ITierHierarchyResponse {
  const sanitized = mapToTierResponse(tier) as ITierHierarchyResponse;
  sanitized.children =
    tier.children && Array.isArray(tier.children)
      ? tier.children.map(mapToTierHierarchyResponse)
      : [];
  return sanitized;
}

export interface ITierWithParentResponse extends ITierResponse {
  parent?: ITierResponse;
}

export function mapToTierWithParentResponse(tier: any): ITierWithParentResponse {
  const sanitized = mapToTierResponse(tier) as ITierWithParentResponse;
  if (tier.parent) sanitized.parent = mapToTierResponse(tier.parent);
  return sanitized;
}

export type ITierMinimal = Pick<ITier, 'id' | 'name' | 'code' | 'level'>;

export interface IProductTier {
  product_id: string;
  tier_id: string;
  is_primary: boolean;
}

export interface ITierExportQueryOptions {
  format: 'csv' | 'xlsx';
  scope: 'all' | 'selected' | 'filtered';
  selectedIds?: string[];
  selectedColumns: string[];
  dateRange?: {
    field: 'created_at' | 'updated_at';
    from: string;
    to: string;
  };
}

export interface ITierImportResult {
  total: number;
  success: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: Array<{
    row: number;
    name: string;
    message: string;
  }>;
}

export interface ICachedTier {
  tier: ITier;
  expiresAt: number;
}

/**
 * Generate URL-friendly code from tier name.
 */
export function generateTierCode(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique tier code.
 */
export function generateUniqueTierCode(baseCode: string, existingCodes: Set<string>): string {
  let code = baseCode;
  let counter = 2;
  while (existingCodes.has(code)) {
    code = `${baseCode}-${counter}`;
    counter++;
  }
  return code;
}

/**
 * Get tier level display name.
 */
export function getTierLevelName(level: number): string {
  const levelNames: Record<number, string> = {
    1: 'Root Category',
    2: 'Main Category',
    3: 'Subcategory',
    4: 'Product Type',
  };
  return levelNames[level] || `Level ${level}`;
}
