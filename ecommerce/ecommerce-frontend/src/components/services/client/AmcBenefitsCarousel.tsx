"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AMC_BENEFITS } from '@/lib/data/services-data';

export function AmcBenefitsCarousel() {
    const [benefitsCarouselIndex, setBenefitsCarouselIndex] = useState(0);

    const handleBenefitsPrev = () => {
        setBenefitsCarouselIndex((prev) => (prev === 0 ? AMC_BENEFITS.length - 1 : prev - 1));
    };

    const handleBenefitsNext = () => {
        setBenefitsCarouselIndex((prev) => (prev === AMC_BENEFITS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative mb-20">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${benefitsCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {AMC_BENEFITS.map((benefit, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100">
                                <div className="w-16 h-16 rounded-xl bg-[#F5B012]/10 flex items-center justify-center mb-6 mx-auto">
                                    <benefit.icon className="w-8 h-8 text-[#F5B012]" />
                                </div>
                                <h4 className="font-bold text-[#0F172A] mb-3 text-center text-xl">{benefit.title}</h4>
                                <p className="text-[#475569] text-center">{benefit.description}</p>
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
                onClick={handleBenefitsPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleBenefitsNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {AMC_BENEFITS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === benefitsCarouselIndex
                            ? "w-8 bg-[#F5B012]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setBenefitsCarouselIndex(index)}
                        aria-label={`Go to benefit ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
