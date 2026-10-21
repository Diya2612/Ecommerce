'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UsageType } from '@/types/home';

interface UsageTypesMobileProps {
    usageTypes: UsageType[];
}

/**
 * UsageTypesMobile - Client Component
 * 
 * Handles mobile carousel with drag interactions for usage types
 * Maintains EXACT same UI as original Categories component mobile view
 */
export function UsageTypesMobile({ usageTypes }: UsageTypesMobileProps) {
    return (
        <div className="md:hidden overflow-hidden py-8">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 no-scrollbar touch-pan-x">
                {usageTypes.map((item, idx) => (
                    <Link
                        href={item.link || "/collections"}
                        key={idx}
                        className="snap-center shrink-0 first:pl-2 last:pr-2"
                        aria-label={`View ${item.title} solutions`}
                    >
                        <div
                            className="relative rounded-[2rem] overflow-hidden shadow-lg h-[400px] w-[85vw] max-w-[360px]"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 85vw, 400px"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-[#0A1A3F]/95 via-[#0A1A3F]/30 to-transparent z-10" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-8 z-20 w-full text-white flex flex-col justify-end h-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-3xl font-bold tracking-tight mb-3">
                                        {item.title}
                                    </h3>

                                    <div className="w-12 h-1 bg-[#16C4DA] rounded-full mb-4" />

                                    <p className="text-white/80 text-base mb-6 leading-relaxed line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center text-[#16C4DA] font-semibold tracking-wide uppercase text-sm">
                                        Explore <div className="ml-2 w-8 h-[1px] bg-[#16C4DA]" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center gap-1.5 mt-2">
                {usageTypes.map((_, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                ))}
            </div>
        </div>
    );
}
