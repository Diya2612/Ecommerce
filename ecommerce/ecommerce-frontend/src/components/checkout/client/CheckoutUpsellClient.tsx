"use client";

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import Image from "next/image";
import type { UpsellProduct } from '@/lib/data/checkout';
import { useState, useEffect, useRef } from 'react';

// ============================================================================
// CheckoutUpsellClient - Client Component
// ============================================================================
// Interactive upsell products with add to cart functionality and rotation

interface CheckoutUpsellClientProps {
    products: UpsellProduct[];
}

export function CheckoutUpsellClient({ products }: CheckoutUpsellClientProps) {
    const { addToCart, cartItems } = useCart();
    const [displayedProducts, setDisplayedProducts] = useState<UpsellProduct[]>([]);
    const [productPool, setProductPool] = useState<UpsellProduct[]>([]);
    const prevCartItemsRef = useRef<typeof cartItems>([]);

    // Initialize displayed products and pool
    useEffect(() => {
        if (products.length > 0) {
            // Show first 3 products
            const initial = products.slice(0, 3);
            setDisplayedProducts(initial);
            // Keep remaining products in pool
            setProductPool(products.slice(3));
        }
    }, [products]);

    // Detect removed cart items and add them back to recommendations
    // Detect removed cart items and add them back to recommendations
    useEffect(() => {
        const currentIds = new Set(cartItems.map(item => item.id)); // Line item IDs

        // Find items that were removed (present in prev but not current)
        const removedItems = prevCartItemsRef.current.filter(item => !currentIds.has(item.id));

        // Get product IDs of removed items
        const removedProductIds = new Set(removedItems.map(item => item.productId));

        // Add removed products back to displayed products if they exist in original products
        removedProductIds.forEach(removedProductId => {
            // Compare String(p.id) with removedProductId (string)
            const product = products.find(p => String(p.id) === removedProductId);

            // Check if product exists and is not currently displayed
            if (product && !displayedProducts.some(dp => String(dp.id) === removedProductId)) {
                setDisplayedProducts(prev => [...prev, product]);
            }
        });

        // Update ref for next comparison
        prevCartItemsRef.current = cartItems;
    }, [cartItems, products, displayedProducts]);

    const handleAddToCart = (product: UpsellProduct) => {
        const isInCart = cartItems.some(item => item.productId === String(product.id));
        if (isInCart) {
            toast.info("Item already in cart");
            return;
        }

        addToCart({
            productId: String(product.id),
            quantity: 1,
        });
        toast.success("Added to cart");

        // Replace logic (keep existing UI logic)

        // Replace the added product with a new one from the pool
        setDisplayedProducts(prev => {
            const index = prev.findIndex(p => p.id === product.id);
            if (index === -1) return prev;

            // Find a product from pool that isn't already displayed or in cart
            const displayedIds = new Set(prev.map(p => String(p.id)));
            const cartProductIds = new Set(cartItems.map(item => item.productId));
            const availableProducts = productPool.filter(p =>
                !displayedIds.has(String(p.id)) && !cartProductIds.has(String(p.id))
            );

            if (availableProducts.length > 0) {
                // Get the first available product
                const newProduct = availableProducts[0];

                // Remove the new product from pool
                setProductPool(prevPool => prevPool.filter(p => p.id !== newProduct.id));

                // Replace the product at the same index
                const updated = [...prev];
                updated[index] = newProduct;
                return updated;
            }

            // If no more products available, just hide the added one
            return prev.filter(p => p.id !== product.id);
        });
    };

    if (displayedProducts.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-card border border-black/6 p-6">
            <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-4">
                Recommended Add-ons
            </h3>
            <div className="space-y-4">
                {displayedProducts
                    .filter(product => !cartItems.some(item => item.productId === String(product.id)))
                    .map((product) => (
                        <div key={product.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-[#F9FBFD] rounded-input shrink-0 relative overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-[16px] font-semibold text-[#0B1F51] leading-[130%]">
                                        {product.name}
                                    </h4>
                                    {product.tag && (
                                        <span className="text-[10px] font-bold text-white bg-[#00C4CC] px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            {product.tag}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] text-gray-500 mb-2 line-clamp-1">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[16px] font-bold text-[#0B1F51]">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        <span className="text-[12px] text-gray-400 line-through">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(product)}
                                        className="h-8 rounded-full px-4 text-[13px] bg-[#0B1F51] text-white hover:bg-[#00C4CC]"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
