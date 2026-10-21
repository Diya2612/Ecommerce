"use client";

import { motion } from 'motion/react';
import { ShoppingCart, Lock, Truck, CheckCircle } from 'lucide-react';

export function CheckoutProgressSteps() {
    const steps = [
        { icon: ShoppingCart, label: "Cart", active: true, completed: true },
        { icon: Truck, label: "Shipping", active: true, completed: false },
        { icon: CheckCircle, label: "Payment", active: false, completed: false }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between max-w-2xl mx-auto mt-8"
        >
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isLastStep = index === steps.length - 1;
                return (
                    <div key={index} className={`flex items-center ${isLastStep ? '' : 'flex-1'}`}>
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className={`w-14 h-14 rounded-input flex items-center justify-center mb-3 shadow-lg transition-all duration-300 ${step.completed
                                    ? 'bg-[#22C55E]'
                                    : step.active
                                        ? 'bg-[#00C4CC]'
                                        : 'bg-white/20 backdrop-blur-xs'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${step.active || step.completed ? 'text-white' : 'text-white/50'}`} />
                            </motion.div>
                            <span className={`text-[14px] font-bold ${step.active ? 'text-white' : 'text-white/60'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-4 rounded-full overflow-hidden bg-white/20">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: step.completed ? '100%' : '0%' }}
                                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                                    className="h-full bg-[#22C55E]"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </motion.div>
    );
}
