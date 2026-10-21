"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { PaymentErrorModal } from '@/components/checkout/PaymentErrorModal';
import { PaymentProcessingOverlay } from '@/components/checkout/PaymentProcessingOverlay';
import type { PaymentStatus } from '@/types/order';

// ============================================================================
// OrderPaymentActions - Client Component
// ============================================================================
// Handles payment retry and displays payment status for an order

interface OrderPaymentActionsProps {
    orderId: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    totalAmount: string;
    /** Called when payment succeeds */
    onPaymentSuccess?: () => void;
}

export function OrderPaymentActions({
    orderId,
    orderNumber,
    paymentStatus,
    paymentMethod,
    totalAmount,
    onPaymentSuccess,
}: OrderPaymentActionsProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    const {
        status: razorpayStatus,
        error: paymentError,
        errorCode,
        showErrorModal,
        closeErrorModal,
        pendingAmount,
        initiatePayment,
        reset,
    } = useRazorpay();

    // Derived state
    const isProcessing = razorpayStatus !== 'idle' && razorpayStatus !== 'failed' && razorpayStatus !== 'cancelled' && razorpayStatus !== 'success';
    const isSDKReady = true; // SDK loaded on demand

    // Get payment status display config
    const getPaymentStatusConfig = (status: PaymentStatus) => {
        switch (status) {
            case 'paid':
                return {
                    icon: CheckCircle,
                    label: 'Paid',
                    color: 'text-[#22C55E]',
                    bgColor: 'bg-[#22C55E]/10',
                    description: 'Payment successful',
                };
            case 'pending':
                return {
                    icon: Clock,
                    label: 'Pending',
                    color: 'text-[#F59E0B]',
                    bgColor: 'bg-[#F59E0B]/10',
                    description: paymentMethod === 'cod' ? 'Pay on delivery' : 'Awaiting payment',
                };
            case 'failed':
                return {
                    icon: XCircle,
                    label: 'Failed',
                    color: 'text-[#EF4444]',
                    bgColor: 'bg-[#EF4444]/10',
                    description: 'Payment failed',
                };
            case 'authorized':
                return {
                    icon: Clock,
                    label: 'Authorized',
                    color: 'text-[#3B82F6]',
                    bgColor: 'bg-[#3B82F6]/10',
                    description: 'Payment authorized',
                };
            case 'refunded':
            case 'partially_refunded':
                return {
                    icon: RefreshCw,
                    label: status === 'refunded' ? 'Refunded' : 'Partially Refunded',
                    color: 'text-[#6B7280]',
                    bgColor: 'bg-gray-100',
                    description: 'Amount refunded to your account',
                };
            default:
                return {
                    icon: Clock,
                    label: status,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                    description: '',
                };
        }
    };

    const statusConfig = getPaymentStatusConfig(paymentStatus);
    const StatusIcon = statusConfig.icon;

    // Check if payment can be retried
    const canRetryPayment =
        (paymentStatus === 'pending' || paymentStatus === 'failed') &&
        paymentMethod === 'razorpay';

    // Check if payment can be initiated (for pending Razorpay orders)
    const canInitiatePayment =
        paymentStatus === 'pending' &&
        paymentMethod === 'razorpay';

    const handleRetryPayment = async () => {
        if (!canRetryPayment || isProcessing) return;

        setIsRetrying(true);
        reset();
        await initiatePayment(orderId, true); // true = isRetry
    };

    const handleInitiatePayment = async () => {
        if (!canInitiatePayment || isProcessing) return;

        setIsRetrying(true);
        reset();
        await initiatePayment(orderId, false);
    };

    // Get button text based on state
    const getRetryButtonContent = () => {
        if (razorpayStatus === 'creating_order') {
            return (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Preparing...
                </>
            );
        }
        if (razorpayStatus === 'awaiting_payment') {
            return (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Complete Payment...
                </>
            );
        }
        if (razorpayStatus === 'verifying') {
            return (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                </>
            );
        }

        if (paymentStatus === 'failed') {
            return (
                <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Payment
                </>
            );
        }

        return (
            <>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Payment
            </>
        );
    };

    const amountNumber = parseFloat(totalAmount);

    return (
        <>
            <div className="space-y-4">
                {/* Payment Status Badge */}
                {/* Payment Status Badge Removed (Redundant) */}

                {/* Status Description */}
{/*                 
                {statusConfig.description && (
                    <p className="text-xs text-gray-500">{statusConfig.description}</p>
                )} */}

                {/* Payment Error (inline, if no modal) */}
                {paymentError && !showErrorModal && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-300">{paymentError}</p>
                    </div>
                )}

                {/* Retry/Complete Payment Button */}
                {(canRetryPayment || canInitiatePayment) && (
                    <div className="pt-2">
                        {razorpayStatus === 'loading_sdk' && paymentMethod === 'razorpay' && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                                Loading payment gateway...
                            </p>
                        )}
                        <Button
                            onClick={paymentStatus === 'failed' ? handleRetryPayment : handleInitiatePayment}
                            disabled={isProcessing || !isSDKReady}
                            className="w-full bg-[#0B1F51] hover:bg-[#00C4CC] text-white"
                            size="sm"
                        >
                            {getRetryButtonContent()}
                        </Button>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Amount: ₹{amountNumber.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Error Modal */}
            <PaymentErrorModal
                isOpen={showErrorModal}
                onClose={closeErrorModal}
                errorCode={errorCode || 'UNKNOWN_ERROR'}
                orderId={orderId}
                orderNumber={orderNumber}
                amount={pendingAmount || amountNumber}
                onRetry={paymentStatus === 'failed' ? handleRetryPayment : handleInitiatePayment}
            />

            {/* Processing Overlay */}
            <PaymentProcessingOverlay
                isVisible={isProcessing}
                currentStep={razorpayStatus as 'creating_order' | 'awaiting_payment' | 'verifying' | 'success' | 'failed'}
                amount={amountNumber}
                orderNumber={orderNumber}
            />
        </>
    );
}
