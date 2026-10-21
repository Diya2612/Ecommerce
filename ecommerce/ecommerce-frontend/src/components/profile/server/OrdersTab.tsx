"use client";

import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, ChevronRight, Eye, RotateCcw, Star, ShoppingBag, ChevronLeft, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Order } from '@/types/order';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders } from '@/hooks/queries/orders/useOrders';
import { getPaymentStatusDisplay, needsPayment, isPaymentPending } from '@/lib/utils/payment-status';
import { OrdersListSkeleton } from '@/components/profile/skeletons/OrdersListSkeleton';
import { MobileOrderCard } from '../client/MobileOrderCard';
import { PullToRefreshIndicator } from '../ui/PullToRefreshIndicator';

interface OrdersTabProps {
    /** Initial orders from server - no longer used, kept for backwards compatibility */
    initialOrders?: Order[];
}

// Pagination constants
const MOBILE_ITEMS_PER_PAGE = 10;
const DESKTOP_ITEMS_PER_PAGE = 5;

// Status configuration
const STATUS_CONFIG = {
    delivered: {
        icon: CheckCircle,
        label: 'Delivered',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-200 dark:border-green-800'
    },
    shipped: {
        icon: Truck,
        label: 'Shipped',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-200 dark:border-blue-800'
    },
    processing: {
        icon: Package,
        label: 'Processing',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-200 dark:border-amber-800'
    },
    confirmed: {
        icon: Clock,
        label: 'Confirmed',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-200 dark:border-blue-800'
    },
    pending: {
        icon: Clock,
        label: 'Pending',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-700'
    },
    cancelled: {
        icon: Package,
        label: 'Cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800'
    },
    refunded: {
        icon: RotateCcw,
        label: 'Refunded',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-200 dark:border-purple-800'
    }
};

export function OrdersTab({ initialOrders }: OrdersTabProps = {}) {
    const searchParams = useSearchParams();
    const [displayCount, setDisplayCount] = useState(MOBILE_ITEMS_PER_PAGE);
    const [isMobile, setIsMobile] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Pull-to-refresh state
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use TanStack Query - client-side only now
    const {
        orders,
        loading,
        error,
        refresh,
    } = useOrders();

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Infinite scroll observer for mobile
    useEffect(() => {
        if (!isMobile || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && displayCount < orders.length) {
                    setDisplayCount(prev => Math.min(prev + MOBILE_ITEMS_PER_PAGE, orders.length));
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isMobile, displayCount, orders.length]);

    // Pull-to-refresh handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (isRefreshing) return;
        const container = containerRef.current;
        if (container && container.scrollTop <= 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) {
            setPullDistance(Math.min(deltaY / 2.5, 100));
        }
    }, [isPulling, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= 60) {
            setIsRefreshing(true);
            setPullDistance(40);
            try {
                await refresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, refresh]);

    // Desktop pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(orders.length / DESKTOP_ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * DESKTOP_ITEMS_PER_PAGE;
    const endIndex = startIndex + DESKTOP_ITEMS_PER_PAGE;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Reset page when orders change
    useEffect(() => {
        setCurrentPage(1);
        setDisplayCount(MOBILE_ITEMS_PER_PAGE);
    }, [orders.length]);

    const getStatusConfig = (status: Order['order_status']) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading state
    if (loading && orders.length === 0) {
        return <OrdersListSkeleton />;
    }

    // Error state
    if (error && orders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 lg:py-16"
            >
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 lg:w-8 lg:h-8 text-red-500" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Failed to load orders
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-6">
                    {error}
                </p>
                <Button onClick={refresh} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            </motion.div>
        );
    }

    // Empty state
    if (orders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 lg:py-16"
            >
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-linear-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-6 lg:mb-8 max-w-sm mx-auto px-4">
                    When you place orders, they will appear here. Start shopping to discover amazing products!
                </p>
                <Link href="/collections">
                    <Button className="bg-linear-to-r from-[#0B1F51] to-[#00C4CC] text-white hover:opacity-90 h-11 lg:h-12 px-6 lg:px-8 rounded-xl font-semibold">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Start Shopping
                    </Button>
                </Link>
            </motion.div>
        );
    }

    // Mobile orders display
    const mobileOrders = orders.slice(0, displayCount);

    return (
        <div className="relative">
            {/* Pull to Refresh Indicator - Mobile Only */}
            <div className="lg:hidden">
                <PullToRefreshIndicator
                    pullProgress={pullDistance / 60}
                    isRefreshing={isRefreshing}
                    pullDistance={pullDistance}
                />
            </div>

            {/* Mobile Orders List with Pull-to-Refresh */}
            <div
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="lg:hidden space-y-3"
                style={{
                    transform: isPulling || isRefreshing ? `translateY(${pullDistance}px)` : undefined,
                    transition: isPulling ? 'none' : 'transform 0.3s ease-out',
                }}
            >
                <AnimatePresence mode="popLayout">
                    {mobileOrders.map((order, index) => (
                        <MobileOrderCard key={order.id} order={order} index={index} />
                    ))}
                </AnimatePresence>

                {/* Load More Trigger */}
                {displayCount < orders.length && (
                    <div ref={loadMoreRef} className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                )}

                {/* All loaded indicator */}
                {displayCount >= orders.length && orders.length > MOBILE_ITEMS_PER_PAGE && (
                    <p className="text-center text-sm text-gray-400 py-4">
                        All {orders.length} orders loaded
                    </p>
                )}
            </div>

            {/* Desktop Orders List */}
            <div className="hidden lg:block space-y-4">
                {paginatedOrders.map((order, index) => {
                    const displayItems = order.items && order.items.length > 0 ? order.items : [];
                    const status = getStatusConfig(order.order_status);
                    const StatusIcon = status.icon;
                    const totalAmount = parseFloat(order.total_amount);
                    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });

                    const paymentStatusDisplay = getPaymentStatusDisplay(order.payment_status);
                    const showPaymentWarning = order.payment_method === 'razorpay' &&
                        needsPayment(order.payment_status) &&
                        order.order_status !== 'cancelled';
                    const isProcessingPayment = isPaymentPending(order.payment_status) &&
                        order.payment_status === 'authorized';

                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-600 transition-all duration-300"
                        >
                            {/* Order Header */}
                            <div className="p-5 flex flex-wrap items-center gap-4 border-b border-gray-50 dark:border-slate-700/50">
                                {/* Status Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor}`}>
                                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                    <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                                </div>

                                {/* Order Info */}
                                <div className="flex items-center gap-6 flex-wrap text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Order </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">#{order.order_number}</span>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400">{date}</div>
                                </div>

                                {/* Total */}
                                <div className="ml-auto text-right">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="p-5">
                                <div className="flex items-center gap-4">
                                    {/* Product Images Stack */}
                                    <div className="flex -space-x-3">
                                        {displayItems.slice(0, 3).map((item, i) => (
                                            <div
                                                key={i}
                                                className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-white dark:border-slate-800 overflow-hidden relative shrink-0 shadow-sm"
                                                style={{ zIndex: 3 - i }}
                                            >
                                                <Image
                                                    src={item.product_image || '/placeholder.png'}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                        ))}
                                        {displayItems.length > 3 && (
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl border-2 border-white dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                    +{displayItems.length - 3}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items Summary */}
                                    <div className="flex-1 min-w-0">
                                        {displayItems.length > 0 ? (
                                            <>
                                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {displayItems[0].product_name}
                                                </p>
                                                {displayItems.length > 1 && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        and {displayItems.length - 1} more {displayItems.length - 1 === 1 ? 'item' : 'items'}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-gray-400 dark:text-gray-500 italic text-sm">No item details</p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0">
{/* {order.order_status === 'delivered' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hidden sm:flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                                            >
                                                <Star className="w-4 h-4" />
                                                Rate
                                            </Button>
                                        )} */}
                                        <Link href={`/profile/orders/${order.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[#00C4CC] hover:text-[#0B1F51] hover:bg-[#00C4CC]/10 font-medium group/btn"
                                            >
                                                <Eye className="w-4 h-4 mr-1.5" />
                                                View Details
                                                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Status Bars */}
                            {(order.order_status === 'shipped' || order.order_status === 'delivered') && (
                                <div className={`px-5 py-3 ${status.bgColor} border-t ${status.borderColor}`}>
                                    <div className="flex items-center gap-2 text-sm">
                                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                        <span className={status.color}>
                                            {order.order_status === 'delivered'
                                                ? `Delivered on ${date}`
                                                : 'Your order is on the way! Track for live updates.'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {isProcessingPayment && (
                                <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Payment being confirmed...</span>
                                    </div>
                                </div>
                            )}

                            {showPaymentWarning && !isProcessingPayment && (
                                <div className={`px-5 py-3 border-t ${order.payment_status === 'failed'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className={`w-4 h-4 ${order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'}`} />
                                            <span className={order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'}>
                                                {order.payment_status === 'failed'
                                                    ? 'Payment failed. Click to try again.'
                                                    : 'Payment pending. Complete your payment to confirm order.'}
                                            </span>
                                        </div>
                                        <Link href={`/profile/orders/${order.id}`}>
                                            <Button
                                                size="sm"
                                                className={`h-8 text-xs font-semibold ${order.payment_status === 'failed'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                                                    }`}
                                            >
                                                {order.payment_status === 'failed' ? 'Retry Payment' : 'Pay Now'}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Desktop Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    const showPage = page === 1 || page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                    const showEllipsis = page === currentPage - 2 || page === currentPage + 2;

                                    if (showEllipsis && totalPages > 5) {
                                        return <span key={page} className="px-2 text-gray-400">...</span>;
                                    }

                                    if (!showPage && totalPages > 5) {
                                        return null;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={`w-9 h-9 p-0 ${currentPage === page
                                                ? 'bg-[#0B1F51] text-white'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
