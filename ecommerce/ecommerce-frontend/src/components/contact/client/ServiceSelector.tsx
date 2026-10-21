'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Home, CheckCircle, Wrench, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookingService } from '@/types/contact';

/**
 * Icon mapping for services
 */
const iconMap = {
    Home,
    CheckCircle,
    Wrench,
    Package,
} as const;

interface ServiceSelectorProps {
    services: BookingService[];
}

/**
 * ServiceSelector - Client Component
 * 
 * Handles service selection with state and hover/tap animations.
 * Includes both desktop grid and mobile carousel.
 * 
 * MAINTAINS EXACT SAME UI as original BookNowSection.tsx
 */
export function ServiceSelector({ services }: ServiceSelectorProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [carouselIndex, setCarouselIndex] = useState(0);

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0B1F51] rounded-full flex items-center justify-center text-white font-bold">
                    1
                </div>
                <h3 className="text-[28px] font-semibold text-[#0B1F51] tracking-[-0.01em]">
                    Select Service Type
                </h3>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => {
                    const Icon = iconMap[service.iconKey];
                    const isSelected = selectedService === service.id;
                    return (
                        <motion.button
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedService(service.id)}
                            className={`bg-linear-to-br ${service.colorFrom} ${service.colorTo} border-2 rounded-card p-6 text-left transition-all duration-300 ${isSelected
                                    ? 'border-[#0B1F51] shadow-xl'
                                    : 'border-black/6 hover:border-[#00C4CC]/30 hover:shadow-lg'
                                }`}
                            aria-pressed={isSelected}
                            aria-label={`Select ${service.title} service`}
                        >
                            <div className={`w-14 h-14 ${service.iconBg} rounded-input flex items-center justify-center mb-4 shadow-lg`}>
                                <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                            </div>
                            <h4 className="text-[20px] font-semibold text-[#0B1F51] mb-2">
                                {service.title}
                            </h4>
                            <p className="text-[14px] text-gray-600">
                                {service.description}
                            </p>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mt-4 flex items-center gap-2 text-[#22C55E]"
                                >
                                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                                    <span className="text-[14px] font-bold">Selected</span>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative">
                <div className="relative overflow-hidden pb-2">
                    <motion.div
                        className="flex"
                        animate={{ x: `-${carouselIndex * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {services.map((service) => {
                            const Icon = iconMap[service.iconKey];
                            const isSelected = selectedService === service.id;
                            return (
                                <div key={service.id} className="w-full shrink-0 px-2">
                                    <button
                                        onClick={() => setSelectedService(service.id)}
                                        className={`w-full bg-linear-to-br ${service.colorFrom} ${service.colorTo} border-2 rounded-card p-8 text-center transition-all duration-300 ${isSelected
                                                ? 'border-[#0B1F51] shadow-xl'
                                                : 'border-black/6 shadow-xs'
                                            }`}
                                        aria-pressed={isSelected}
                                        aria-label={`Select ${service.title} service`}
                                    >
                                        <div className={`w-20 h-20 ${service.iconBg} rounded-input flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                            <Icon className="w-10 h-10 text-white" aria-hidden="true" />
                                        </div>
                                        <h4 className="text-[24px] font-semibold text-[#0B1F51] mb-3 tracking-[-0.01em]">
                                            {service.title}
                                        </h4>
                                        <p className="text-[16px] text-gray-600 leading-[150%]">
                                            {service.description}
                                        </p>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="mt-6 flex items-center justify-center gap-2 text-[#22C55E]"
                                            >
                                                <CheckCircle className="w-6 h-6" aria-hidden="true" />
                                                <span className="text-[16px] font-bold">Selected</span>
                                            </motion.div>
                                        )}
                                    </button>
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
                    onClick={() => setCarouselIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1))}
                    aria-label="Previous service"
                >
                    <ChevronLeft className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                    onClick={() => setCarouselIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1))}
                    aria-label="Next service"
                >
                    <ChevronRight className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
                </Button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-8">
                    {services.map((service, index) => (
                        <button
                            key={service.id}
                            className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
                                    ? "w-8 bg-[#00C4CC]"
                                    : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            onClick={() => setCarouselIndex(index)}
                            aria-label={`Go to ${service.title}`}
                            aria-current={index === carouselIndex ? 'true' : 'false'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
