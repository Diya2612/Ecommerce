"use client";

import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ripple {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface TouchRippleProps {
    children: ReactNode;
    className?: string;
    /** Color of the ripple (Tailwind class) */
    color?: string;
    /** Whether ripple is disabled */
    disabled?: boolean;
    /** Duration of ripple animation in ms */
    duration?: number;
    /** Scale factor for ripple size */
    scale?: number;
    /** As which HTML element to render */
    as?: keyof React.JSX.IntrinsicElements;
    /** Additional props to pass to the wrapper */
    onClick?: () => void;
}

export function TouchRipple({
    children,
    className = '',
    color = 'bg-gray-400/30 dark:bg-white/20',
    disabled = false,
    duration = 600,
    scale = 4,
    as: ComponentProp = 'div',
    onClick,
    ...props
}: TouchRippleProps) {
    const Component = ComponentProp as React.ElementType;
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const rippleId = useRef(0);

    const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        let x: number, y: number;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        // Calculate ripple size based on container dimensions
        const size = Math.max(rect.width, rect.height) * 0.3;

        const id = rippleId.current++;
        setRipples(prev => [...prev, { id, x, y, size }]);

        // Remove ripple after animation completes
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, duration);
    }, [disabled, duration]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        createRipple(e);
        onClick?.();
    }, [createRipple, onClick]);

    return (
        <Component
            ref={containerRef as any}
            className={`relative overflow-hidden ${className}`}
            onMouseDown={createRipple}
            onTouchStart={createRipple}
            onClick={handleClick}
            {...props}
        >
            {children}

            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.75 }}
                        animate={{ scale, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: duration / 1000, ease: 'easeOut' }}
                        className={`absolute rounded-full pointer-events-none ${color}`}
                        style={{
                            left: ripple.x - ripple.size / 2,
                            top: ripple.y - ripple.size / 2,
                            width: ripple.size,
                            height: ripple.size,
                        }}
                    />
                ))}
            </AnimatePresence>
        </Component>
    );
}

/**
 * Higher-order component to add touch ripple effect to any component
 */
export function withTouchRipple<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    rippleProps?: Partial<TouchRippleProps>
) {
    return function WithTouchRippleComponent(props: P) {
        return (
            <TouchRipple {...rippleProps}>
                <WrappedComponent {...props} />
            </TouchRipple>
        );
    };
}

/**
 * Standalone ripple hook for manual control
 */
export function useTouchRipple(options?: {
    color?: string;
    duration?: number;
    disabled?: boolean;
}) {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const containerRef = useRef<HTMLElement>(null);
    const rippleId = useRef(0);
    const { color = 'bg-gray-400/30', duration = 600, disabled = false } = options || {};

    const createRipple = useCallback((x: number, y: number) => {
        if (disabled) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 0.3;

        const id = rippleId.current++;
        setRipples(prev => [...prev, { id, x, y, size }]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, duration);
    }, [disabled, duration]);

    const handleEvent = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        let x: number, y: number;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        createRipple(x, y);
    }, [createRipple]);

    const RippleContainer = useCallback(() => (
        <AnimatePresence>
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.75 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 1000, ease: 'easeOut' }}
                    className={`absolute rounded-full pointer-events-none ${color}`}
                    style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}
        </AnimatePresence>
    ), [ripples, color, duration]);

    return {
        containerRef,
        handlers: {
            onMouseDown: handleEvent,
            onTouchStart: handleEvent,
        },
        RippleContainer,
        createRipple,
    };
}
