/**
 * Cart Types (Query Layer)
 */

export type {
    CartResponse,
    CartItemResponse,
    AddToCartData,
    UpdateCartItemData,
    CartItem,
    AppliedDiscountInfo,
} from '@/types/cart';

/**
 * Cart merge response
 */
export interface MergeCartResponse {
    merged: boolean;
    itemsMerged: number;
}

/**
 * Apply discount response (same as cart)
 */
export type ApplyDiscountResponse = import('@/types/cart').CartResponse;
