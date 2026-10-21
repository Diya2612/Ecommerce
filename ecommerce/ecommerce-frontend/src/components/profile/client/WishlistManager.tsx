"use client";

import { Star, Heart, ShoppingCart, Trash2, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WishlistItem, useProfile } from '@/contexts/ProfileContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { WishlistActions } from './WishlistActions';
import { MobileCard, SWIPE_ACTIONS } from '../ui/MobileCard';
import { triggerHaptic } from '@/hooks/gestures/useHaptic';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';

interface WishlistManagerProps {
    initialWishlist: WishlistItem[];
}

export function WishlistManager({ initialWishlist }: WishlistManagerProps) {
    const { wishlist, removeFromWishlist, isLoading } = useProfile();
    const { addToCart } = useCart();
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Use context wishlist for real-time updates
    // Only use initialWishlist while context is loading
    const displayWishlist = isLoading ? initialWishlist : wishlist;

    // Handle remove from wishlist
    const handleRemove = useCallback(async (item: WishlistItem) => {
        setRemovingId(item.id);
        triggerHaptic('medium');

        try {
            removeFromWishlist(item.id);
            toast.success(`${item.name} removed from wishlist`);
        } finally {
            setRemovingId(null);
        }
    }, [removeFromWishlist]);

    // Handle share
    const handleShare = useCallback(async (item: WishlistItem) => {
        triggerHaptic('light');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.name,
                    text: `Check out ${item.name}`,
                    url: `/collections/${item.id}`,
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/collections/${item.id}`);
            toast.success('Product link copied!');
        }
    }, []);

    // Empty state with animated illustration
    if (displayWishlist.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 lg:py-16"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 lg:w-24 lg:h-24 bg-linear-to-br from-pink-100 to-red-50 dark:from-pink-900/30 dark:to-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    >
                        <Heart className="w-10 h-10 lg:w-12 lg:h-12 text-pink-400 dark:text-pink-500" />
                    </motion.div>
                    {/* Floating hearts */}
                    <motion.div
                        animate={{ y: [-10, -20, -10], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        className="absolute -top-2 -right-2"
                    >
                        <Heart className="w-4 h-4 text-pink-300 fill-pink-300" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [-5, -15, -5], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute -top-1 -left-3"
                    >
                        <Heart className="w-3 h-3 text-red-300 fill-red-300" />
                    </motion.div>
                </motion.div>

                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Wishlist is Empty
                </h3>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto px-4">
                    Explore our products and save your favorites here for quick access later.
                </p>
                <Link href="/collections">
                    <Button className="bg-linear-to-r from-[#0B1F51] to-[#00C4CC] text-white hover:opacity-90 h-11 lg:h-12 px-6 lg:px-8 rounded-xl font-semibold">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Start Shopping
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Count and hint */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {displayWishlist.length} {displayWishlist.length === 1 ? 'item' : 'items'} saved
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 lg:hidden">
                    Swipe left to remove
                </p>
            </div>

            {/* Mobile: Single Column with Swipe Actions */}
            <div className="lg:hidden space-y-3">
                <AnimatePresence mode="popLayout">
                    {displayWishlist.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -200 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <MobileCard
                                leftSwipeActions={[
                                    SWIPE_ACTIONS.delete(() => handleRemove(item)),
                                ]}
                                onLongPress={() => handleShare(item)}
                                className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700"
                            >
                                <Link href={`/collections/${item.id}`} className="block">
                                    <div className="flex gap-3 p-3 bg-white dark:bg-slate-800">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-xl relative shrink-0 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                            {/* Discount badge */}
                                            {item.originalPrice > item.price && (
                                                <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {Math.round((1 - item.price / item.originalPrice) * 100)}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                                                {item.name}
                                            </h3>
                                            {/* Rating - HIDDEN */}
                                            {/* <div className="flex items-center gap-1 mb-2">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.rating}</span>
                                                <span className="text-xs text-gray-400">({item.reviews})</span>
                                            </div> */}
                                            {/* Price */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                                    ₹{item.price.toLocaleString()}
                                                </span>
                                                {item.originalPrice > item.price && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Add to Cart Button */}
                                        <div className="flex flex-col justify-center">
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    triggerHaptic('medium');
                                                    addToCart({
                                                        productId: String(item.id),
                                                        quantity: 1,
                                                    });
                                                }}
                                                className="w-10 h-10 p-0 rounded-xl bg-[#00C4CC] hover:bg-[#0B1F51] text-white shadow-lg"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            </MobileCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Desktop: Two Column Grid */}
            <div className="hidden lg:grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {displayWishlist.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 transition-all hover:shadow-lg flex gap-4 group"
                        >
                            {/* Image */}
                            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-xl relative shrink-0 overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-2"
                                />
                                {item.originalPrice > item.price && (
                                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                                        {/* Rating - HIDDEN */}
                                        {/* <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{item.rating}</span>
                                            <span className="text-xs text-gray-400">({item.reviews})</span>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</span>
                                    {item.originalPrice > item.price && (
                                        <span className="text-sm text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>

                                <WishlistActions item={item} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
