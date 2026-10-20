/**
 * Inventory Filter Constants
 * Constants for inventory filtering options
 */

import type { QuickFilter } from '../types';

/**
 * Quick filter values for inventory
 */
export const INVENTORY_QUICK_FILTERS = {
  LOW_STOCK: 'low-stock' as QuickFilter,
  ZERO_AVAILABLE: 'zero-available' as QuickFilter,
  BLOCKED: 'blocked' as QuickFilter,
  RECENTLY_UPDATED: 'recently-updated' as QuickFilter,
} as const;

/**
 * Quick filter options for UI components
 */
export const INVENTORY_QUICK_FILTER_OPTIONS = [
  {
    label: 'All Products',
    value: '',
  },
  {
    label: 'Low Stock',
    value: INVENTORY_QUICK_FILTERS.LOW_STOCK,
  },
  {
    label: 'Zero Available',
    value: INVENTORY_QUICK_FILTERS.ZERO_AVAILABLE,
  },
  {
    label: 'Recently Updated',
    value: INVENTORY_QUICK_FILTERS.RECENTLY_UPDATED,
  },
] as const;