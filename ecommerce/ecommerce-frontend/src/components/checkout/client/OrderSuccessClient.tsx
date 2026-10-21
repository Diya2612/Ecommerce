"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Check,
    ArrowRight,
    ShoppingBag,
    Package,
    Truck,
    MapPin,
    Copy,
    CheckCircle2,
    Clock,
    Share2,
    ChevronRight,
    Loader2,
    Home,
    Gift
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrderDetailQuery } from '@/hooks/queries/orders/useOrders';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { getPaymentStatusDisplay, isPaymentPending } from '@/lib/utils/payment-status';

// Timeline step component
function TimelineStep({
    icon: Icon,
    title,
    description,
    isActive,
    isCompleted,
    isLast
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    isActive: boolean;
    isCompleted: boolean;
    isLast?: boolean;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                            ? 'bg-[#0B1F51] text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                        }`}
                >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.div>
                {!isLast && (
                    <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                )}
            </div>
            <div className="pb-8">
                <p className={`font-semibold ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
}

export function OrderSuccessClient({ initialOrderId }: { initialOrderId?: string | null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshCart } = useCart();
    // Prioritize prop, then search param (though prop is derived from search param in page), then null which triggers session storage check
    const urlOrderId = initialOrderId || searchParams.get('orderId');

    const [effectiveOrderId, setEffectiveOrderId] = useState<string | null>(urlOrderId);
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    // Use TanStack Query hook
    const {
        data: order,
        isLoading: loading,
    } = useOrderDetailQuery(effectiveOrderId || '');

    // Handle payment confirmation toast
    useEffect(() => {
        if (order?.payment_status === 'paid' && sessionStorage.getItem('payment_status') !== 'paid') {
            toast.success('Payment confirmed!', {
                description: 'Your order has been fully processed.',
            });
            sessionStorage.setItem('payment_status', 'paid');
        }
    }, [order?.payment_status]);

    // Copy order number to clipboard
    const copyOrderNumber = () => {
        if (order?.order_number) {
            navigator.clipboard.writeText(order.order_number);
            setCopied(true);
            toast.success('Order number copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Share order
    const shareOrder = async () => {
        if (navigator.share && order) {
            try {
                await navigator.share({
                    title: 'My Order from Anant Enterprises',
                    text: `Just ordered from Anant Enterprises! Order #${order.order_number}`,
                    url: window.location.href,
                });
            } catch {
                toast.info('Share cancelled');
            }
        } else {
            copyOrderNumber();
        }
    };

    useEffect(() => {
        setMounted(true);

        let orderId = urlOrderId;
        if (!orderId && typeof window !== 'undefined') {
            orderId = sessionStorage.getItem('last_order_id');
            if (orderId) {
                setEffectiveOrderId(orderId);
            }
        } else if (orderId) {
            // Need to update state if prop/url changes
            setEffectiveOrderId(orderId);
        }

        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('payment_completed');
            sessionStorage.removeItem('last_order_id');
        }



        // Enhanced confetti burst
        const colors = ['#00C4CC', '#0B1F51', '#22C55E', '#F5B012'];
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors,
                ticks: 60,
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors,
                ticks: 60,
            });
        }, 250);

        return () => clearInterval(interval);
    }, [urlOrderId, refreshCart]);

    if (!mounted) return null;

    const orderId = effectiveOrderId;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#0B1F51] to-[#00C4CC] text-white pt-28 md:pt-32">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center"
                    >
                        {/* Animated Checkmark */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 relative"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                            >
                                <motion.div
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                >
                                    <Check className="w-10 h-10 text-green-500 stroke-[3px]" />
                                </motion.div>
                            </motion.div>
                            {/* Pulse rings */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0.6 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                                className="absolute inset-0 bg-white/20 rounded-full"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                            className="text-3xl md:text-4xl font-bold mb-3"
                        >
                            Order Confirmed! 🎉
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.95, duration: 0.5, ease: "easeOut" }}
                            className="text-white/80 text-lg max-w-md mx-auto"
                        >
                            Thank you for shopping with us. Your order has been placed successfully.
                        </motion.p>

                        {/* Order Number Badge */}
                        {order && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
                                className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5"
                            >
                                <span className="text-white/70 text-sm">Order ID</span>
                                <span className="font-mono font-bold text-lg">#{order.order_number}</span>
                                <button
                                    onClick={copyOrderNumber}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                    title="Copy order number"
                                >
                                    {copied ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-300" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Left Column - Timeline & Actions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#00C4CC]" />
                                Order Timeline
                            </h2>

                            <div className="pl-2">
                                <TimelineStep
                                    icon={CheckCircle2}
                                    title="Order Placed"
                                    description="Your order has been confirmed"
                                    isActive={false}
                                    isCompleted={true}
                                />
                                <TimelineStep
                                    icon={Package}
                                    title="Processing"
                                    description="We're preparing your items for shipment"
                                    isActive={true}
                                    isCompleted={false}
                                />
                                <TimelineStep
                                    icon={Truck}
                                    title="Shipped"
                                    description="Your package is on its way"
                                    isActive={false}
                                    isCompleted={false}
                                />
                                <TimelineStep
                                    icon={MapPin}
                                    title="Delivered"
                                    description="Package delivered to your doorstep"
                                    isActive={false}
                                    isCompleted={false}
                                    isLast
                                />
                            </div>
                        </motion.div>

                        {/* What's Next */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-blue-100 dark:border-slate-700"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                What happens next?
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-blue-600">1</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Email Confirmation</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Check your inbox for order details and receipt
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-blue-600">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Tracking Updates</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            You'll receive SMS and email updates on shipping
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-blue-600">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Delivery</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Expected delivery within 3-5 business days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button
                                onClick={() => router.push(`/profile/orders/${orderId}`)}
                                className="flex-1 bg-[#0B1F51] hover:bg-[#1a3578] text-white h-12 rounded-xl font-semibold group"
                                disabled={!orderId}
                            >
                                Track Order
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Link href="/" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-semibold border-2"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Button
                                onClick={shareOrder}
                                variant="ghost"
                                className="h-12 px-4 rounded-xl"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden sticky top-24">
                            {/* Header */}
                            <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-[#00C4CC]" />
                                    Order Summary
                                </h2>
                            </div>

                            <div className="p-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <p className="text-sm">Loading order details...</p>
                                    </div>
                                ) : order ? (
                                    <>
                                        {/* Order Items */}
                                        <div className="space-y-4 mb-6">
                                            {order.items?.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="relative shrink-0">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-gray-100 dark:border-slate-700">
                                                            <Image
                                                                src={item.product_image || '/placeholder.png'}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-contain p-2"
                                                            />
                                                        </div>
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0B1F51] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 z-10">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-sm font-semibold text-[#0B1F51] dark:text-[#00C4CC] mt-1">
                                                            ₹{parseFloat(item.line_total).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(order.items?.length || 0) > 3 && (
                                                <button
                                                    onClick={() => router.push(`/profile/orders/${orderId}`)}
                                                    className="w-full text-center py-2 text-sm text-[#00C4CC] hover:text-[#0B1F51] font-medium flex items-center justify-center gap-1"
                                                >
                                                    View all {order.items?.length} items
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-dashed border-gray-200 dark:border-slate-700 my-4" />

                                        {/* Price Breakdown */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>Subtotal</span>
                                                <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
                                            </div>
                                            {parseFloat(order.discount_amount) > 0 && (
                                                <div className="flex justify-between text-green-600 font-medium">
                                                    <span>Discount</span>
                                                    <span>-₹{parseFloat(order.discount_amount).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>Shipping</span>
                                                <span className="text-green-600 font-medium">
                                                    {parseFloat(order.shipping_amount) === 0 ? 'FREE' : `₹${order.shipping_amount}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>Tax</span>
                                                <span>₹{parseFloat(order.tax_amount).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-900 dark:text-white">Total Paid</span>
                                                <span className="text-xl font-bold text-[#0B1F51] dark:text-white">
                                                    ₹{parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delivery Address Preview */}
                                        {order.shipping_address && (
                                            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                    Delivering to
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.shipping_address.name}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {order.shipping_address.address_line1}, {order.shipping_address.city}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Order details unavailable</p>
                                        <Button
                                            variant="link"
                                            onClick={() => router.push('/profile?tab=orders')}
                                            className="mt-2"
                                        >
                                            View all orders
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Continue Shopping Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 bg-gradient-to-br from-[#0B1F51] to-[#00C4CC] rounded-2xl p-6 text-white"
                        >
                            <h3 className="font-semibold text-lg mb-2">Continue Shopping</h3>
                            <p className="text-white/80 text-sm mb-4">
                                Discover more amazing products in our collection
                            </p>
                            <Link href="/collections">
                                <Button
                                    variant="secondary"
                                    className="w-full bg-white text-[#0B1F51] hover:bg-white/90 font-semibold"
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Browse Collection
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div >
        </div >
    );
}
