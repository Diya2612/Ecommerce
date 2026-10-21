import React from 'react';
import * as motionClient from 'motion/react-client';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

export interface FloatingCardProps {
    icon?: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    title: string;
    subtitle?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    animation?: 'float-up' | 'float-down' | 'float-horizontal' | 'none';
    variant?: 'glass' | 'solid';
    className?: string;
}

const positionClasses = {
    'top-left': 'top-10 left-0',
    'top-right': 'top-10 right-0',
    'bottom-left': 'bottom-20 left-0',
    'bottom-right': 'bottom-4 right-4',
};

const animationConfigs: Record<string, any> = {
    'float-up': {
        animate: { y: [0, -10, 0] },
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    'float-down': {
        animate: { y: [0, 10, 0] },
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
    },
    'float-horizontal': {
        animate: { x: [0, 5, 0] },
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
    },
    'none': {},
};

/**
 * FloatingCard - Server Component using motion/react-client
 * Since it has no user interaction events (onClick, hover), it can be server rendered.
 */
export const FloatingCard: React.FC<FloatingCardProps> = ({
    icon: Icon,
    iconColor = 'text-[#00C4CC]',
    iconBgColor = 'bg-[#00C4CC]/20',
    title,
    subtitle,
    position,
    animation = 'float-up',
    variant = 'glass',
    className,
}) => {
    const motionProps = animationConfigs[animation];

    const variantClasses = {
        glass: 'bg-white/10 backdrop-blur-md border border-white/20',
        solid: 'bg-white border border-gray-100 shadow-xl',
    };

    const textColors = {
        glass: { title: 'text-white', subtitle: 'text-white/70' },
        solid: { title: 'text-[#0B1F51]', subtitle: 'text-gray-500' },
    };

    return (
        <motionClient.div
            {...motionProps}
            className={cn(
                "z-30 p-3 rounded-input shadow-lg flex items-center gap-3",
                variantClasses[variant],
                position && `absolute ${positionClasses[position]}`,
                className
            )}
        >
            {Icon && (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconBgColor)}>
                    <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
            )}
            <div>
                <div className={cn("text-[12px] font-bold", textColors[variant].title)}>
                    {title}
                </div>
                {subtitle && (
                    <div className={cn("text-[10px] leading-tight", textColors[variant].subtitle)}>
                        {subtitle}
                    </div>
                )}
            </div>
        </motionClient.div>
    );
};
