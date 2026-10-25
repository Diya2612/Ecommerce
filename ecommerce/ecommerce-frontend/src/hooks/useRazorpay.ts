"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    useCreatePaymentOrderMutation,
    useVerifyPaymentMutation,
} from "@/hooks/queries/orders/useOrders";
import { retryPayment } from "@/queries"; // For Retry Logic
import {
    type PaymentErrorCode,
    mapHttpStatusToErrorCode,
    categorizeRazorpayError,
} from "@/lib/constants/payment-errors";
import {
    loadRazorpaySDK,
    createPaymentLogger,
    generateCorrelationId,
    resetPaymentSessionId,
    formatAmount,
} from "@/lib/utils/payment-utils";
import { useQueryClient } from "@tanstack/react-query";

const logger = createPaymentLogger('useRazorpay');

// ============================================================================
// Types
// ============================================================================

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
        image?: string;
    };
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        backdropclose?: boolean;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
    close: () => void; // Unofficial but often present
}

interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata?: {
            order_id?: string;
            payment_id?: string;
        };
    };
}

export type PaymentStatus =
    | "idle"
    | "loading_sdk"
    | "creating_order"
    | "awaiting_payment"
    | "verifying"
    | "awaiting_confirmation"
    | "success"
    | "failed"
    | "cancelled";

interface UseRazorpayReturn {
    status: PaymentStatus;
    initiatePayment: (orderId: string, isRetry?: boolean) => Promise<void>;
    processCodPayment: (orderId: string) => Promise<void>;
    error: string | null;
    errorCode: PaymentErrorCode | null;
    reset: () => void;
    showErrorModal: boolean;
    closeErrorModal: () => void;
    pendingAmount: number | null;
}

// ============================================================================
// Hook
// ============================================================================

export function useRazorpay(): UseRazorpayReturn {
    const router = useRouter();
    const queryClient = useQueryClient();

    // State
    const [status, setStatus] = useState<PaymentStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<PaymentErrorCode | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [pendingAmount, setPendingAmount] = useState<number | null>(null);

    // Refs for cleanup and tracking
    const activeOrderIdRef = useRef<string | null>(null);
    const razorpayInstanceRef = useRef<RazorpayInstance | null>(null);
    const isProcessingRef = useRef(false);

    // Mutations
    const createPaymentOrderMutation = useCreatePaymentOrderMutation();
    const verifyPaymentMutation = useVerifyPaymentMutation();

    const reset = useCallback(() => {
        setStatus("idle");
        setError(null);
        setErrorCode(null);
        setShowErrorModal(false);
        setPendingAmount(null);
        isProcessingRef.current = false;
        activeOrderIdRef.current = null;
        if (razorpayInstanceRef.current) {
            // Try to close if possible, though Razorpay API doesn't always expose clean close
            try { razorpayInstanceRef.current.close?.(); } catch (e) { }
            razorpayInstanceRef.current = null;
        }
    }, []);

    // --------------------------------------------------------------------------
    // Hard Redirect Helper (Success)
    // --------------------------------------------------------------------------
    const navigateToSuccess = useCallback((orderId: string) => {
        // Clear payment session flags
        sessionStorage.setItem('payment_completed', 'true');
        sessionStorage.removeItem('payment_in_progress');
        sessionStorage.removeItem('last_order_id');

        // Force hard redirect to clear React state completely
        window.location.replace(`/checkout/success?orderId=${orderId}`);
    }, []);


    // --------------------------------------------------------------------------
    // Error Handling Helper
    // --------------------------------------------------------------------------
    const handlePaymentError = useCallback((err: any, context: string, amount: number | null = null) => {
        const errorMsg = err?.message || 'Payment operation failed';
        const code = categorizeRazorpayError(err);

        logger.error(`Error in ${context}`, { error: err, code });

        setError(errorMsg);
        setErrorCode(code);
        setStatus("failed");

        if (amount) setPendingAmount(amount);
        setShowErrorModal(true);
        isProcessingRef.current = false;

        sessionStorage.removeItem('payment_in_progress');
    }, []);


    // --------------------------------------------------------------------------
    // Verify Payment (Step 3)
    // --------------------------------------------------------------------------
    const handlePaymentSuccess = useCallback(async (
        response: RazorpaySuccessResponse,
        orderId: string,
        amount: number
    ) => {
        setStatus("verifying");

        try {
            await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });

            setStatus("success");
            navigateToSuccess(orderId);

        } catch (err: any) {
            // Even if verification API fails (network), the payment might be successful on Razorpay.
            // We should ideally check standard webhooks. 
            // For user UX, if it's a network error on verify, we might still want to show success 
            // if we are confident, or show a "Check Status" Pending screen.
            // For now, adhering to strict failure handling as per previous logic.
            handlePaymentError(err, 'Verification', amount);
        }
    }, [verifyPaymentMutation, navigateToSuccess, handlePaymentError]);


    // --------------------------------------------------------------------------
    // Start Razorpay Flow (Step 2)
    // --------------------------------------------------------------------------
    const startRazorpayFlow = useCallback(async (
        paymentData: any, // CreatePaymentOrderResponse
        orderId: string
    ) => {
        const correlationId = generateCorrelationId();
        logger.info('Starting Razorpay SDK', {
            correlationId,
            amount: paymentData.amount,
            razorpayOrderId: paymentData.razorpay_order_id
        });

        setStatus("loading_sdk");

        try {
            // 1. Load SDK
            const isLoaded = await loadRazorpaySDK();
            if (!isLoaded || (typeof isLoaded === 'object' && 'loaded' in isLoaded && !(isLoaded as any).loaded)) {
                throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
            }

            setStatus("awaiting_payment");

            // 2. Options
            const options: RazorpayOptions = {
                key: paymentData.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                amount: Math.round(paymentData.amount), // Ensure integer (paise)
                currency: paymentData.currency,
                name: "Anant Enterprises",
                description: `Order #${paymentData.order_number}`,
                order_id: paymentData.razorpay_order_id,
                prefill: {
                    name: paymentData.prefill?.name,
                    email: paymentData.prefill?.email,
                    contact: paymentData.prefill?.contact,
                },
                theme: {
                    color: "#0F172A",
                },
                modal: {
                    ondismiss: () => {
                        if (status !== 'verifying' && status !== 'success') {
                            logger.warn('Razorpay modal dismissed by user');
                            setStatus("cancelled");
                            isProcessingRef.current = false;
                            sessionStorage.removeItem('payment_in_progress');
                            // Optional: invalid queries to refresh status
                        }
                    },
                    escape: false, // Prevent accidental close
                },
                handler: (response) => {
                    handlePaymentSuccess(response, orderId, paymentData.amount / 100);
                },
            };

            // 3. Open
            const rzp = new window.Razorpay(options);
            razorpayInstanceRef.current = rzp;

            rzp.on("payment.failed", (response: RazorpayErrorResponse) => {
                const errorData = response.error;
                logger.error('Razorpay payment.failed event', errorData);

                // Specific handling for "Please use another method" which often means declined
                if (errorData.description === 'Please use another method') {
                    setErrorCode("PAYMENT_FAILED");
                    setError("Payment method declined by bank. Please try a different card, UPI, or Netbanking.");
                } else {
                    setErrorCode("PAYMENT_FAILED"); // Generic map
                    setError(errorData.description);
                }
                // The ondismiss might trigger after this
            });

            rzp.open();

        } catch (err) {
            handlePaymentError(err, 'SDK Launch', paymentData.amount / 100);
        }
    }, [status, handlePaymentError, handlePaymentSuccess]);


    // --------------------------------------------------------------------------
    // Process COD
    // --------------------------------------------------------------------------
    const processCodPayment = useCallback(async (orderId: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        resetPaymentSessionId(); // New flow

        setStatus("creating_order");
        activeOrderIdRef.current = orderId;

        try {
            await createPaymentOrderMutation.mutateAsync({
                orderId,
                paymentMethod: 'cod'
            });

            setStatus("success");
            navigateToSuccess(orderId);

        } catch (err) {
            handlePaymentError(err, 'COD Processing');
        }
    }, [createPaymentOrderMutation, navigateToSuccess, handlePaymentError]);


    // --------------------------------------------------------------------------
    // Initiate Payment (Entry Point)
    // --------------------------------------------------------------------------
    const initiatePayment = useCallback(async (orderId: string, isRetry = false) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        resetPaymentSessionId();

        setStatus("creating_order");
        activeOrderIdRef.current = orderId;

        // Session storage for recovery
        sessionStorage.setItem('payment_in_progress', 'true');
        sessionStorage.setItem('last_order_id', orderId);

        try {
            // Determine if normal create or retry
            let data;
            if (isRetry) {
                // For retry, we assume we might need a specific endpoint or just create-order again
                // Using service directly for retry to keep mutation simple or using query
                data = await retryPayment(orderId);
            } else {
                data = await createPaymentOrderMutation.mutateAsync({
                    orderId,
                    paymentMethod: 'razorpay'
                });
            }

            await startRazorpayFlow(data, orderId);

        } catch (err: any) {
            handlePaymentError(err, 'Initiate Payment');
        }
    }, [createPaymentOrderMutation, startRazorpayFlow, handlePaymentError]);


    return {
        status,
        initiatePayment,
        processCodPayment,
        error,
        errorCode,
        reset,
        showErrorModal,
        closeErrorModal: () => setShowErrorModal(false),
        pendingAmount,
    };
}
