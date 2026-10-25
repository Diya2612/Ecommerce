"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/contexts/CheckoutContext";
import { toast } from "sonner";

/**
 * Helper to check if payment is in progress via sessionStorage
 * This is checked synchronously to prevent race conditions
 */
function isPaymentInProgressFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    sessionStorage.getItem("payment_in_progress") ||
    sessionStorage.getItem("pending_order_id") ||
    sessionStorage.getItem("payment_completed") ||
    sessionStorage.getItem("last_order_id")
  );
}

/**
 * CheckoutGuard - Prevents access to checkout with empty cart
 * Wraps content to ensure it's not visible until checks pass
 */
export function CheckoutGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartItems, isLoading, isPending, isFetching } = useCart();
  const { isPaymentProcessing } = useCheckout();
  const hasRedirected = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // CRITICAL: Check sessionStorage FIRST - this must happen before any state-based checks
    if (isPaymentInProgressFromStorage()) {
      setIsVerified(true);
      return;
    }

    // CRITICAL: Never redirect from success page
    if (pathname?.includes("/checkout/success")) {
      setIsVerified(true);
      return;
    }

    // Check URL params
    const verifiedParam = searchParams?.get("verified");
    const orderIdParam = searchParams?.get("orderId");

    if (verifiedParam === "1" || orderIdParam) {
      setIsVerified(true);
      return;
    }

    // Check React state (payment in progress)
    if (isPaymentProcessing) {
      setIsVerified(true);
      return;
    }

    // If cart has items, immediately verify!
    if (cartItems.length > 0) {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      setIsVerified(true);
      return;
    }

    // Wait for any ongoing loading/fetching to complete before verifying emptiness
    const isBusy = isLoading || isPending || isFetching;
    if (!isBusy) {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Schedule a delayed check (1200ms) to ensure guest/user cart resolution is settled
      checkTimeoutRef.current = setTimeout(() => {
        if (isPaymentInProgressFromStorage() || pathname?.includes("/checkout/success") || hasRedirected.current) {
          setIsVerified(true);
          return;
        }

        // Re-check cart items
        if (cartItems.length === 0) {
          hasRedirected.current = true;
          toast.error("Your cart is empty. Please add products first.");
          router.replace("/collections");
        } else {
          setIsVerified(true);
        }
      }, 1200);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [
    isLoading,
    isPending,
    isFetching,
    cartItems,
    router,
    pathname,
    searchParams,
    isPaymentProcessing,
  ]);

  if (!isVerified) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#0B1F51] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Verifying your cart...</p>
      </div>
    );
  }

  return <>{children}</>;
}
