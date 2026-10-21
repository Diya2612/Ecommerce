"use client";

import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
    pullProgress: number;
    isRefreshing: boolean;
    pullDistance: number;
}

export function PullToRefreshIndicator({
    pullProgress,
    isRefreshing,
    pullDistance,
}: PullToRefreshIndicatorProps) {
    if (pullDistance <= 0 && !isRefreshing) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: pullProgress > 0.2 ? 1 : pullProgress * 5,
                y: isRefreshing ? 0 : Math.min(pullDistance - 30, 20),
            }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-1/2 -translate-x-1/2 top-2 z-30"
        >
            <div className="bg-white dark:bg-slate-800 rounded-full p-2.5 shadow-lg border border-gray-100 dark:border-slate-700">
                <motion.div
                    animate={{
                        rotate: isRefreshing ? 360 : pullProgress * 180,
                        scale: isRefreshing ? 1 : 0.8 + pullProgress * 0.2,
                    }}
                    transition={{
                        rotate: isRefreshing
                            ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                            : { duration: 0 },
                    }}
                >
                    <RefreshCw
                        className={`w-5 h-5 ${pullProgress >= 1 || isRefreshing
                                ? 'text-[#00C4CC]'
                                : 'text-gray-400'
                            }`}
                    />
                </motion.div>
            </div>

            {/* Progress ring */}
            {!isRefreshing && pullProgress > 0 && (
                <svg
                    className="absolute inset-0 w-10 h-10 -rotate-90"
                    viewBox="0 0 40 40"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-200 dark:text-slate-700"
                    />
                    <motion.circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        className="text-[#00C4CC]"
                        style={{
                            strokeDasharray: 113,
                            strokeDashoffset: 113 - (113 * pullProgress),
                        }}
                    />
                </svg>
            )}
        </motion.div>
    );
}
