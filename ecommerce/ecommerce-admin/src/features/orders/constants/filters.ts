/**
 * Order Filter Constants
 * Type-safe constants for order filtering
 */

/**
 * Abandoned Cart Status Filter Values
 */
export const ABANDONED_CART_FILTERS = {
  STATUS: {
    ALL: '',
    NOT_CONTACTED: 'not-contacted',
    EMAIL_SENT: 'email-sent',
    RECOVERED: 'recovered',
  },
} as const;

/**
 * Order Status Filter Values
 */
export const ORDER_FILTERS = {
  STATUS: {
    ALL: '',
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    RETURNED: 'returned',
  },
  PAYMENT_STATUS: {
    ALL: '',
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
    FAILED: 'failed',
    PARTIALLY_REFUNDED: 'partially_refunded',
  },
  FULFILLMENT_STATUS: {
    ALL: '',
    UNFULFILLED: 'unfulfilled',
    PARTIAL: 'partial',
    FULFILLED: 'fulfilled',
    RETURNED: 'returned',
    CANCELLED: 'cancelled',
  },
} as const;