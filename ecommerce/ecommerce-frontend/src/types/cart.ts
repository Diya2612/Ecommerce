/**
 * Cart API Types
 * Matches backend `CartResponse` and `CartItemResponse` schemas.
 */

export interface CartItemResponse {
    id: string;
    product_id: string | null;
    bundle_id: string | null;
    quantity: number;
    cost_price: string;
    final_price: string;
    discount_amount: string;
    line_subtotal: string;
    line_total: string;
    product_name: string | null;
    product_slug: string | null;
    product_image_url: string | null;
    product_sku: string | null;

    // Phase 2: Reservation fields
    reservation_id: string | null;
    reservation_expires_at: string | null;

    // Computed fields
    inStock: boolean;
    availableStock: number;
    priceChanged: boolean;
    currentPrice: string | null;
}

// Discount metadata for type-based UI
export interface AppliedDiscountInfo {
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
    title: string;
    value: string | null;
    savings: string;
}

export interface CartResponse {
    id: string | null;
    currency: string;
    subtotal: string;
    discount_total: string;
    shipping_total: string;
    tax_total: string;
    grand_total: string;
    applied_discount_codes: string[];
    applied_giftcard_codes: string[];
    applied_discounts: AppliedDiscountInfo[]; // NEW: Discount metadata
    items: CartItemResponse[];
    itemCount: number;
    totalQuantity: number;
    hasStockIssues: boolean;
    hasPriceChanges: boolean;
    hasUnmergedGuestCart: boolean; // True if there's a guest cart that should be merged
}

export interface AddToCartData {
    productId: string;
    quantity: number;
    bundleId?: string;
    variantId?: string;
}

export interface UpdateCartItemData {
    quantity: number;
}

export interface CartItem {
    id: string;
    productId: string;
    slug?: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    variant?: string;
    bundleId?: string | null;
    maxStock?: number;

    // Phase 2: Reservation fields
    reservationId?: string;
    reservationExpiresAt?: string;  // ISO timestamp
    inStock?: boolean;
}
