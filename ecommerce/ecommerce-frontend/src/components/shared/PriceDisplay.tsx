'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatPrice, calculateDiscount } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/lib/constants/colors';

// ============================================================================
// Types
// ============================================================================

export interface PriceDisplayProps {
    /** Current/sale price */
    price: number;
    /** Original price (for showing discount) */
    originalPrice?: number;
    /** Whether to show discount badge */
    showDiscountBadge?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Layout direction */
    direction?: 'row' | 'column';
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CLASSES = {
    sm: {
        price: 'text-[14px]',
        original: 'text-[12px]',
        discount: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
        price: 'text-[18px]',
        original: 'text-[14px]',
        discount: 'text-[12px] px-2 py-0.5',
    },
    lg: {
        price: 'text-[24px]',
        original: 'text-[16px]',
        discount: 'text-[12px] px-2 py-1',
    },
    xl: {
        price: 'text-[32px]',
        original: 'text-[18px]',
        discount: 'text-[14px] px-3 py-1',
    },
};

// ============================================================================
// Component
// ============================================================================

/**
 * PriceDisplay - Displays product price with optional discount
 * 
 * @example Basic usage
 * ```tsx
 * <PriceDisplay price={12999} />
 * ```
 * 
 * @example With discount
 * ```tsx
 * <PriceDisplay 
 *   price={12999} 
 *   originalPrice={18999} 
 *   showDiscountBadge 
 * />
 * ```
 * 
 * @example Large size, row layout
 * ```tsx
 * <PriceDisplay 
 *   price={12999} 
 *   originalPrice={18999}
 *   size="xl"
 *   direction="row"
 *   showDiscountBadge
 * />
 * ```
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    originalPrice,
    showDiscountBadge = true,
    size = 'md',
    direction = 'column',
    className,
}) => {
    const hasDiscount = originalPrice !== undefined && originalPrice > price;
    const discountPercent = hasDiscount
        ? calculateDiscount(originalPrice!, price)
        : 0;
    const sizeConfig = SIZE_CLASSES[size];

    // Column layout (stacked)
    if (direction === 'column') {
        return (
            <div className={cn("flex flex-col", className)}>
                {hasDiscount && (
                    <span className={cn(
                        "text-gray-400 line-through",
                        sizeConfig.original
                    )}>
                        {formatPrice(originalPrice!)}
                    </span>
                )}
                <div className="flex items-baseline gap-2">
                    <span className={cn(
                        "font-bold text-[#0B1F51]",
                        sizeConfig.price
                    )}>
                        {formatPrice(price)}
                    </span>
                    {hasDiscount && showDiscountBadge && (
                        <Badge className={cn(
                            "bg-green-100 text-green-700 hover:bg-green-100",
                            sizeConfig.discount
                        )}>
                            {discountPercent}% OFF
                        </Badge>
                    )}
                </div>
            </div>
        );
    }

    // Row layout (inline)
    return (
        <div className={cn("flex items-baseline gap-3 flex-wrap", className)}>
            <span className={cn(
                "font-bold text-[#0B1F51]",
                sizeConfig.price
            )}>
                {formatPrice(price)}
            </span>
            {hasDiscount && (
                <span className={cn(
                    "text-gray-400 line-through",
                    sizeConfig.original
                )}>
                    {formatPrice(originalPrice!)}
                </span>
            )}
            {hasDiscount && showDiscountBadge && (
                <Badge className={cn(
                    "bg-green-100 text-green-700 hover:bg-green-100",
                    sizeConfig.discount
                )}>
                    {discountPercent}% OFF
                </Badge>
            )}
        </div>
    );
};

export default PriceDisplay;
