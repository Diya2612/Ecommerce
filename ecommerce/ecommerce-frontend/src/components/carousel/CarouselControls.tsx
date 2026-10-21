'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface CarouselControlsProps {
    /** Handler for previous button */
    onPrev: () => void;
    /** Handler for next button */
    onNext: () => void;
    /** Whether previous navigation is disabled */
    disablePrev?: boolean;
    /** Whether next navigation is disabled */
    disableNext?: boolean;
    /** Control style variant */
    variant?: 'floating' | 'overlay' | 'minimal' | 'compact';
    /** Vertical position (CSS class or value) */
    verticalPosition?: string;
    /** Additional CSS classes */
    className?: string;
    /** Size of control buttons */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show only one button */
    showOnly?: 'prev' | 'next' | 'both';
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CLASSES = {
    sm: {
        button: 'w-8 h-8',
        icon: 'w-4 h-4',
    },
    md: {
        button: 'w-10 h-10',
        icon: 'w-5 h-5',
    },
    lg: {
        button: 'w-12 h-12',
        icon: 'w-6 h-6',
    },
};

// ============================================================================
// Component
// ============================================================================

/**
 * CarouselControls - Navigation controls for carousels
 * 
 * @example Floating variant (absolute positioned)
 * ```tsx
 * <CarouselControls
 *   onPrev={goToPrev}
 *   onNext={goToNext}
 *   variant="floating"
 *   verticalPosition="top-1/2 -translate-y-1/2"
 * />
 * ```
 * 
 * @example Compact variant (inline)
 * ```tsx
 * <CarouselControls
 *   onPrev={goToPrev}
 *   onNext={goToNext}
 *   variant="compact"
 *   size="sm"
 * />
 * ```
 * 
 * @example Next only
 * ```tsx
 * <CarouselControls
 *   onNext={goToNext}
 *   onPrev={() => {}}
 *   showOnly="next"
 *   variant="minimal"
 * />
 * ```
 */
export const CarouselControls: React.FC<CarouselControlsProps> = ({
    onPrev,
    onNext,
    disablePrev = false,
    disableNext = false,
    variant = 'floating',
    verticalPosition = 'top-1/2 -translate-y-1/2',
    className,
    size = 'md',
    showOnly = 'both',
}) => {
    const sizeConfig = SIZE_CLASSES[size];

    // Base button styles per variant
    const getButtonClasses = (position: 'left' | 'right') => {
        const baseClasses = cn(
            "flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
            sizeConfig.button
        );

        switch (variant) {
            case 'floating':
                return cn(
                    baseClasses,
                    "absolute z-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200",
                    position === 'left' ? 'left-0' : 'right-0',
                    verticalPosition
                );

            case 'overlay':
                return cn(
                    baseClasses,
                    "absolute z-10 rounded-full bg-white shadow-lg border border-gray-100",
                    position === 'left' ? '-left-3' : '-right-3',
                    verticalPosition
                );

            case 'minimal':
                return cn(
                    baseClasses,
                    "rounded-full bg-white shadow-md hover:shadow-lg border border-gray-100 hover:border-[#00C4CC]"
                );

            case 'compact':
                return cn(
                    baseClasses,
                    "rounded-input border-2 border-gray-200 hover:border-[#00C4CC] hover:bg-[#00C4CC]/5"
                );

            default:
                return baseClasses;
        }
    };

    const showPrev = showOnly === 'both' || showOnly === 'prev';
    const showNext = showOnly === 'both' || showOnly === 'next';

    // For non-absolute variants, wrap in a flex container
    if (variant === 'compact' || variant === 'minimal') {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {showPrev && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPrev}
                        disabled={disablePrev}
                        className={getButtonClasses('left')}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className={cn(sizeConfig.icon, "text-[#0B1F51]")} />
                    </Button>
                )}
                {showNext && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNext}
                        disabled={disableNext}
                        className={getButtonClasses('right')}
                        aria-label="Next slide"
                    >
                        <ChevronRight className={cn(sizeConfig.icon, "text-[#0B1F51]")} />
                    </Button>
                )}
            </div>
        );
    }

    // Floating/overlay variants render absolute positioned buttons
    return (
        <>
            {showPrev && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrev}
                    disabled={disablePrev}
                    className={cn(getButtonClasses('left'), className)}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className={cn(sizeConfig.icon, "text-[#0B1F51]")} />
                </Button>
            )}
            {showNext && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={disableNext}
                    className={cn(getButtonClasses('right'), className)}
                    aria-label="Next slide"
                >
                    <ChevronRight className={cn(sizeConfig.icon, "text-[#0B1F51]")} />
                </Button>
            )}
        </>
    );
};

export default CarouselControls;
