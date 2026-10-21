'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { CarouselControls } from './CarouselControls';

// ============================================================================
// Types
// ============================================================================

export interface MobileCarouselProps<T> {
    /** Array of items to display */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Key extractor for each item */
    keyExtractor?: (item: T, index: number) => string | number;
    /** Whether to show navigation controls */
    showControls?: boolean;
    /** Whether to show pagination dots */
    showDots?: boolean;
    /** Vertical position of controls (CSS class) */
    controlsPosition?: string;
    /** Enable infinite loop */
    loop?: boolean;
    /** Enable auto-play */
    autoPlay?: boolean;
    /** Auto-play interval in milliseconds */
    autoPlayInterval?: number;
    /** Additional CSS classes for container */
    className?: string;
    /** Additional CSS classes for each item wrapper */
    itemClassName?: string;
    /** Animation type */
    animationType?: 'slide' | 'fade';
}

// ============================================================================
// Animation Configurations
// ============================================================================

const slideTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

// ============================================================================
// Component
// ============================================================================

/**
 * MobileCarousel - Generic carousel component for mobile views
 * 
 * @example Basic usage with products
 * ```tsx
 * <MobileCarousel
 *   items={products}
 *   keyExtractor={(product) => product.id.toString()}
 *   renderItem={(product) => (
 *     <ProductCard product={product} />
 *   )}
 * />
 * ```
 * 
 * @example With auto-play and custom controls position
 * ```tsx
 * <MobileCarousel
 *   items={testimonials}
 *   renderItem={(t) => <TestimonialCard {...t} />}
 *   autoPlay={true}
 *   autoPlayInterval={5000}
 *   controlsPosition="top-[200px]"
 *   showDots={true}
 * />
 * ```
 * 
 * @example Without controls (swipe only)
 * ```tsx
 * <MobileCarousel
 *   items={images}
 *   renderItem={(src) => <Image src={src} />}
 *   showControls={false}
 *   showDots={true}
 * />
 * ```
 */
export function MobileCarousel<T>({
    items,
    renderItem,
    keyExtractor = (_, index) => index,
    showControls = true,
    showDots = true,
    controlsPosition = 'top-[160px] -translate-y-1/2',
    loop = true,
    autoPlay = false,
    autoPlayInterval = 3000,
    className,
    itemClassName,
    animationType = 'slide',
}: MobileCarouselProps<T>) {
    const {
        currentIndex,
        goToNext,
        goToPrev,
        goToIndex,
        canGoNext,
        canGoPrev,
    } = useCarousel({
        totalItems: items.length,
        loop,
        autoPlay,
        autoPlayInterval,
    });

    // Don't render if no items
    if (items.length === 0) {
        return null;
    }

    // Single item - no carousel needed
    if (items.length === 1) {
        return (
            <div className={cn("relative", className)}>
                <div className={cn("px-2", itemClassName)}>
                    {renderItem(items[0], 0)}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {/* Carousel Container */}
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={slideTransition}
                >
                    {items.map((item, index) => (
                        <div
                            key={keyExtractor(item, index)}
                            className={cn("w-full shrink-0 px-2", itemClassName)}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Controls */}
            {showControls && (
                <CarouselControls
                    onPrev={goToPrev}
                    onNext={goToNext}
                    disablePrev={!canGoPrev}
                    disableNext={!canGoNext}
                    variant="floating"
                    verticalPosition={controlsPosition}
                />
            )}

            {/* Pagination Dots */}
            {showDots && (
                <div className="flex justify-center gap-2 mt-8">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "w-8 bg-[#0B1F51]"
                                    : "w-2 bg-gray-300 hover:bg-gray-400"
                            )}
                            onClick={() => goToIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MobileCarousel;
