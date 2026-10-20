/**
 * useTouchGesture Hook
 * Handles touch gestures for mobile interactions (swipe, drag, etc.)
 */

import { useRef, useCallback } from 'react';
import { MOBILE_GESTURE } from '../utils/constants';

export interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface UseTouchGestureOptions {
  /** Callback when drag exceeds threshold */
  onDragThreshold?: () => void;
  /** Current drag offset (for controlled mode) */
  dragOffset?: number;
  /** Callback to update drag offset (for controlled mode) */
  onDragOffsetChange?: (offset: number) => void;
  /** Threshold in pixels before triggering action */
  threshold?: number;
  /** Damping factor for drag resistance (0-1) */
  damping?: number;
}

export interface UseTouchGestureReturn {
  /** Touch event handlers to spread on the element */
  handlers: TouchGestureHandlers;
  /** Current drag offset in pixels */
  dragOffset: number;
  /** Whether currently dragging */
  isDragging: boolean;
}

/**
 * Hook for handling touch gestures (primarily for mobile bottom sheet)
 */
export function useTouchGesture({
  onDragThreshold,
  dragOffset: externalDragOffset,
  onDragOffsetChange,
  threshold = MOBILE_GESTURE.dragThreshold,
  damping = MOBILE_GESTURE.dragDamping,
}: UseTouchGestureOptions = {}): UseTouchGestureReturn {
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const internalDragOffsetRef = useRef<number>(0);

  // Determine if we're in controlled mode
  const isControlled = externalDragOffset !== undefined;
  const dragOffset = isControlled ? externalDragOffset : internalDragOffsetRef.current;

  /**
   * Update drag offset (handles both controlled and uncontrolled)
   */
  const updateDragOffset = useCallback(
    (offset: number) => {
      if (isControlled) {
        onDragOffsetChange?.(offset);
      } else {
        internalDragOffsetRef.current = offset;
      }
    },
    [isControlled, onDragOffsetChange]
  );

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  }, []);

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // Only allow dragging down (positive diff)
      if (diff > 0) {
        updateDragOffset(diff * damping);
      }
    },
    [damping, updateDragOffset]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;

    // Check if drag exceeded threshold
    if (dragOffset > threshold) {
      onDragThreshold?.();
    }

    // Reset drag offset
    updateDragOffset(0);
  }, [dragOffset, threshold, onDragThreshold, updateDragOffset]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    dragOffset,
    isDragging: isDraggingRef.current,
  };
}

/**
 * useSwipeGesture Hook
 * Detects swipe gestures (left, right, up, down)
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface UseSwipeGestureOptions {
  /** Callback when swipe is detected */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Minimum distance in pixels to trigger swipe */
  minSwipeDistance?: number;
}

export interface UseSwipeGestureReturn {
  /** Touch event handlers to spread on the element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipeGesture({
  onSwipe,
  minSwipeDistance = 50,
}: UseSwipeGestureOptions = {}): UseSwipeGestureReturn {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine direction based on largest delta
      if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
        // Horizontal swipe
        onSwipe?.(deltaX > 0 ? 'right' : 'left');
      } else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
        // Vertical swipe
        onSwipe?.(deltaY > 0 ? 'down' : 'up');
      }

      touchStartRef.current = null;
    },
    [onSwipe, minSwipeDistance]
  );

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}
