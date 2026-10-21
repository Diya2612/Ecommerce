"use client";

import { motion } from 'motion/react';
import Image from 'next/image';
import { Loader2, ArrowRight, Star } from 'lucide-react';
import type { SearchResultsGridProps } from '../types';
import type { Product } from '@/types/home';
import type { TierNode } from '@/types/tier';
import { cn } from '@/utils/utils';

interface ProductCardProps {
    product: Product;
    onClick: () => void;
    index: number;
    tiers: TierNode[];
}

/**
 * Helper to resolve category name from UUID using tiers hierarchy
 */
function resolveCategoryName(categoryId: string | undefined, tiers: TierNode[]): string {
    if (!categoryId) return 'Product';
    
    // Check if categoryId is a UUID (approximate check - 8-4-4-4-12 pattern)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) return categoryId;

    // Helper for recursive search
    const findInTiers = (nodes: TierNode[]): string | null => {
        for (const node of nodes) {
            if (node.id === categoryId) return node.name;
            if (node.children && node.children.length > 0) {
                const found = findInTiers(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    return findInTiers(tiers) || 'Product';
}

function ProductCard({ product, onClick, index, tiers }: ProductCardProps) {
    const resolvedCategory = resolveCategoryName(product.category, tiers);

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay: 0.1 + (index * 0.05),
                duration: 0.4,
                ease: "easeOut"
            }}
            onClick={onClick}
            className="group relative flex flex-col w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 h-full"
        >
            {/* Image Container - Large & Spacious */}
            <div className="relative aspect-[4/5] w-full bg-gray-50 dark:bg-slate-700/50 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-[#1C2A54] dark:text-[#31CDD4]">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 w-full p-4 text-left space-y-2">
                <div>
                    <p className="text-xs font-medium text-[#31CDD4] uppercase tracking-wider mb-1">
                        {resolvedCategory}
                    </p>
                    <h4 className="text-base font-bold text-[#1C2A54] dark:text-white line-clamp-2 leading-tight group-hover:text-[#31CDD4] transition-colors">
                        {product.name}
                    </h4>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50 dark:border-slate-700/50">
                    <p className="text-lg font-bold text-[#1C2A54] dark:text-white">
                        ₹{product.price.toLocaleString()}
                    </p>
                    {/* Rating - HIDDEN */}
                    {/* {product.rating && (product.reviews || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating}</span>
                        </div>
                    )} */}
                </div>
            </div>
        </motion.button>
    );
}

interface SearchResultsGridPropsWithClass extends SearchResultsGridProps {
    className?: string;
    onViewAllClick?: () => void;
    tiers?: TierNode[];
}

export function SearchResultsGrid({
    results,
    onProductClick,
    onViewAllClick,
    isLoading = false,
    className,
    tiers = []
}: SearchResultsGridPropsWithClass) {
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-20"
            >
                <Loader2 className="w-10 h-10 text-[#31CDD4] animate-spin" />
            </motion.div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    // Show fewer results but larger
    const displayResults = results.slice(0, 4);
    const hasMore = results.length > 4;

    return (
        <div className={cn("w-full px-2 pb-12", className)}>
            {/* Results Grid - Responsive Large Columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {displayResults.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product.slug || product.id)}
                        index={index}
                        tiers={tiers}
                    />
                ))}
            </div>

            {/* View All Link */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onViewAllClick}
                        className="text-sm font-medium text-gray-400 hover:text-[#31CDD4] transition-colors cursor-pointer"
                    >
                        View all {results.length} results
                    </button>
                </div>
            )}
        </div>
    );
}
