"use client";

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    ChevronRight,
    Eye,
    Star,
    AlertCircle,
    Loader2,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/order';
import { getPaymentStatusDisplay, needsPayment, isPaymentPending } from '@/lib/utils/payment-status';

interface MobileOrderCardProps {
    order: Order;
    index: number;
}

const STATUS_CONFIG = {
    delivered: {
        icon: CheckCircle,
        label: 'Delivered',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-500',
    },
    shipped: {
        icon: Truck,
        label: 'Shipped',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-500',
    },
    processing: {
        icon: Package,
        label: 'Processing',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-500',
    },
    confirmed: {
        icon: CheckCircle,
        label: 'Confirmed',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-500',
    },
    pending: {
        icon: Clock,
        label: 'Pending',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        borderColor: 'border-gray-400',
    },
    cancelled: {
        icon: AlertCircle,
        label: 'Cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-500',
    },
    refunded: {
        icon: RotateCcw,
        label: 'Refunded',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-500',
    },
};

export function MobileOrderCard({ order, index }: MobileOrderCardProps) {
    const displayItems = order.items && order.items.length > 0 ? order.items : [];
    const status = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const totalAmount = parseFloat(order.total_amount);
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });

    const showPaymentWarning =
        order.payment_method === 'razorpay' &&
        needsPayment(order.payment_status) &&
        order.order_status !== 'cancelled';
    const isProcessingPayment =
        isPaymentPending(order.payment_status) && order.payment_status === 'authorized';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150"
        >
            <Link href={`/profile/orders/${order.id}`} className="block">
                {/* Status Banner - Left colored border indicator */}
                <div className="flex">
                    <div className={`w-1 ${status.borderColor} bg-current shrink-0`} />

                    <div className="flex-1 p-4">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                            {/* Order Info */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    #{order.order_number}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    • {date}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor}`}>
                                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                <span className={`text-xs font-semibold ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                        </div>

                        {/* Product Images Row - Horizontal Scroll */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex -space-x-2 overflow-x-auto scrollbar-hide py-1">
                                {displayItems.slice(0, 4).map((item, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-white dark:border-slate-800 overflow-hidden relative shrink-0 shadow-sm"
                                        style={{ zIndex: 4 - i }}
                                    >
                                        <Image
                                            src={item.product_image || '/placeholder.png'}
                                            alt={item.product_name}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                ))}
                                {displayItems.length > 4 && (
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl border-2 border-white dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                            +{displayItems.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Item Summary */}
                            <div className="flex-1 min-w-0">
                                {displayItems.length > 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                            {displayItems[0].product_name}
                                        </p>
                                        {displayItems.length > 1 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                +{displayItems.length - 1} more
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No items</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Row */}
                        <div className="flex items-center justify-between">
                            {/* Total */}
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ₹{totalAmount.toLocaleString()}
                            </span>

                            {/* View Details Chevron */}
                            <div className="flex items-center gap-1 text-[#00C4CC]">
                                <span className="text-xs font-medium">View</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Processing Payment Bar */}
            {isProcessingPayment && (
                <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Payment being confirmed...</span>
                    </div>
                </div>
            )}

            {/* Payment Warning Bar */}
            {showPaymentWarning && !isProcessingPayment && (
                <div
                    className={`px-4 py-2.5 border-t flex items-center justify-between ${order.payment_status === 'failed'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                        }`}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <Clock
                            className={`w-4 h-4 ${order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'
                                }`}
                        />
                        <span
                            className={
                                order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'
                            }
                        >
                            {order.payment_status === 'failed' ? 'Payment failed' : 'Payment pending'}
                        </span>
                    </div>
                    <Link href={`/profile/orders/${order.id}`}>
                        <Button
                            size="sm"
                            className={`h-7 text-xs font-semibold ${order.payment_status === 'failed'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                                }`}
                        >
                            {order.payment_status === 'failed' ? 'Retry' : 'Pay Now'}
                        </Button>
                    </Link>
                </div>
            )}

            {/* Delivery Status Bar */}
            {(order.order_status === 'shipped' || order.order_status === 'delivered') && (
                <div className={`px-4 py-2.5 ${status.bgColor} border-t border-gray-100 dark:border-slate-700`}>
                    <div className="flex items-center gap-2 text-sm">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={status.color}>
                            {order.order_status === 'delivered'
                                ? `Delivered on ${date}`
                                : 'Your order is on the way!'}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
