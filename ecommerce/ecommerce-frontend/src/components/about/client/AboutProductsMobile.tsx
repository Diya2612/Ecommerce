'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
    ShoppingCart,
    Star,
    Eye,
    Check,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { AboutFeaturedProduct } from '@/types/about';

interface AboutProductsMobileProps {
    products: AboutFeaturedProduct[];
}

/**
 * AboutProductsMobile - Client Island Component
 * 
 * Mobile carousel for About page featured products.
 * Handles cart interactions. product navigation, and carousel state.
 * 
 * This is specific to the About page to maintain its unique styling
 * while leveraging the same cart context as the rest of the app.
 */
export function AboutProductsMobile({ products }: AboutProductsMobileProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const { addToCart, cartItems } = useCart();
    const router = useRouter();

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    };

    const handleAddToCart = (product: AboutFeaturedProduct) => {
        addToCart({
            productId: String(product.id),
            quantity: 1,
        });
        toast.success("Added to cart");
    };

    const isInCart = (productId: number) =>
        cartItems.some((item) => item.productId === String(productId));

    return (
        <div className="sm:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="w-full shrink-0 px-2">
                            <div className="group relative bg-white rounded-card border border-black/6 overflow-hidden shadow-xs">
                                {/* Image Container */}
                                <div
                                    className="relative h-[280px] w-full bg-[#F9FBFD] p-8 overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/product/${product.id}`)}
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                            sizes="100vw"
                                        />
                                    </div>

                                    {/* Quick View Button */}
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/product/${product.id}`);
                                            }}
                                            className="bg-white text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-full px-6 py-2 shadow-lg"
                                        >
                                            Quick View <Eye className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[12px] font-bold text-[#00C4CC] uppercase tracking-wider mb-1">
                                                {product.tags[0]}
                                            </p>
                                            <h3
                                                onClick={() => router.push(`/product/${product.id}`)}
                                                className="font-semibold text-[20px] text-[#0B1F51] cursor-pointer line-clamp-1 tracking-[-0.01em]"
                                            >
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-[6px]">
                                            <Star className="w-3 h-3 fill-[#F5B012] text-[#F5B012]" />
                                            <span className="text-[12px] font-bold text-[#0B1F51]">
                                                {product.rating}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[14px] line-through">
                                                ₹{product.originalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-[18px] font-bold text-[#0B1F51]">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isInCart(product.id)}
                                            className={`w-11 h-11 rounded-input flex items-center justify-center transition-all duration-300 shadow-lg ${isInCart(product.id)
                                                ? "bg-[#00C4CC] text-white scale-110"
                                                : "bg-[#0B1F51] text-white hover:bg-[#00C4CC]"
                                                }`}
                                        >
                                            {isInCart(product.id) ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <ShoppingCart className="w-5 h-5" />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-0 top-[160px] -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                aria-label="Previous product"
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-0 top-[160px] -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                aria-label="Next product"
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
                {products.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
                            ? "w-8 bg-[#00C4CC]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setCarouselIndex(index)}
                        aria-label={`Go to product ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
