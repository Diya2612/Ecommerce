'use client';

import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

interface MobileActionBarProps {
    onSortClick: () => void;
    onFilterClick: () => void;
    filterCount?: number;
    className?: string;
}

export function MobileActionBar({
    onSortClick,
    onFilterClick,
    filterCount = 0,
    className
}: MobileActionBarProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-gray-800",
            "lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]",
            className
        )}>
            <div className="flex h-14 items-center">
                <Button
                    variant="ghost"
                    className="flex-1 h-full rounded-none border-r border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 gap-2 font-medium"
                    onClick={onSortClick}
                >
                    <ArrowUpDown className="w-4 h-4" />
                    Sort
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 h-full rounded-none text-[#0B1F51] dark:text-[#31CDD4] gap-2 font-semibold"
                    onClick={onFilterClick}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                    {filterCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-[#0B1F51] text-white text-[10px] rounded-full">
                            {filterCount}
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
