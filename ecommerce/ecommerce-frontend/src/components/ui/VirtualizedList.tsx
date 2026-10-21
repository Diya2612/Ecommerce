"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
    type CSSProperties,
} from 'react';

interface VirtualizedListProps<T> {
    /** Array of items to render */
    items: T[];
    /** Height of each item (or function to calculate) */
    itemHeight: number | ((item: T, index: number) => number);
    /** Render function for each item */
    renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
    /** Number of items to render above/below visible area */
    overscan?: number;
    /** Container height (defaults to 100vh) */
    containerHeight?: number | string;
    /** Custom container className */
    className?: string;
    /** Key extractor for items */
    keyExtractor?: (item: T, index: number) => string;
    /** Empty state to render */
    emptyState?: ReactNode;
    /** Loading state */
    isLoading?: boolean;
    /** Loading indicator */
    loadingIndicator?: ReactNode;
    /** Called when scrolled near bottom */
    onEndReached?: () => void;
    /** Threshold for end reached (0-1) */
    endReachedThreshold?: number;
}

/**
 * Virtualized list component for rendering large lists efficiently
 * Only renders items visible in the viewport plus overscan
 */
export function VirtualizedList<T>({
    items,
    itemHeight,
    renderItem,
    overscan = 3,
    containerHeight = '100%',
    className = '',
    keyExtractor,
    emptyState,
    isLoading,
    loadingIndicator,
    onEndReached,
    endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerClientHeight, setContainerClientHeight] = useState(0);
    const endReachedCalled = useRef(false);

    // Calculate item heights
    const getItemHeight = useCallback(
        (index: number): number => {
            if (typeof itemHeight === 'function') {
                return itemHeight(items[index], index);
            }
            return itemHeight;
        },
        [itemHeight, items]
    );

    // Calculate total height and item positions
    const { totalHeight, itemPositions } = useMemo(() => {
        let totalHeight = 0;
        const positions: number[] = [];

        for (let i = 0; i < items.length; i++) {
            positions.push(totalHeight);
            totalHeight += getItemHeight(i);
        }

        return { totalHeight, itemPositions: positions };
    }, [items.length, getItemHeight]);

    // Find visible range using binary search
    const visibleRange = useMemo(() => {
        if (items.length === 0) {
            return { start: 0, end: 0 };
        }

        // Binary search for start index
        let start = 0;
        let end = items.length - 1;

        while (start < end) {
            const mid = Math.floor((start + end) / 2);
            if (itemPositions[mid] + getItemHeight(mid) < scrollTop) {
                start = mid + 1;
            } else {
                end = mid;
            }
        }

        const startIndex = Math.max(0, start - overscan);

        // Find end index
        let endIndex = startIndex;
        let accumulatedHeight = itemPositions[startIndex] || 0;

        while (
            endIndex < items.length &&
            accumulatedHeight < scrollTop + containerClientHeight
        ) {
            accumulatedHeight += getItemHeight(endIndex);
            endIndex++;
        }

        endIndex = Math.min(items.length, endIndex + overscan);

        return { start: startIndex, end: endIndex };
    }, [items.length, scrollTop, containerClientHeight, itemPositions, getItemHeight, overscan]);

    // Handle scroll
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        setScrollTop(container.scrollTop);

        // Check for end reached
        if (onEndReached) {
            const { scrollHeight, scrollTop, clientHeight } = container;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            if (scrollPercentage >= endReachedThreshold) {
                if (!endReachedCalled.current) {
                    endReachedCalled.current = true;
                    onEndReached();
                }
            } else {
                endReachedCalled.current = false;
            }
        }
    }, [onEndReached, endReachedThreshold]);

    // Update container height on resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateHeight = () => {
            setContainerClientHeight(container.clientHeight);
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    // Empty state
    if (items.length === 0 && !isLoading) {
        return <>{emptyState}</>;
    }

    // Visible items
    const visibleItems = items.slice(visibleRange.start, visibleRange.end);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`overflow-auto will-change-scroll ${className}`}
            style={{ height: containerHeight }}
        >
            {/* Spacer for total height */}
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((item, relativeIndex) => {
                    const actualIndex = visibleRange.start + relativeIndex;
                    const top = itemPositions[actualIndex];
                    const height = getItemHeight(actualIndex);

                    const style: CSSProperties = {
                        position: 'absolute',
                        top,
                        left: 0,
                        right: 0,
                        height,
                    };

                    const key = keyExtractor
                        ? keyExtractor(item, actualIndex)
                        : actualIndex.toString();

                    return (
                        <div key={key} style={style}>
                            {renderItem(item, actualIndex, style)}
                        </div>
                    );
                })}
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-center py-4">
                    {loadingIndicator || (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#00C4CC] rounded-full animate-spin" />
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Simple windowed list for fixed-height items
 * More lightweight than VirtualizedList
 */
interface WindowedListProps<T> {
    items: T[];
    itemHeight: number;
    renderItem: (item: T, index: number) => ReactNode;
    containerHeight: number;
    overscan?: number;
    className?: string;
}

export function WindowedList<T>({
    items,
    itemHeight,
    renderItem,
    containerHeight,
    overscan = 5,
    className = '',
}: WindowedListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return (
        <div
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, i) => (
                        <div
                            key={startIndex + i}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, startIndex + i)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
