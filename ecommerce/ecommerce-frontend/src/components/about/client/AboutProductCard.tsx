'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { AboutFeaturedProduct } from '@/types/about';

interface AboutProductCardProps {
    product: AboutFeaturedProduct;
    index: number;
}

/**
 * AboutProductCard - Client Island Component
 * 
 * Desktop product card for About page with hover effects and cart interactions.
 * Uses useCart context for add-to-cart functionality.
 * Uses useRouter for navigation.
 * 
 * This maintains the exact styling from the original AboutFeaturedProducts component.
 */
export function AboutProductCard({ product, index }: AboutProductCardProps) {
    const { addToCart, cartItems } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const isInCart = cartItems.some((item) => item.productId === String(product.id));

    const handleAddToCart = () => {
        addToCart({
            productId: String(product.id),
            quantity: 1,
            preventDuplicates: true,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white rounded-card border border-black/6 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative h-[280px] w-full bg-[#F9FBFD] p-8 overflow-hidden">
                <div className="relative w-full h-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-contain transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                </div>

                {/* Quick Actions Overlay */}
                <div
                    className={`absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                    <Button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="bg-white text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300 flex items-center"
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
                            className="font-semibold text-[20px] text-[#0B1F51] group-hover:text-[#00C4CC] transition-colors cursor-pointer line-clamp-1 tracking-[-0.01em]"
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
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`w-11 h-11 rounded-input flex items-center justify-center transition-all duration-300 shadow-lg ${isInCart
                            ? "bg-[#00C4CC] text-white scale-110"
                            : "bg-[#0B1F51] text-white hover:bg-[#00C4CC]"
                            }`}
                    >
                        {isInCart ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <ShoppingCart className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
