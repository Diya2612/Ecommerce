"use client";

import { motion } from 'motion/react';
import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { UserMenu } from '@/components/auth';
import type { ActionButtonsProps } from '../types';

export function ActionButtons({
    onSearchClick,
    cartItemCount,
    onCartClick,
    className = "",
}: Omit<ActionButtonsProps, 'onProfileClick'>) {
    return (
        <motion.div
            className={cn("hidden lg:flex items-center gap-2", className)}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
        >
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200/50 dark:border-gray-700/50 mr-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSearchClick}
                    className="text-[#1C2A54] dark:text-white hover:text-[#31CDD4] hover:bg-[#31CDD4]/10 dark:hover:bg-slate-800 rounded-full w-10 h-10 transition-colors"
                    aria-label="Search products"
                >
                    <Search className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#1C2A54] dark:text-white hover:text-[#31CDD4] hover:bg-[#31CDD4]/10 dark:hover:bg-slate-800 rounded-full w-10 h-10 transition-colors relative"
                    onClick={onCartClick}
                    aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#31CDD4] text-white text-[11px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center px-1" aria-hidden="true">
                            {cartItemCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Auth-aware User Menu */}
            <UserMenu />
        </motion.div>
    );
}

