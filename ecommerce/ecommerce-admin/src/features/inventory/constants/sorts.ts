/**
 * Inventory Sort Constants
 * Constants for inventory sorting options
 */

/**
 * Sort options for inventory table
 */
export const INVENTORY_SORT_OPTIONS = [
  {
    label: 'Name',
    value: 'productName',
    direction: 'asc' as const,
  },
  {
    label: 'Last Updated',
    value: 'lastUpdated',
    direction: 'desc' as const,
  },
  {
    label: 'Available Stock',
    value: 'available',
    direction: 'desc' as const,
  },
] as const;