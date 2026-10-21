"use client";

import { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import Image, { type ImageProps } from 'next/image';
import { motion } from 'motion/react';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
    /** Show blur placeholder while loading */
    blurUp?: boolean;
    /** Skeleton shimmer while loading */
    skeleton?: boolean;
    /** Fade in duration (ms) */
    fadeDuration?: number;
    /** Threshold for intersection observer (0-1) */
    threshold?: number;
    /** Root margin for intersection observer */
    rootMargin?: string;
}

/**
 * Optimized lazy loading image component with:
 * - Intersection Observer based lazy loading
 * - Blur-up effect for smooth reveal
 * - Skeleton shimmer placeholder
 * - Smooth fade-in animation
 */
export function LazyImage({
    src,
    alt,
    blurUp = false,
    skeleton = true,
    fadeDuration = 300,
    threshold = 0.1,
    rootMargin = '50px',
    className = '',
    ...props
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {/* Skeleton placeholder */}
            {skeleton && !isLoaded && (
                <div className="absolute inset-0 skeleton-shimmer rounded-inherit" />
            )}

            {/* Only render image when in view */}
            {isInView && (
                <Image
                    src={src}
                    alt={alt}
                    {...props}
                    className={`transition-all ${blurUp && !isLoaded ? 'blur-lg scale-105' : 'blur-0 scale-100'
                        } ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        transitionDuration: `${fadeDuration}ms`,
                    }}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
}

/**
 * Progressive image with low-quality placeholder
 */
interface ProgressiveImageProps extends Omit<ImageProps, 'placeholder'> {
    /** Low-quality placeholder image URL */
    lowQualitySrc?: string;
}

export function ProgressiveImage({
    src,
    alt,
    lowQualitySrc,
    className = '',
    ...props
}: ProgressiveImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Low quality placeholder */}
            {lowQualitySrc && !isLoaded && (
                <Image
                    src={lowQualitySrc}
                    alt=""
                    {...props}
                    className="absolute inset-0 blur-lg scale-110"
                    priority
                />
            )}

            {/* Full quality image */}
            <Image
                src={src}
                alt={alt}
                {...props}
                className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
}

/**
 * Hook for lazy loading any element
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || hasLoaded) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    setHasLoaded(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [hasLoaded, options]);

    return { ref, isIntersecting, hasLoaded };
}

/**
 * Lazy load wrapper component
 */
interface LazyLoadProps {
    children: React.ReactNode;
    /** Placeholder to show while not in view */
    placeholder?: React.ReactNode;
    /** Skeleton height for placeholder */
    skeletonHeight?: number | string;
    /** Animation when loaded */
    animate?: boolean;
    /** Root margin for observer */
    rootMargin?: string;
    className?: string;
}

export function LazyLoad({
    children,
    placeholder,
    skeletonHeight = 200,
    animate = true,
    rootMargin = '100px',
    className = '',
}: LazyLoadProps) {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin,
            }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [rootMargin]);

    if (!isInView) {
        return (
            <div
                ref={containerRef}
                className={className}
                style={{ minHeight: skeletonHeight }}
            >
                {placeholder || (
                    <div
                        className="skeleton-shimmer rounded-xl"
                        style={{ height: skeletonHeight }}
                    />
                )}
            </div>
        );
    }

    if (animate) {
        return (
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={className}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
