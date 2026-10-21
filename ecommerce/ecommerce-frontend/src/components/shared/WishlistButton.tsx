'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { colors } from '@/lib/constants/colors';

// ============================================================================
// Types
// ============================================================================

export interface WishlistButtonProps {
    /** Whether the item is currently in the wishlist */
    isActive: boolean;
    /** Click handler */
    onClick: (e: React.MouseEvent) => void;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Style variant */
    variant?: 'default' | 'outline-solid' | 'solid';
    /** Additional CSS classes */
    className?: string;
    /** Accessible label */
    ariaLabel?: string;
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
        button: 'w-9 h-9',
        icon: 'w-5 h-5',
    },
    lg: {
        button: 'w-14 h-14',
        icon: 'w-6 h-6',
    },
};

// ============================================================================
// Component
// ============================================================================

/**
 * WishlistButton - Animated wishlist heart button
 * 
 * @example Default (floating button style)
 * ```tsx
 * <WishlistButton 
 *   isActive={isInWishlist} 
 *   onClick={handleToggle} 
 * />
 * ```
 * 
 * @example Outline variant (for dialogs/forms)
 * ```tsx
 * <WishlistButton 
 *   isActive={isInWishlist} 
 *   onClick={handleToggle}
 *   variant="outline"
 *   size="lg"
 * />
 * ```
 */
export const WishlistButton: React.FC<WishlistButtonProps> = ({
    isActive,
    onClick,
    size = 'md',
    variant = 'default',
    className,
    ariaLabel,
}) => {
    const sizeConfig = SIZE_CLASSES[size];
    const label = ariaLabel || (isActive ? "Remove from wishlist" : "Add to wishlist");

    // Outline variant (for dialogs/modals)
    if (variant === 'outline-solid') {
        return (
            <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={cn(
                    "rounded-input border-2 p-0 flex items-center justify-center transition-all",
                    sizeConfig.button,
                    isActive
                        ? "border-red-100 bg-red-50 text-[#EF4444]"
                        : "border-gray-100 hover:bg-gray-50 text-gray-600",
                    className
                )}
                aria-label={label}
            >
                <Heart className={cn(sizeConfig.icon, isActive && "fill-current")} />
            </motion.button>
        );
    }

    // Solid variant (always filled background)
    if (variant === 'solid') {
        return (
            <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                className={cn(
                    "rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                    sizeConfig.button,
                    isActive
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500",
                    className
                )}
                aria-label={label}
            >
                <Heart className={cn(sizeConfig.icon, isActive && "fill-current")} />
            </motion.button>
        );
    }

    // Default variant (floating button style)
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "rounded-full flex items-center justify-center transition-all duration-300 shadow-xs",
                sizeConfig.button,
                isActive
                    ? "bg-[#0B1F51] text-white"
                    : "bg-white/90 text-gray-400 hover:text-[#EF4444] hover:bg-white",
                className
            )}
            aria-label={label}
        >
            <Heart className={cn(sizeConfig.icon, isActive && "fill-current")} />
        </motion.button>
    );
};

export default WishlistButton;
