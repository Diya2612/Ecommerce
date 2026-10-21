"use client";

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
import { Minus, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { CartItem } from '@/types/cart';
import { motion, AnimatePresence } from 'motion/react';
import Image from "next/image";
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { CART_QUERY_KEY } from '@/hooks/useCart';
import { ReservationTimer } from '../ReservationTimer';
import { toast } from 'sonner';
import { useCallback, useState } from 'react';

// ============================================================================
// CartItemsList - Client Component
// ============================================================================
// Interactive cart items list with quantity controls and remove functionality

export function CartItemsList() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const queryClient = useQueryClient();
    const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);

    const handleReservationExpired = useCallback(() => {
        // Refetch cart to get updated state (backend clears expired)
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast.warning('Item reservation expired. Stock released.');
    }, [queryClient]);

    const handleRemoveClick = (item: CartItem) => {
        setItemToRemove(item);
    };

    const handleConfirmRemove = async () => {
        if (itemToRemove) {
            try {
                await removeFromCart(itemToRemove.id, true);
                setItemToRemove(null);
            } catch (error) {
                console.error('Error removing item:', error);
                // Error toast is handled by the mutation
            }
        }
    };

    const handleCancelRemove = () => {
        setItemToRemove(null);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-card border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 space-y-6">
                <AnimatePresence mode='popLayout'>
                    {cartItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
                            className="flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0 first:pt-0"
                        >
                            {/* Product Image */}
                            <div className="w-full sm:w-32 h-32 bg-[#F9FBFD] dark:bg-slate-800 rounded-[16px] flex items-center justify-center p-4 relative shrink-0">
                                <Link href={`/products/${item.slug || item.productId}`} className="relative w-full h-full">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain"
                                    />
                                </Link>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <Link href={`/products/${item.slug || item.productId}`}>
                                            <h3 className="text-lg font-bold text-[#0B1F51] dark:text-white mb-1 hover:text-[#00C4CC] transition-colors">{item.name}</h3>
                                        </Link>
                                        {item.variant && (
                                            <p className="text-sm text-gray-500 bg-gray-50 dark:bg-slate-800 inline-block px-2 py-1 rounded-md mb-2">
                                                {item.variant}
                                            </p>
                                        )}
                                        {/* Dynamic Stock Status - Shows Available Stock After Reservations */}
                                        {item.maxStock !== undefined ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                {item.maxStock === 0 ? (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                                        <span className="text-red-600 font-medium">
                                                            Out of stock
                                                        </span>
                                                    </>
                                                ) : item.maxStock <= 5 ? (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                        <span className="text-orange-600 font-medium">
                                                            Only {item.maxStock} more available
                                                        </span>
                                                    </>
                                                ) : item.maxStock <= 10 ? (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                        <span className="text-orange-600 font-medium">
                                                            {item.maxStock} more available
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                                                        <span className="text-[#22C55E]">In Stock</span>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-[#22C55E]">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span>In Stock</span>
                                            </div>
                                        )}

                                        {/* Phase 2: Reservation Timer */}
                                        {item.reservationExpiresAt && (
                                            <div className="mt-2">
                                                <ReservationTimer
                                                    expiresAt={item.reservationExpiresAt}
                                                    onExpired={handleReservationExpired}
                                                    size="sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-[#0B1F51] dark:text-white">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                        {item.originalPrice && (
                                            <div className="text-sm text-gray-400 line-through">
                                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4 sm:mt-0">
                                    {/* Quantity Control */}
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl p-1.5 border border-gray-100 dark:border-slate-700">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            disabled={item.quantity <= 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-gray-600 hover:text-[#0B1F51] shadow-xs disabled:opacity-50 disabled:shadow-none transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-semibold text-[#0B1F51] dark:text-white w-8 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            disabled={item.maxStock !== undefined && item.maxStock === 0}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-gray-600 hover:text-[#0B1F51] shadow-xs disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveClick(item)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium transition-colors text-sm px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

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
        </div>
    );
}
