"use client";

import { motion } from 'motion/react';
import { TrendingUp, Clock, ChevronRight } from 'lucide-react';
import type { TrendingTagsProps } from '../types';

export function TrendingTags({
    trendingSearches,
    recentSearches,
    onTagClick,
    onClearRecent,
}: TrendingTagsProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="w-full px-6 md:px-8 pb-6 space-y-6"
        >
            {/* Trending Searches */}
            <div>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 mb-4 text-[#31CDD4] text-sm font-bold uppercase tracking-wider"
                >
                    <TrendingUp className="w-4 h-4" />
                    Trending
                </motion.div>
                <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, index) => (
                        <motion.button
                            key={term}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.45 + (index * 0.05) }}
                            onClick={() => onTagClick(term)}
                            className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-[#31CDD4]/10 hover:text-[#31CDD4] rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
                        >
                            {term}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider"
                        >
                            <Clock className="w-4 h-4" />
                            Recent
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            onClick={onClearRecent}
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                            Clear All
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {recentSearches.map((term, index) => (
                            <motion.button
                                key={term}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 + (index * 0.05) }}
                                onClick={() => onTagClick(term)}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left group"
                            >
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-[#1C2A54] dark:group-hover:text-white font-medium truncate">
                                    {term}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#31CDD4] shrink-0 ml-2" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
