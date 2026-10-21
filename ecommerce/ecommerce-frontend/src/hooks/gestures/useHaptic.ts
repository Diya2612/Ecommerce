"use client";

import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

interface HapticPatterns {
    light: number;
    medium: number;
    heavy: number;
    selection: number;
    success: number[];
    warning: number[];
    error: number[];
}

const HAPTIC_PATTERNS: HapticPatterns = {
    light: 10,
    medium: 20,
    heavy: 40,
    selection: 5,
    success: [20, 50, 20],      // Short-pause-short
    warning: [30, 100, 30],     // Medium-pause-medium
    error: [50, 100, 50, 100, 50], // Long-pause-long-pause-long
};

/**
 * Checks if the Vibration API is available
 */
function isHapticAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Triggers haptic feedback with the specified style
 * @param style - The haptic style to use
 */
function triggerHaptic(style: HapticStyle): boolean {
    if (!isHapticAvailable()) return false;

    const pattern = HAPTIC_PATTERNS[style];
    return navigator.vibrate(pattern);
}

/**
 * Custom hook for haptic feedback integration
 * Provides type-safe haptic feedback methods with fallback handling
 */
export function useHaptic() {
    /**
     * Light haptic - for subtle interactions like hover or focus
     */
    const light = useCallback(() => {
        triggerHaptic('light');
    }, []);

    /**
     * Medium haptic - for standard interactions like button presses
     */
    const medium = useCallback(() => {
        triggerHaptic('medium');
    }, []);

    /**
     * Heavy haptic - for significant actions like deletions
     */
    const heavy = useCallback(() => {
        triggerHaptic('heavy');
    }, []);

    /**
     * Selection haptic - for picker/segment changes
     */
    const selection = useCallback(() => {
        triggerHaptic('selection');
    }, []);

    /**
     * Success haptic - for successful operations
     */
    const success = useCallback(() => {
        triggerHaptic('success');
    }, []);

    /**
     * Warning haptic - for warning states
     */
    const warning = useCallback(() => {
        triggerHaptic('warning');
    }, []);

    /**
     * Error haptic - for error states
     */
    const error = useCallback(() => {
        triggerHaptic('error');
    }, []);

    /**
     * Custom haptic pattern
     * @param pattern - Duration in ms or array of durations for pattern
     */
    const custom = useCallback((pattern: number | number[]) => {
        if (!isHapticAvailable()) return false;
        return navigator.vibrate(pattern);
    }, []);

    /**
     * Stop any ongoing vibration
     */
    const stop = useCallback(() => {
        if (!isHapticAvailable()) return false;
        return navigator.vibrate(0);
    }, []);

    return {
        // Check availability
        isAvailable: isHapticAvailable(),

        // Pre-defined patterns
        light,
        medium,
        heavy,
        selection,
        success,
        warning,
        error,

        // Custom patterns
        custom,
        stop,

        // Direct trigger with style
        trigger: triggerHaptic,
    };
}

// Export standalone trigger for non-hook usage
export { triggerHaptic, isHapticAvailable };
