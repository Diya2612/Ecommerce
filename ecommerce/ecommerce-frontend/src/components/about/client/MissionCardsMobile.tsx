'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MissionItemSerializable, MissionIconName } from '@/types/about';

// Icon mapping for resolving icon names to components
const MISSION_ICONS: Record<MissionIconName, React.ComponentType<{ className?: string }>> = {
    Target,
    Eye,
    Lightbulb,
};

interface MissionCardsMobileProps {
    items: MissionItemSerializable[];
}

/**
 * MissionCardsMobile - Client Island Component
 * 
 * Handles the mobile carousel for mission/vision/philosophy cards.
 * Uses useState for carousel index and motion for slide animations.
 * Resolves icon names to actual icon components.
 */
export function MissionCardsMobile({ items }: MissionCardsMobileProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {items.map((item, index) => {
                        const Icon = MISSION_ICONS[item.iconName];
                        return (
                            <div key={index} className="w-full shrink-0 px-2">
                                <div className={`bg-linear-to-br ${item.gradient} border border-black/6 rounded-[28px] p-8 shadow-xs`}>
                                    <div className={`w-20 h-20 ${item.color} rounded-input flex items-center justify-center mb-6 shadow-lg mx-auto`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>

                                    <h3 className="text-[32px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] text-center">
                                        {item.title}
                                    </h3>

                                    <p className="text-[16px] text-gray-700 leading-[150%] text-center">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handlePrev}
                aria-label="Previous card"
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleNext}
                aria-label="Next card"
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
                                ? "w-8 bg-[#00C4CC]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setCarouselIndex(index)}
                        aria-label={`Go to ${items[index].title}`}
                    />
                ))}
            </div>
        </div>
    );
}
