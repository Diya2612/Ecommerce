'use client';

import { getStockStatus, getStockBadgeColor, getStockMessage, getStockIcon } from '@/lib/inventory/stock-utils';
import { cn } from '@/lib/utils/cn';

interface StockBadgeProps {
    available: number;
    reserved?: number;
    size?: 'sm' | 'md' | 'lg';
    showQuantity?: boolean;
    className?: string;
}

/**
 * StockBadge Component
 * 
 * Displays real-time stock availability with color-coded status indicator.
 * 
 * @example
 * ```tsx
 * <StockBadge available={15} size="md" />
 * <StockBadge available={3} showQuantity={true} size="sm" />
 * <StockBadge available={0} />
 * ```
 */
export function StockBadge({
    available,
    reserved = 0,
    size = 'md',
    showQuantity = true,
    className,
}: StockBadgeProps) {
    const actualAvailable = Math.max(0, available - reserved);
    const status = getStockStatus(actualAvailable);
    const colorClasses = getStockBadgeColor(status);
    const message = getStockMessage(actualAvailable);
    const icon = getStockIcon(status);

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    if (status === 'out_of_stock') {
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border font-medium',
                    colorClasses,
                    sizeClasses[size],
                    className
                )}
                data-testid="stock-badge"
                data-status="out_of_stock"
            >
                <span className="w-2 h-2 rounded-full bg-current" />
                Out of Stock
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium',
                colorClasses,
                sizeClasses[size],
                status === 'low_stock' && 'animate-pulse',
                className
            )}
            data-testid="stock-badge"
            data-status={status}
        >
            <span className={cn(
                'w-2 h-2 rounded-full bg-current',
                status === 'in_stock' && 'animate-pulse'
            )} />
            {showQuantity ? message : 'In Stock'}
        </span>
    );
}
