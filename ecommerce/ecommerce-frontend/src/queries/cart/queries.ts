/**
 * Cart Query Functions
 *
 * Pure async functions for cart operations.
 * Note: Cart uses client-side state (React Query), not ISR.
 */

import { api } from '@/api';
import { generateUUID } from '@/utils/utils';
import type {
    CartResponse,
    AddToCartData,
    UpdateCartItemData,
    MergeCartResponse,
    ApplyDiscountResponse,
} from './types';

// ============================================================================
// Session ID Management
// ============================================================================

const CART_SESSION_KEY = 'cart_session_id';

/**
 * Get or create cart session ID for guest users
 */
export function getCartSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem(CART_SESSION_KEY);
    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(CART_SESSION_KEY, sessionId);
    }
    return sessionId;
}

/**
 * Clear cart session ID (on logout, etc.)
 */
export function clearCartSessionId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_SESSION_KEY);
}

// ============================================================================
// Cart Queries
// ============================================================================

/**
 * Get current cart
 */
export async function getCart(): Promise<CartResponse> {
    const sessionId = getCartSessionId();

    return api<CartResponse>('/cart', {
        sessionId,
    });
}

// ============================================================================
// Cart Mutations
// ============================================================================

/**
 * Add item to cart
 */
export async function addToCart(data: AddToCartData): Promise<CartResponse> {
    const sessionId = getCartSessionId();

    return api<CartResponse>('/cart/items', {
        method: 'POST',
        body: {
            product_id: data.productId,
            quantity: data.quantity,
            bundle_id: data.bundleId,
            variant_id: data.variantId,
        },
        sessionId,
    });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
    itemId: string,
    data: UpdateCartItemData
): Promise<CartResponse> {
    const sessionId = getCartSessionId();

    return api<CartResponse>(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: data,
        sessionId,
    });
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<CartResponse> {
    const sessionId = getCartSessionId();

    return api<CartResponse>(`/cart/items/${itemId}`, {
        method: 'DELETE',
        sessionId,
    });
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<CartResponse> {
    const sessionId = getCartSessionId();

    return api<CartResponse>('/cart', {
        method: 'DELETE',
        sessionId,
    });
}

/**
 * Merge guest cart with user cart (after login)
 */
export async function mergeCart(): Promise<MergeCartResponse> {
    const sessionId = getCartSessionId();
    if (!sessionId) return { merged: false, itemsMerged: 0 };

    try {
        return await api<MergeCartResponse>('/cart/merge', {
            method: 'POST',
            body: { session_id: sessionId },
            auth: true,
        });
    } catch {
        return { merged: false, itemsMerged: 0 };
    }
}

// ============================================================================
// Discount Operations
// ============================================================================

/**
 * Apply discount code to cart
 */
export async function applyDiscount(code: string): Promise<ApplyDiscountResponse> {
    const sessionId = getCartSessionId();

    return api<ApplyDiscountResponse>('/cart/discount', {
        method: 'POST',
        body: { code },
        sessionId,
    });
}

/**
 * Remove discount from cart
 */
export async function removeDiscount(code?: string): Promise<CartResponse> {
    const sessionId = getCartSessionId();
    const endpoint = code ? `/cart/discount/${encodeURIComponent(code)}` : '/cart/discount';

    return api<CartResponse>(endpoint, {
        method: 'DELETE',
        sessionId,
    });
}
