"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    AlertCircle,
    Wifi,
    WifiOff,
    CreditCard,
    Clock,
    XCircle,
    CheckCircle,
    RefreshCw,
    ArrowRight,
    X,
    Phone,
    Mail,
    MessageCircle,
    ShieldAlert,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    type PaymentErrorCode,
    type PaymentErrorConfig,
    type RecoveryAction,
    getPaymentError,
    getActionLabel,
    isPendingSuccessError,
} from '@/lib/constants/payment-errors';

// ============================================================================
// Types
// ============================================================================

interface PaymentErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    errorCode: PaymentErrorCode;
    errorMessage?: string; // Override default message
    orderId?: string;
    orderNumber?: string;
    amount?: number;
    onRetry?: () => void;
    onDifferentMethod?: () => void;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const getErrorIcon = (iconType: PaymentErrorConfig['icon']) => {
    switch (iconType) {
        case 'network':
            return WifiOff;
        case 'bank':
            return CreditCard;
        case 'timeout':
            return Clock;
        case 'cancelled':
            return XCircle;
        case 'warning':
            return ShieldAlert;
        case 'info':
            return Info;
        case 'error':
        default:
            return AlertCircle;
    }
};

const getIconColors = (iconType: PaymentErrorConfig['icon']) => {
    switch (iconType) {
        case 'info':
            return { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' };
        case 'warning':
            return { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' };
        case 'cancelled':
            return { bg: 'bg-gray-100 dark:bg-gray-800', icon: 'text-gray-600 dark:text-gray-400' };
        case 'network':
            return { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' };
        case 'bank':
            return { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' };
        case 'timeout':
            return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' };
        case 'error':
        default:
            return { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' };
    }
};

// ============================================================================
// Component
// ============================================================================

export function PaymentErrorModal({
    isOpen,
    onClose,
    errorCode,
    errorMessage,
    orderId,
    orderNumber,
    amount,
    onRetry,
    onDifferentMethod,
}: PaymentErrorModalProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState<number | null>(null);

    const config = getPaymentError(errorCode);
    const Icon = getErrorIcon(config.icon);
    const colors = getIconColors(config.icon);
    const isPendingSuccess = isPendingSuccessError(errorCode);

    // Auto-close countdown
    useEffect(() => {
        if (!isOpen || !config.autoCloseSeconds) return;

        setCountdown(config.autoCloseSeconds);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    onClose();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, config.autoCloseSeconds, onClose]);

    // Reset countdown when modal opens
    useEffect(() => {
        if (isOpen && config.autoCloseSeconds) {
            setCountdown(config.autoCloseSeconds);
        } else {
            setCountdown(null);
        }
    }, [isOpen, config.autoCloseSeconds]);

    // Handle action buttons
    const handleAction = useCallback((action: RecoveryAction) => {
        switch (action) {
            case 'retry':
                onRetry?.();
                onClose();
                break;
            case 'different_method':
                onDifferentMethod?.();
                onClose();
                break;
            case 'login':
                router.push('/login?redirect=/checkout');
                break;
            case 'view_order':
                if (orderId) {
                    router.push(`/profile?tab=orders&orderId=${orderId}`);
                } else {
                    router.push('/profile?tab=orders');
                }
                onClose();
                break;
            case 'go_to_cart':
                router.push('/collections');
                onClose();
                break;
            case 'go_to_orders':
                router.push('/profile?tab=orders');
                onClose();
                break;
            case 'refresh':
                window.location.reload();
                break;
            case 'contact_support':
                // Scroll to support section or open support modal
                window.open('mailto:support@anantenterprises.com?subject=Payment Issue - Order ' + (orderNumber || ''), '_blank');
                break;
            case 'wait':
                // Do nothing, just close
                onClose();
                break;
        }
    }, [router, orderId, orderNumber, onRetry, onDifferentMethod, onClose]);

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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-4">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                        className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center`}
                                    >
                                        <Icon className={`w-8 h-8 ${colors.icon}`} />
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                                    {config.title}
                                </h2>

                                {/* Message */}
                                <p className="text-center text-gray-600 dark:text-gray-300">
                                    {errorMessage || config.message}
                                </p>
                            </div>

                            {/* Description */}
                            {config.description && (
                                <div className="px-6 pb-4">
                                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {config.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Amount (if applicable) */}
                            {amount && !isPendingSuccess && (
                                <div className="px-6 pb-4">
                                    <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
                                        <span className="text-sm text-gray-500">Amount</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            ₹{amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Order Number */}
                            {orderNumber && (
                                <div className="px-6 pb-4">
                                    <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
                                        <span className="text-sm text-gray-500">Order</span>
                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                            {orderNumber}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="px-6 pb-6 space-y-3">
                                {/* Primary Action */}
                                <Button
                                    onClick={() => handleAction(config.primaryAction)}
                                    className={`w-full h-12 text-base font-semibold rounded-xl ${isPendingSuccess
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-[#0B1F51] hover:bg-[#00C4CC] text-white'
                                        }`}
                                >
                                    {isPendingSuccess && <CheckCircle className="w-5 h-5 mr-2" />}
                                    {config.primaryAction === 'retry' && <RefreshCw className="w-5 h-5 mr-2" />}
                                    {getActionLabel(config.primaryAction)}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>

                                {/* Secondary Action */}
                                {config.secondaryAction && (
                                    <Button
                                        onClick={() => handleAction(config.secondaryAction!)}
                                        variant="outline"
                                        className="w-full h-12 text-base font-medium rounded-xl border-2"
                                    >
                                        {getActionLabel(config.secondaryAction)}
                                    </Button>
                                )}

                                {/* Auto-close countdown */}
                                {countdown !== null && (
                                    <p className="text-center text-sm text-gray-400">
                                        Closing in {countdown} seconds...
                                    </p>
                                )}
                            </div>

                            {/* Support Section */}
                            {config.showSupport && (
                                <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-slate-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                                        Need help? Contact our support team
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => window.open('tel:+919876543210', '_blank')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Call</span>
                                        </button>
                                        <button
                                            onClick={() => window.open('mailto:support@anantenterprises.com', '_blank')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                                        </button>
                                        <button
                                            onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">WhatsApp</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
