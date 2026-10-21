'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import type { Brand } from '@/types/home';
import { cn } from '@/utils/utils';

interface BrandsMarqueeMobileProps {
    brands: Brand[];
}

/**
 * BrandsMarqueeMobile - Creative Agency Style
 * 
 * Implements an infinite scrolling text/logo ticker effect.
 * Uses Framer Motion for smooth, hardware-accelerated animation.
 * 
 * Design:
 * - Continuous infinite loop
 * - Logos with opacity/grayscale transition
 * - "Ticker" aesthetic common in high-end agency sites
 */
export function BrandsMarqueeMobile({ brands }: BrandsMarqueeMobileProps) {
    // Duplicate list to ensure seamless loop
    const marqueeBrands = [...brands, ...brands, ...brands];

    return (
        <div className="md:hidden w-full overflow-hidden py-8 bg-white/50 backdrop-blur-sm relative">
            {/* Fade Gradients for "Infinite" Feel */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-white to-transparent z-10" />

            <div className="flex select-none">
                <motion.div
                    className="flex gap-12 items-center pr-12"
                    animate={{
                        x: [0, -1035], // Appropriate offset based on content width (calc dynamically if possible, or large enough guess)
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30, // Slow, premium speed
                            ease: "linear",
                        },
                    }}
                >
                    {marqueeBrands.map((brand, idx) => (
                        <div
                            key={`${brand.id}-${idx}`}
                            className="relative w-32 h-16 shrink-0 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                        >
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="text-center mt-6">
                <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">Trusted Partners</p>
            </div>
        </div>
    );
}
