import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
    /**
     * The content to be rendered inside the header
     */
    children: ReactNode;

    /**
     * Optional additional className
     */
    className?: string;

    /**
     * Optional ID for the header element
     */
    id?: string;

    /**
     * Offset from top in pixels (default 0)
     * Can be used if there are other sticky elements
     */
    topOffset?: number;
}

/**
 * StickyHeader
 * 
 * A layout primitive that handles the "stickiness" and visual styling 
 * (glass-morphism, border, shadow) for page headers.
 * 
 * @example
 * <StickyHeader>
 *   <div className="flex justify-between">...</div>
 * </StickyHeader>
 */
export function StickyHeader({
    children,
    className,
    id,
    topOffset = 0
}: StickyHeaderProps) {
    return (
        <div
            id={id}
            style={{ top: topOffset }}
            className={cn(
                // Layout
                "sticky z-20 mb-6 py-4",
                "transition-all duration-200",

                // Negative margins to stretch full width within padding container
                "-mx-1 px-7 lg:px-9",

                // Visuals (Glassmorphism)
                "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
                "border-b border-slate-200 shadow-sm",

                className
            )}
        >
            {children}
        </div>
    );
}
