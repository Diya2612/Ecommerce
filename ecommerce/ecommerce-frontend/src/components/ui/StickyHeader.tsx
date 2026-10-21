"use client";

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface StickyHeaderProps {
    children: ReactNode;
    /** Offset from top (in pixels) when the header becomes sticky */
    offset?: number;
    /** Additional class names */
    className?: string;
    /** Show shadow when sticky */
    showShadow?: boolean;
    /** Blur backdrop when sticky */
    backdropBlur?: boolean;
    /** Hide when scrolling down, show when scrolling up */
    hideOnScroll?: boolean;
    /** Compact mode content (shown when sticky) */
    compactContent?: ReactNode;
    /** Z-index for the sticky header */
    zIndex?: number;
}

export function StickyHeader({
    children,
    offset = 0,
    className = '',
    showShadow = true,
    backdropBlur = true,
    hideOnScroll = false,
    compactContent,
    zIndex = 30,
}: StickyHeaderProps) {
    const [isSticky, setIsSticky] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const headerRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const placeholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const headerTop = placeholderRef.current?.getBoundingClientRect().top ?? 0;

            // Check if should be sticky
            setIsSticky(headerTop <= offset);

            // Handle hide on scroll
            if (hideOnScroll) {
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    // Scrolling down
                    setIsVisible(false);
                } else {
                    // Scrolling up
                    setIsVisible(true);
                }
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [offset, hideOnScroll]);

    return (
        <>
            {/* Placeholder to maintain layout when header becomes fixed */}
            <div ref={placeholderRef}>
                {!isSticky && (
                    <div ref={headerRef} className={className}>
                        {children}
                    </div>
                )}
            </div>

            {/* Sticky header when scrolled */}
            <AnimatePresence>
                {isSticky && (
                    <motion.div
                        initial={{ y: hideOnScroll ? -100 : 0, opacity: 0 }}
                        animate={{
                            y: isVisible ? 0 : -100,
                            opacity: isVisible ? 1 : 0
                        }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            zIndex,
                            top: offset,
                        }}
                        className={`fixed left-0 right-0 ${className} ${showShadow ? 'shadow-sm' : ''
                            } ${backdropBlur ? 'backdrop-blur-md bg-white/90 dark:bg-slate-900/90' : 'bg-white dark:bg-slate-900'
                            }`}
                    >
                        {compactContent || children}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/**
 * Progress indicator that shows scroll progress
 */
interface ScrollProgressProps {
    className?: string;
    color?: string;
    height?: number;
}

export function ScrollProgress({
    className = '',
    color = 'bg-[#00C4CC]',
    height = 2,
}: ScrollProgressProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <motion.div
            style={{ scaleX, transformOrigin: 'left' }}
            className={`fixed top-0 left-0 right-0 ${color} ${className}`}
            initial={{ height }}
        />
    );
}

/**
 * Hook for detecting scroll position and direction
 */
export function useScrollPosition() {
    const [scrollPosition, setScrollPosition] = useState({
        x: 0,
        y: 0,
        direction: 'none' as 'up' | 'down' | 'none',
        isAtTop: true,
        isAtBottom: false,
    });
    const lastY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const direction = currentY > lastY.current ? 'down' : currentY < lastY.current ? 'up' : 'none';
            const isAtTop = currentY <= 10;
            const isAtBottom =
                window.innerHeight + currentY >= document.documentElement.scrollHeight - 10;

            setScrollPosition({
                x: window.scrollX,
                y: currentY,
                direction,
                isAtTop,
                isAtBottom,
            });

            lastY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollPosition;
}

/**
 * Component that fades/transforms based on scroll position
 */
interface ScrollFadeProps {
    children: ReactNode;
    /** Start fading at this scroll position (px) */
    startFade?: number;
    /** Complete fade at this scroll position (px) */
    endFade?: number;
    /** Direction of fade: 'in' fades from invisible to visible, 'out' fades from visible to invisible */
    direction?: 'in' | 'out';
    /** Additional transformations */
    translateY?: number;
}

export function ScrollFade({
    children,
    startFade = 0,
    endFade = 100,
    direction = 'out',
    translateY = 0,
}: ScrollFadeProps) {
    const { scrollY } = useScroll();

    const opacity = useTransform(
        scrollY,
        [startFade, endFade],
        direction === 'out' ? [1, 0] : [0, 1]
    );

    const y = useTransform(
        scrollY,
        [startFade, endFade],
        [0, translateY]
    );

    return (
        <motion.div style={{ opacity, y }}>
            {children}
        </motion.div>
    );
}
