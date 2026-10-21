/**
 * Payment Status Display Utilities
 * 
 * Consistent, user-friendly payment status display across the application.
 */

import {
    Clock,
    CheckCircle,
    AlertCircle,
    CreditCard,
    RefreshCw,
    Loader2,
    type LucideIcon
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type PaymentStatusType =
    | 'pending'
    | 'authorized'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded'
    | 'cancelled';

export interface PaymentStatusDisplay {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
    isSuccess: boolean;
    isPending: boolean;
    isError: boolean;
}

// ============================================================================
// Status Configuration
// ============================================================================

const PAYMENT_STATUS_CONFIG: Record<PaymentStatusType, PaymentStatusDisplay> = {
    pending: {
        label: 'Awaiting Payment',
        description: 'Payment has not been completed yet',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        icon: Clock,
        isSuccess: false,
        isPending: true,
        isError: false,
    },
    authorized: {
        label: 'Processing',
        description: 'Payment received, awaiting confirmation',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: Loader2,
        isSuccess: false,
        isPending: true,
        isError: false,
    },
    paid: {
        label: 'Paid',
        description: 'Payment completed successfully',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        isSuccess: true,
        isPending: false,
        isError: false,
    },
    failed: {
        label: 'Payment Failed',
        description: 'Payment could not be processed',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        isSuccess: false,
        isPending: false,
        isError: true,
    },
    refunded: {
        label: 'Refunded',
        description: 'Full refund has been processed',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        icon: RefreshCw,
        isSuccess: false,
        isPending: false,
        isError: false,
    },
    partially_refunded: {
        label: 'Partially Refunded',
        description: 'Partial refund has been processed',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        icon: RefreshCw,
        isSuccess: false,
        isPending: false,
        isError: false,
    },
    cancelled: {
        label: 'Cancelled',
        description: 'Payment was cancelled',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-700',
        icon: AlertCircle,
        isSuccess: false,
        isPending: false,
        isError: false,
    },
};

// Default fallback for unknown statuses
const DEFAULT_STATUS: PaymentStatusDisplay = {
    label: 'Unknown',
    description: 'Payment status is unknown',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: CreditCard,
    isSuccess: false,
    isPending: false,
    isError: false,
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Get payment status display configuration
 */
export function getPaymentStatusDisplay(status: string | null | undefined): PaymentStatusDisplay {
    if (!status) return DEFAULT_STATUS;
    return PAYMENT_STATUS_CONFIG[status as PaymentStatusType] || DEFAULT_STATUS;
}

/**
 * Check if payment status indicates the order needs payment
 */
export function needsPayment(paymentStatus: string | null | undefined): boolean {
    return paymentStatus === 'pending' || paymentStatus === 'failed';
}

/**
 * Check if payment is still being processed (should poll for updates)
 */
export function isPaymentPending(paymentStatus: string | null | undefined): boolean {
    return paymentStatus === 'pending' || paymentStatus === 'authorized';
}

/**
 * Check if payment is in a final state (no more updates expected)
 */
export function isPaymentFinal(paymentStatus: string | null | undefined): boolean {
    return paymentStatus === 'paid' ||
        paymentStatus === 'failed' ||
        paymentStatus === 'refunded' ||
        paymentStatus === 'cancelled';
}

/**
 * Get user-friendly message for payment status
 */
export function getPaymentStatusMessage(
    paymentStatus: string | null | undefined,
    paymentMethod?: string | null
): string {
    const status = getPaymentStatusDisplay(paymentStatus);

    if (paymentStatus === 'pending' && paymentMethod === 'cod') {
        return 'Pay when your order arrives';
    }

    if (paymentStatus === 'authorized') {
        return 'Your payment is being confirmed...';
    }

    return status.description;
}
