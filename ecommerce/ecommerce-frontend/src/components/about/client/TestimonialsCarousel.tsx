'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AboutTestimonial } from '@/types/about';

interface TestimonialsCarouselProps {
    testimonials: AboutTestimonial[];
}

/**
 * TestimonialsCarousel - Client Island Component
 * 
 * Handles the mobile carousel for testimonial cards.
 * Includes full testimonial card with avatar, rating, and quote.
 */
export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="w-full shrink-0 px-2">
                            <div className="bg-white rounded-card border border-black/6 p-8 shadow-xs relative">
                                {/* Quote Icon */}
                                <div className="absolute top-6 right-6 w-14 h-14 bg-[#00C4CC]/10 rounded-full flex items-center justify-center">
                                    <Quote className="w-7 h-7 text-[#00C4CC]" />
                                </div>

                                {/* Rating */}
                                <div className="flex justify-center mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-6 h-6 fill-[#F5B012] text-[#F5B012]" />
                                    ))}
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-[16px] text-gray-700 leading-[150%] mb-8 text-center">
                                    &ldquo;{testimonial.text}&rdquo;
                                </p>

                                {/* Author */}
                                <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">
                                    <Avatar className="w-16 h-16 border-2 border-gray-100">
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                        <AvatarFallback className="bg-[#0B1F51] text-white text-[18px]">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <h4 className="text-[18px] font-semibold text-[#0B1F51]">
                                                {testimonial.name}
                                            </h4>
                                            {testimonial.verified && (
                                                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-2 py-0.5 rounded-[6px] text-[10px] font-bold">
                                                    ✓ Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[14px] text-gray-600">{testimonial.role}</p>
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
                onClick={handlePrev}
                aria-label="Previous testimonial"
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleNext}
                aria-label="Next testimonial"
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
                                ? "w-8 bg-[#00C4CC]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setCarouselIndex(index)}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
