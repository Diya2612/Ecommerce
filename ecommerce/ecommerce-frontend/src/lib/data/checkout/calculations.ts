import type { OrderCalculation } from './types';

/**
 * Calculate shipping cost based on cart items and location
 */
export function calculateShipping(subtotal: number, pincode?: string): number {
    // Free shipping for orders above ₹10,000
    if (subtotal >= 10000) {
        return 0;
    }

    // TODO: Implement pincode-based shipping calculation
    // For now, flat rate
    return 500;
}

/**
 * Calculate tax (GST) based on subtotal
 */
export function calculateTax(subtotal: number, state?: string): number {
    // Standard GST rate of 18%
    const GST_RATE = 0.18;

    // TODO: Implement state-specific tax rates if needed
    return Math.round(subtotal * GST_RATE);
}

/**
 * Calculate complete order totals
 */
export function calculateOrderTotals(
    subtotal: number,
    discount: number = 0,
    pincode?: string,
    state?: string
): OrderCalculation {
    const shipping = calculateShipping(subtotal, pincode);
    const taxableAmount = subtotal - discount;
    const tax = calculateTax(taxableAmount, state);
    const total = subtotal + shipping + tax - discount;

    return {
        subtotal,
        shipping,
        tax,
        discount,
        total: Math.max(0, total) // Ensure total is never negative
    };
}

/**
 * Validate and calculate promo code discount
 */
export function validatePromoCode(code: string, subtotal: number): {
    isValid: boolean;
    discount: number;
    message?: string;
} {
    // TODO: Replace with actual API call for promo code validation
    const validPromoCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
        'SAVE10': { type: 'percentage', value: 10 },
        'SAVE500': { type: 'fixed', value: 500 },
        'WELCOME': { type: 'percentage', value: 15 },
    };

    const upperCode = code.toUpperCase().trim();
    const promo = validPromoCodes[upperCode];

    if (!promo) {
        return {
            isValid: false,
            discount: 0,
            message: 'Invalid promo code'
        };
    }

    const discount = promo.type === 'percentage'
        ? Math.round(subtotal * (promo.value / 100))
        : promo.value;

    return {
        isValid: true,
        discount,
        message: `${promo.type === 'percentage' ? promo.value + '%' : '₹' + promo.value} discount applied!`
    };
}
