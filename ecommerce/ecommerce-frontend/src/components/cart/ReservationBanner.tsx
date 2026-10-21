'use client';

import { useReservationTimer } from '@/hooks/cart/useReservationTimer';
import { Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationBannerProps {
    earliestExpiration: string;  // ISO timestamp of earliest expiring item
    itemCount: number;
}

/**
 * Reservation Banner Component
 * 
 * Displays a prominent banner at the top of the cart showing
 * the reservation timer for the earliest expiring item.
 * 
 * @example
 * ```tsx
 * <ReservationBanner
 *   earliestExpiration="2026-01-16T23:30:00Z"
 *   itemCount={3}
 * />
 * ```
 */
export function ReservationBanner({ earliestExpiration, itemCount }: ReservationBannerProps) {
    const { minutes, formatted, isExpired, timeLeft } = useReservationTimer(earliestExpiration);

    if (isExpired) return null;

    const isUrgent = minutes < 5;
    const isCritical = minutes < 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 border-2 ${isCritical
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                    : isUrgent
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
            data-testid="reservation-banner"
        >
            <div className="flex items-center gap-3">
                {isCritical ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </motion.div>
                ) : isUrgent ? (
                    <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
                ) : (
                    <Sparkles className="w-6 h-6 text-blue-600" />
                )}

                <div className="flex-1">
                    <p className={`font-semibold text-sm md:text-base ${isCritical
                            ? 'text-red-900 dark:text-red-200'
                            : isUrgent
                                ? 'text-orange-900 dark:text-orange-200'
                                : 'text-blue-900 dark:text-blue-200'
                        }`}>
                        {isCritical
                            ? '🚨 Reservation expires in less than 1 minute!'
                            : isUrgent
                                ? '⏰ Hurry! Your items are reserved for:'
                                : '✨ Your items are reserved for:'}
                    </p>
                    <p className={`text-2xl md:text-3xl font-mono font-bold mt-1 ${isCritical
                            ? 'text-red-600 dark:text-red-400'
                            : isUrgent
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-blue-600 dark:text-blue-400'
                        }`}>
                        {formatted}
                    </p>
                </div>

                <div className="text-right">
                    <p className={`text-sm font-medium ${isCritical || isUrgent ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Stock reserved</p>
                </div>
            </div>

            {isUrgent && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-3 text-xs md:text-sm ${isCritical
                            ? 'text-red-800 dark:text-red-300 font-semibold'
                            : 'text-orange-800 dark:text-orange-300'
                        }`}
                >
                    {isCritical
                        ? '⚠️ Complete checkout immediately or your reservation will expire and items may go out of stock!'
                        : 'Complete checkout soon or your reservation will expire and items may go out of stock.'}
                </motion.p>
            )}
        </motion.div>
    );
}
