"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { INSTALLATION_STEPS } from '@/lib/data/services-data';

export function InstallationProcessCarousel() {
    const [processCarouselIndex, setProcessCarouselIndex] = useState(0);

    const handlePrevSlide = () => {
        setProcessCarouselIndex((prev) => (prev === 0 ? INSTALLATION_STEPS.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setProcessCarouselIndex((prev) => (prev === INSTALLATION_STEPS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${processCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {INSTALLATION_STEPS.map((step, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="relative bg-[#F9FBFD] rounded-2xl p-8 border border-gray-100 shadow-xs">
                                {/* Step Number */}
                                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#0B1F51] to-[#00C4CC] flex items-center justify-center mb-6 shadow-lg mx-auto">
                                    <span className="text-3xl font-bold text-white">{step.number}</span>
                                </div>

                                <h4 className="text-2xl font-bold text-[#0F172A] mb-3 text-center">
                                    {step.title}
                                </h4>
                                <p className="text-[#475569] leading-relaxed text-center">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handlePrevSlide}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleNextSlide}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {INSTALLATION_STEPS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === processCarouselIndex
                            ? "w-8 bg-[#0B1F51]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setProcessCarouselIndex(index)}
                        aria-label={`Go to step ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
