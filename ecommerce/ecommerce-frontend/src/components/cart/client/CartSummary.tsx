"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCartWithDiscount } from '@/hooks/useCartWithDiscount';
import { useRouter } from 'next/navigation';
import { DiscountCodeInput } from './DiscountCodeInput';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

// ============================================================================
// CartSummary - Client Component
// ============================================================================
// Order summary sidebar with checkout button

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartSummary() {
    const { getTotalPrice, getGrandTotal, discountTotal, appliedDiscountCodes } = useCartWithDiscount();
    const { cartItems } = useCart();
    const router = useRouter();
    const subtotal = getTotalPrice();
    const grandTotal = getGrandTotal();
    const hasDiscount = discountTotal > 0;

    // Don't flag stock issues - if items are in cart, they're reserved
    const hasStockIssues = false;

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-card border border-gray-100 dark:border-slate-800 shadow-lg sticky top-32">
            <h2 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#0B1F51] dark:text-white">₹{subtotal.toLocaleString()}</span>
                </div>

                {/* Discount Row */}
                {hasDiscount && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            Discount ({appliedDiscountCodes[0]})
                        </span>
                        <span className="font-medium">-₹{discountTotal.toLocaleString()}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-[#22C55E] font-medium">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}
                    </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span className="text-gray-400 text-sm">Calculated at checkout</span>
                </div>
            </div>

            {/* Discount Code Input */}
            {/* <DiscountCodeInput className="mb-6" /> */}

            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mb-6">
                <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-[#0B1F51] dark:text-white">Total</span>
                    <div className="text-right">
                        {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through block">
                                ₹{subtotal.toLocaleString()}
                            </span>
                        )}
                        <span className="text-2xl font-bold text-[#0B1F51] dark:text-white block">
                            ₹{grandTotal.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">Including GST</span>
                    </div>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                className="w-full h-14 bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-[14px] font-bold text-lg shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure Checkout</span>
            </div>
        </div>
    );
}

