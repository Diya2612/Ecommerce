/**
 * Tier Status Constants
 */
export enum TierStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const TIER_STATUSES = {
  ACTIVE: TierStatusEnum.ACTIVE,
  INACTIVE: TierStatusEnum.INACTIVE,
} as const;

export type TierStatus = typeof TIER_STATUSES[keyof typeof TIER_STATUSES];

/**
 * Tier Status Display Configuration
 * Maps status values to UI styling and labels
 */
export const TIER_STATUS_CONFIG = {
  [TIER_STATUSES.ACTIVE]: {
    label: 'Active',
    color: 'emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'CheckCircle',
  },
  [TIER_STATUSES.INACTIVE]: {
    label: 'Inactive',
    color: 'gray',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: 'XCircle',
  },
} as const;

/**
 * Get status badge classes for a given status
 */
export function getTierStatusBadge(status: string): string {
  const normalizedStatus = (status || '').toLowerCase();
  const config = TIER_STATUS_CONFIG[normalizedStatus as TierStatus];
  return config?.badge || 'bg-gray-100 text-gray-600 border-gray-200';
}

/**
 * Get status label for a given status
 */
export function getTierStatusLabel(status: string): string {
  const normalizedStatus = (status || '').toLowerCase();
  const config = TIER_STATUS_CONFIG[normalizedStatus as TierStatus];
  return config?.label || status;
}
