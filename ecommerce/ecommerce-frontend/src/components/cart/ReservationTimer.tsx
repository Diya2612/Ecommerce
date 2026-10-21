'use client';

import { useReservationTimer } from '@/hooks/cart/useReservationTimer';
import { Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface ReservationTimerProps {
    expiresAt: string;
    onExpired?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

/**
 * Reservation Timer Component
 * 
 * Displays a countdown timer for cart item reservations.
 * Automatically detects expiration and triggers callback.
 * 
 * @example
 * ```tsx
 * <ReservationTimer
 *   expiresAt="2026-01-16T23:30:00Z"
 *   onExpired={() => refetchCart()}
 *   size="md"
 * />
 * ```
 */
export function ReservationTimer({
    expiresAt,
    onExpired,
    size = 'md',
    showIcon = true
}: ReservationTimerProps) {
    const { minutes, seconds, isExpired, timeLeft, percentage } = useReservationTimer(expiresAt);

    // Call onExpired callback when timer hits 0
    useEffect(() => {
        if (isExpired && onExpired) {
            onExpired();
        }
    }, [isExpired, onExpired]);

    const isLowTime = timeLeft < 300;  // Less than 5 minutes
    const isCritical = timeLeft < 60;  // Less than 1 minute

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    if (isExpired) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 text-red-600 ${sizeClasses[size]} font-medium`}
                data-testid="reservation-expired"
            >
                {showIcon && <AlertTriangle className={iconSizes[size]} />}
                <span>Reservation expired</span>
            </motion.div>
        );
    }

    return (
        <div
            className={`flex items-center gap-2 ${sizeClasses[size]} ${isCritical ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'
                }`}
            data-testid="reservation-timer"
        >
            {showIcon && (
                <Clock className={`${iconSizes[size]} ${isCritical ? 'animate-pulse' : ''}`} />
            )}
            <span className="font-mono font-medium">
                Reserved: {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            {isLowTime && !isCritical && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 px-2 py-0.5 rounded-full">
                    Hurry!
                </span>
            )}
            {isCritical && (
                <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full font-bold"
                >
                    Expires soon!
                </motion.span>
            )}
        </div>
    );
}
