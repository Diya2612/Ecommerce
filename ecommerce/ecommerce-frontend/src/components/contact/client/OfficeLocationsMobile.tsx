'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { MapPin, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OfficeLocation } from '@/types/contact';

interface OfficeLocationsMobileProps {
    offices: OfficeLocation[];
}

/**
 * OfficeLocationsMobile - Client Component (Mobile Only)
 * 
 * Mobile carousel for office locations with swipe navigation.
 * Desktop version uses CSS-only hover in server component.
 * 
 * MAINTAINS EXACT SAME UI as original ContactUsSection.tsx mobile view
 */
export function OfficeLocationsMobile({ offices }: OfficeLocationsMobileProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {offices.map((office) => (
                        <div key={office.id} className="w-full shrink-0 px-2">
                            <div className="bg-linear-to-br from-[#F9FBFD] to-white border border-black/6 rounded-card p-8 shadow-xs">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-16 h-16 bg-[#0B1F51] rounded-input flex items-center justify-center mb-4 shadow-lg">
                                        <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
                                    </div>
                                    <h4 className="text-[24px] font-semibold text-[#0B1F51] tracking-[-0.01em]">
                                        {office.city}
                                    </h4>
                                </div>
                                <address className="space-y-4 not-italic">
                                    <div className="flex items-start gap-3 bg-white rounded-input p-4 border border-gray-100">
                                        <MapPin className="w-5 h-5 text-[#00C4CC] mt-0.5 shrink-0" aria-hidden="true" />
                                        <p className="text-[16px] text-gray-700 leading-[150%]">
                                            {office.address}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white rounded-input p-4 border border-gray-100">
                                        <Phone className="w-5 h-5 text-[#00C4CC] shrink-0" aria-hidden="true" />
                                        <a
                                            href={`tel:${office.phone.replace(/\s/g, '')}`}
                                            className="text-[16px] text-gray-700 hover:text-[#00C4CC] transition-colors"
                                        >
                                            {office.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white rounded-input p-4 border border-gray-100">
                                        <Mail className="w-5 h-5 text-[#00C4CC] shrink-0" aria-hidden="true" />
                                        <a
                                            href={`mailto:${office.email}`}
                                            className="text-[16px] text-gray-700 hover:text-[#00C4CC] transition-colors"
                                        >
                                            {office.email}
                                        </a>
                                    </div>
                                </address>
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
                onClick={() => setCarouselIndex((prev) => (prev === 0 ? offices.length - 1 : prev - 1))}
                aria-label="Previous office"
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={() => setCarouselIndex((prev) => (prev === offices.length - 1 ? 0 : prev + 1))}
                aria-label="Next office"
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {offices.map((office, index) => (
                    <button
                        key={office.id}
                        className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
                                ? "w-8 bg-[#00C4CC]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setCarouselIndex(index)}
                        aria-label={`Go to ${office.city} office`}
                        aria-current={index === carouselIndex ? 'true' : 'false'}
                    />
                ))}
            </div>
        </div>
    );
}
