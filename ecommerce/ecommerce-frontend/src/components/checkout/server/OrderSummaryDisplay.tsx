"use client";

import { motion, AnimatePresence } from 'motion/react';
import { Truck, Shield, ArrowRight, RefreshCw, AlertCircle, Tag, Sparkles, Package, ChevronDown, ChevronUp, X, Loader2, Percent, Gift, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCartWithDiscount } from '@/hooks/useCartWithDiscount';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/queries';
import { useRazorpay } from '@/hooks/useRazorpay';
import Image from 'next/image';
import type { AppliedDiscountInfo } from '@/types/cart';
import { PaymentErrorModal } from '@/components/checkout/PaymentErrorModal';
import { PaymentConfirmingOverlay, type ConfirmationStatus } from '@/components/checkout/PaymentConfirmingOverlay';

// ============================================================================
// Cart Fingerprint Utility
// ============================================================================
// Creates a unique hash of cart contents to detect changes
function generateCartFingerprint(cartItems: Array<{ productId: string; quantity: number; price: number }>, discountTotal: number): string {
    const itemsHash = cartItems
        .map(item => `${item.productId}:${item.quantity}:${item.price}`)
        .sort()
        .join('|');
    return `${itemsHash}::${discountTotal}`;
}

// ============================================================================
// OrderSummary - Type-Based Discount UI
// ============================================================================

// Type-specific discount badge component
function DiscountBadge({ discount }: { discount: AppliedDiscountInfo }) {
    const config = {
        percentage: {
            icon: Percent,
            gradient: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-700 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-800',
            label: `${discount.value}% OFF`,
        },
        fixed_amount: {
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-700 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-800',
            label: `₹${discount.value} OFF`,
        },
        free_shipping: {
            icon: Truck,
            gradient: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-700 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-800',
            label: 'FREE SHIPPING',
        },
        buy_x_get_y: {
            icon: Gift,
            gradient: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            borderColor: 'border-orange-200 dark:border-orange-800',
            textColor: 'text-orange-700 dark:text-orange-400',
            iconBg: 'bg-orange-100 dark:bg-orange-800',
            label: 'BOGO DEAL',
        },
    };

    const style = config[discount.type] || config.percentage;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${style.bgColor} border ${style.borderColor}`}
        >
            <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${style.textColor}`} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${style.textColor}`}>{discount.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-linear-to-r ${style.gradient} text-white font-medium`}>
                        {style.label}
                    </span>
                </div>
                <p className={`text-sm ${style.textColor} opacity-80`}>{discount.title}</p>
            </div>
            <div className="text-right">
                <span className={`text-lg font-bold ${style.textColor}`}>-₹{parseFloat(discount.savings).toLocaleString()}</span>
            </div>
        </motion.div>
    );
}

// Savings banner with type-specific styling
function SavingsBanner({ discounts, savings }: { discounts: AppliedDiscountInfo[], savings: number }) {
    if (discounts.length === 0) return null;

    const primaryDiscount = discounts[0];
    const gradients = {
        percentage: 'from-green-500 via-green-600 to-emerald-600',
        fixed_amount: 'from-green-500 via-emerald-500 to-teal-600',
        free_shipping: 'from-blue-500 via-blue-600 to-cyan-600',
        buy_x_get_y: 'from-orange-500 via-red-500 to-red-600',
    };
    const gradient = gradients[primaryDiscount.type] || gradients.percentage;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-linear-to-r ${gradient} p-4 text-white`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <div>
                        <p className="font-bold text-lg">You're saving ₹{savings.toLocaleString()}!</p>
                        <p className="text-white/80 text-sm">{primaryDiscount.title}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold">{primaryDiscount.code}</span>
                </div>
            </div>
        </motion.div>
    );
}

export function OrderSummary() {
    const {
        cartItems,
        getTotalPrice,
        getTotalItems,
        getGrandTotal,
        discountTotal,
        appliedDiscountCodes,
        appliedDiscounts,
        applyDiscount,
        removeDiscount,
        isApplyingDiscount,
    } = useCartWithDiscount();
    const { selectedPaymentMethod, selectedAddressId } = useCheckout();
    const router = useRouter();

    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [pendingOrderAmount, setPendingOrderAmount] = useState<number | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState<string | null>(null);

    const subtotal = getTotalPrice();
    const hasDiscount = discountTotal > 0;
    const grandTotal = getGrandTotal();

    // Generate cart fingerprint to detect changes
    const cartFingerprint = useMemo(() => {
        return generateCartFingerprint(
            cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
            discountTotal
        );
    }, [cartItems, discountTotal]);

    // Track the fingerprint that was used when order was created
    const orderCartFingerprintRef = useRef<string | null>(null);

    // CRITICAL: Invalidate pending order when cart changes
    // This ensures user always pays the correct amount
    useEffect(() => {
        if (pendingOrderId && orderCartFingerprintRef.current && orderCartFingerprintRef.current !== cartFingerprint) {


            // Clear the pending order - a new one will be created on next payment attempt
            setPendingOrderId(null);
            setPendingOrderAmount(null);
            orderCartFingerprintRef.current = null;

            // Clear session storage as well
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pending_order_id');
            }

            // Notify user that they need to retry due to cart change
            toast.info('Cart updated - please proceed to payment again');
        }
    }, [cartFingerprint, pendingOrderId]);

    // Items in cart are already reserved, trust them
    const hasStockIssues = false;

    const {
        status: paymentStatus,
        error: paymentError,
        errorCode,
        showErrorModal,
        closeErrorModal,
        pendingAmount,
        initiatePayment,
        processCodPayment,
        reset: resetPayment,
    } = useRazorpay();

    // Derived state
    const isPaymentProcessing = paymentStatus !== 'idle' && paymentStatus !== 'failed' && paymentStatus !== 'cancelled' && paymentStatus !== 'success';
    const isSDKReady = true; // SDK is loaded on demand by the hook, so we consider it ready or handled by loading state
    const pendingOrderNumber = undefined; // Hook doesn't provide this, use orderId if needed or omit

    // Map payment status to confirmation overlay status
    const getConfirmationStatus = (): ConfirmationStatus | null => {
        switch (paymentStatus) {
            case 'verifying':
                return 'verifying';
            default:
                return null;
        }
    };
    const confirmationStatus = getConfirmationStatus();

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) { setPromoError('Please enter a code'); return; }
        setPromoError(null);
        const result = await applyDiscount(promoCode.trim().toUpperCase());
        if (result.success) { toast.success('Discount applied!'); setPromoCode(''); }
        else { setPromoError(result.message || 'Invalid code'); }
    };

    const handleRemoveDiscount = async () => { await removeDiscount(); };

    const isProcessing = isCreatingOrder || isPaymentProcessing;

    // Sync processing state to context so CheckoutGuard doesn't redirect
    const { setIsPaymentProcessing } = useCheckout();
    useEffect(() => {
        setIsPaymentProcessing(isProcessing);
    }, [isProcessing, setIsPaymentProcessing]);

    const handlePlaceOrder = useCallback(async () => {
        if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
        if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
        if (isProcessing) return;

        // CRITICAL: Prevent duplicate order creation
        if (isCreatingOrder) {

            return;
        }

        // CRITICAL: Set processing state SYNCHRONOUSLY before any async work
        // This prevents CheckoutGuard from redirecting during the order creation
        setIsCreatingOrder(true);
        setIsPaymentProcessing(true);

        // Also set sessionStorage flag as a safety net for CheckoutGuard
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('payment_in_progress', 'true');
        }

        try {
            let orderId = pendingOrderId;

            // SECURITY: Verify pending order amount matches current cart
            // If cart changed, we MUST create a new order to prevent price manipulation
            const amountMismatch = pendingOrderAmount !== null && Math.abs(pendingOrderAmount - grandTotal) > 0.01;

            if (amountMismatch) {
                console.warn('[OrderSummary] Amount mismatch detected - creating fresh order', {
                    pendingOrderAmount,
                    currentGrandTotal: grandTotal,
                });
                orderId = null;
                setPendingOrderId(null);
                setPendingOrderAmount(null);
            }

            if (!orderId) {
                const orderResponse = await createOrder({
                    shipping_address_id: selectedAddressId,
                    billing_address_id: selectedAddressId,
                    payment_method: selectedPaymentMethod
                });
                orderId = orderResponse.order_id;

                // Store the order and the cart state it was created with
                setPendingOrderId(orderId);
                setPendingOrderAmount(grandTotal);
                orderCartFingerprintRef.current = cartFingerprint;

                // Store order ID immediately to prevent redirect
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pending_order_id', orderId);
                }
            }

            // IMPORTANT: Keep isCreatingOrder true until payment flow starts
            // The useRazorpay hook will manage its own processing state
            if (selectedPaymentMethod === 'cod') {
                await processCodPayment(orderId);
            } else if (selectedPaymentMethod === 'razorpay') {
                await initiatePayment(orderId);
            }
        } catch (error: any) {
            // Only clear flags on error
            setIsCreatingOrder(false);
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('payment_in_progress');
                sessionStorage.removeItem('pending_order_id');
            }
            if (error.status === 400 && error.message?.includes('No active cart')) { toast.error('Your cart is empty.'); router.push('/collections'); }
            else if (error.status === 401) { toast.error('Please log in'); router.push('/login?redirect=/checkout'); }
            else { toast.error(error.message || 'Failed to place order.'); }
        } finally {
            // Always reset isCreatingOrder, but keep isPaymentProcessing managed by the hook
            setIsCreatingOrder(false);
        }
    }, [selectedAddressId, cartItems.length, isProcessing, pendingOrderId, pendingOrderAmount, grandTotal, cartFingerprint, selectedPaymentMethod, processCodPayment, initiatePayment, router, setIsPaymentProcessing]);

    const handleRetryPayment = useCallback(() => {
        // SECURITY: Before retrying, verify cart hasn't changed
        if (pendingOrderAmount !== null && Math.abs(pendingOrderAmount - grandTotal) > 0.01) {
            toast.error('Cart has changed. Please place a new order.');
            setPendingOrderId(null);
            setPendingOrderAmount(null);
            resetPayment();
            return;
        }

        if (!pendingOrderId) return;
        resetPayment();
        if (selectedPaymentMethod === 'razorpay') initiatePayment(pendingOrderId, true);
        else processCodPayment(pendingOrderId);
    }, [pendingOrderId, pendingOrderAmount, grandTotal, resetPayment, selectedPaymentMethod, initiatePayment, processCodPayment]);

    // Simple handler to switch method or just close
    const handleDifferentMethod = useCallback(() => {
        resetPayment();
        closeErrorModal();
        // Optional: Scroll to payment method selection if needed
    }, [resetPayment, closeErrorModal]);

    const getButtonContent = () => {
        if (isCreatingOrder) return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Creating Order...</>;
        if (paymentStatus === 'loading_sdk') return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading Gateway...</>;
        if (paymentStatus === 'creating_order') return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Preparing...</>;
        // If awaiting payment (modal open) or verifying, show progress
        if (paymentStatus === 'awaiting_payment') return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Payment in Progress...</>;
        if (paymentStatus === 'verifying') return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Verifying Payment...</>;
        if (paymentStatus === 'success') return <><Loader2 className="w-5 h-5 animate-spin mr-2" />Payment Successful...</>;
        return <>Place Order • ₹{grandTotal.toLocaleString()}<ArrowRight className="w-5 h-5 ml-2" /></>;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">

                {/* Savings Banner (Type-Specific) */}
                <SavingsBanner discounts={appliedDiscounts} savings={discountTotal} />

                <div className="p-5">
                    {/* Cart Items Preview */}
                    <div className="mb-4">
                        <button onClick={() => setShowItems(!showItems)} className="w-full flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg px-2 -mx-2 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {cartItems.slice(0, 3).map((item, idx) => (
                                        <div key={item.id} className="w-10 h-10 rounded-lg border-2 border-white dark:border-slate-900 overflow-hidden bg-gray-100 relative" style={{ zIndex: 3 - idx }}>
                                            <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                                        </div>
                                    ))}
                                    {cartItems.length > 3 && <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">+{cartItems.length - 3}</div>}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{getTotalItems()} items</span>
                            </div>
                            {showItems ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>
                        <AnimatePresence>
                            {showItems && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="pt-3 space-y-2 max-h-48 overflow-y-auto">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                                <div className="w-10 h-10 rounded overflow-hidden relative shrink-0"><Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" /></div>
                                                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                                                <span className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 my-4" />

                    {/* Promo Code Section */}
                    {/* {appliedDiscounts.length === 0 ? (
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Discount code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()} disabled={isApplyingDiscount} className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-[#00C4CC] focus:ring-2 focus:ring-[#00C4CC]/20 outline-none text-sm bg-white dark:bg-slate-800 disabled:opacity-50" />
                                </div>
                                <Button onClick={handleApplyPromo} disabled={isApplyingDiscount || !promoCode.trim()} className="h-11 px-5 bg-[#0B1F51] hover:bg-[#00C4CC] text-white font-semibold rounded-xl transition-colors">
                                    {isApplyingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                </Button>
                            </div>
                            {promoError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {promoError}</p>}
                        </div>
                    ) : (
                        <div className="mb-4 space-y-2">
                            {appliedDiscounts.map((discount) => (
                                <div key={discount.code} className="relative">
                                    <DiscountBadge discount={discount} />
                                    <button onClick={handleRemoveDiscount} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )} */}

                    <div className="border-t border-gray-100 dark:border-slate-700 my-4" />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-base items-center"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span className="font-semibold text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</span></div>
                        {hasDiscount && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex justify-between items-center text-base -mx-3 px-3 py-2 rounded-lg border ${appliedDiscounts[0]?.type === 'fixed_amount' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                                    appliedDiscounts[0]?.type === 'free_shipping' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                        appliedDiscounts[0]?.type === 'buy_x_get_y' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                                            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    }`}
                            >
                                <span className={`flex items-center gap-2 font-medium ${appliedDiscounts[0]?.type === 'fixed_amount' ? 'text-emerald-700 dark:text-emerald-400' :
                                    appliedDiscounts[0]?.type === 'free_shipping' ? 'text-blue-700 dark:text-blue-400' :
                                        appliedDiscounts[0]?.type === 'buy_x_get_y' ? 'text-orange-700 dark:text-orange-400' :
                                            'text-green-700 dark:text-green-400'
                                    }`}>
                                    <Tag className="w-4 h-4" />
                                    Discount
                                    {appliedDiscountCodes[0] && (
                                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${appliedDiscounts[0]?.type === 'fixed_amount' ? 'bg-emerald-600' :
                                            appliedDiscounts[0]?.type === 'free_shipping' ? 'bg-blue-600' :
                                                appliedDiscounts[0]?.type === 'buy_x_get_y' ? 'bg-orange-600' :
                                                    'bg-green-600'
                                            }`}>{appliedDiscountCodes[0]}</span>
                                    )}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold ${appliedDiscounts[0]?.type === 'fixed_amount' ? 'text-emerald-700 dark:text-emerald-400' :
                                        appliedDiscounts[0]?.type === 'free_shipping' ? 'text-blue-700 dark:text-blue-400' :
                                            appliedDiscounts[0]?.type === 'buy_x_get_y' ? 'text-orange-700 dark:text-orange-400' :
                                                'text-green-700 dark:text-green-400'
                                        }`}>-₹{discountTotal.toLocaleString()}</span>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await handleRemoveDiscount();
                                            } catch (error) {
                                                toast.error('Failed to remove discount');
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                                        title="Remove discount"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        <div className="flex justify-between text-base items-center"><span className="text-gray-600 dark:text-gray-400">Shipping</span><span className="font-semibold text-green-600">FREE</span></div>
                        <div className="flex justify-between text-base items-center"><span className="text-gray-600 dark:text-gray-400">Tax</span><span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Included in price</span></div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-slate-600 my-4" />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                            {hasDiscount && <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><Sparkles className="w-3 h-3" />You save ₹{discountTotal.toLocaleString()}</p>}
                        </div>
                        <div className="text-right">
                            {hasDiscount && <span className="text-sm text-gray-400 line-through block">₹{subtotal.toLocaleString()}</span>}
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 dark:bg-slate-800 px-5 py-3 grid grid-cols-3 gap-2 border-t">
                    <div className="flex items-center gap-2 text-xs"><Truck className="w-4 h-4 text-green-500" /><span className="text-gray-600">Free Delivery</span></div>
                    <div className="flex items-center gap-2 text-xs"><Shield className="w-4 h-4 text-blue-500" /><span className="text-gray-600">1 Year Warranty</span></div>
                    <div className="flex items-center gap-2 text-xs"><Package className="w-4 h-4 text-orange-500" /><span className="text-gray-600">Easy Returns</span></div>
                </div>
            </div>

            {/* Error States */}
            {/* Payment Error Modal */}
            <PaymentErrorModal
                isOpen={showErrorModal}
                onClose={closeErrorModal}
                errorCode={errorCode || 'UNKNOWN_ERROR'}
                orderId={pendingOrderId || undefined}
                amount={pendingAmount || grandTotal}
                onRetry={handleRetryPayment}
                onDifferentMethod={handleDifferentMethod}
            />

            {/* Payment Confirming Overlay */}
            <PaymentConfirmingOverlay
                isOpen={confirmationStatus !== null}
                status={confirmationStatus || 'verifying'}
                orderId={pendingOrderId || undefined}
                orderNumber={pendingOrderNumber || undefined}
                amount={pendingAmount || grandTotal}
            />

            {selectedPaymentMethod === 'razorpay' && !isSDKReady && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">Loading payment gateway...</div>}

            {/* Place Order Button */}
            <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || (selectedPaymentMethod === 'razorpay' && !isSDKReady)}
                className="w-full h-14 bg-linear-to-r from-[#0B1F51] to-[#00C4CC] text-white hover:shadow-2xl hover:scale-[1.02] rounded-xl text-base font-bold transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {getButtonContent()}
            </Button>

            <p className="text-[11px] text-gray-500 text-center">By placing your order, you agree to our Terms & Privacy Policy</p>
        </motion.div>
    );
}
