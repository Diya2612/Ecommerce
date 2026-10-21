'use client';

import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Testimonial } from '@/types/home';

interface TestimonialsCarouselClientProps {
    testimonials: Testimonial[];
}

/**
 * TestimonialsCarouselClient - Client Component (Hybrid Pattern)
 * 
 * Handles carousel interactions, auto-play, and CTA buttons
 * Stats cards are rendered server-side
 * 
 * ✨ Phase 2: Carousel interactions only (stats on server)
 */
export function TestimonialsCarouselClient({ testimonials }: TestimonialsCarouselClientProps) {
    const { openChat } = useChat();
    const router = useRouter();
    const [api, setApi] = useState<CarouselApi>();

    // Auto-advance carousel every 3 seconds - EXACT same as original
    useEffect(() => {
        if (!api) {
            return;
        }

        const intervalId = setInterval(() => {
            api.scrollNext();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [api]);

    return (
        <>
            {/* Carousel - EXACT same */}
            <Carousel
                className="w-full"
                opts={{
                    align: 'start',
                    loop: true
                }}
                setApi={setApi}
            >
                <CarouselContent className="-ml-6">
                    {testimonials.map((item) => (
                        <CarouselItem key={item.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="bg-white/5 backdrop-blur-md p-8 rounded-[24px] h-full min-h-[340px] flex flex-col border border-[#00C4CC]/20 hover:border-[#00C4CC]/50 hover:shadow-2xl hover:shadow-[#00C4CC]/10 transition-all duration-300 group"
                            >
                                {/* Quote Icon - EXACT same */}
                                <Quote className="w-8 h-8 text-[#00C4CC]/40 mb-4" />

                                {/* Review Text - EXACT same */}
                                <p className="text-white/90 leading-relaxed mb-4 grow">
                                    &quot;{item.text}&quot;
                                </p>

                                {/* Outcome Badge - EXACT same */}
                                {item.outcome && (
                                    <div className="mb-4 flex items-center gap-2 p-3 bg-[#00C4CC]/10 rounded-lg border border-[#00C4CC]/20">
                                        <CheckCircle2 className="w-4 h-4 text-[#00C4CC] shrink-0" />
                                        <span className="text-sm text-[#00C4CC] font-medium">{item.outcome}</span>
                                    </div>
                                )}

                                {/* Divider - EXACT same */}
                                <div className="border-t border-white/10 pt-4 mt-auto">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar - EXACT same */}
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#00C4CC]/30">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* User Info - EXACT same */}
                                        <div className="grow">
                                            <div className="font-semibold text-white mb-1">{item.name}</div>
                                            <div className="text-sm text-white/60">{item.location}</div>
                                        </div>

                                        {/* Rating - EXACT same */}
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < item.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-white/20'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Arrows - EXACT same */}
                <div className="hidden md:flex justify-center gap-4 mt-8">
                    <Button
                        onClick={() => api?.scrollPrev()}
                        variant="ghost"
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 transition-all"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                    </Button>
                    <Button
                        onClick={() => api?.scrollNext()}
                        variant="ghost"
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 transition-all"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6" aria-hidden="true" />
                    </Button>
                </div>
            </Carousel>

            {/* CTA Buttons - EXACT same */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
                <Button
                    onClick={openChat}
                    className="bg-[#00C4CC] hover:bg-[#00b2b9] text-white shadow-lg shadow-[#00C4CC]/20 rounded-card h-[52px] px-8 text-[15px] font-bold border-none"
                >
                    Share Your Experience
                </Button>
                <Button
                    onClick={() => router.push('/testimonials')}
                    variant="outline"
                    className="border-2 border-white/20 hover:border-[#00C4CC] text-white bg-transparent hover:bg-[#00C4CC]/10 rounded-card h-[52px] px-8 text-[15px] font-bold"
                >
                    View All Reviews
                </Button>
            </motion.div>
        </>
    );
}
