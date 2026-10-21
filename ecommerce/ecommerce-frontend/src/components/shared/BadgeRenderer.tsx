'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { colors } from '@/lib/constants/colors';

// ============================================================================
// Types
// ============================================================================

export type BadgeVariant = 'new' | 'bestseller' | 'premium' | 'sale' | 'custom';

export interface BadgeRendererProps {
    /** The text to display in the badge */
    text: string;
    /** Badge style variant */
    variant?: BadgeVariant;
    /** Additional CSS classes */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Badge Configuration
// ============================================================================

const BADGE_CONFIGS: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
    new: {
        label: 'NEW ARRIVAL',
        bg: 'bg-[#D0F4F0]',
        text: 'text-[#115E59]'
    },
    bestseller: {
        label: 'BESTSELLER',
        bg: 'bg-[#FFF4C2]',
        text: 'text-[#854D0E]'
    },
    premium: {
        label: 'PREMIUM',
        bg: 'bg-[#E8D9FF]',
        text: 'text-[#6B21A8]'
    },
    sale: {
        label: 'SALE',
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]'
    },
    custom: {
        label: '',
        bg: 'bg-gray-100',
        text: 'text-gray-700'
    },
};

const SIZE_CLASSES = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-4 py-1.5 text-[12px]',
    lg: 'px-5 py-2 text-[14px]',
};

// ============================================================================
// Component
// ============================================================================

/**
 * BadgeRenderer - Renders a styled badge with predefined variants
 * 
 * @example
 * ```tsx
 * <BadgeRenderer text="NEW ARRIVAL" variant="new" />
 * <BadgeRenderer text="50% OFF" variant="sale" size="lg" />
 * <BadgeRenderer text="Custom Badge" variant="custom" />
 * ```
 */
export const BadgeRenderer: React.FC<BadgeRendererProps> = ({
    text,
    variant = 'custom',
    className,
    size = 'md',
}) => {
    const config = BADGE_CONFIGS[variant];
    const displayText = text || config.label;
    const sizeClasses = SIZE_CLASSES[size];

    return (
        <Badge
            className={cn(
                "border-none rounded-[6px] font-bold tracking-wide shadow-lg",
                config.bg,
                config.text,
                sizeClasses,
                className
            )}
        >
            {displayText}
        </Badge>
    );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determines badge variant from product attributes
 */
export function getBadgeVariant(product: {
    isNew?: boolean;
    rating?: number;
    label?: string;
}): BadgeVariant {
    if (product.label) {
        const labelMap: Record<string, BadgeVariant> = {
            'BESTSELLER': 'bestseller',
            'NEW ARRIVAL': 'new',
            'NEW': 'new',
            'PREMIUM': 'premium',
            'SALE': 'sale',
        };
        return labelMap[product.label.toUpperCase()] || 'custom';
    }

    if (product.isNew) return 'new';
    if (product.rating && product.rating >= 4.9) return 'bestseller';
    return 'premium';
}

/**
 * Gets badge text from variant if not provided
 */
export function getBadgeText(variant: BadgeVariant, customText?: string): string {
    if (customText) return customText;
    return BADGE_CONFIGS[variant].label;
}

export default BadgeRenderer;
