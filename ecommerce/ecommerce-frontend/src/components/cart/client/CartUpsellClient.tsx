"use client";

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import Image from "next/image";
import type { UpsellProduct } from '@/lib/data/cart/types';

// ============================================================================
// Props Interface
// ============================================================================

interface CartUpsellClientProps {
    products: UpsellProduct[];
}

// ============================================================================
// CartUpsellClient Component
// ============================================================================

export function CartUpsellClient({ products }: CartUpsellClientProps) {
    const { addToCart, cartItems } = useCart();

    const handleAddToCart = (product: UpsellProduct) => {
        const isInCart = cartItems.some(item => item.productId === String(product.id));
        if (isInCart) return;

        addToCart({
            productId: String(product.id),
            quantity: 1,
            variant: "Add-on"
        });
        toast.success("Added to cart");
    };

    // Filter out products already in cart
    const availableProducts = products.filter(
        product => !cartItems.some(item => item.productId === String(product.id))
    );

    if (availableProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-[#0B1F51] dark:text-white mb-4">
                Fancy Something Extra?
            </h3>
            <div className="space-y-3">
                {availableProducts.map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 rounded-xl p-3"
                    >
                        {/* Image with Badge */}
                        <div className="relative w-14 h-14 bg-white dark:bg-slate-800 rounded-lg shrink-0 overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            <span className={`absolute top-0 left-0 ${product.badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg`}>
                                {product.badge}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#0B1F51] dark:text-white text-sm line-clamp-1">
                                {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-[#0B1F51] dark:text-white text-sm">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Add Button */}
                        <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-lg px-4 h-9 text-sm font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
