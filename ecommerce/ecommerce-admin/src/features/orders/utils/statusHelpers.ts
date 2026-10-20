/**
 * Order status helpers - Status transition and helper functions
 */

import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '../constants/statuses';
import { VALID_ORDER_TRANSITIONS, VALID_PAYMENT_TRANSITIONS, VALID_FULFILLMENT_TRANSITIONS } from '../constants/statuses';

// Re-export types for backward compatibility
export type { OrderStatus, PaymentStatus, FulfillmentStatus };

// Re-export constants for backward compatibility
export { VALID_ORDER_TRANSITIONS, VALID_PAYMENT_TRANSITIONS, VALID_FULFILLMENT_TRANSITIONS } from '../constants/statuses';
export { ORDER_LIFECYCLE_STEPS } from '../constants/lifecycle';

// Re-export functions for backward compatibility
export { getStatusLabel, getPaymentLabel, getFulfillmentLabel, getStatusColor, getPaymentColor, getFulfillmentColor, getStatusIcon } from '../constants/labels';
export { getOrderLifecycleStep, isTerminalState } from '../constants/lifecycle';

export interface TransitionValidation {
    isValid: boolean;
    errorMessage?: string;
    allowedTransitions: string[];
}

export interface StatusWarning {
    type: 'warning' | 'info' | 'error';
    message: string;
    affectedStatus: 'order' | 'payment' | 'fulfillment';
}

/**
 * Check if an order status transition is allowed
 */
export function canTransitionOrder(currentStatus: string, targetStatus: string): boolean {
    if (!currentStatus) return true;
    const allowed = VALID_ORDER_TRANSITIONS[currentStatus.toLowerCase() as OrderStatus] || [];
    return allowed.includes(targetStatus.toLowerCase() as OrderStatus);
}

/**
 * Check if a payment status transition is allowed
 */
export function canTransitionPayment(currentStatus: string, targetStatus: string): boolean {
    if (!currentStatus) return true;
    const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus.toLowerCase() as PaymentStatus] || [];
    return allowed.includes(targetStatus.toLowerCase() as PaymentStatus);
}

/**
 * Check if a fulfillment status transition is allowed
 */
export function canTransitionFulfillment(currentStatus: string, targetStatus: string): boolean {
    if (!currentStatus) return true;
    const allowed = VALID_FULFILLMENT_TRANSITIONS[currentStatus.toLowerCase() as FulfillmentStatus] || [];
    return allowed.includes(targetStatus.toLowerCase() as FulfillmentStatus);
}

/**
 * Get warnings for conflicting or noteworthy status combinations
 */
export function getStatusWarnings(
    orderStatus: string,
    paymentStatus: string,
    fulfillmentStatus: string
): StatusWarning[] {
    const warnings: StatusWarning[] = [];
    const os = orderStatus?.toLowerCase();
    const ps = paymentStatus?.toLowerCase();
    const fs = fulfillmentStatus?.toLowerCase();

    // Shipped but payment pending - concerning
    if (os === 'shipped' && ps === 'pending') {
        warnings.push({
            type: 'warning',
            message: 'Order shipped but payment is still pending',
            affectedStatus: 'payment'
        });
    }

    // Delivered but not fulfilled (data inconsistency)
    if (os === 'delivered' && fs !== 'fulfilled') {
        warnings.push({
            type: 'error',
            message: 'Order delivered but fulfillment status is not marked as fulfilled',
            affectedStatus: 'fulfillment'
        });
    }

    // Cancelled but payment was made
    if (os === 'cancelled' && ps === 'paid') {
        warnings.push({
            type: 'warning',
            message: 'Order cancelled but payment was received - consider processing a refund',
            affectedStatus: 'payment'
        });
    }

    // Processing but not paid (COD is okay, but flagging)
    if (os === 'processing' && ps === 'pending') {
        warnings.push({
            type: 'info',
            message: 'Order is being processed with pending payment (COD or awaiting confirmation)',
            affectedStatus: 'payment'
        });
    }

    // Refunded but order not cancelled
    if (ps === 'refunded' && !['cancelled', 'returned', 'refunded'].includes(os)) {
        warnings.push({
            type: 'warning',
            message: 'Payment refunded but order status should be updated accordingly',
            affectedStatus: 'order'
        });
    }

    // Fulfilled but order still pending
    if (fs === 'fulfilled' && os === 'pending') {
        warnings.push({
            type: 'error',
            message: 'Fulfillment complete but order is still pending - update order status',
            affectedStatus: 'order'
        });
    }

    return warnings;
}