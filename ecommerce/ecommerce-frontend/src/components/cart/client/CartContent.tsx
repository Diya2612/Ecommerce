"use client";

import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

// ============================================================================
// EmptyCart - Client Component
// ============================================================================
// Empty cart state display

export function EmptyCart() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-950">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-[#0B1F51] dark:text-white mb-3">Your cart is empty</h1>
            <p className="text-gray-500 mb-8 max-w-md text-center">
                Looks like you haven't added anything to your cart yet. Explore our products to find the perfect water purifier for your home.
            </p>
            <Link href="/collections">
                <Button className="h-14 px-8 bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-full font-semibold text-lg shadow-xl shadow-blue-900/10 transition-all">
                    Start Shopping
                </Button>
            </Link>
        </div>
    );
}

// ============================================================================
// CartContent - Client Wrapper
// ============================================================================
// Wrapper that checks cart state and shows appropriate content

interface CartContentProps {
    children: React.ReactNode;
}

export function CartContent({ children }: CartContentProps) {
    const { cartItems } = useCart();

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    return <>{children}</>;
}
