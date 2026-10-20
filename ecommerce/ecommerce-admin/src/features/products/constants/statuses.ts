/**
 * Product Status Constants
 */
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled',
} as const;

export type ProductStatus = typeof PRODUCT_STATUSES[keyof typeof PRODUCT_STATUSES];

/**
 * Product Status Display Configuration
 * Maps status values to UI styling and labels
 */
export const PRODUCT_STATUS_CONFIG = {
  [PRODUCT_STATUSES.ACTIVE]: {
    label: 'Active',
    color: 'emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'CheckCircle',
  },
  [PRODUCT_STATUSES.DRAFT]: {
    label: 'Draft',
    color: 'blue',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'FileText',
  },
  [PRODUCT_STATUSES.ARCHIVED]: {
    label: 'Archived',
    color: 'gray',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: 'Archive',
  },
  [PRODUCT_STATUSES.SCHEDULED]: {
    label: 'Scheduled',
    color: 'yellow',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: 'Clock',
  },
} as const;

/**
 * Get status badge classes for a given status
 */
export function getProductStatusBadge(status: string): string {
  const config = PRODUCT_STATUS_CONFIG[status as ProductStatus];
  return config?.badge || 'bg-gray-100 text-gray-600 border-gray-200';
}

/**
 * Get status label for a given status
 */
export function getProductStatusLabel(status: string): string {
  const config = PRODUCT_STATUS_CONFIG[status as ProductStatus];
  return config?.label || status;
}
