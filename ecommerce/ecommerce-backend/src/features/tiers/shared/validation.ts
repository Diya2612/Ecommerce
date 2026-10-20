import { z } from 'zod';

/**
 * Constants and Enum Values
 */
export const MAX_TIER_LEVELS = 4;
export const MIN_TIER_LEVEL = 1;
export const tierStatusValues = ['active', 'inactive'] as const;
export type TierStatus = (typeof tierStatusValues)[number];

/**
 * Tier Code Validation
 */
export const tierCodeSchema = z
  .string()
  .min(1, 'Code is required')
  .max(255, 'Code must be 255 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Code must be lowercase alphanumeric with hyphens only')
  .trim();

/**
 * Tier Validation Schemas
 */

export const createTierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').trim(),
  code: tierCodeSchema.optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  level: z.number().int().min(MIN_TIER_LEVEL).max(MAX_TIER_LEVELS),
  parent_id: z.string().uuid('Invalid parent ID').optional(),
  priority: z.number().int().nonnegative().optional().default(0),
  status: z.enum(tierStatusValues).default('active'),
});

export const updateTierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').trim().optional(),
  code: tierCodeSchema.optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.number().int().nonnegative().optional(),
  status: z.enum(tierStatusValues).optional(),
});

export const tierImportSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  code: z.string().min(1).max(255).trim().optional(),
  description: z.string().optional(),
  level: z.number().int().min(MIN_TIER_LEVEL).max(MAX_TIER_LEVELS),
  parent_code: z.string().optional(),
  priority: z.number().int().nonnegative().optional(),
  status: z.enum(tierStatusValues).optional(),
});

export const importTiersRequestSchema = z.object({
  data: z
    .array(tierImportSchema)
    .min(1, 'Must provide at least one tier')
    .max(1000, 'Maximum 1000 tiers per import'),
  mode: z.enum(['create', 'update', 'upsert']).default('create'),
});

export const tierIdParamSchema = z.object({
  id: z.string().uuid('Invalid tier ID'),
});

export const getTiersQuerySchema = z.object({
  level: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  usage: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const bulkDeleteTiersSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Must provide at least one tier ID'),
});

/**
 * Validation Helpers
 */

export const validateTierHierarchy = (
  level: number,
  parentLevel: number | null,
): { valid: boolean; error?: string } => {
  if (level === 1) {
    if (parentLevel !== null)
      return { valid: false, error: 'Root tier (level 1) cannot have a parent' };
    return { valid: true };
  }
  if (parentLevel === null) return { valid: false, error: `Level ${level} tier requires a parent` };
  if (level !== parentLevel + 1) {
    return {
      valid: false,
      error: `Invalid level. Child tier must be level ${parentLevel + 1} (parent is level ${parentLevel})`,
    };
  }
  return { valid: true };
};

export const isValidTierLevel = (level: number): boolean => {
  return level >= MIN_TIER_LEVEL && level <= MAX_TIER_LEVELS;
};

export const isValidTierStatus = (status: string): status is TierStatus => {
  return tierStatusValues.includes(status as TierStatus);
};
