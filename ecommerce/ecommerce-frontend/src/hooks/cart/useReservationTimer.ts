/**
 * Reservation Timer Hook
 * 
 * Manages countdown timer for cart item reservations with automatic expiration detection.
 * Phase 2: Cart Reservations Integration
 */

import { useState, useEffect } from 'react';

export interface ReservationTimerState {
    timeLeft: number;        // Total seconds remaining
    minutes: number;         // Minutes portion
    seconds: number;         // Seconds portion
    isExpired: boolean;      // Whether reservation has expired
    formatted: string;       // Formatted time string (MM:SS)
    percentage: number;      // Percentage of time remaining (0-100)
}

/**
 * Hook to manage reservation countdown timer
 * 
 * @param expiresAt - ISO timestamp when reservation expires
 * @param totalDuration - Total duration in seconds (default 1800 = 30 minutes)
 * @returns Timer state with countdown values and expiration status
 * 
 * @example
 * ```tsx
 * const timer = useReservationTimer('2026-01-16T23:30:00Z');
 * 
 * return (
 *   <div>
 *     {timer.isExpired ? (
 *       <span>Reservation expired</span>
 *     ) : (
 *       <span>Time left: {timer.formatted}</span>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useReservationTimer(
    expiresAt?: string | null,
    totalDuration: number = 1800  // 30 minutes default
): ReservationTimerState {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft(0);
            setIsExpired(false);
            return;
        }

        const calculateTimeLeft = (): number => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                return 0;
            }

            const seconds = Math.floor(diff / 1000);
            setTimeLeft(seconds);
            setIsExpired(false);
            return diff;
        };

        // Initial calculation
        calculateTimeLeft();

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const percentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

    return {
        timeLeft,
        minutes,
        seconds,
        isExpired,
        formatted,
        percentage,
    };
}
