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
  const { cartItems, isLoading } = useCart();
  const { isPaymentProcessing } = useCheckout();
  const hasRedirected = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // CRITICAL: Check sessionStorage FIRST - this must happen before any state-based checks
    // sessionStorage is set synchronously, while React state updates are async
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

    // Check React state (async, may have race condition)
    if (isPaymentProcessing) {

      setIsVerified(true);
      return;
    }

    // Wait for loading to complete before checking cart
    if (!isLoading) {
      // Clear any existing timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Schedule a delayed check with multiple fallbacks
      checkTimeoutRef.current = setTimeout(() => {
        // Re-check EVERYTHING inside the timeout

        // 1. SessionStorage check (most reliable)
        if (isPaymentInProgressFromStorage()) {

          setIsVerified(true);
          return;
        }

        // 2. Pathname check
        if (pathname?.includes("/checkout/success")) {
          setIsVerified(true);
          return;
        }

        // 3. Already redirected check
        if (hasRedirected.current) {
          return;
        }

        // 4. Check for out-of-stock items
        // Note: If items are in cart, they're already reserved, so don't block
        // The backend will validate during order creation if stock changed
        const hasStockIssues = false; // Trust that cart items are valid

        if (hasStockIssues) {
          hasRedirected.current = true;

          toast.error(
            "Some items in your cart are no longer available. Please remove them from your cart.",
            { duration: 5000 }
          );
          router.replace("/collections");
          return;
        }

        // 5. Finally, check if cart is empty
        if (cartItems.length === 0) {
          hasRedirected.current = true;

          toast.error("Your cart is empty. Please add products first.");
          router.replace("/collections");
        } else {
          // If we pass all checks, show content
          setIsVerified(true);
        }
      }, 100); // Reduced to 100ms for faster response
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [
    isLoading,
    cartItems,
    router,
    pathname,
    searchParams,
    isPaymentProcessing,
  ]);

  if (!isVerified) {
    return null; // Or return a loader/skeleton here
  }

  return <>{children}</>;
}
