'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import type { ProductDetail, ProductBundle } from '@/types/product';

interface ProductBundlesClientProps {
    mainProduct: ProductDetail;
    bundles: ProductBundle[];
}

/**
 * ProductBundlesClient - Client Component
 * 
 * Displays bundle deals and handles adding bundles to cart
 * Receives data from parent server component
 */
export function ProductBundlesClient({ mainProduct, bundles }: ProductBundlesClientProps) {
    const { addToCart } = useCart();

    const handleAddBundle = async (bundle: ProductBundle) => {
        try {
            const promises = [];

            // Add main product
            promises.push(addToCart({
                productId: String(mainProduct.id),
                quantity: 1,
                variant: "Part of Bundle" // Meta-data
            }));

            // Add bundle items
            // Note: In real app, maybe we just send bundleId to backend and backend adds all items?
            // But current API expects items.
            // Also, we need `productId` for bundle items. `ProductBundle["items"]` has `id`?
            // Assuming `item` in `bundle.items` has a valid product ID.
            // The mock/type def says `ProductBundleItem`.

            bundle.items.forEach((item) => {
                // If item has an ID (it should), use it.
                // If mock IDs were numbers, convert.
                promises.push(addToCart({
                    productId: String(item.id), // BundleItem has id now
                    quantity: 1,
                    bundleId: String(bundle.id),
                    variant: "Bundle Add-on"
                }));
            });

            await Promise.all(promises);
            toast.success("Bundle added to cart successfully!");
        } catch (error) {
            console.error("Failed to add bundle", error);
            // Context handles error toast
        }
    };

    if (bundles.length === 0) return null;

    return (
        <div className="mt-12 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-[22px] font-bold text-[#0B1F51]">Bundle Deals</h3>
                <Badge className="bg-[#F5B012] text-white hover:bg-[#F5B012]">Save up to 20%</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                    <motion.div
                        key={bundle.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white border border-black/6 rounded-card p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Discount Tag */}
                        <div className="absolute top-4 right-4 z-10">
                            <Badge className="bg-[#22C55E] text-white border-none px-3 py-1">
                                Save {Math.round(((bundle.originalPrice - bundle.totalPrice) / bundle.originalPrice) * 100)}%
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            {/* Main Product Image */}
                            <div className="relative w-24 h-24 bg-gray-50 rounded-input p-2 flex items-center justify-center border border-gray-100">
                                <Image
                                    src={mainProduct.images?.[0] || mainProduct.image}
                                    alt={mainProduct.name}
                                    fill
                                    className="object-contain mix-blend-multiply p-2"
                                />
                            </div>

                            {/* Plus Icon */}
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                <Plus className="w-4 h-4" />
                            </div>

                            {/* Bundle Item Image */}
                            <div className="relative w-24 h-24 bg-gray-50 rounded-input p-2 flex items-center justify-center border border-gray-100">
                                <Image
                                    src={bundle.items[0]?.image || '/placeholder.png'}
                                    alt={bundle.items[0]?.name || 'Bundle item'}
                                    fill
                                    className="object-cover rounded-[8px]"
                                />
                            </div>
                        </div>

                        <h4 className="font-semibold text-[#0B1F51] text-lg mb-2">{bundle.name}</h4>
                        <div className="text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="w-4 h-4 text-[#22C55E]" />
                                <span>{mainProduct.name}</span>
                            </div>
                            {bundle.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[#22C55E]" />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <div>
                                <div className="text-2xl font-bold text-[#0B1F51]">₹{bundle.totalPrice.toLocaleString()}</div>
                                <div className="text-sm text-gray-400 line-through">₹{bundle.originalPrice.toLocaleString()}</div>
                            </div>
                            <Button
                                onClick={() => handleAddBundle(bundle)}
                                className="bg-[#0B1F51] hover:bg-[#152C6B] text-white rounded-[10px]"
                            >
                                Add Bundle
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
