"use client";

import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface SkeletonProps {
    className?: string;
    /** Width in pixels or CSS value */
    width?: number | string;
    /** Height in pixels or CSS value */
    height?: number | string;
    /** Border radius */
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /** Animation type */
    animation?: 'shimmer' | 'pulse' | 'none';
}

const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
};

/**
 * Base skeleton component for profile pages
 */
export function ProfileSkeleton({
    className = '',
    width,
    height,
    rounded = 'md',
    animation = 'shimmer',
}: SkeletonProps) {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    const animationClass =
        animation === 'shimmer'
            ? 'skeleton-shimmer'
            : animation === 'pulse'
                ? 'skeleton-pulse'
                : '';

    return (
        <div
            className={`bg-gray-200 dark:bg-slate-700 ${roundedClasses[rounded]} ${animationClass} ${className}`}
            style={style}
        />
    );
}

/**
 * Text line skeleton
 */
export function SkeletonTextLines({
    lines = 1,
    width = '100%',
    className = '',
}: {
    lines?: number;
    width?: string | string[];
    className?: string;
}) {
    const lineWidths = Array.isArray(width) ? width : Array(lines).fill(width);

    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <ProfileSkeleton
                    key={i}
                    width={lineWidths[i] || '100%'}
                    height={16}
                    rounded="md"
                />
            ))}
        </div>
    );
}

/**
 * Order card skeleton (mobile)
 */
export function SkeletonOrderCard({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 ${className}`}
        >
            <div className="flex items-start gap-3">
                <ProfileSkeleton width={20} height={20} rounded="full" />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                        <ProfileSkeleton width={100} height={14} />
                        <ProfileSkeleton width={60} height={20} rounded="full" />
                    </div>
                    <ProfileSkeleton width="80%" height={12} />
                </div>
            </div>
            <div className="flex gap-2 mt-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <ProfileSkeleton key={i} width={60} height={60} rounded="lg" />
                ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <ProfileSkeleton width={80} height={16} />
                <ProfileSkeleton width={100} height={32} rounded="lg" />
            </div>
        </div>
    );
}

/**
 * Address card skeleton
 */
export function SkeletonAddressCard({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 ${className}`}
        >
            <div className="flex items-center gap-3 mb-3">
                <ProfileSkeleton width={40} height={40} rounded="xl" />
                <div className="flex-1 space-y-1">
                    <ProfileSkeleton width={80} height={14} />
                    <ProfileSkeleton width={100} height={12} />
                </div>
            </div>
            <div className="space-y-1.5 pl-[52px]">
                <ProfileSkeleton width="90%" height={12} />
                <ProfileSkeleton width="70%" height={12} />
                <ProfileSkeleton width="50%" height={12} />
            </div>
        </div>
    );
}

/**
 * Wishlist item skeleton
 */
export function SkeletonWishlistItem({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 flex gap-3 ${className}`}
        >
            <ProfileSkeleton width={80} height={80} rounded="xl" />
            <div className="flex-1 space-y-2 py-0.5">
                <ProfileSkeleton width="100%" height={14} />
                <div className="flex items-center gap-2">
                    <ProfileSkeleton width={12} height={12} rounded="full" />
                    <ProfileSkeleton width={40} height={12} />
                </div>
                <ProfileSkeleton width={80} height={16} />
            </div>
            <ProfileSkeleton width={40} height={40} rounded="xl" />
        </div>
    );
}

/**
 * AMC card skeleton
 */
export function SkeletonAMCCard({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 ${className}`}
        >
            <div className="flex items-center gap-3">
                <ProfileSkeleton width={56} height={56} rounded="full" />
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <ProfileSkeleton width={120} height={14} />
                        <ProfileSkeleton width={50} height={18} rounded="full" />
                    </div>
                    <ProfileSkeleton width="60%" height={12} />
                    <ProfileSkeleton width="40%" height={10} />
                </div>
            </div>
        </div>
    );
}

/**
 * Profile stats skeleton
 */
export function SkeletonProfileStats({
    count = 4,
    className = '',
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div className={`flex gap-2 overflow-x-auto ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-2 shrink-0"
                >
                    <ProfileSkeleton width={28} height={28} rounded="full" />
                    <div className="space-y-1">
                        <ProfileSkeleton width={30} height={12} />
                        <ProfileSkeleton width={40} height={10} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Loading container with optional skeleton children
 */
interface LoadingContainerProps {
    isLoading: boolean;
    skeleton: ReactNode;
    children: ReactNode;
    /** Animate transition */
    animate?: boolean;
}

export function ProfileLoadingContainer({
    isLoading,
    skeleton,
    children,
    animate = true,
}: LoadingContainerProps) {
    if (isLoading) {
        return <>{skeleton}</>;
    }

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        );
    }

    return <>{children}</>;
}
