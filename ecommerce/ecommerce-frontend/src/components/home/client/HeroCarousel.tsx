'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { HeroSlide } from '@/types/home';

interface HeroCarouselProps {
    slides: HeroSlide[];
}

/**
 * HeroCarousel - Client Component
 * 
 * Handles carousel interactions and navigation
 * Receives slides data from server component as props
 * 
 * IMPORTANT: This component maintains the EXACT same UI as the original Hero component
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
    const router = useRouter();
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const scrollTo = (index: number) => {
        api?.scrollTo(index);
    };

    const handlePrev = () => api?.scrollPrev();
    const handleNext = () => api?.scrollNext();

    return (
        <div className={cn(
            'relative w-full group overflow-hidden shadow-md isolate',
            // Height Constraints - Mobile: 85dvh (allows peek), Desktop: 75vh
            'h-[85dvh] md:h-[75vh] md:max-h-[800px] min-h-[500px]'
        )}>
            <Carousel
                setApi={setApi}
                className="w-full h-full **:data-[slot=carousel-content]:h-full"
                opts={{ loop: true, align: 'start' }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
            >
                <CarouselContent className="h-full ml-0">
                    {slides.map((slide, index) => (
                        <CarouselItem key={slide.id} className="h-full pl-0 relative">
                            <Link href={slide.link} className="absolute inset-0 z-0" aria-label={`View ${slide.alt}`}>
                                <Image
                                    src={slide.image}
                                    alt={slide.alt}
                                    fill
                                    priority={index === 0 || slide.priority}
                                    className="object-cover transition-transform duration-700 ease-out"
                                />
                            </Link>

                            {/* Gradient Overlay - EXACT same */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                            {/* CTA Button Positioner - EXACT same */}
                            <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16 lg:pb-20">
                                <div className="container mx-auto px-4 md:px-8 flex justify-center md:justify-start">
                                    <Button
                                        onClick={() => router.push(slide.link)}
                                        className={cn(
                                            // Colors - EXACT same
                                            'bg-[#0B1F51] hover:bg-[#152C69] text-white',
                                            // Sizing & Shape - EXACT same
                                            'h-12 px-8 rounded-full md:h-14 md:px-10',
                                            // Typography - EXACT same
                                            'text-base md:text-lg font-semibold tracking-wide',
                                            // Effects - EXACT same
                                            'shadow-lg shadow-blue-900/20 hover:shadow-[#00C4CC]/30 hover:scale-[1.03]',
                                            // Focus - EXACT same
                                            'focus:ring-4 focus:ring-[#00C4CC]/30 focus:outline-hidden',
                                            // Transitions - EXACT same
                                            'transition-all duration-300 ease-out'
                                        )}
                                    >
                                        {slide.ctaText}
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Arrows (Desktop Only) - EXACT same */}
                <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-20">
                    <Button
                        onClick={handlePrev}
                        variant="ghost"
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white hover:text-[#31CDD4] border border-white/20 transition-all duration-300 group/arrow"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 stroke-2 group-hover/arrow:-translate-x-0.5 transition-transform" aria-hidden="true" />
                    </Button>
                </div>

                <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-20">
                    <Button
                        onClick={handleNext}
                        variant="ghost"
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white hover:text-[#31CDD4] border border-white/20 transition-all duration-300 group/arrow"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 stroke-2 group-hover/arrow:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </Button>
                </div>

                {/* Pagination Dots - EXACT same */}
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-500 ease-out focus:outline-hidden',
                                current === index
                                    ? 'w-8 bg-white shadow-xs'
                                    : 'w-2 bg-white/40 hover:bg-white/60'
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </Carousel>
        </div>
    );
}
