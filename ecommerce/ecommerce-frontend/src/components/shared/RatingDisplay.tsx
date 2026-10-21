'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatRating, formatReviewCount } from '@/lib/utils/formatters';
import { colors } from '@/lib/constants/colors';

// ============================================================================
// Types
// ============================================================================

export interface RatingDisplayProps {
    /** Rating value (0-5) */
    rating: number;
    /** Number of reviews */
    reviews?: number;
    /** Whether to show the numeric rating */
    showRating?: boolean;
    /** Whether to show review count */
    showReviews?: boolean;
    /** Display variant */
    variant?: 'badge' | 'inline' | 'stars' | 'full';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CLASSES = {
    sm: {
        star: 'w-3 h-3',
        text: 'text-[12px]',
    },
    md: {
        star: 'w-4 h-4',
        text: 'text-[14px]',
    },
    lg: {
        star: 'w-5 h-5',
        text: 'text-[16px]',
    },
};

// ============================================================================
// Component
// ============================================================================

/**
 * RatingDisplay - Displays product rating with stars
 * 
 * @example Badge variant (compact)
 * ```tsx
 * <RatingDisplay rating={4.8} variant="badge" />
 * ```
 * 
 * @example Inline variant (horizontal)
 * ```tsx
 * <RatingDisplay rating={4.8} reviews={124} variant="inline" showReviews />
 * ```
 * 
 * @example Stars variant (all 5 stars)
 * ```tsx
 * <RatingDisplay rating={4.8} reviews={124} variant="stars" showReviews />
 * ```
 * 
 * @example Full variant (stars + rating + reviews)
 * ```tsx
 * <RatingDisplay rating={4.8} reviews={124} variant="full" />
 * ```
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
    rating,
    reviews,
    showRating = true,
    showReviews = false,
    variant = 'badge',
    size = 'sm',
    className,
}) => {
    const sizeConfig = SIZE_CLASSES[size];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Stars variant - shows all 5 stars
    if (variant === 'stars') {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                sizeConfig.star,
                                i < fullStars
                                    ? "fill-[#F5B012] text-[#F5B012]"
                                    : "text-gray-300"
                            )}
                        />
                    ))}
                </div>
                {showReviews && reviews !== undefined && (
                    <span className={cn("font-medium text-gray-600", sizeConfig.text)}>
                        ({formatReviewCount(reviews)} reviews)
                    </span>
                )}
            </div>
        );
    }

    // Full variant - stars + rating number + reviews
    if (variant === 'full') {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                sizeConfig.star,
                                i < fullStars
                                    ? "fill-[#F5B012] text-[#F5B012]"
                                    : "text-gray-300"
                            )}
                        />
                    ))}
                </div>
                {showRating && (
                    <span className={cn("font-bold text-[#0B1F51]", sizeConfig.text)}>
                        {formatRating(rating)}
                    </span>
                )}
                {reviews !== undefined && (
                    <span className={cn("text-gray-500", sizeConfig.text)}>
                        ({formatReviewCount(reviews)} reviews)
                    </span>
                )}
            </div>
        );
    }

    // Inline variant - single star + rating + optional reviews
    if (variant === 'inline') {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <Star className={cn(sizeConfig.star, "fill-[#F5B012] text-[#F5B012]")} />
                {showRating && (
                    <span className={cn("font-bold text-[#0B1F51]", sizeConfig.text)}>
                        {formatRating(rating)}
                    </span>
                )}
                {showReviews && reviews !== undefined && (
                    <span className={cn("text-gray-500", sizeConfig.text)}>
                        ({formatReviewCount(reviews)})
                    </span>
                )}
            </div>
        );
    }

    // Badge variant (default) - compact badge style
    return (
        <div
            className={cn(
                "flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-[6px]",
                className
            )}
        >
            <Star className={cn(sizeConfig.star, "fill-[#F5B012] text-[#F5B012]")} />
            {showRating && (
                <span className={cn("font-bold text-[#0B1F51]", sizeConfig.text)}>
                    {formatRating(rating)}
                </span>
            )}
        </div>
    );
};

export default RatingDisplay;
