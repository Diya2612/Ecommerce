/**
 * Stock Availability Utility Functions
 * 
 * Utilities for determining stock status, generating user-friendly messages,
 * and styling stock badges across the application.
 */

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockInfo {
    available: number;
    reserved: number;
    status: StockStatus;
    maxOrderQuantity: number;
}

export interface AvailableStockResponse {
    productId: string;
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    inStock: boolean;
}

/**
 * Fetch real-time available stock for a product from the backend
 */
export async function fetchAvailableStock(productId: string): Promise<AvailableStockResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/product/${productId}/available`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch available stock');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Determine stock status based on available quantity
 */
export function getStockStatus(available: number): StockStatus {
    if (available === 0) return 'out_of_stock';
    if (available <= 10) return 'low_stock';
    return 'in_stock';
}

/**
 * Get Tailwind CSS classes for stock badge based on status
 */
export function getStockBadgeColor(status: StockStatus) {
    const colors = {
        in_stock: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        low_stock: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        out_of_stock: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    };

    return colors[status];
}

/**
 * Get user-friendly stock message
 */
export function getStockMessage(available: number): string {
    if (available === 0) return 'Out of Stock';
    if (available <= 5) return `Only ${available} left!`;
    if (available <= 10) return `${available} in stock`;
    return 'In Stock';
}

/**
 * Get icon indicator for stock status  */
export function getStockIcon(status: StockStatus): '●' | '◐' | '○' {
    const icons = {
        in_stock: '●' as const,
        low_stock: '◐' as const,
        out_of_stock: '○' as const,
    };

    return icons[status];
}

/**
 * Calculate actual available quantity (available - reserved)
 */
export function getActualAvailable(available: number, reserved: number = 0): number {
    return Math.max(0, available - reserved);
}

/**
 * Check if product can be added to cart
 */
export function canAddToCart(available: number, reserved: number = 0): boolean {
    return getActualAvailable(available, reserved) > 0;
}

/**
 * Get maximum quantity that can be ordered
 */
export function getMaxOrderQuantity(available: number, reserved: number = 0, maxPerOrder: number = 100): number {
    const actualAvailable = getActualAvailable(available, reserved);
    return Math.min(actualAvailable, maxPerOrder);
}

/**
 * Format stock error message for API errors
 */
export function parseStockErrorMessage(errorMessage: string): {
    productName?: string;
    availableQuantity?: number;
    requestedQuantity?: number;
} {
    // Example: "Insufficient stock: Product 'Widget' only has 5 units available"
    const productMatch = errorMessage.match(/Product '([^']+)'/);
    const quantityMatch = errorMessage.match(/(\d+)\s+units?\s+available/i);

    return {
        productName: productMatch?.[1],
        availableQuantity: quantityMatch ? parseInt(quantityMatch[1], 10) : undefined,
    };
}
