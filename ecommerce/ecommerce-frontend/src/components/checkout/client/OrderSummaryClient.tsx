"use client";

import { motion } from 'motion/react';
import { Tag, ArrowRight, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCartWithDiscount } from '@/hooks/useCartWithDiscount';
import { useRouter } from 'next/navigation';

// ============================================================================
// OrderSummaryClient - Client Component
// ============================================================================
// Interactive promo code input for checkout page

interface OrderSummaryClientProps {
    onPromoApplied?: (discount: number) => void;
}

export function OrderSummaryClient({ onPromoApplied }: OrderSummaryClientProps) {
    const router = useRouter();
    const { cartItems, clearCart, applyDiscount, removeDiscount, appliedDiscountCodes, discountTotal, isApplyingDiscount } = useCartWithDiscount();
    const { selectedAddressId, selectedPaymentMethod } = useCheckout();
    const [promoCode, setPromoCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const hasAppliedPromo = appliedDiscountCodes.length > 0;

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            setError('Please enter a promo code');
            return;
        }

        setError(null);
        const result = await applyDiscount(promoCode);

        if (result.success) {
            toast.success('Promo code applied!');
            setPromoCode('');
            onPromoApplied?.(discountTotal);
        } else {
            setError(result.message || 'Invalid promo code');
        }
    };

    const handleRemovePromo = async () => {
        await removeDiscount();
        setError(null);
        onPromoApplied?.(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApplyPromoCode();
        }
    };

    return (
        <>
            {/* Promo Code Section */}
            <div className="mb-6">
                <label className="text-[16px] font-medium text-gray-700 mb-3 block flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Have a promo code?
                </label>

                {!hasAppliedPromo ? (
                    <>
                        <div className="flex items-stretch gap-3">
                            <input
                                type="text"
                                placeholder="Enter code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                disabled={isApplyingDiscount}
                                className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] disabled:opacity-50 disabled:bg-gray-50"
                            />
                            <Button
                                onClick={handleApplyPromoCode}
                                disabled={isApplyingDiscount || !promoCode.trim()}
                                className="h-12! px-6 bg-[#0B1F51] text-white hover:bg-[#00C4CC] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#0B1F51] hover:border-[#00C4CC] transition-colors text-[16px]!"
                            >
                                {isApplyingDiscount ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[14px] text-red-500 mt-2 flex items-center gap-1"
                            >
                                <AlertCircle className="w-4 h-4" /> {error}
                            </motion.p>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-200"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <span className="font-semibold text-green-700">{appliedDiscountCodes[0]}</span>
                                <span className="text-sm text-green-600 ml-2">-₹{discountTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleRemovePromo}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove promo code"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </div>
        </>
    );
}

