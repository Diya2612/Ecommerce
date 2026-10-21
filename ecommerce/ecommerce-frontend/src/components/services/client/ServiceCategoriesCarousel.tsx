"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/data/services-data';

export function ServiceCategoriesCarousel() {
    const [mobileCarouselIndex, setMobileCarouselIndex] = useState(0);

    const handlePrevSlide = () => {
        setMobileCarouselIndex((prev) => (prev === 0 ? SERVICE_CATEGORIES.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setMobileCarouselIndex((prev) => (prev === SERVICE_CATEGORIES.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${mobileCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {SERVICE_CATEGORIES.map((category, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <a
                                href={category.href}
                                className="group relative bg-white rounded-3xl p-8 shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#00C4CC]/20 cursor-pointer block"
                            >
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl ${category.lightBg} flex items-center justify-center mb-6 mx-auto`}>
                                    <category.icon className={`w-8 h-8 ${category.color.replace('bg-', 'text-')}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-[#0F172A] mb-3 text-center">
                                    {category.title}
                                </h3>
                                <p className="text-[#475569] leading-relaxed text-center">
                                    {category.description}
                                </p>

                                {/* Learn More */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-[#00C4CC] font-medium text-sm">
                                    <span>Learn More</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* Decorative Corner */}
                                <div className={`absolute top-0 right-0 w-20 h-20 ${category.lightBg} rounded-bl-full opacity-20`} />
                            </a>
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
                {SERVICE_CATEGORIES.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === mobileCarouselIndex
                            ? "w-8 bg-[#0B1F51]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setMobileCarouselIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
