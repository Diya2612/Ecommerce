/**
 * Order Lifecycle Constants
 * Constants and utilities for order lifecycle management
 */

import type { OrderStatus } from './statuses';
import { VALID_ORDER_TRANSITIONS } from './statuses';

/**
 * Order lifecycle steps for timeline visualization
 */
export const ORDER_LIFECYCLE_STEPS = [
    { value: 'pending', label: 'Pending', icon: 'clock' },
    { value: 'confirmed', label: 'Confirmed', icon: 'check' },
    { value: 'processing', label: 'Processing', icon: 'package' },
    { value: 'shipped', label: 'Shipped', icon: 'truck' },
    { value: 'delivered', label: 'Delivered', icon: 'check-circle' }
] as const;

/**
 * Check if order is in a terminal state (cannot proceed forward)
 */
export function isTerminalState(orderStatus: string): boolean {
    const os = orderStatus?.toLowerCase() as OrderStatus;
    const transitions = VALID_ORDER_TRANSITIONS[os] || [];
    return transitions.length === 0 || os === 'cancelled';
}

/**
 * Get the current step in the order lifecycle (0-indexed)
 */
export function getOrderLifecycleStep(orderStatus: string): number {
    const os = orderStatus?.toLowerCase();

    // Map terminal/alternate states to their equivalent position
    if (os === 'cancelled' || os === 'refunded') return -1; // Not in normal flow
    if (os === 'returned') return 4; // After delivered conceptually

    const stepIndex = ORDER_LIFECYCLE_STEPS.findIndex(s => s.value === os);
    return stepIndex >= 0 ? stepIndex : 0;
}

/**
 * Check if shipping requires tracking number
 */
export function requiresTracking(targetOrderStatus: string, currentTrackingNumber?: string): boolean {
    return targetOrderStatus.toLowerCase() === 'shipped' && !currentTrackingNumber;
}