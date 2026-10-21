"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type ProcessingStep =
    | 'creating_order'
    | 'awaiting_payment'
    | 'verifying'
    | 'success'
    | 'failed';

interface PaymentProcessingOverlayProps {
    isVisible: boolean;
    currentStep: ProcessingStep;
    amount?: number;
    orderNumber?: string;
    /**
     * Called when user tries to close/cancel during processing
     * Return true to allow close, false to prevent
     */
    onAttemptClose?: () => boolean;
}

// ============================================================================
// Step Configuration
// ============================================================================

interface StepConfig {
    label: string;
    description: string;
    icon: 'loading' | 'check' | 'warning';
}

const STEP_CONFIG: Record<ProcessingStep, StepConfig> = {
    creating_order: {
        label: 'Creating Order',
        description: 'Securing your order details...',
        icon: 'loading',
    },
    awaiting_payment: {
        label: 'Processing Payment',
        description: 'Complete payment in the Razorpay window',
        icon: 'loading',
    },
    verifying: {
        label: 'Verifying Payment',
        description: 'Confirming your payment...',
        icon: 'loading',
    },
    success: {
        label: 'Payment Successful',
        description: 'Redirecting to confirmation...',
        icon: 'check',
    },
    failed: {
        label: 'Payment Failed',
        description: 'Something went wrong',
        icon: 'warning',
    },
};

const STEP_ORDER: ProcessingStep[] = ['creating_order', 'awaiting_payment', 'verifying', 'success'];

// ============================================================================
// Component
// ============================================================================

export function PaymentProcessingOverlay({
    isVisible,
    currentStep,
    amount,
    orderNumber,
    onAttemptClose,
}: PaymentProcessingOverlayProps) {
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Track elapsed time
    useEffect(() => {
        if (!isVisible) {
            setElapsedTime(0);
            setShowTimeoutWarning(false);
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isVisible]);

    // Show timeout warning after 30 seconds
    useEffect(() => {
        if (elapsedTime >= 30 && !showTimeoutWarning && currentStep !== 'success') {
            setShowTimeoutWarning(true);
        }
    }, [elapsedTime, showTimeoutWarning, currentStep]);

    // Prevent accidental close
    useEffect(() => {
        if (!isVisible) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Don't block if finished or if it's taking too long (likely stuck)
            if (
                currentStep !== 'success' &&
                currentStep !== 'failed' &&
                !showTimeoutWarning
            ) {
                e.preventDefault();
                e.returnValue = 'Payment is in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isVisible, currentStep]);

    const getStepStatus = (step: ProcessingStep): 'completed' | 'current' | 'pending' => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        const stepIndex = STEP_ORDER.indexOf(step);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const currentConfig = STEP_CONFIG[currentStep];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-md w-full mx-4">
                        {/* Security Badge */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-center gap-2 mb-8"
                        >
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium text-sm">
                                256-bit SSL Secure Payment
                            </span>
                        </motion.div>

                        {/* Main Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#0B1F51] to-[#00C4CC] p-6 text-center">
                                <h2 className="text-white text-xl font-bold">
                                    Anant Enterprises
                                </h2>
                                {orderNumber && (
                                    <p className="text-white/70 text-sm mt-1">
                                        Order: {orderNumber}
                                    </p>
                                )}
                            </div>

                            {/* Amount */}
                            {amount && (
                                <div className="text-center py-6 border-b border-gray-100 dark:border-slate-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Amount
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ₹{amount.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Progress Steps */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {STEP_ORDER.slice(0, -1).map((step, index) => {
                                        const status = getStepStatus(step);
                                        const config = STEP_CONFIG[step];
                                        const isLast = index === STEP_ORDER.length - 2;

                                        return (
                                            <div key={step} className="flex items-start gap-4">
                                                {/* Step Indicator */}
                                                <div className="flex flex-col items-center">
                                                    <motion.div
                                                        animate={{
                                                            scale: status === 'current' ? [1, 1.1, 1] : 1,
                                                        }}
                                                        transition={{
                                                            repeat: status === 'current' ? Infinity : 0,
                                                            duration: 1.5,
                                                        }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'completed'
                                                            ? 'bg-green-500'
                                                            : status === 'current'
                                                                ? 'bg-[#00C4CC]'
                                                                : 'bg-gray-200 dark:bg-slate-700'
                                                            }`}
                                                    >
                                                        {status === 'completed' ? (
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        ) : status === 'current' ? (
                                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-slate-500" />
                                                        )}
                                                    </motion.div>
                                                    {!isLast && (
                                                        <div
                                                            className={`w-0.5 h-8 ${status === 'completed'
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-200 dark:bg-slate-700'
                                                                }`}
                                                        />
                                                    )}
                                                </div>

                                                {/* Step Content */}
                                                <div className="flex-1 pb-4">
                                                    <p
                                                        className={`font-medium ${status === 'current'
                                                            ? 'text-gray-900 dark:text-white'
                                                            : status === 'completed'
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-gray-400 dark:text-slate-500'
                                                            }`}
                                                    >
                                                        {config.label}
                                                    </p>
                                                    {status === 'current' && (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                                                        >
                                                            {config.description}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Timeout Warning */}
                            <AnimatePresence>
                                {showTimeoutWarning && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6">
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                        Taking longer than usual
                                                    </p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                                                        If the payment window closed, check your order status.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer Warning */}
                            <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4">
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Do not close or refresh this page
                                </p>
                            </div>
                        </motion.div>

                        {/* Powered by Razorpay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center mt-6"
                        >
                            <p className="text-gray-500 text-sm">
                                Powered by{' '}
                                <span className="font-semibold text-gray-400">Razorpay</span>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
