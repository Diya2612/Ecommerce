"use client";

/**
 * useCartWithDiscount - Combined hook for components needing both cart and discount state
 * 
 * Use this in checkout components that need access to both cart items and discount state.
 * Header should continue using just useCart() to avoid re-renders on discount changes.
 */

import { useCart } from '@/hooks/useCart';
import { useCartDiscount } from '@/contexts/CartDiscountContext';

export function useCartWithDiscount() {
    const cart = useCart();
    const discount = useCartDiscount();

    // Combined grand total calculation
    const getGrandTotal = () => {
        return cart.getTotalPrice() - discount.discountTotal;
    };

    return {
        // Cart state
        cartItems: cart.cartItems,
        isLoading: cart.isLoading,


        // Cart actions
        addToCart: cart.addToCart,
        removeFromCart: cart.removeFromCart,
        updateQuantity: cart.updateQuantity,
        clearCart: cart.clearCart,
        getTotalItems: cart.getTotalItems,
        getTotalPrice: cart.getTotalPrice,
        refreshCart: cart.refreshCart,

        // Discount state
        discountTotal: discount.discountTotal,
        appliedDiscountCodes: discount.appliedDiscountCodes,
        appliedDiscounts: discount.appliedDiscounts,
        isApplyingDiscount: discount.isApplyingDiscount,

        // Discount actions
        applyDiscount: discount.applyDiscount,
        removeDiscount: discount.removeDiscount,

        // Combined
        getGrandTotal,
    };
}
