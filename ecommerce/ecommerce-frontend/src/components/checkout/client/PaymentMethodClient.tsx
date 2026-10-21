"use client";

import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Banknote, Check, ShieldCheck, Clock, Wallet, Smartphone, Building2 } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';

// ============================================================================
// PaymentMethodClient - Client Component
// ============================================================================
// Interactive payment method selection with enhanced COD

const PAYMENT_METHODS = [
    {
        id: 'razorpay',
        icon: CreditCard,
        name: 'Pay Online',
        description: 'Cards, UPI, Netbanking, Wallets',
        popular: true,
        secure: true,
        subIcons: [Wallet, Smartphone, Building2]
    },
    {
        id: 'cod',
        icon: Banknote,
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        popular: false,
        secure: false,
        codFee: 0 // Set to a number if you want to charge COD fee
    }
];

export function PaymentMethodClient() {
    const { selectedPaymentMethod, setSelectedPaymentMethod } = useCheckout();

    return (
        <div className="space-y-4">
            {/* Payment Options */}
            <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedPaymentMethod === method.id;

                    return (
                        <motion.button
                            key={method.id}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                            whileTap={{ scale: 0.99 }}
                            className={`relative w-full text-left bg-white dark:bg-slate-800 border-2 rounded-xl p-4 transition-all duration-200 ${isSelected
                                ? 'border-[#00C4CC] bg-[#00C4CC]/5 dark:bg-[#00C4CC]/10'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Radio Button */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                                    ? 'border-[#00C4CC] bg-[#00C4CC]'
                                    : 'border-gray-300 dark:border-slate-600'
                                    }`}>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 bg-white rounded-full"
                                        />
                                    )}
                                </div>

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#00C4CC]' : 'bg-gray-100 dark:bg-slate-700'
                                    }`}>
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {method.name}
                                        </h3>
                                        {method.popular && (
                                            <span className="text-[10px] font-bold text-[#00C4CC] bg-[#00C4CC]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {method.description}
                                    </p>

                                    {/* Sub icons for online payment */}
                                    {method.subIcons && (
                                        <div className="flex items-center gap-2 mt-2">
                                            {method.subIcons.map((SubIcon, i) => (
                                                <div key={i} className="w-7 h-7 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                    <SubIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                </div>
                                            ))}
                                            <span className="text-xs text-gray-400 dark:text-gray-500">& more</span>
                                        </div>
                                    )}
                                </div>

                                {/* Security Badge */}
                                {method.secure && isSelected && (
                                    <div className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                        <ShieldCheck className="w-3 h-3" />
                                        Secure
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Context Message */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedPaymentMethod}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl p-4 ${selectedPaymentMethod === 'razorpay'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800'
                        }`}
                >
                    {selectedPaymentMethod === 'razorpay' ? (
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    You'll be securely redirected to Razorpay to complete your payment. All major cards, UPI apps, wallets, and netbanking supported.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Pay with cash or UPI when your order arrives. Please keep the exact amount ready for a contactless delivery experience.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-2 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="currentColor" opacity="0.2" />
                    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V7.3l7-3.11v8.8z" fill="currentColor" />
                </svg>
                <p className="text-xs font-medium">
                    Your payment information is encrypted and secure
                </p>
            </div>
        </div>
    );
}
