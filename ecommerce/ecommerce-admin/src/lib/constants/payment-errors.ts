/**
 * Payment Error Constants & Helpers
 * 
 * Centralized error code definitions, user-friendly messages, and helper functions
 * for categorizing and handling Razorpay payment errors.
 */

// ============================================================================
// Types
// ============================================================================

export type PaymentErrorCode =
    // Pre-Payment Errors
    | 'SDK_NOT_LOADED'
    | 'SESSION_EXPIRED'
    | 'ORDER_NOT_FOUND'
    | 'ORDER_ALREADY_PAID'
    | 'ORDER_CANCELLED'
    | 'ORDER_EXPIRED'
    | 'MAX_RETRIES_EXCEEDED'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR'
    // During-Payment Errors
    | 'PAYMENT_CANCELLED'
    | 'PAYMENT_FAILED'
    | 'BAD_REQUEST'
    | 'GATEWAY_ERROR'
    | 'TIMEOUT'
    // Post-Payment Errors
    | 'INVALID_SIGNATURE'
    | 'VERIFICATION_TIMEOUT'
    | 'VERIFICATION_NETWORK_ERROR'
    | 'AWAITING_CONFIRMATION'  // NEW: Waiting for webhook confirmation
    // Generic
    | 'UNKNOWN_ERROR';

export type ErrorCategory =
    | 'network'
    | 'bank'
    | 'validation'
    | 'timeout'
    | 'cancelled'
    | 'system'
    | 'success_pending';

export type RecoveryAction =
    | 'retry'
    | 'different_method'
    | 'login'
    | 'contact_support'
    | 'view_order'
    | 'go_to_cart'
    | 'go_to_orders'
    | 'refresh'
    | 'wait';

export interface PaymentErrorConfig {
    code: PaymentErrorCode;
    category: ErrorCategory;
    title: string;
    message: string;
    description?: string;
    primaryAction: RecoveryAction;
    secondaryAction?: RecoveryAction;
    autoCloseSeconds?: number;
    showSupport?: boolean;
    icon: 'error' | 'warning' | 'info' | 'network' | 'bank' | 'timeout' | 'cancelled';
}

// ============================================================================
// Error Configurations
// ============================================================================

export const PAYMENT_ERROR_CONFIG: Record<PaymentErrorCode, PaymentErrorConfig> = {
    // Pre-Payment Errors
    SDK_NOT_LOADED: {
        code: 'SDK_NOT_LOADED',
        category: 'network',
        title: 'Payment Gateway Loading',
        message: 'Payment gateway is loading. Please wait or refresh the page.',
        description: 'The Razorpay checkout script is still loading. This usually happens on slow connections.',
        primaryAction: 'refresh',
        secondaryAction: 'retry',
        icon: 'network',
    },
    SESSION_EXPIRED: {
        code: 'SESSION_EXPIRED',
        category: 'validation',
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        description: 'For security reasons, your session has timed out. Your cart is saved.',
        primaryAction: 'login',
        icon: 'warning',
    },
    ORDER_NOT_FOUND: {
        code: 'ORDER_NOT_FOUND',
        category: 'validation',
        title: 'Order Not Found',
        message: 'We couldn\'t find this order. It may have been modified.',
        description: 'The order you\'re trying to pay for doesn\'t exist or has been removed.',
        primaryAction: 'go_to_cart',
        showSupport: true,
        icon: 'error',
    },
    ORDER_ALREADY_PAID: {
        code: 'ORDER_ALREADY_PAID',
        category: 'validation',
        title: 'Already Paid!',
        message: 'Great news! This order is already paid.',
        description: 'You\'ve already completed payment for this order.',
        primaryAction: 'view_order',
        icon: 'info',
        autoCloseSeconds: 5,
    },
    ORDER_CANCELLED: {
        code: 'ORDER_CANCELLED',
        category: 'validation',
        title: 'Order Cancelled',
        message: 'This order has been cancelled and cannot be paid.',
        description: 'You\'ll need to create a new order to make a purchase.',
        primaryAction: 'go_to_cart',
        icon: 'warning',
    },
    ORDER_EXPIRED: {
        code: 'ORDER_EXPIRED',
        category: 'validation',
        title: 'Order Expired',
        message: 'This order is too old to process payment.',
        description: 'Orders must be paid within 7 days. Please create a new order.',
        primaryAction: 'go_to_cart',
        icon: 'timeout',
    },
    MAX_RETRIES_EXCEEDED: {
        code: 'MAX_RETRIES_EXCEEDED',
        category: 'validation',
        title: 'Too Many Attempts',
        message: 'Maximum payment attempts exceeded.',
        description: 'For security reasons, we\'ve limited the number of payment attempts. Please contact support for assistance.',
        primaryAction: 'contact_support',
        showSupport: true,
        icon: 'error',
    },
    SERVER_ERROR: {
        code: 'SERVER_ERROR',
        category: 'system',
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again.',
        description: 'Our servers encountered an unexpected error. Your payment was not processed.',
        primaryAction: 'retry',
        showSupport: true,
        icon: 'error',
    },
    NETWORK_ERROR: {
        code: 'NETWORK_ERROR',
        category: 'network',
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        description: 'We couldn\'t reach our servers. Make sure you\'re connected to the internet.',
        primaryAction: 'retry',
        icon: 'network',
    },

    // During-Payment Errors
    PAYMENT_CANCELLED: {
        code: 'PAYMENT_CANCELLED',
        category: 'cancelled',
        title: 'Payment Cancelled',
        message: 'You cancelled the payment. Your order is saved.',
        description: 'No worries! You can complete the payment anytime from your orders page.',
        primaryAction: 'retry',
        secondaryAction: 'go_to_orders',
        icon: 'cancelled',
        autoCloseSeconds: 10,
    },
    PAYMENT_FAILED: {
        code: 'PAYMENT_FAILED',
        category: 'bank',
        title: 'Payment Failed',
        message: 'Your payment was declined.',
        description: 'This could be due to insufficient funds, card limits, or your bank\'s security measures.',
        primaryAction: 'retry',
        secondaryAction: 'different_method',
        icon: 'bank',
    },
    BAD_REQUEST: {
        code: 'BAD_REQUEST',
        category: 'validation',
        title: 'Payment Error',
        message: 'Something went wrong with the payment request.',
        description: 'Please try again. If the issue persists, try a different payment method.',
        primaryAction: 'retry',
        secondaryAction: 'different_method',
        icon: 'error',
    },
    GATEWAY_ERROR: {
        code: 'GATEWAY_ERROR',
        category: 'system',
        title: 'Gateway Error',
        message: 'The payment gateway encountered an error.',
        description: 'This is a temporary issue with Razorpay. Please try again in a few minutes.',
        primaryAction: 'retry',
        icon: 'error',
    },
    TIMEOUT: {
        code: 'TIMEOUT',
        category: 'timeout',
        title: 'Payment Timeout',
        message: 'The payment took too long to process.',
        description: 'Your payment may have gone through. Please check your order status before trying again.',
        primaryAction: 'view_order',
        secondaryAction: 'retry',
        showSupport: true,
        icon: 'timeout',
    },

    // Post-Payment Errors
    INVALID_SIGNATURE: {
        code: 'INVALID_SIGNATURE',
        category: 'system',
        title: 'Verification Failed',
        message: 'Payment verification failed.',
        description: 'We couldn\'t verify your payment. If money was deducted, it will be refunded automatically.',
        primaryAction: 'contact_support',
        showSupport: true,
        icon: 'error',
    },
    VERIFICATION_TIMEOUT: {
        code: 'VERIFICATION_TIMEOUT',
        category: 'success_pending',
        title: 'Verification In Progress',
        message: 'Your payment is being verified.',
        description: 'Payment received! Verification is taking longer than usual. Check your order status.',
        primaryAction: 'view_order',
        icon: 'info',
        autoCloseSeconds: 5,
    },
    VERIFICATION_NETWORK_ERROR: {
        code: 'VERIFICATION_NETWORK_ERROR',
        category: 'success_pending',
        title: 'Verification Pending',
        message: 'Payment received. Verification pending.',
        description: 'Your payment was successful but we couldn\'t verify it immediately. Check your order status.',
        primaryAction: 'view_order',
        icon: 'info',
        autoCloseSeconds: 5,
    },
    AWAITING_CONFIRMATION: {
        code: 'AWAITING_CONFIRMATION',
        category: 'success_pending',
        title: 'Confirming Payment',
        message: 'Your payment is being confirmed...',
        description: 'We received your payment and are waiting for confirmation from our payment provider. This usually takes a few seconds.',
        primaryAction: 'wait',
        icon: 'info',
    },

    // Generic
    UNKNOWN_ERROR: {
        code: 'UNKNOWN_ERROR',
        category: 'system',
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred.',
        description: 'Please try again. If the issue persists, contact our support team.',
        primaryAction: 'retry',
        showSupport: true,
        icon: 'error',
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get error configuration from error code
 */
export function getPaymentError(code: PaymentErrorCode | string): PaymentErrorConfig {
    return PAYMENT_ERROR_CONFIG[code as PaymentErrorCode] || PAYMENT_ERROR_CONFIG.UNKNOWN_ERROR;
}

/**
 * Map HTTP status code to error code
 */
export function mapHttpStatusToErrorCode(status: number, errorCode?: string): PaymentErrorCode {
    // Check for specific backend error codes first
    if (errorCode) {
        const mappedCode = mapBackendErrorCode(errorCode);
        if (mappedCode) return mappedCode;
    }

    switch (status) {
        case 401:
            return 'SESSION_EXPIRED';
        case 404:
            return 'ORDER_NOT_FOUND';
        case 400:
            return 'BAD_REQUEST';
        case 408:
        case 504:
            return 'TIMEOUT';
        case 500:
        case 502:
        case 503:
            return 'SERVER_ERROR';
        default:
            return 'UNKNOWN_ERROR';
    }
}

/**
 * Map backend error codes to frontend error codes
 */
export function mapBackendErrorCode(code: string): PaymentErrorCode | null {
    const mapping: Record<string, PaymentErrorCode> = {
        'ORDER_NOT_FOUND': 'ORDER_NOT_FOUND',
        'ORDER_ALREADY_PAID': 'ORDER_ALREADY_PAID',
        'ORDER_CANCELLED': 'ORDER_CANCELLED',
        'ORDER_EXPIRED': 'ORDER_EXPIRED',
        'MAX_RETRIES_EXCEEDED': 'MAX_RETRIES_EXCEEDED',
        'INVALID_SIGNATURE': 'INVALID_SIGNATURE',
        'PAYMENT_NOT_FOUND': 'ORDER_NOT_FOUND',
    };
    return mapping[code] || null;
}

/**
 * Categorize Razorpay error response
 */
export function categorizeRazorpayError(error: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
}): PaymentErrorCode {
    const { code, reason, source } = error;

    // Bank/Card related errors
    if (source === 'bank' || reason?.includes('bank')) {
        return 'PAYMENT_FAILED';
    }

    // Gateway errors
    if (source === 'gateway' || code?.includes('GATEWAY')) {
        return 'GATEWAY_ERROR';
    }

    // Timeout errors
    if (code?.includes('TIMEOUT') || reason?.includes('timeout')) {
        return 'TIMEOUT';
    }

    // Network errors
    if (code?.includes('NETWORK') || reason?.includes('network')) {
        return 'NETWORK_ERROR';
    }

    // Specific Razorpay error codes
    switch (code) {
        case 'BAD_REQUEST_ERROR':
            return 'BAD_REQUEST';
        case 'GATEWAY_ERROR':
            return 'GATEWAY_ERROR';
        case 'SERVER_ERROR':
            return 'SERVER_ERROR';
        default:
            return 'PAYMENT_FAILED';
    }
}

/**
 * Check if error is recoverable with retry
 */
export function isRetryableError(code: PaymentErrorCode): boolean {
    const retryable: PaymentErrorCode[] = [
        'SDK_NOT_LOADED',
        'NETWORK_ERROR',
        'SERVER_ERROR',
        'GATEWAY_ERROR',
        'TIMEOUT',
        'PAYMENT_CANCELLED',
        'PAYMENT_FAILED',
        'BAD_REQUEST',
    ];
    return retryable.includes(code);
}

/**
 * Check if error indicates pending success (payment went through)
 */
export function isPendingSuccessError(code: PaymentErrorCode): boolean {
    return code === 'VERIFICATION_TIMEOUT' || code === 'VERIFICATION_NETWORK_ERROR';
}

/**
 * Get action button label for a recovery action
 */
export function getActionLabel(action: RecoveryAction): string {
    const labels: Record<RecoveryAction, string> = {
        retry: 'Try Again',
        different_method: 'Try Different Method',
        login: 'Log In',
        contact_support: 'Contact Support',
        view_order: 'View Order',
        go_to_cart: 'Go to Cart',
        go_to_orders: 'View My Orders',
        refresh: 'Refresh Page',
        wait: 'Please Wait',
    };
    return labels[action];
}
