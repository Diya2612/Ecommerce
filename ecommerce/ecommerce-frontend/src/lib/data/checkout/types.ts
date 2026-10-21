// ============================================================================
// Checkout Data Types
// ============================================================================

/**
 * User shipping address
 */
export interface Address {
    id: number;
    type: 'Home' | 'Office';
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

/**
 * Upsell product for checkout page
 */
export interface UpsellProduct {
    id: string | number;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    image: string;
    tag?: string;
}

/**
 * Order calculation result
 */
export interface OrderCalculation {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
}

/**
 * Promo code validation result
 */
export interface PromoCodeResult {
    isValid: boolean;
    discount: number;
    code: string;
    message?: string;
}
