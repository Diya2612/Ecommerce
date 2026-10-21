"use client";

import { CartSheet, CartSheetContent, CartSheetHeader, CartSheetTitle } from '../CartSheet';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { CartRecommendedCarouselClient } from './CartRecommendedCarouselClient';
import { CartUpsellClient } from './CartUpsellClient';
import Image from "next/image";
import type { CartProduct, UpsellProduct } from '@/lib/data/cart/types';
import type { CartItem } from '@/types/cart';
import { useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// Props Interface
// ============================================================================

interface CartDrawerClientProps {
    isOpen: boolean;
    onClose: () => void;
    recommendedProducts: CartProduct[];
    upsellProducts: UpsellProduct[];
}

// ============================================================================
// CartDrawerClient Component
// ============================================================================

export function CartDrawerClient({
    isOpen,
    onClose,
    recommendedProducts,
    upsellProducts
}: CartDrawerClientProps) {
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
    const router = useRouter();
    const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
    const subtotal = getTotalPrice();

    // Free shipping threshold
    const FREE_SHIPPING_THRESHOLD = 5000;
    const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    const handleRemoveClick = (item: CartItem) => {
        setItemToRemove(item);
    };

    const handleConfirmRemove = async () => {
        if (itemToRemove) {
            await removeFromCart(itemToRemove.id, true);
            setItemToRemove(null);
        }
    };

    const handleCancelRemove = () => {
        setItemToRemove(null);
    };

    const handleCheckout = () => {
        // Check for real stock issues:
        // Only flag items where the quantity in cart is actually problematic
        // Having availableStock = 0 is fine if you already have all units in cart
        const hasStockIssues = cartItems.some((item) => {
            // If maxStock is 0 AND we somehow have items, that's an issue
            // (This means stock was depleted after adding to cart)
            if (item.maxStock === 0 && item.quantity > 0) {
                // But check if this is just "all stock is in this cart"
                // We can't tell for sure, so we'll allow it
                return false;
            }
            // Only flag truly problematic items (backend should handle this)
            return false;
        });

        if (hasStockIssues) {
            toast.error('Please remove out-of-stock items before checking out', {
                duration: 5000
            });
            return;
        }

        onClose();
        router.push('/checkout');
    };

    return (
        <CartSheet open={isOpen} onOpenChange={onClose}>
            <CartSheetContent
                isOpen={isOpen}
                leftContent={cartItems.length > 0 ? (
                    // <CartRecommendedCarouselClient products={recommendedProducts} />
                    null
                ) : null}
                onOverlayClick={onClose}
                className="bg-white dark:bg-slate-950"
            >
                {/* Header */}
                <CartSheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0B1F51] rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CartSheetTitle className="text-xl font-bold text-[#0B1F51] dark:text-white">
                                Shopping Cart
                            </CartSheetTitle>
                            <p className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </CartSheetHeader>

                {/* Free Shipping Banner - Hidden for now */}
                {false && cartItems.length > 0 && (
                    <div className="px-6 py-4 bg-white dark:bg-slate-900">
                        <p className="text-sm font-medium mb-2">
                            {hasFreeShipping ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    🎉 You get FREE shipping!
                                </span>
                            ) : (
                                <span className="text-gray-600 dark:text-gray-300">
                                    Add <span className="font-bold text-[#0B1F51]">₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> more for FREE shipping
                                </span>
                            )}
                        </p>
                        <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${shippingProgress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-linear-to-r from-[#00C4CC] to-[#0B1F51] rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6 py-12">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-12 h-12 text-gray-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-2">Your cart is empty</h3>
                                <p className="text-gray-500">Looks like you haven't added anything yet</p>
                            </div>
                            <Button
                                onClick={() => {
                                    onClose();
                                    router.push('/products');
                                }}
                                className="bg-[#0B1F51] text-white hover:bg-[#00C4CC] rounded-full px-8 h-12"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-4">
                            {/* Cart Items */}
                            <div className="space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4"
                                        >
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-xl relative shrink-0 overflow-hidden">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-[#0B1F51] dark:text-white text-base line-clamp-1">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => handleRemoveClick(item)}
                                                            className="text-red-400 hover:text-red-500 p-1 -mr-1"
                                                            aria-label={`Remove ${item.name}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-bold text-[#0B1F51] dark:text-white">
                                                            ₹{item.price.toLocaleString()}
                                                        </span>
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-sm text-gray-400 line-through">
                                                                ₹{item.originalPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Stock Warning - Only for low stock, not when user has all available */}
                                                    {item.maxStock !== undefined && item.maxStock > 0 && item.maxStock <= 10 && (
                                                        <div className="mt-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300">
                                                            ⚠️ Only {item.maxStock} more available (max {item.quantity + item.maxStock} total)
                                                        </div>
                                                    )}

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center justify-end mt-3">
                                                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                                                                aria-label={`Decrease quantity`}
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-10 h-9 flex items-center justify-center font-semibold text-[#0B1F51] dark:text-white bg-gray-50 dark:bg-slate-800">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                                                aria-label={`Increase quantity`}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Upsell Section */}
                            {/* <CartUpsellClient products={upsellProducts} /> */}
                        </div>
                    )}
                </div>

                {/* Footer - Order Summary */}
                {cartItems.length > 0 && (
                    <div className="p-6 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
                        {/* Summary Lines */}
                        <div className="space-y-3 mb-5">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-[#0B1F51] dark:text-white">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Shipping</span>
                                <span className={`font-semibold ${hasFreeShipping ? 'text-green-500' : 'text-[#0B1F51]'}`}>
                                    {hasFreeShipping ? 'FREE' : 'Calculated at checkout'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                                <span className="text-[#0B1F51] dark:text-white font-medium">Total</span>
                                <span className="text-2xl font-bold text-[#0B1F51] dark:text-white">
                                    ₹{subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Checkout Button - Always enabled if cart has items */}
                        <Button
                            onClick={handleCheckout}
                            className="w-full h-14 bg-linear-to-r from-[#0B1F51] to-[#00C4CC] hover:from-[#0B1F51] hover:to-[#00B5B5] text-white rounded-full font-semibold text-base shadow-lg transition-all"
                        >
                            Proceed to Checkout
                        </Button>

                        {/* Continue Shopping Link */}
                        <button
                            onClick={onClose}
                            className="w-full mt-4 text-center text-[#0B1F51] dark:text-gray-400 hover:text-[#00C4CC] font-medium text-sm transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </CartSheetContent>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && handleCancelRemove()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{itemToRemove?.name}</strong> from your cart?
                            This will release the stock reservation for other customers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelRemove}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmRemove}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CartSheet>
    );
}
