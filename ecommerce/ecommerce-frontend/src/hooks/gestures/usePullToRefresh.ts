"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPull?: number;
    resistance?: number;
    disabled?: boolean;
}

interface PullToRefreshState {
    isPulling: boolean;
    isRefreshing: boolean;
    pullDistance: number;
    pullProgress: number;
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    maxPull = 150,
    resistance = 2.5,
    disabled = false,
}: PullToRefreshOptions) {
    const [state, setState] = useState<PullToRefreshState>({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        pullProgress: 0,
    });

    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrolledToTop = useRef(true);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (disabled || state.isRefreshing) return;

        const container = containerRef.current;
        if (!container) return;

        // Check if we're scrolled to top
        isScrolledToTop.current = container.scrollTop <= 0;

        if (isScrolledToTop.current) {
            startY.current = e.touches[0].clientY;
        }
    }, [disabled, state.isRefreshing]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (disabled || state.isRefreshing || !isScrolledToTop.current) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY.current;

        if (deltaY > 0) {
            // Apply resistance to make pulling feel natural
            const pullDistance = Math.min(deltaY / resistance, maxPull);
            const pullProgress = Math.min(pullDistance / threshold, 1);

            setState(prev => ({
                ...prev,
                isPulling: true,
                pullDistance,
                pullProgress,
            }));

            // Prevent default scroll behavior when pulling
            if (pullDistance > 0) {
                e.preventDefault();
            }
        }
    }, [disabled, state.isRefreshing, resistance, maxPull, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (disabled || state.isRefreshing) return;

        const shouldRefresh = state.pullDistance >= threshold;

        if (shouldRefresh) {
            setState(prev => ({
                ...prev,
                isRefreshing: true,
                pullDistance: threshold / 2,
                pullProgress: 1,
            }));

            try {
                await onRefresh();
            } finally {
                setState({
                    isPulling: false,
                    isRefreshing: false,
                    pullDistance: 0,
                    pullProgress: 0,
                });
            }
        } else {
            setState({
                isPulling: false,
                isRefreshing: false,
                pullDistance: 0,
                pullProgress: 0,
            });
        }
    }, [disabled, state.isRefreshing, state.pullDistance, threshold, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        ...state,
    };
}
