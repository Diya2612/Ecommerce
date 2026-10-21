'use client';

import React from 'react';
import Image from 'next/image';
import { Check, ShoppingCart, Heart, Star, Shield, Truck, Droplets, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatPrice, calculateDiscount } from '@/lib/utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

export interface QuickViewProduct {
    id: number | string;
    name: string;
    description?: string;
    tags: string[];
    rating?: number;
    reviews?: number;
    price: number;
    originalPrice: number;
    image: string;
    inStock?: boolean;
    total_stock?: number;
}

export interface QuickViewDialogProps {
    product: QuickViewProduct;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onAddToCart?: () => void;
    onToggleWishlist?: () => void;
    isAddingToCart?: boolean;
    isWishlisted?: boolean;
    trigger?: React.ReactNode;
}

export const QuickViewDialog: React.FC<QuickViewDialogProps> = ({
    product,
    isOpen,
    onOpenChange,
    onAddToCart,
    onToggleWishlist,
    isAddingToCart = false,
    isWishlisted = false,
    trigger,
}) => {
    const [quantity, setQuantity] = React.useState(1);
    const discount = calculateDiscount(product.originalPrice, product.price);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const highlights = [
        { icon: Shield, text: '1 Year Warranty', color: 'text-blue-500' },
        { icon: Truck, text: 'Free Installation', color: 'text-green-500' },
        { icon: Droplets, text: 'Pure & Mineral-rich', color: 'text-cyan-500' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[32px] gap-0">
                <div className="grid md:grid-cols-12 gap-0 min-h-[500px]">
                    {/* Left: Image Section */}
                    <div className="md:col-span-6 bg-gray-50/50 p-6 md:p-12 flex flex-col items-center justify-center relative border-r border-gray-100/50">
                        {/* New Arrival Badge */}
                        <div className="absolute top-6 left-6 z-10">
                            <Badge className="bg-[#00C4CC]/10 text-[#00C4CC] hover:bg-[#00C4CC]/20 border-none px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.1em]">
                                NEW ARRIVAL
                            </Badge>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative w-full h-[300px] md:h-full max-h-[450px]"
                        >
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </motion.div>
                    </div>

                    {/* Right: Details Section */}
                    <div className="md:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-white">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <div className="mb-8">
                                <p className="text-[13px] font-bold text-[#00C4CC] uppercase tracking-[0.2em] mb-3">
                                    {product.tags.join(' • ') || 'WATER PURIFIER'}
                                </p>

                                <DialogTitle className="text-[40px] font-bold text-[#0B1F51] mb-3 tracking-tight leading-[1.1]">
                                    {product.name}
                                </DialogTitle>



                                <DialogDescription className="text-gray-600 text-base leading-relaxed mb-8 max-w-[90%]">
                                    {product.description || "Advanced purification technology ensures pure, healthy, and mineral-rich water for your family with every drop."}
                                </DialogDescription>

                                {/* Price & Savings */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-[36px] font-bold text-[#0B1F51]">
                                            {formatPrice(product.price)}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[18px] text-gray-400 line-through">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                            <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-green-100 rounded-full px-3">
                                                Save {discount}%
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {/* Stock Badge */}
                                    <div className="ml-auto">
                                        {(product.total_stock !== undefined && product.total_stock > 0 && product.total_stock < 10) ? (
                                            <Badge variant="outline" className="border-orange-100 bg-orange-50 text-orange-700 rounded-full px-4 py-1.5 font-bold animate-pulse">
                                                Only {product.total_stock} Left
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 font-bold flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Ready to Ship
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Highlights */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                                    {highlights.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-50">
                                            <item.icon className={cn("w-5 h-5", item.color)} />
                                            <span className="text-xs font-bold text-gray-700 leading-none">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions Group */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    {/* Quantity Toggle */}
                                    <div className="flex items-center h-14 bg-gray-50 rounded-2xl px-2 border border-gray-100">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 text-gray-500 hover:text-[#0B1F51]"
                                            onClick={() => handleQuantityChange(-1)}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-10 text-center font-bold text-[#0B1F51]">{quantity}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 text-gray-500 hover:text-[#0B1F51]"
                                            onClick={() => handleQuantityChange(1)}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Main CTA */}
                                    <Button
                                        onClick={onAddToCart}
                                        disabled={isAddingToCart}
                                        className="flex-1 bg-[#0B1F51] hover:bg-[#152C6B] text-white h-14 rounded-2xl text-[16px] font-bold shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98]"
                                    >
                                        {isAddingToCart ? (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-5 h-5" /> Added to Cart
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShoppingCart className="w-5 h-5" /> Add to Cart
                                            </span>
                                        )}
                                    </Button>

                                    {/* Wishlist */}
                                    <Button
                                        onClick={onToggleWishlist}
                                        variant="outline"
                                        className={cn(
                                            "w-14 h-14 rounded-2xl border-2 p-0 flex items-center justify-center transition-all",
                                            isWishlisted
                                                ? "border-red-100 bg-red-50 text-[#EF4444]"
                                                : "border-gray-100 hover:bg-gray-50 text-gray-600 hover:border-[#0B1F51]/20"
                                        )}
                                    >
                                        <Heart className={cn("w-6 h-6", isWishlisted && "fill-current")} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
