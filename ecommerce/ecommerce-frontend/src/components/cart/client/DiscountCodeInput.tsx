"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartWithDiscount } from '@/hooks/useCartWithDiscount';

// ============================================================================
// DiscountCodeInput - Reusable discount code input component
// ============================================================================

interface DiscountCodeInputProps {
    variant?: 'default' | 'compact';
    className?: string;
}

export function DiscountCodeInput({ variant = 'default', className = '' }: DiscountCodeInputProps) {
    const {
        appliedDiscountCodes,
        discountTotal,
        isApplyingDiscount,
        applyDiscount,
        removeDiscount
    } = useCartWithDiscount();

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const hasAppliedDiscount = appliedDiscountCodes.length > 0;

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Please enter a discount code');
            return;
        }

        setError(null);
        setSuccess(false);

        const result = await applyDiscount(code);

        if (result.success) {
            setSuccess(true);
            setCode('');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setError(result.message || 'Invalid discount code');
        }
    };

    const handleRemove = async (codeToRemove?: string) => {
        await removeDiscount(codeToRemove);
        setError(null);
        setSuccess(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApply();
        }
    };

    // Compact variant for checkout sidebar
    if (variant === 'compact') {
        return (
            <div className={`space-y-2 ${className}`}>
                {!hasAppliedDiscount ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Discount code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            disabled={isApplyingDiscount}
                            className="flex-1 h-10 px-3 text-sm rounded-lg border border-gray-200 focus:border-[#00C4CC] focus:outline-none disabled:opacity-50"
                        />
                        <Button
                            onClick={handleApply}
                            disabled={isApplyingDiscount || !code.trim()}
                            size="sm"
                            className="h-10 px-4 bg-[#0B1F51] hover:bg-[#00C4CC]"
                        >
                            {isApplyingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                    </div>
                ) : (
                    <AppliedDiscountBadge
                        codes={appliedDiscountCodes}
                        savings={discountTotal}
                        onRemove={handleRemove}
                        compact
                    />
                )}

                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </p>
                )}
            </div>
        );
    }

    // Default variant for cart page
    return (
        <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 ${className}`}>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Have a discount code?
            </label>

            {!hasAppliedDiscount ? (
                <>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            disabled={isApplyingDiscount}
                            className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:border-[#00C4CC] focus:outline-none transition-colors text-base disabled:opacity-50 dark:bg-slate-800"
                        />
                        <Button
                            onClick={handleApply}
                            disabled={isApplyingDiscount || !code.trim()}
                            className="h-12 px-6 bg-[#0B1F51] hover:bg-[#00C4CC] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isApplyingDiscount ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Apply'
                            )}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 text-sm text-red-500 flex items-center gap-1"
                            >
                                <AlertCircle className="w-4 h-4" /> {error}
                            </motion.p>
                        )}
                        {success && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 text-sm text-green-500 flex items-center gap-1"
                            >
                                <CheckCircle className="w-4 h-4" /> Discount applied successfully!
                            </motion.p>
                        )}
                    </AnimatePresence>
                </>
            ) : (
                <AppliedDiscountBadge
                    codes={appliedDiscountCodes}
                    savings={discountTotal}
                    onRemove={handleRemove}
                />
            )}
        </div>
    );
}

// ============================================================================
// AppliedDiscountBadge - Shows applied discount with remove option
// ============================================================================

interface AppliedDiscountBadgeProps {
    codes: string[];
    savings: number;
    onRemove: (code?: string) => void;
    compact?: boolean;
}

export function AppliedDiscountBadge({ codes, savings, onRemove, compact = false }: AppliedDiscountBadgeProps) {
    if (compact) {
        return (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        {codes[0]}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-500">
                        -₹{savings.toLocaleString()}
                    </span>
                </div>
                <button
                    onClick={() => onRemove(codes[0])}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove discount"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-700 dark:text-green-400">
                            {codes[0]}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200 rounded-full">
                            Applied
                        </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-500">
                        You save ₹{savings.toLocaleString()}
                    </p>
                </div>
            </div>
            <button
                onClick={() => onRemove(codes[0])}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                aria-label="Remove discount"
            >
                <X className="w-5 h-5" />
            </button>
        </motion.div>
    );
}
