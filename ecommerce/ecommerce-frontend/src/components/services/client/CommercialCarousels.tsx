"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { COMMERCIAL_SOLUTIONS, COMMERCIAL_CASE_STUDIES } from '@/lib/data/services-data';

export function CommercialSolutionsCarousel() {
    const [solutionsCarouselIndex, setSolutionsCarouselIndex] = useState(0);

    const handleSolutionsPrev = () => {
        setSolutionsCarouselIndex((prev) => (prev === 0 ? COMMERCIAL_SOLUTIONS.length - 1 : prev - 1));
    };

    const handleSolutionsNext = () => {
        setSolutionsCarouselIndex((prev) => (prev === COMMERCIAL_SOLUTIONS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative mb-20">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${solutionsCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {COMMERCIAL_SOLUTIONS.map((solution, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="bg-[#F9FBFD] rounded-2xl p-8 border border-gray-100 shadow-xs">
                                <div className="w-16 h-16 rounded-xl bg-[#0B1F51]/10 flex items-center justify-center mb-6 mx-auto">
                                    <solution.icon className="w-8 h-8 text-[#0B1F51]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0F172A] mb-3 text-center">{solution.title}</h3>
                                <p className="text-sm text-[#00C4CC] font-bold mb-6 text-center">{solution.capacity}</p>
                                <ul className="space-y-3">
                                    {solution.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-[#475569]">
                                            <CheckCircle2 className="w-5 h-5 text-[#00C4CC] shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
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
                onClick={handleSolutionsPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleSolutionsNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {COMMERCIAL_SOLUTIONS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === solutionsCarouselIndex
                            ? "w-8 bg-[#0B1F51]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setSolutionsCarouselIndex(index)}
                        aria-label={`Go to solution ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function CommercialCaseStudiesCarousel() {
    const [storiesCarouselIndex, setStoriesCarouselIndex] = useState(0);

    const handleStoriesPrev = () => {
        setStoriesCarouselIndex((prev) => (prev === 0 ? COMMERCIAL_CASE_STUDIES.length - 1 : prev - 1));
    };

    const handleStoriesNext = () => {
        setStoriesCarouselIndex((prev) => (prev === COMMERCIAL_CASE_STUDIES.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${storiesCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {COMMERCIAL_CASE_STUDIES.map((study, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-[#0F172A] mb-1">{study.client}</h4>
                                        <p className="text-xs text-[#475569]">{study.type}</p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-sm text-[#475569]">Capacity</span>
                                        <span className="font-bold text-[#0B1F51]">{study.capacity}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-sm text-[#475569]">Scale</span>
                                        <span className="font-bold text-[#0B1F51]">{study.employees}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-[#475569]">Annual Savings</span>
                                        <span className="text-xl font-bold text-[#22C55E]">{study.savings}</span>
                                    </div>
                                </div>
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
                onClick={handleStoriesPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleStoriesNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {COMMERCIAL_CASE_STUDIES.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === storiesCarouselIndex
                            ? "w-8 bg-[#00C4CC]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setStoriesCarouselIndex(index)}
                        aria-label={`Go to story ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
