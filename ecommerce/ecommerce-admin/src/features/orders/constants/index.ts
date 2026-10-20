/**
 * Order Constants
 * Centralized constants for order management
 */

// Export all constants
export * from './statuses';
export * from './lifecycle';
export * from './labels';
export * from './filters';
export * from './sorts';

/**
 * Order Field Limits
 */
export const ORDER_LIMITS = {
  TRACKING_NUMBER_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 1000,
  MAX_ORDER_ITEMS: 100,
} as const;

/**
 * Order Validation Rules
 */
export const ORDER_VALIDATION = {
  MIN_ORDER_VALUE: 0.01,
  MAX_ORDER_VALUE: 10000000, // 1 crore
  DECIMAL_PLACES: 2,
} as const;

/**
 * Currency symbol for orders
 */
export const CURRENCY_SYMBOL = '₹';