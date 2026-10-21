"use client";

import { useState, useCallback, useRef } from 'react';

interface SwipeActionsOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    disabled?: boolean;
}

interface SwipeActionsState {
    isSwiping: boolean;
    swipeDirection: 'left' | 'right' | null;
    swipeDistance: number;
    swipeProgress: number;
}

export function useSwipeActions({
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    disabled = false,
}: SwipeActionsOptions) {
    const [state, setState] = useState<SwipeActionsState>({
        isSwiping: false,
        swipeDirection: null,
        swipeDistance: 0,
        swipeProgress: 0,
    });

    const startX = useRef(0);
    const startY = useRef(0);
    const isHorizontalSwipe = useRef<boolean | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled) return;

        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isHorizontalSwipe.current = null;

        setState(prev => ({
            ...prev,
            isSwiping: true,
        }));
    }, [disabled]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (disabled || !state.isSwiping) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX.current;
        const deltaY = currentY - startY.current;

        // Determine if horizontal or vertical swipe on first significant movement
        if (isHorizontalSwipe.current === null) {
            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
            }
            return;
        }

        // If vertical swipe, reset and let normal scroll happen
        if (!isHorizontalSwipe.current) {
            setState({
                isSwiping: false,
                swipeDirection: null,
                swipeDistance: 0,
                swipeProgress: 0,
            });
            return;
        }

        // Calculate horizontal swipe distance with rubber-banding
        const absDistance = Math.abs(deltaX);
        const maxDistance = threshold * 1.5;
        const cappedDistance = Math.min(absDistance, maxDistance);
        const rubberBandDistance = cappedDistance > threshold
            ? threshold + (cappedDistance - threshold) * 0.3
            : cappedDistance;

        const direction = deltaX > 0 ? 'right' : 'left';
        const progress = Math.min(rubberBandDistance / threshold, 1);

        setState({
            isSwiping: true,
            swipeDirection: direction,
            swipeDistance: deltaX > 0 ? rubberBandDistance : -rubberBandDistance,
            swipeProgress: progress,
        });
    }, [disabled, state.isSwiping, threshold]);

    const handleTouchEnd = useCallback(() => {
        if (disabled) return;

        const { swipeDirection, swipeProgress } = state;

        // Trigger action if threshold was met
        if (swipeProgress >= 1) {
            if (swipeDirection === 'left' && onSwipeLeft) {
                // Haptic feedback
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate(15);
                }
                onSwipeLeft();
            } else if (swipeDirection === 'right' && onSwipeRight) {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate(15);
                }
                onSwipeRight();
            }
        }

        // Reset state
        setState({
            isSwiping: false,
            swipeDirection: null,
            swipeDistance: 0,
            swipeProgress: 0,
        });
        isHorizontalSwipe.current = null;
    }, [disabled, state, onSwipeLeft, onSwipeRight]);

    const reset = useCallback(() => {
        setState({
            isSwiping: false,
            swipeDirection: null,
            swipeDistance: 0,
            swipeProgress: 0,
        });
    }, []);

    return {
        ...state,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            onTouchCancel: handleTouchEnd,
        },
        reset,
    };
}
