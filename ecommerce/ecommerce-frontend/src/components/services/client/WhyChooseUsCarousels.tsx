"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { SERVICE_STATS, SERVICE_REASONS, SERVICE_CERTIFICATIONS } from '@/lib/data/services-data';

export function StatsCarousel() {
    const [statsCarouselIndex, setStatsCarouselIndex] = useState(0);

    const handleStatsPrev = () => {
        setStatsCarouselIndex((prev) => (prev === 0 ? SERVICE_STATS.length - 1 : prev - 1));
    };

    const handleStatsNext = () => {
        setStatsCarouselIndex((prev) => (prev === SERVICE_STATS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative mb-20">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${statsCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {SERVICE_STATS.map((stat, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className={`bg-linear-to-br ${stat.color} rounded-3xl p-10 text-white shadow-lg relative`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                                <div className="relative text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-6 mx-auto">
                                        <stat.icon className="w-10 h-10 text-white" />
                                    </div>

                                    <div className="text-6xl font-bold mb-3">{stat.value}</div>
                                    <p className="text-white/90 font-medium text-lg">{stat.label}</p>
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
                onClick={handleStatsPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleStatsNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {SERVICE_STATS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === statsCarouselIndex
                                ? "w-8 bg-[#00C4CC]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setStatsCarouselIndex(index)}
                        aria-label={`Go to stat ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function ReasonsCarousel() {
    const [reasonsCarouselIndex, setReasonsCarouselIndex] = useState(0);

    const handleReasonsPrev = () => {
        setReasonsCarouselIndex((prev) => (prev === 0 ? SERVICE_REASONS.length - 1 : prev - 1));
    };

    const handleReasonsNext = () => {
        setReasonsCarouselIndex((prev) => (prev === SERVICE_REASONS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative mb-20">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${reasonsCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {SERVICE_REASONS.map((reason, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-100">
                                {/* Icon */}
                                <div className="w-20 h-20 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center mb-6 mx-auto">
                                    <reason.icon className="w-10 h-10 text-[#00C4CC]" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-[#0F172A] mb-4 text-center">
                                    {reason.title}
                                </h3>
                                <p className="text-[#475569] leading-relaxed text-center">
                                    {reason.description}
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
                onClick={handleReasonsPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                onClick={handleReasonsNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {SERVICE_REASONS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === reasonsCarouselIndex
                                ? "w-8 bg-[#00C4CC]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setReasonsCarouselIndex(index)}
                        aria-label={`Go to reason ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function CertificationsCarousel() {
    const [certsCarouselIndex, setCertsCarouselIndex] = useState(0);

    const handleCertsPrev = () => {
        setCertsCarouselIndex((prev) => (prev === 0 ? SERVICE_CERTIFICATIONS.length - 1 : prev - 1));
    };

    const handleCertsNext = () => {
        setCertsCarouselIndex((prev) => (prev === SERVICE_CERTIFICATIONS.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="md:hidden relative">
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex"
                    animate={{ x: `-${certsCarouselIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {SERVICE_CERTIFICATIONS.map((cert, index) => (
                        <div key={index} className="w-full shrink-0 px-2">
                            <div className="text-center py-4">
                                <div className="w-24 h-24 rounded-full bg-[#0B1F51]/10 flex items-center justify-center mb-4 mx-auto">
                                    <Award className="w-12 h-12 text-[#0B1F51]" />
                                </div>
                                <div className="font-bold text-[#0F172A] text-lg mb-1">{cert.name}</div>
                                <div className="text-sm text-[#475569]">{cert.desc}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[#0B1F51]/10 hover:bg-[#0B1F51]/20 shadow-lg border border-gray-200"
                onClick={handleCertsPrev}
            >
                <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[#0B1F51]/10 hover:bg-[#0B1F51]/20 shadow-lg border border-gray-200"
                onClick={handleCertsNext}
            >
                <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
                {SERVICE_CERTIFICATIONS.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === certsCarouselIndex
                                ? "w-8 bg-[#0B1F51]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        onClick={() => setCertsCarouselIndex(index)}
                        aria-label={`Go to certification ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
