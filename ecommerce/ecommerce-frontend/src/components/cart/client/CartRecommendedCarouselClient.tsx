"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { ProductCard, type Product } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils/cn';
import type { CartProduct } from '@/lib/data/cart/types';

// ============================================================================
// Props Interface
// ============================================================================

interface CartRecommendedCarouselClientProps {
    products: CartProduct[];
}

// ============================================================================
// CartRecommendedCarouselClient Component
// ============================================================================

export function CartRecommendedCarouselClient({ products }: CartRecommendedCarouselClientProps) {
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useProfile();
    const [[currentPage, direction], setPage] = useState([0, 0]);

    const itemsPerPage = 3;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const paginate = useCallback((newDirection: number) => {
        setPage(([prevPage]) => {
            const newPage = (prevPage + newDirection + totalPages) % totalPages;
            return [newPage, newDirection];
        });
    }, [totalPages]);

    const currentProducts = products.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // Convert CartProduct to Product type for ProductCard
    const mapToProduct = (product: CartProduct): Product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        rating: product.rating,
        reviews: product.reviews,
        tags: product.tags,
        label: product.label,
        isNew: product.isNew,
        inStock: product.inStock,
    });

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: String(product.id),
            quantity: 1,
            variant: product.tags?.[0] || undefined,
            preventDuplicates: true
        });
    };

    const handleWishlistToggle = (product: Product) => {
        const isInWishlist = wishlist.some(item => item.id === String(product.id));
        if (isInWishlist) {
            removeFromWishlist(String(product.id));
            toast.success("Removed from wishlist");
        } else {
            addToWishlist({
                id: String(product.id),
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                image: product.image,
                rating: product.rating || 0,
                reviews: product.reviews || 0,
                inStock: true
            });
            toast.success("Added to wishlist");
        }
    };

    if (products.length === 0) {
        return null;
    }

    return (
        <div
            className="py-10"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <motion.h3
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl font-bold text-white text-center mb-10 italic tracking-wide drop-shadow-lg"
            >
                You May Also Like
            </motion.h3>

            {/* Carousel Container - with proper padding for arrows */}
            <div className="relative px-16">
                {/* Previous Button */}
                <button
                    onClick={() => paginate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-[#0B1F51] shadow-lg backdrop-blur-xs rounded-full flex items-center justify-center z-20 transition-all duration-200 hover:scale-110 transform-gpu"
                    aria-label="Previous products"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Products Grid */}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction < 0 ? 100 : -100 }}
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="grid grid-cols-3 gap-5"
                    >
                        {currentProducts.map((product, index) => {
                            const mappedProduct = mapToProduct(product);
                            const isInWishlist = wishlist.some(item => item.id === String(product.id));

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ProductCard
                                        product={mappedProduct}
                                        isInWishlist={isInWishlist}
                                        onAddToCart={handleAddToCart}
                                        onWishlistToggle={handleWishlistToggle}
                                        productHref={`/product/${product.id}`}
                                        showQuickView={false}
                                        imageHeight="h-[220px]"
                                        animateEntrance={false}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Next Button */}
                <button
                    onClick={() => paginate(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-[#0B1F51] shadow-lg backdrop-blur-xs rounded-full flex items-center justify-center z-20 transition-all duration-200 hover:scale-110 transform-gpu"
                    aria-label="Next products"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-8">
                {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            const newDirection = idx > currentPage ? 1 : -1;
                            setPage([idx, newDirection]);
                        }}
                        className={cn(
                            "rounded-full transition-all duration-300 hover:scale-110",
                            idx === currentPage
                                ? 'bg-white w-8 h-2'
                                : 'bg-white/40 w-2 h-2 hover:bg-white/60'
                        )}
                        aria-label={`Go to page ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
