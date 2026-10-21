'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import type { TierNode } from '@/types/tier';

interface MegaMenuPanelProps {
    tiers: TierNode[];
    activeTierId: string | null;
    onClose: () => void;
}

/**
 * MegaMenuPanel - Sidebar-style mega menu for tier hierarchy
 * Modified to fit within the integrated Header container
 */
export function MegaMenuPanel({ tiers, activeTierId, onClose }: MegaMenuPanelProps) {
    const activeTier = tiers.find(t => t.id === activeTierId);

    if (!activeTier) return null;

    return (
        <div className="w-full">
            <div className="flex w-full">
                {/* Left Panel: Root Tier Info */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-1/3 bg-linear-to-br from-[#1C2A54] to-[#2a458c] dark:from-slate-900 dark:to-slate-800 p-8 flex flex-col justify-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {activeTier.name}
                    </h3>
                    {activeTier.description && (
                        <p className="text-gray-300 dark:text-gray-400 text-sm mb-6 line-clamp-3">
                            {activeTier.description}
                        </p>
                    )}
                    <Link
                        href={`/products?categories=${activeTier.code}`}
                        className="inline-flex items-center gap-2 text-[#31CDD4] hover:text-white font-semibold text-sm uppercase tracking-wider transition-colors group"
                        onClick={onClose}
                    >
                        View All {activeTier.name}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Right Panel: Children Grid */}
                <div className="flex-1 bg-white dark:bg-slate-900 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Categories
                        </h4>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {activeTier.children && activeTier.children.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.03,
                                    },
                                },
                            }}
                        >
                            {activeTier.children.map((child) => (
                                <motion.div
                                    key={child.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 5 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <Link
                                        href={`/products?categories=${child.code}`}
                                        className="group block p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#31CDD4]/50 hover:bg-[#31CDD4]/5 dark:hover:bg-[#31CDD4]/10 transition-all duration-300"
                                        onClick={onClose}
                                    >
                                        <span className="text-[#1C2A54] dark:text-white font-medium group-hover:text-[#31CDD4] transition-colors">
                                            {child.name}
                                        </span>
                                        {child.usage_count > 0 && (
                                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                                                ({child.usage_count})
                                            </span>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No subcategories available
                            </p>
                            <Link
                                href={`/products?categories=${activeTier.code}`}
                                className="inline-flex items-center gap-2 mt-4 text-[#31CDD4] hover:text-[#28a8ae] font-medium transition-colors"
                                onClick={onClose}
                            >
                                Browse all products
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
