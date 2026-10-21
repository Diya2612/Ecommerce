'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

export interface SectionHeaderAction {
    /** Action label text */
    label: string;
    /** Href for link actions */
    href?: string;
    /** Click handler for button actions */
    onClick?: () => void;
    /** Action style variant */
    variant?: 'link' | 'button';
}

export interface SectionHeaderProps {
    /** Main title text */
    title: string;
    /** Optional description text */
    description?: string;
    /** Optional badge/tag above title */
    badge?: string;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Title size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Color variant */
    variant?: 'default' | 'gradient' | 'accent' | 'light';
    /** Bottom spacing */
    spacing?: 'compact' | 'normal' | 'relaxed';
    /** Enable entrance animation */
    animate?: boolean;
    /** Optional action button/link */
    action?: SectionHeaderAction;
    /** Container class overrides */
    className?: string;
    /** Title class overrides */
    titleClassName?: string;
    /** Description class overrides */
    descriptionClassName?: string;
    /** Badge class overrides */
    badgeClassName?: string;
    /** Optional children (rendered below description) */
    children?: React.ReactNode;
    /** Use h1 instead of h2 for main page titles */
    as?: 'h1' | 'h2' | 'h3';
}

// ============================================================================
// Style Configurations
// ============================================================================

const SIZE_CLASSES = {
    sm: 'text-[24px] md:text-[32px]',
    md: 'text-[28px] md:text-[40px]',
    lg: 'text-[36px] md:text-[48px]',
    xl: 'text-[40px] md:text-[56px]',
};

const ALIGNMENT_CLASSES = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
};

const SPACING_CLASSES = {
    compact: 'mb-6',
    normal: 'mb-12',
    relaxed: 'mb-16',
};

const VARIANT_CLASSES = {
    default: 'text-[#0B1F51]',
    gradient: 'bg-linear-to-r from-[#0B1F51] to-[#00C4CC] bg-clip-text text-transparent',
    accent: 'text-[#00C4CC]',
    light: 'text-white',
};

const DESCRIPTION_VARIANT_CLASSES = {
    default: 'text-gray-600',
    gradient: 'text-gray-600',
    accent: 'text-gray-600',
    light: 'text-white/80',
};

// ============================================================================
// Component
// ============================================================================

/**
 * SectionHeader - Unified section header component
 * 
 * @example Basic usage
 * ```tsx
 * <SectionHeader
 *   title="Featured Products"
 *   description="Discover our best-selling products"
 * />
 * ```
 * 
 * @example With badge and centered
 * ```tsx
 * <SectionHeader
 *   badge="OUR MISSION"
 *   title="Delivering Excellence"
 *   description="We are committed to quality"
 *   align="center"
 *   variant="gradient"
 * />
 * ```
 * 
 * @example With action link
 * ```tsx
 * <SectionHeader
 *   title="Featured Collection"
 *   description="Meticulously engineered for purity"
 *   action={{
 *     label: "View All Collection →",
 *     href: "/collections",
 *     variant: "link"
 *   }}
 * />
 * ```
 * 
 * @example Hero section (h1, light variant)
 * ```tsx
 * <SectionHeader
 *   as="h1"
 *   title="Welcome to Anant Enterprises"
 *   description="Premium water purification solutions"
 *   align="center"
 *   size="xl"
 *   variant="light"
 * />
 * ```
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    description,
    badge,
    align = 'left',
    size = 'lg',
    variant = 'default',
    spacing = 'normal',
    animate = true,
    action,
    className,
    titleClassName,
    descriptionClassName,
    badgeClassName,
    children,
    as = 'h2',
}) => {
    const HeadingTag = as;

    // Wrapper component (with or without animation)
    const Wrapper = animate ? motion.div : 'div';
    const wrapperProps = animate ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
    } : {};

    // Badge component (with or without animation)
    const BadgeWrapper = animate ? motion.div : 'div';
    const badgeProps = animate ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay: 0.1 },
    } : {};

    // Render action element
    const renderAction = () => {
        if (!action) return null;

        const actionClasses = action.variant === 'link'
            ? "text-[#00C4CC] text-[18px] font-semibold hover:opacity-80 transition-opacity flex items-center gap-1"
            : "px-6 py-3 bg-[#00C4CC] text-white rounded-input font-semibold hover:bg-[#0B1F51] transition-colors";

        if (action.href) {
            return (
                <Link href={action.href} className={actionClasses}>
                    {action.label}
                </Link>
            );
        }

        return (
            <button onClick={action.onClick} className={actionClasses}>
                {action.label}
            </button>
        );
    };

    return (
        <Wrapper
            {...wrapperProps}
            className={cn(
                'w-full',
                align === 'center' && 'max-w-4xl',
                ALIGNMENT_CLASSES[align],
                SPACING_CLASSES[spacing],
                className
            )}
        >
            {/* Badge */}
            {badge && (
                <BadgeWrapper
                    {...badgeProps}
                    className={cn(
                        "inline-block bg-[#00C4CC]/20 backdrop-blur-xs text-[#00C4CC] px-6 py-2 rounded-full text-[14px] font-bold tracking-wide mb-6 border border-[#00C4CC]/30",
                        badgeClassName
                    )}
                >
                    {badge}
                </BadgeWrapper>
            )}

            {/* Title Row (with optional action) */}
            <div className={cn(
                "flex flex-col md:flex-row md:items-end gap-4 md:gap-6",
                align === 'center' && 'justify-center',
                align === 'right' && 'justify-end',
                action && 'justify-between'
            )}>
                <HeadingTag
                    className={cn(
                        SIZE_CLASSES[size],
                        "font-semibold tracking-[-0.01em] leading-[120%]",
                        VARIANT_CLASSES[variant],
                        titleClassName
                    )}
                >
                    {title}
                </HeadingTag>

                {/* Action (for left-aligned layout with action) */}
                {action && align === 'left' && (
                    <div className="shrink-0">
                        {renderAction()}
                    </div>
                )}
            </div>

            {/* Description */}
            {description && (
                <p
                    className={cn(
                        "text-[18px] leading-[150%] mt-4",
                        align === 'center' && 'max-w-3xl mx-auto',
                        DESCRIPTION_VARIANT_CLASSES[variant],
                        descriptionClassName
                    )}
                >
                    {description}
                </p>
            )}

            {/* Action (for centered/right layout) */}
            {action && align !== 'left' && (
                <div className="mt-6">
                    {renderAction()}
                </div>
            )}

            {/* Children slot */}
            {children}
        </Wrapper>
    );
};

export default SectionHeader;
