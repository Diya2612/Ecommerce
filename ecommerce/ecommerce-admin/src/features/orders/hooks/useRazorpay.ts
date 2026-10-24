import { useState, useCallback, useRef } from "react";
import { notifySuccess, notifyError, notifyInfo } from "@/utils/toast";
import {
    useCreatePaymentOrderMutation,
    useVerifyPaymentMutation,
} from "./useOrdersApi";
import {
    type PaymentErrorCode,
    categorizeRazorpayError,
} from "@/lib/constants/payment-errors";
import {
    loadRazorpaySDK,
    createPaymentLogger,
    generateCorrelationId,
    resetPaymentSessionId,
} from "@/lib/utils/payment-utils";

const logger = createPaymentLogger('useRazorpay');

// ============================================================================
// Types
// ============================================================================

declare global {
    interface Window {
        Razorpay: any;
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
    close: () => void;
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
    initiatePayment: (orderId: string, currentAmount?: number) => Promise<void>;
    error: string | null;
    errorCode: PaymentErrorCode | null;
    reset: () => void;
    showErrorModal: boolean;
    closeErrorModal: () => void;
}

// ============================================================================
// Hook
// ============================================================================

interface UseRazorpayOptions {
    onSuccess?: () => void;
}

export function useRazorpay(options?: UseRazorpayOptions): UseRazorpayReturn {

    // State
    const [status, setStatus] = useState<PaymentStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<PaymentErrorCode | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

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
        isProcessingRef.current = false;
        activeOrderIdRef.current = null;
        if (razorpayInstanceRef.current) {
            try { razorpayInstanceRef.current.close?.(); } catch (e) { }
            razorpayInstanceRef.current = null;
        }
    }, []);

    // --------------------------------------------------------------------------
    // Error Handling Helper
    // --------------------------------------------------------------------------
    const handlePaymentError = useCallback((err: any, context: string) => {
        const errorMsg = err?.message || 'Payment operation failed';
        const code = categorizeRazorpayError(err);
        const description = err?.description || '';

        logger.error(`Error in ${context}`, { error: err, code });

        setError(description || errorMsg);
        setErrorCode(code);
        setStatus("failed");
        setShowErrorModal(true);
        isProcessingRef.current = false;

        notifyError(errorMsg); // Show toast as well
    }, []);


    // --------------------------------------------------------------------------
    // Verify Payment (Step 3)
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // Verify Payment (Step 3)
    // --------------------------------------------------------------------------
    const handlePaymentSuccess = useCallback(async (
        response: RazorpaySuccessResponse
    ) => {
        setStatus("verifying");

        try {
            await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });

            setStatus("success");
            notifySuccess("Payment successful!");
            isProcessingRef.current = false;

            // Trigger onSuccess callback if provided
            if (options?.onSuccess) {
                options.onSuccess();
            }

        } catch (err: any) {
            handlePaymentError(err, 'Verification');
        }
    }, [verifyPaymentMutation, handlePaymentError, options]);


    // --------------------------------------------------------------------------
    // Start Razorpay Flow (Step 2)
    // --------------------------------------------------------------------------
    const startRazorpayFlow = useCallback(async (
        paymentData: any // CreatePaymentOrderResponse
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
            if (!isLoaded.loaded) {
                throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
            }

            const razorpayKey = paymentData.razorpay_key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                throw new Error("Payment configuration missing. Please contact support.");
            }

            setStatus("awaiting_payment");

            // 2. Options
            const options: RazorpayOptions = {
                key: razorpayKey,
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
                            notifyInfo("Payment cancelled");
                        }
                    },
                    escape: false,
                },
                handler: (response) => {
                    handlePaymentSuccess(response);
                },
            };

            // 3. Open
            const rzp = new window.Razorpay(options);
            razorpayInstanceRef.current = rzp;

            rzp.on("payment.failed", (response: RazorpayErrorResponse) => {
                const errorData = response.error;
                logger.error('Razorpay payment.failed event', errorData);

                if (errorData.description === 'Please use another method') {
                    setErrorCode("PAYMENT_FAILED");
                    setError("Payment method declined by bank.");
                    notifyError("Payment method declined. Please try another.");
                } else {
                    setErrorCode("PAYMENT_FAILED");
                    setError(errorData.description);
                    notifyError(errorData.description);
                }
            });

            rzp.open();

        } catch (err) {
            handlePaymentError(err, 'SDK Launch');
        }
    }, [status, handlePaymentError, handlePaymentSuccess]);


    // --------------------------------------------------------------------------
    // Initiate Payment (Entry Point)
    // --------------------------------------------------------------------------
    const initiatePayment = useCallback(async (orderId: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        resetPaymentSessionId();

        setStatus("creating_order");
        activeOrderIdRef.current = orderId;

        try {
            const data = await createPaymentOrderMutation.mutateAsync({
                orderId,
                paymentMethod: 'razorpay'
            });

            await startRazorpayFlow(data);

        } catch (err: any) {
            handlePaymentError(err, 'Initiate Payment');
        }
    }, [createPaymentOrderMutation, startRazorpayFlow, handlePaymentError]);


    return {
        status,
        initiatePayment,
        error,
        errorCode,
        reset,
        showErrorModal,
        closeErrorModal: () => setShowErrorModal(false),
    };
}
