/**
 * Order Sort Constants
 * Type-safe constants for order sorting
 */

/**
 * Order Sort Options
 */
export const ORDER_SORTS = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  AMOUNT_DESC: 'amount_desc',
  AMOUNT_ASC: 'amount_asc',
  STATUS_DESC: 'status_desc',
  STATUS_ASC: 'status_asc',
} as const;

/**
 * Abandoned Cart Sort Options
 */
export const ABANDONED_CART_SORTS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  VALUE_DESC: 'value_desc',
  VALUE_ASC: 'value_asc',
} as const;

/**
 * Default sort values
 */
export const DEFAULT_SORTS = {
  ORDERS: ORDER_SORTS.DATE_DESC,
  ABANDONED_CARTS: ABANDONED_CART_SORTS.NEWEST,
} as const;