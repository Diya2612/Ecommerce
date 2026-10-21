"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ProductCardClient } from './ProductCardClient';
import { CarouselControls } from '@/components/carousel/CarouselControls';
import type { Product } from '@/types/home';

interface FeaturedProductsCarouselProps {
    products: Product[];
}

/**
 * FeaturedProductsCarousel - Refined Client Component
 * 
 * Implements a truly infinite loop using item cloning and index management.
 * Features:
 * - Single item movement per click
 * - Smooth spring-based transitions
 * - Side-mounted absolute controls
 * - Infinite loop without blank spaces
 */
export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
    const [visibleItems, setVisibleItems] = useState(4);
    
    // Update visible items based on window size
    useEffect(() => {
        const updateVisibleItems = () => {
            if (window.innerWidth >= 1280) setVisibleItems(4);
            else if (window.innerWidth >= 1024) setVisibleItems(3);
            else if (window.innerWidth >= 768) setVisibleItems(2);
            else setVisibleItems(1);
        };

        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, []);

    // We clone elements to ensure no blank spaces during transitions
    const clonedItems = useMemo(() => {
        if (!products.length) return [];
        // We clone exactly the number of visible items to facilitate the loop
        const startClones = products.slice(-visibleItems);
        const endClones = products.slice(0, visibleItems);
        return [...startClones, ...products, ...endClones];
    }, [products, visibleItems]);

    // Initial index is the offset of the clones at the start
    const [currentIndex, setCurrentIndex] = useState(visibleItems);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNext = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    }, [isTransitioning]);

    const handlePrev = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    }, [isTransitioning]);

    // Handle the infinite loop jump
    useEffect(() => {
        if (!isTransitioning) return;

        const timer = setTimeout(() => {
            setIsTransitioning(false);
            
            // If we reached the end clones, jump back to the start of original items
            if (currentIndex >= products.length + visibleItems) {
                setCurrentIndex(visibleItems);
            }
            // If we reached the start clones, jump to the end of original items
            else if (currentIndex <= 0) {
                setCurrentIndex(products.length);
            }
        }, 600); // Must match transition duration

        return () => clearTimeout(timer);
    }, [currentIndex, products.length, visibleItems, isTransitioning]);

    if (!products || products.length === 0) return null;

    // Viewport relative percentage for one item
    const itemWidthPercent = 100 / visibleItems;

    return (
        <div className="relative group/carousel px-4 sm:px-16">
            {/* Navigation Controls - Side Positioned */}
            <CarouselControls
                onPrev={handlePrev}
                onNext={handleNext}
                disablePrev={false}
                disableNext={false}
                variant="floating"
                size="lg"
                verticalPosition="top-1/2 -translate-y-1/2"
                className="hidden lg:flex opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            />

            {/* Mobile/Small Screen Controls */}
            <div className="flex lg:hidden justify-end mb-4 gap-2">
                 <CarouselControls
                    onPrev={handlePrev}
                    onNext={handleNext}
                    variant="compact"
                    size="sm"
                    className="flex"
                />
            </div>

            {/* Carousel Container */}
            <div className="overflow-hidden">
                <motion.div
                    className="flex"
                    animate={{
                        // This is the key fix: move by the percentage relative to the VIEWPORT
                        // Since motion calculates percentage relative to the element, 
                        // we must convert viewport-relative to element-relative.
                        x: `-${(currentIndex * itemWidthPercent) / (clonedItems.length / visibleItems)}%`,
                    }}
                    transition={isTransitioning ? {
                        type: "spring",
                        stiffness: 100,
                        damping: 24,
                        mass: 0.8
                    } : { duration: 0 }}
                    style={{
                        width: `${(clonedItems.length / visibleItems) * 100}%`,
                    }}
                >
                    {clonedItems.map((product, idx) => (
                        <div 
                            key={`${product.id}-${idx}`} 
                            style={{ 
                                width: `${100 / clonedItems.length}%`,
                            }}
                            className="px-4"
                        >
                            <ProductCardClient
                                product={product}
                                productHref={`/collections/${product.slug || product.id}`}
                                showQuickView={true}
                                imageHeight="h-[320px]"
                                animateEntrance={false}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Progress/Indicator */}
            <div className="mt-12 flex justify-center gap-2">
                {products.map((_, idx) => {
                    // Logic to find which original item is "active"
                    const normalizedIndex = (currentIndex - visibleItems + products.length) % products.length;
                    const isActive = normalizedIndex === idx;

                    return (
                        <div 
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'w-8 bg-[#00C4CC]' : 'w-2 bg-gray-200'}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
