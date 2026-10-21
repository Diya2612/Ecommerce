import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRawCartQuery, useMergeCartMutation } from '@/hooks/useCart';

// Constants
const MERGE_STATUS_KEY = 'cart_merge_status';
const MERGE_TIMESTAMP_KEY = 'cart_merge_timestamp';
const MERGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helpers
function wasMergeAlreadyDone(): boolean {
    if (typeof window === 'undefined') return false;
    const status = sessionStorage.getItem(MERGE_STATUS_KEY);
    const timestamp = sessionStorage.getItem(MERGE_TIMESTAMP_KEY);
    if (status !== 'done' || !timestamp) return false;
    const mergeTime = parseInt(timestamp, 10);
    if (Date.now() - mergeTime > MERGE_EXPIRY_MS) {
        sessionStorage.removeItem(MERGE_STATUS_KEY);
        sessionStorage.removeItem(MERGE_TIMESTAMP_KEY);
        return false;
    }
    return true;
}

function markMergeAsDone(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(MERGE_STATUS_KEY, 'done');
    sessionStorage.setItem(MERGE_TIMESTAMP_KEY, Date.now().toString());
}

function clearMergeStatus(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(MERGE_STATUS_KEY);
    sessionStorage.removeItem(MERGE_TIMESTAMP_KEY);
}

function isPaymentInProgress(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
        sessionStorage.getItem('payment_in_progress') ||
        sessionStorage.getItem('payment_completed') ||
        sessionStorage.getItem('last_order_id')
    );
}

// Callback for legacy Discount Context sync
// We export this setter so CartDiscountContext can register itself
let discountStateCallback: ((total: number, codes: string[], discounts: any[]) => void) | null = null;
export function setDiscountStateCallback(callback: (total: number, codes: string[], discounts: any[]) => void) {
    discountStateCallback = callback;
}

export function useCartSession() {
    const { user } = useAuth();
    const previousUserIdRef = useRef<string | null>(null);
    const { data: cartData, refetch } = useRawCartQuery();
    const mergeMutation = useMergeCartMutation();

    // Sync Discount Context (Legacy Support)
    useEffect(() => {
        if (cartData && discountStateCallback) {
            discountStateCallback(
                parseFloat(cartData.discount_total || '0'),
                cartData.applied_discount_codes || [],
                cartData.applied_discounts || []
            );
        }
    }, [cartData]);

    // Automatic Merge Logic
    useEffect(() => {
        const currentUserId = user?.id || null;

        // Logout: Clear merge status and refetch (to get guest cart)
        if (!currentUserId && previousUserIdRef.current) {
            clearMergeStatus();
            previousUserIdRef.current = null;
            refetch();
            return;
        }

        // Login: Check for unmerged cart and refetch
        if (currentUserId && previousUserIdRef.current !== currentUserId) {
            previousUserIdRef.current = currentUserId;
            refetch(); // Will fetch user cart
        }

        // Check backend flag for merge
        if (cartData?.hasUnmergedGuestCart && user && !wasMergeAlreadyDone() && !isPaymentInProgress()) {

            mergeMutation.mutateAsync().then(() => markMergeAsDone());
        }
    }, [user, cartData, refetch, mergeMutation]);

    return {
        isMerging: mergeMutation.isPending
    };
}
