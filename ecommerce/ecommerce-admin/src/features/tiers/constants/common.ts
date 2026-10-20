/**
 * Tier Table Column Keys
 * Used for column visibility toggling
 */
export const TIER_COLUMN_KEYS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  USAGE: 'usageCount',
  STATUS: 'status',
  LEVEL: 'level',
  CREATED: 'createdAt',
  UPDATED: 'updatedAt',
} as const;

/**
 * Non-sortable columns
 * Columns that should not have sort functionality
 */
export const TIER_NON_SORTABLE_COLUMNS = [
  TIER_COLUMN_KEYS.DESCRIPTION,
] as const;

/**
 * Tier Level Display Options
 */
export const TIER_LEVEL_OPTIONS = [
  { label: 'Level 1 (Top)', value: '1' },
  { label: 'Level 2', value: '2' },
  { label: 'Level 3', value: '3' },
  { label: 'Level 4 (Bottom)', value: '4' },
] as const;

/**
 * Tier Status Display Options
 */
export const TIER_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

/**
 * Tier Field Limits
 */
export const TIER_LIMITS = {
  NAME_MAX_LENGTH: 100,
  CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;
