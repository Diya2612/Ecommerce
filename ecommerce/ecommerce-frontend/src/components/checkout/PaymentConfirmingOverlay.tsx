"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

export type ConfirmationStatus =
    | 'verifying'           // Initial signature verification
    | 'confirmed'           // Payment confirmed
    | 'timeout'             // Polling timeout (but likely successful)
    | 'failed';             // Payment failed

interface PaymentConfirmingOverlayProps {
    isOpen: boolean;
    status: ConfirmationStatus;
    orderId?: string;
    orderNumber?: string;
    amount?: number;
    onClose?: () => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const pulseRing = {
    animate: {
        scale: [1, 1.5, 1.5],
        opacity: [0.6, 0, 0],
    },
    transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut" as const,
    },
};

// ============================================================================
// Status Configurations
// ============================================================================

const statusConfig = {
    verifying: {
        icon: Loader2,
        iconAnimate: true,
        title: 'Verifying Payment',
        message: 'Please wait while we verify your payment...',
        color: 'blue',
        showProgress: false,
    },
    confirmed: {
        icon: CheckCircle,
        iconAnimate: false,
        title: 'Payment Confirmed!',
        message: 'Your payment was successful. Redirecting...',
        color: 'green',
    },
    timeout: {
        icon: AlertCircle,
        iconAnimate: false,
        title: 'Almost There!',
        message: 'Your payment is being processed. You will receive a confirmation shortly.',
        color: 'yellow',
    },
    failed: {
        icon: AlertCircle,
        iconAnimate: false,
        title: 'Payment Failed',
        message: 'We could not process your payment. Please try again.',
        color: 'red',
    },
};

const colorStyles = {
    blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        ring: 'bg-blue-200 dark:bg-blue-800/50',
        progress: 'bg-blue-500',
        progressBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        ring: 'bg-green-200 dark:bg-green-800/50',
        progress: 'bg-green-500',
        progressBg: 'bg-green-100 dark:bg-green-900/50',
    },
    yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: 'text-yellow-600 dark:text-yellow-400',
        ring: 'bg-yellow-200 dark:bg-yellow-800/50',
        progress: 'bg-yellow-500',
        progressBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    },
    red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: 'text-red-600 dark:text-red-400',
        ring: 'bg-red-200 dark:bg-red-800/50',
        progress: 'bg-red-500',
        progressBg: 'bg-red-100 dark:bg-red-900/50',
    },
};

// ============================================================================
// Component
// ============================================================================

export function PaymentConfirmingOverlay({
    isOpen,
    status,
    orderId,
    orderNumber,
    amount,
    onClose,
}: PaymentConfirmingOverlayProps) {
    const [dots, setDots] = useState('');

    const config = statusConfig[status as keyof typeof statusConfig];
    const colors = colorStyles[config.color as keyof typeof colorStyles];
    const Icon = config.icon;

    // Animated dots for loading states
    useEffect(() => {
        if (status === 'verifying') {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 500);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                            {/* Animated Icon */}
                            <div className="relative flex justify-center mb-6">
                                {/* Pulse rings for loading states */}
                                {(status === 'verifying') && (
                                    <>
                                        <motion.div
                                            {...pulseRing}
                                            className={`absolute w-20 h-20 rounded-full ${colors.ring}`}
                                        />
                                        <motion.div
                                            {...pulseRing}
                                            transition={{ ...pulseRing.transition, delay: 0.5 }}
                                            className={`absolute w-20 h-20 rounded-full ${colors.ring}`}
                                        />
                                    </>
                                )}

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                    className={`relative w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center`}
                                >
                                    <Icon
                                        className={`w-10 h-10 ${colors.icon} ${config.iconAnimate ? 'animate-spin' : ''}`}
                                    />
                                </motion.div>
                            </div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                            >
                                {config.title}
                            </motion.h2>

                            {/* Message */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 dark:text-gray-300 mb-6"
                            >
                                {config.message}
                                {(status === 'verifying') && (
                                    <span className="inline-block w-4">{dots}</span>
                                )}
                            </motion.p>



                            {/* Amount Display */}
                            {amount && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6"
                                >
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ₹{amount.toLocaleString()}
                                    </p>
                                    {orderNumber && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Order #{orderNumber}
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* View Order Link (for timeout state) */}
                            {status === 'timeout' && orderId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Link
                                        href={`/profile?tab=orders&orderId=${orderId}`}
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Check order status
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            )}

                            {/* Close button for terminal states */}
                            {(status === 'failed' || status === 'timeout') && onClose && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-6"
                                >
                                    <Button
                                        onClick={onClose}
                                        variant={status === 'failed' ? 'default' : 'outline'}
                                        className="w-full h-12 rounded-xl font-semibold"
                                    >
                                        {status === 'failed' ? 'Try Again' : 'Continue'}
                                    </Button>
                                </motion.div>
                            )}

                            {/* Don't close warning */}
                            {(status === 'verifying') && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-xs text-gray-400 mt-4"
                                >
                                    Please don't close this window
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
