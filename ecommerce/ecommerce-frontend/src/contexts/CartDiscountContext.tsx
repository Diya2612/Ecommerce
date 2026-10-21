"use client";

/**
 * CartDiscountContext - Isolated discount state context
 * 
 * This context is separated from CartContext to prevent Header 
 * (which only uses cart items count) from re-rendering when 
 * discounts are applied/removed.
 */

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { applyDiscount as applyDiscountFn, removeDiscount as removeDiscountFn, getCart } from '@/queries';
import { toast } from 'sonner';
import type { AppliedDiscountInfo } from '@/types/cart';
import { setDiscountStateCallback } from '@/hooks/cart/useCartSession';

// ============================================================================
// Types
// ============================================================================

interface CartDiscountContextType {
    // Discount state
    discountTotal: number;
    appliedDiscountCodes: string[];
    appliedDiscounts: AppliedDiscountInfo[];
    isApplyingDiscount: boolean;

    // Discount actions
    applyDiscount: (code: string) => Promise<{ success: boolean; message?: string }>;
    removeDiscount: (code?: string) => Promise<void>;
    refreshDiscountState: () => Promise<void>;

    // For CartContext to update discount state when fetching cart
    setDiscountState: (discountTotal: number, codes: string[], discounts: AppliedDiscountInfo[]) => void;
}

// ============================================================================
// Context
// ============================================================================

const CartDiscountContext = createContext<CartDiscountContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function CartDiscountProvider({ children }: { children: ReactNode }) {
    const [discountTotal, setDiscountTotal] = useState(0);
    const [appliedDiscountCodes, setAppliedDiscountCodes] = useState<string[]>([]);
    const [appliedDiscounts, setAppliedDiscounts] = useState<AppliedDiscountInfo[]>([]);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    // Set discount state (called by CartContext after fetching cart)
    const setDiscountState = useCallback((total: number, codes: string[], discounts: AppliedDiscountInfo[]) => {
        setDiscountTotal(total);
        setAppliedDiscountCodes(codes);
        setAppliedDiscounts(discounts);
    }, []);

    // Register callback with CartContext so it can update discount state when fetching cart
    useEffect(() => {
        setDiscountStateCallback(setDiscountState);
    }, [setDiscountState]);

    // Refresh discount state from cart
    const refreshDiscountState = useCallback(async () => {
        try {
            const data = await getCart();
            setDiscountTotal(parseFloat(data?.discount_total || '0'));
            setAppliedDiscountCodes(data?.applied_discount_codes || []);
            setAppliedDiscounts(data?.applied_discounts || []);
        } catch (error) {
            console.error('[CartDiscountContext] Failed to refresh discount state:', error);
        }
    }, []);

    // Apply discount code
    const applyDiscount = useCallback(async (code: string): Promise<{ success: boolean; message?: string }> => {
        if (!code.trim()) {
            return { success: false, message: 'Please enter a discount code' };
        }

        setIsApplyingDiscount(true);
        try {
            const result = await applyDiscountFn(code.trim().toUpperCase());

            // Update discount state from response
            setDiscountTotal(parseFloat(result?.discount_total || '0'));
            setAppliedDiscountCodes(result?.applied_discount_codes || []);
            setAppliedDiscounts(result?.applied_discounts || []);

            // IMPORTANT: Refresh cart to get updated state from backend
            try {
                await getCart();
            } catch {
                // Silent fail
            }

            return { success: true, message: 'Discount applied!' };
        } catch (error: any) {
            console.error('[CartDiscountContext] Apply discount error:', error);
            // Extract message from various error formats
            let message = 'Failed to apply discount';
            if (typeof error === 'string') {
                message = error;
            } else if (error?.message && typeof error.message === 'string') {
                message = error.message;
            } else if (error?.data?.message) {
                message = error.data.message;
            }

            return { success: false, message };
        } finally {
            setIsApplyingDiscount(false);
        }
    }, []);

    // Remove discount code
    const removeDiscount = useCallback(async (code?: string): Promise<void> => {
        try {
            const result = await removeDiscountFn(code);
            setDiscountTotal(parseFloat(result?.discount_total || '0'));
            setAppliedDiscountCodes(result?.applied_discount_codes || []);
            setAppliedDiscounts(result?.applied_discounts || []);
        } catch (error: any) {
            console.error('[CartDiscountContext] Remove discount error:', error);
            toast.error('Failed to remove discount');
        }
    }, []);

    return (
        <CartDiscountContext.Provider
            value={{
                discountTotal,
                appliedDiscountCodes,
                appliedDiscounts,
                isApplyingDiscount,
                applyDiscount,
                removeDiscount,
                refreshDiscountState,
                setDiscountState,
            }}
        >
            {children}
        </CartDiscountContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useCartDiscount() {
    const context = useContext(CartDiscountContext);
    if (context === undefined) {
        throw new Error('useCartDiscount must be used within a CartDiscountProvider');
    }
    return context;
}
