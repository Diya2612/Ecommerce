'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface CTAButtonGroupProps {
    primaryText: string;
    primaryHref?: string;
    primaryOnClick?: () => void;
    primaryIcon?: LucideIcon;
    secondaryText?: string;
    secondaryHref?: string;
    secondaryOnClick?: () => void;
    direction?: 'row' | 'column';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: {
        primary: 'h-10 px-6 text-sm',
        secondary: 'h-10 px-6 text-sm',
    },
    md: {
        primary: 'h-14 px-8 text-base',
        secondary: 'h-14 px-8 text-base',
    },
    lg: {
        primary: 'h-16 px-10 text-lg',
        secondary: 'h-16 px-10 text-lg',
    },
};

export const CTAButtonGroup: React.FC<CTAButtonGroupProps> = ({
    primaryText,
    primaryHref,
    primaryOnClick,
    primaryIcon: PrimaryIcon,
    secondaryText,
    secondaryHref,
    secondaryOnClick,
    direction = 'row',
    size = 'md',
    className,
}) => {
    const classes = sizeClasses[size];

    const PrimaryButton = (
        <Button
            onClick={primaryOnClick}
            className={cn(
                "bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
                classes.primary
            )}
        >
            {PrimaryIcon && <PrimaryIcon className="w-5 h-5 mr-2" />}
            {primaryText}
        </Button>
    );

    const SecondaryButton = secondaryText && (
        <Button
            onClick={secondaryOnClick}
            variant="outline"
            className={cn(
                "rounded-xl border-2 border-[#00C4CC]/30 text-[#0B1F51] hover:bg-[#00C4CC]/5 hover:border-[#00C4CC] transition-all duration-300",
                classes.secondary
            )}
        >
            {secondaryText}
        </Button>
    );

    return (
        <div
            className={cn(
                "flex gap-4",
                direction === 'column' ? 'flex-col' : 'flex-wrap',
                className
            )}
        >
            {primaryHref ? (
                <Link href={primaryHref}>{PrimaryButton}</Link>
            ) : (
                PrimaryButton
            )}

            {secondaryText && (
                secondaryHref ? (
                    <Link href={secondaryHref}>{SecondaryButton}</Link>
                ) : (
                    SecondaryButton
                )
            )}
        </div>
    );
};
