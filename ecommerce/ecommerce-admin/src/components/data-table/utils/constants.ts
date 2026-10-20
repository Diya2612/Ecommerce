/**
 * Constants for data-table components
 * Central location for magic numbers and default configurations
 */

// ============================================================================
// COLUMN SIZES
// ============================================================================
export const COLUMN_SIZES = {
  CHECKBOX: {
    width: 48,
    minWidth: 48,
    maxWidth: 48,
  },
  EXPAND: {
    width: 48,
  },
} as const;

// ============================================================================
// PAGINATION
// ============================================================================
export const PAGINATION_DEFAULTS = {
  rowsPerPageOptions: [10, 25, 50, 100],
  defaultRowsPerPage: 10,
  storageKey: 'rowsPerPage',
} as const;

// ============================================================================
// SKELETON LOADING
// ============================================================================
export const SKELETON_DEFAULTS = {
  rowCount: 5,
  mobileCardCount: 4,
} as const;

// ============================================================================
// TABLE HEIGHTS
// ============================================================================
export const TABLE_HEIGHTS = {
  maxDesktopHeight: 600,
  footer: 80,
  filterRow: 50,
} as const;

// ============================================================================
// MOBILE THRESHOLDS
// ============================================================================
export const MOBILE_GESTURE = {
  dragThreshold: 120, // pixels to drag down before closing
  dragDamping: 0.6, // resistance factor during drag
} as const;

// ============================================================================
// DEBOUNCE TIMINGS
// ============================================================================
export const DEBOUNCE_TIMINGS = {
  search: 300, // ms
  filter: 200, // ms
  resize: 150, // ms
} as const;

// ============================================================================
// BADGE VARIANTS
// ============================================================================
export const BADGE_VARIANTS = {
  active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  draft: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  default: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
} as const;

// ============================================================================
// DEFAULT CURRENCY
// ============================================================================
export const DEFAULT_CURRENCY_SYMBOL = '₹';

// ============================================================================
// BUTTON HEIGHTS
// ============================================================================
export const BUTTON_HEIGHTS = {
  default: 50,
  small: 38,
  icon: 50,
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const Z_INDEX = {
  tableHeader: 10,
  mobileSheet: 50,
  overlay: 50,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export type BadgeVariant = keyof typeof BADGE_VARIANTS;
