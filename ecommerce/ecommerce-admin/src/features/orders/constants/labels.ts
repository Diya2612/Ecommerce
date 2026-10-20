/**
 * Order Display Labels and Styling
 * Constants and functions for order status display
 */

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

/**
 * Get human readable description for order status
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded',
        'returned': 'Returned'
    };
    return labels[status?.toLowerCase()] || status;
}

/**
 * Get human readable description for payment status
 */
export function getPaymentLabel(status: string): string {
    const labels: Record<string, string> = {
        'pending': 'Pending',
        'paid': 'Paid',
        'refunded': 'Refunded',
        'failed': 'Failed',
        'partially_refunded': 'Partially Refunded'
    };
    return labels[status?.toLowerCase()] || status;
}

/**
 * Get human readable description for fulfillment status
 */
export function getFulfillmentLabel(status: string): string {
    const labels: Record<string, string> = {
        'unfulfilled': 'Unfulfilled',
        'partial': 'Partial',
        'fulfilled': 'Fulfilled',
        'returned': 'Returned',
        'cancelled': 'Cancelled'
    };
    return labels[status?.toLowerCase()] || status;
}

/**
 * Get color/variant for order status badge
 */
export function getStatusColor(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'confirmed': return 'info';
        case 'processing': return 'info';
        case 'shipped': return 'secondary';
        case 'delivered': return 'success';
        case 'cancelled': return 'destructive';
        case 'refunded': return 'outline';
        case 'returned': return 'warning';
        default: return 'default';
    }
}

/**
 * Get color/variant for payment status badge
 */
export function getPaymentColor(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'paid': return 'success';
        case 'refunded': return 'destructive';
        case 'failed': return 'destructive';
        case 'partially_refunded': return 'warning';
        default: return 'default';
    }
}

/**
 * Get color/variant for fulfillment status badge
 */
export function getFulfillmentColor(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
        case 'unfulfilled': return 'warning';
        case 'partial': return 'info';
        case 'fulfilled': return 'success';
        case 'returned': return 'destructive';
        case 'cancelled': return 'destructive';
        default: return 'default';
    }
}

/**
 * Get icon name for order status
 */
export function getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        'pending': 'clock',
        'confirmed': 'check-circle',
        'processing': 'package',
        'shipped': 'truck',
        'delivered': 'check-circle-2',
        'cancelled': 'x-circle',
        'refunded': 'rotate-ccw',
        'returned': 'undo-2'
    };
    return icons[status?.toLowerCase()] || 'circle';
}