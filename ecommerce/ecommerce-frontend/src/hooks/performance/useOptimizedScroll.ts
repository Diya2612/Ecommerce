"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Throttle function with requestAnimationFrame
 */
function rafThrottle<T extends (...args: unknown[]) => void>(fn: T): T {
    let ticking = false;
    let lastArgs: Parameters<T> | null = null;

    const throttled = (...args: Parameters<T>) => {
        lastArgs = args;

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                if (lastArgs) {
                    fn(...lastArgs);
                }
                ticking = false;
                lastArgs = null;
            });
        }
    };

    return throttled as T;
}

/**
 * Debounce function
 */
function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): T & { cancel: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;

    const debounced = (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced as T & { cancel: () => void };
}

/**
 * Hook for optimized scroll handling with RAF throttling
 */
export function useOptimizedScroll(
    options?: {
        /** Target element ref (defaults to window) */
        element?: React.RefObject<HTMLElement>;
        /** Callback on scroll */
        onScroll?: (scrollInfo: ScrollInfo) => void;
        /** Debounce delay for scroll end detection */
        scrollEndDelay?: number;
    }
) {
    const { element, onScroll, scrollEndDelay = 150 } = options || {};

    const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 0,
        scrollWidth: 0,
        clientHeight: 0,
        clientWidth: 0,
        isScrolling: false,
        direction: 'none',
        progress: 0,
    });

    const lastScrollTop = useRef(0);
    const isScrollingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleScroll = useCallback(
        rafThrottle(() => {
            const target = element?.current || document.documentElement;

            const scrollTop = element?.current
                ? target.scrollTop
                : window.scrollY;
            const scrollLeft = element?.current
                ? target.scrollLeft
                : window.scrollX;

            const scrollHeight = target.scrollHeight;
            const scrollWidth = target.scrollWidth;
            const clientHeight = element?.current
                ? target.clientHeight
                : window.innerHeight;
            const clientWidth = element?.current
                ? target.clientWidth
                : window.innerWidth;

            const direction =
                scrollTop > lastScrollTop.current
                    ? 'down'
                    : scrollTop < lastScrollTop.current
                        ? 'up'
                        : 'none';

            const maxScroll = scrollHeight - clientHeight;
            const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

            lastScrollTop.current = scrollTop;

            const newScrollInfo: ScrollInfo = {
                scrollTop,
                scrollLeft,
                scrollHeight,
                scrollWidth,
                clientHeight,
                clientWidth,
                isScrolling: true,
                direction,
                progress,
            };

            setScrollInfo(newScrollInfo);
            onScroll?.(newScrollInfo);

            // Clear existing timeout
            if (isScrollingTimeout.current) {
                clearTimeout(isScrollingTimeout.current);
            }

            // Set scroll end timeout
            isScrollingTimeout.current = setTimeout(() => {
                setScrollInfo((prev) => ({ ...prev, isScrolling: false }));
            }, scrollEndDelay);
        }),
        [element, onScroll, scrollEndDelay]
    );

    useEffect(() => {
        const target = element?.current || window;

        target.addEventListener('scroll', handleScroll, { passive: true });

        // Initial read
        handleScroll();

        return () => {
            target.removeEventListener('scroll', handleScroll);
            if (isScrollingTimeout.current) {
                clearTimeout(isScrollingTimeout.current);
            }
        };
    }, [element, handleScroll]);

    return scrollInfo;
}

interface ScrollInfo {
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
    isScrolling: boolean;
    direction: 'up' | 'down' | 'none';
    progress: number;
}

/**
 * Hook for detecting when user has scrolled past a threshold
 */
export function useScrollThreshold(threshold: number) {
    const [isPastThreshold, setIsPastThreshold] = useState(false);

    useEffect(() => {
        const handleScroll = rafThrottle(() => {
            setIsPastThreshold(window.scrollY > threshold);
        });

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return isPastThreshold;
}

/**
 * Hook for hide-on-scroll behavior (like mobile headers)
 */
export function useHideOnScroll(options?: {
    /** Minimum scroll before hiding (px) */
    threshold?: number;
    /** Always show at top? */
    showAtTop?: boolean;
}) {
    const { threshold = 50, showAtTop = true } = options || {};

    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;

            ticking.current = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (showAtTop && currentScrollY < threshold) {
                    setIsHidden(false);
                } else if (currentScrollY > lastScrollY.current + 10) {
                    // Scrolling down
                    setIsHidden(true);
                } else if (currentScrollY < lastScrollY.current - 10) {
                    // Scrolling up
                    setIsHidden(false);
                }

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold, showAtTop]);

    return isHidden;
}

/**
 * Hook for scroll lock (useful for modals)
 */
export function useScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        const scrollY = window.scrollY;
        const body = document.body;
        const originalStyles = {
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            overflow: body.style.overflow,
        };

        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';

        return () => {
            body.style.position = originalStyles.position;
            body.style.top = originalStyles.top;
            body.style.width = originalStyles.width;
            body.style.overflow = originalStyles.overflow;
            window.scrollTo(0, scrollY);
        };
    }, [isLocked]);
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll(options: {
    /** Callback when bottom is reached */
    onLoadMore: () => void;
    /** Is currently loading? */
    isLoading: boolean;
    /** Has more items to load? */
    hasMore: boolean;
    /** Distance from bottom to trigger (px) */
    threshold?: number;
    /** Element to observe (defaults to window) */
    element?: React.RefObject<HTMLElement>;
}) {
    const {
        onLoadMore,
        isLoading,
        hasMore,
        threshold = 200,
        element,
    } = options;

    const loadMoreCalled = useRef(false);

    useEffect(() => {
        // Reset when loading finishes
        if (!isLoading) {
            loadMoreCalled.current = false;
        }
    }, [isLoading]);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const handleScroll = rafThrottle(() => {
            if (loadMoreCalled.current) return;

            const target = element?.current;
            let distanceFromBottom: number;

            if (target) {
                distanceFromBottom =
                    target.scrollHeight - target.scrollTop - target.clientHeight;
            } else {
                distanceFromBottom =
                    document.documentElement.scrollHeight -
                    window.scrollY -
                    window.innerHeight;
            }

            if (distanceFromBottom < threshold) {
                loadMoreCalled.current = true;
                onLoadMore();
            }
        });

        const scrollTarget = element?.current || window;
        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

        // Check immediately
        handleScroll();

        return () => scrollTarget.removeEventListener('scroll', handleScroll);
    }, [element, hasMore, isLoading, onLoadMore, threshold]);
}

/**
 * Hook for scroll to top
 */
export function useScrollToTop() {
    const scrollToTop = useCallback((smooth = true) => {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }, []);

    return scrollToTop;
}

/**
 * Export utilities
 */
export { rafThrottle, debounce };
