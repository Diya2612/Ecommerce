'use client';

import { useQueryState } from 'nuqs';
import { ArrowUpDown, Check } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SortSelectClientProps } from '@/types/collection';
import { searchParamsParsers } from '@/lib/search-params';

/**
 * SortSelectClient - Client Component
 * 
 * Sort dropdown that updates URL search params via nuqs.
 */

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

export function SortSelectClient({ currentSort }: SortSelectClientProps) {
    const [, setSort] = useQueryState('sort', searchParamsParsers.sort.withOptions({
        shallow: true,
        history: 'push'
    }));

    // Also need page setter to reset page on sort
    const [, setPage] = useQueryState('page', searchParamsParsers.page.withOptions({
        shallow: true
    }));

    const handleSortChange = (value: string) => {
        setSort(value as any);
        setPage(1); // Reset to first page
    };

    const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Newest First';

    return (
        <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger
                className="w-auto h-auto p-0 border-0 bg-transparent focus:ring-0 hover:bg-transparent data-[state=open]:bg-transparent shadow-none gap-2 group"
            >
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <span className="font-bold text-[#1C2A54] dark:text-white group-hover:text-[#31CDD4] transition-colors">
                        {currentLabel}
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent
                align="end"
                className="min-w-[200px] rounded-xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl p-1"
            >
                {SORT_OPTIONS.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded-lg cursor-pointer focus:bg-[#31CDD4]/10 focus:text-[#31CDD4] py-2.5 px-3 mb-0.5 last:mb-0"
                    >
                        <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{option.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
