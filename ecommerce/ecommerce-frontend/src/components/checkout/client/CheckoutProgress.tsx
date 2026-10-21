"use client";

import { motion } from 'motion/react';
import { MapPin, ShoppingBag, CreditCard, Check } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/hooks/useCart';

// ============================================================================
// CheckoutProgress - Client Component
// ============================================================================
// Visual step indicator showing checkout progress

const STEPS = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'items', label: 'Items', icon: ShoppingBag },
    { id: 'payment', label: 'Payment', icon: CreditCard },
];

export function CheckoutProgress() {
    const { selectedAddressId, selectedPaymentMethod } = useCheckout();
    const { cartItems } = useCart();

    // Determine current step based on state
    const getStepStatus = (stepId: string) => {
        switch (stepId) {
            case 'address':
                return selectedAddressId ? 'completed' : 'current';
            case 'items':
                if (!selectedAddressId) return 'upcoming';
                return cartItems.length > 0 ? 'completed' : 'current';
            case 'payment':
                if (!selectedAddressId || cartItems.length === 0) return 'upcoming';
                return selectedPaymentMethod ? 'completed' : 'current';
            default:
                return 'upcoming';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-4">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const status = getStepStatus(step.id);
                            const Icon = step.icon;
                            const isLast = index === STEPS.length - 1;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    {/* Step Circle */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${status === 'completed'
                                            ? 'bg-green-500 text-white'
                                            : status === 'current'
                                                ? 'bg-[#0B1F51] text-white ring-4 ring-[#0B1F51]/20'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                                            }`}>
                                            {status === 'completed' ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className={`text-sm font-medium ${status === 'completed' || status === 'current'
                                                ? 'text-gray-900 dark:text-white'
                                                : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Connector Line */}
                                    {!isLast && (
                                        <div className="flex-1 mx-3">
                                            <div className="h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: status === 'completed' ? '100%' : '0%'
                                                    }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="h-full bg-green-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
