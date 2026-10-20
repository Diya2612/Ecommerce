import React, { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface MetricItem {
    title: string;
    value: string | number;
    helperText?: string;
    tooltip?: string;
    icon?: LucideIcon;
    iconBg?: string;
    iconClass?: string;
}

interface MetricsGridProps {
    metrics: MetricItem[];
    isLoading?: boolean;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isLoading }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const scrollLeft = scrollContainerRef.current.scrollLeft;
            const cardWidth = scrollContainerRef.current.offsetWidth * 0.6; // 1.5 view width per card
            const newSlide = Math.round(scrollLeft / cardWidth);
            setCurrentSlide(newSlide);
        }
    };

    const scrollToSlide = (index: number) => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.offsetWidth * 0.6;
            scrollContainerRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading && metrics.length === 0) {
        return (
            <div className="mb-3 mt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-[130px] animate-pulse">
                            <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                                <div className="h-8 w-16 bg-gray-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-3 mt-1">
            {/* ================= MOBILE SLIDER ================= */}
            {isMobile && (
                <>
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {metrics.map((metric) => (
                            <div key={metric.title} className="snap-start flex-shrink-0 w-[60%]">
                                <MetricCard metric={metric} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="relative z-10 flex justify-center gap-2 mt-4">
                        {metrics.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToSlide(idx)}
                                aria-label={`Go to metric ${idx + 1}`}
                                className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${currentSlide === idx
                                    ? "bg-purple-600 scale-110"
                                    : "bg-gray-400 hover:bg-gray-500"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* ================= DESKTOP GRID ================= */}
            {!isMobile && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${metrics.length >= 5 ? 'lg:grid-cols-5' :
                    metrics.length === 4 ? 'lg:grid-cols-4' :
                        metrics.length === 3 ? 'lg:grid-cols-3' :
                            metrics.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
                    } gap-5`}>
                    {metrics.map((metric) => (
                        <MetricCard key={metric.title} metric={metric} />
                    ))}
                </div>
            )}
        </div>
    );
};

export { MetricsGrid };

/* ===================================================== */
/* ================= INTERNAL CARD ===================== */
/* ===================================================== */

interface MetricCardProps {
    metric: MetricItem;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const Icon = metric.icon;
    const tooltipContent = metric.tooltip ?? metric.helperText;

    return (
        <div
            className="
                relative group
                bg-white p-5 rounded-2xl
                border border-gray-100
                shadow-sm
                flex flex-col justify-between
                h-[130px]
                transition-shadow duration-200
                hover:shadow-lg
            "
        >
            {/* Title + Tooltip */}
            <div className="flex justify-between items-start">
                <span className="text-[#253154] font-medium text-[15px]">
                    {metric.title}
                </span>

                {tooltipContent && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={`${metric.title} info`}
                                className="text-gray-300 hover:text-gray-500"
                            >
                                <Info size={14} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {tooltipContent}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* Value + Icon */}
            <div className="flex items-end gap-3 mt-3 min-w-0">
                {Icon && (
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: metric.iconBg ?? "#6C63FF" }}
                    >
                        <Icon
                            size={20}
                            strokeWidth={2}
                            className={`${metric.iconClass ?? "text-white"}`}
                        />
                    </div>
                )}

                <span
                    className="text-[22px] md:text-[24px] lg:text-[26px] font-bold text-[#253154] leading-none truncate"
                    title={String(metric.value)}
                >
                    {metric.value}
                </span>
            </div>

            {/* Decorative Icon */}
            {Icon && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-100">
                        <div className="absolute -right-6 -bottom-5 opacity-5">
                            {/* Tilt the decorative icon to the right side */}
                            <Icon size={80} className="text-[#253154] rotate-12" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
