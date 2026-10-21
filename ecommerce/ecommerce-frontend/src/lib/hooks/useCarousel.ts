'use client';

import { useState, useCallback, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseCarouselOptions {
    /** Total number of items in the carousel */
    totalItems: number;
    /** Initial slide index */
    initialIndex?: number;
    /** Enable auto-play */
    autoPlay?: boolean;
    /** Auto-play interval in milliseconds */
    autoPlayInterval?: number;
    /** Enable infinite loop */
    loop?: boolean;
    /** Number of items visible per page (for multi-item carousels) */
    itemsPerPage?: number;
}

export interface UseCarouselReturn {
    /** Current slide index */
    currentIndex: number;
    /** Navigate to next slide */
    goToNext: () => void;
    /** Navigate to previous slide */
    goToPrev: () => void;
    /** Navigate to specific slide index */
    goToIndex: (index: number) => void;
    /** Whether currently on first slide (when not looping) */
    isFirst: boolean;
    /** Whether currently on last slide (when not looping) */
    isLast: boolean;
    /** Whether can navigate to next */
    canGoNext: boolean;
    /** Whether can navigate to previous */
    canGoPrev: boolean;
    /** Total number of pages (for multi-item carousels) */
    totalPages: number;
    /** Current page number (0-indexed) */
    currentPage: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useCarousel - Stateful hook for carousel navigation
 * 
 * @example Basic usage
 * ```tsx
 * const { currentIndex, goToNext, goToPrev } = useCarousel({
 *   totalItems: products.length,
 * });
 * ```
 * 
 * @example With auto-play
 * ```tsx
 * const carousel = useCarousel({
 *   totalItems: 5,
 *   autoPlay: true,
 *   autoPlayInterval: 3000,
 *   loop: true,
 * });
 * ```
 * 
 * @example Multi-item carousel (2 items per page)
 * ```tsx
 * const carousel = useCarousel({
 *   totalItems: 8,
 *   itemsPerPage: 2,
 * });
 * ```
 */
export function useCarousel({
    totalItems,
    initialIndex = 0,
    autoPlay = false,
    autoPlayInterval = 3000,
    loop = true,
    itemsPerPage = 1,
}: UseCarouselOptions): UseCarouselReturn {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Calculate total pages for multi-item carousels
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage);

    // Navigation functions
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => {
            if (itemsPerPage > 1) {
                // Multi-item carousel: navigate by page
                const nextPage = currentPage + 1;
                if (loop) {
                    return nextPage >= totalPages ? 0 : nextPage * itemsPerPage;
                }
                return nextPage >= totalPages ? prev : nextPage * itemsPerPage;
            }

            // Single item carousel
            if (loop) {
                return prev === totalItems - 1 ? 0 : prev + 1;
            }
            return prev === totalItems - 1 ? prev : prev + 1;
        });
    }, [totalItems, loop, itemsPerPage, currentPage, totalPages]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => {
            if (itemsPerPage > 1) {
                // Multi-item carousel: navigate by page
                const prevPage = currentPage - 1;
                if (loop) {
                    return prevPage < 0 ? (totalPages - 1) * itemsPerPage : prevPage * itemsPerPage;
                }
                return prevPage < 0 ? prev : prevPage * itemsPerPage;
            }

            // Single item carousel
            if (loop) {
                return prev === 0 ? totalItems - 1 : prev - 1;
            }
            return prev === 0 ? prev : prev - 1;
        });
    }, [totalItems, loop, itemsPerPage, currentPage, totalPages]);

    const goToIndex = useCallback((index: number) => {
        if (index >= 0 && index < totalItems) {
            setCurrentIndex(index);
        }
    }, [totalItems]);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || totalItems <= 1) return;

        const interval = setInterval(goToNext, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, goToNext, totalItems]);

    // Calculate navigation availability
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalItems - 1;
    const canGoNext = loop || currentIndex < totalItems - 1;
    const canGoPrev = loop || currentIndex > 0;

    return {
        currentIndex,
        goToNext,
        goToPrev,
        goToIndex,
        isFirst,
        isLast,
        canGoNext,
        canGoPrev,
        totalPages,
        currentPage,
    };
}
