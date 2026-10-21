'use client';

import React from 'react';
import { motion, MotionProps } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { defaultTransition } from '@/lib/constants/animations';

export interface FadeInSectionProps extends Omit<MotionProps, 'initial' | 'whileInView' | 'viewport'> {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    once?: boolean;
    amount?: number | 'some' | 'all';
}

export const FadeInSection: React.FC<FadeInSectionProps> = ({
    children,
    className,
    delay = 0,
    direction = 'up',
    once = true,
    amount = 0.2,
    ...motionProps
}) => {
    const getInitialState = () => {
        switch (direction) {
            case 'up':
                return { opacity: 0, y: 20 };
            case 'down':
                return { opacity: 0, y: -20 };
            case 'left':
                return { opacity: 0, x: 20 };
            case 'right':
                return { opacity: 0, x: -20 };
            case 'none':
            default:
                return { opacity: 0 };
        }
    };

    const getAnimateState = () => {
        switch (direction) {
            case 'up':
            case 'down':
                return { opacity: 1, y: 0 };
            case 'left':
            case 'right':
                return { opacity: 1, x: 0 };
            case 'none':
            default:
                return { opacity: 1 };
        }
    };

    return (
        <motion.div
            initial={getInitialState()}
            whileInView={getAnimateState()}
            viewport={{ once, amount }}
            transition={{ ...defaultTransition, delay }}
            className={className}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
};
