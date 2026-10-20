/**
 * Order Status Constants
 * Extracted from orderStatusHelpers.ts for better organization
 */

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';

/**
 * Valid order status transitions mirroring backend logic
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'returned'],
    'delivered': ['refunded'],
    'cancelled': ['refunded'],
    'refunded': [],
    'returned': ['refunded']
};

/**
 * Valid payment status transitions
 */
export const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
    'pending': ['paid', 'failed'],
    'paid': ['refunded', 'partially_refunded'],
    'failed': ['pending', 'paid'],
    'refunded': [],
    'partially_refunded': ['refunded']
};

/**
 * Valid fulfillment status transitions
 */
export const VALID_FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
    'unfulfilled': ['partial', 'fulfilled', 'cancelled'],
    'partial': ['fulfilled', 'cancelled'],
    'fulfilled': ['returned'],
    'returned': [],
    'cancelled': []
};