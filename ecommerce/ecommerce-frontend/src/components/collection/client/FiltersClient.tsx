"use client"
import { useState } from 'react';
import { useQueryStates } from 'nuqs';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CategorySidebar } from '../CategorySidebar';
import { searchParamsParsers } from '@/lib/search-params';
import { useFilterOptions } from '@/hooks/products';
import { useQuery } from '@tanstack/react-query';
import { tierKeys, getTierHierarchy } from '@/queries';
import { cn } from '@/lib/utils';

function FiltersSkeleton() {
    return (
        <aside className="sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-pulse">
            {/* Header Skeleton */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6 space-y-8">
                {/* Categories Section */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="space-y-3 pl-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Section */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                    <div className="flex justify-between">
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                    </div>
                </div>

                {/* Tech Section */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-6" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}

/**
 * FiltersClient - Client Component
 * 
 * Premium sticky sidebar with internal scrolling and accordion sections.
 */

// Internal Accordion Component
function FilterSection({
    title,
    children,
    defaultOpen = false,
    activeCount = 0
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    activeCount?: number;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 group"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#1C2A54] dark:text-white uppercase tracking-wide">
                        {title}
                    </span>
                    {activeCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#31CDD4] text-white text-[10px] font-bold">
                            {activeCount}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-400 group-hover:text-[#31CDD4] transition-all duration-300",
                        isOpen ? "-rotate-180" : "rotate-0"
                    )}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }} // smooth easeOutCubic
                        className="overflow-hidden"
                    >
                        <div className="pb-6 pt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FiltersClient() {
    // Use shared parsers to sync state with URL
    const [filters, setFilters] = useQueryStates(searchParamsParsers, {
        shallow: true, // Client-side filtering (React Query)
        history: 'push'
    });

    // Fetch dynamic filter options (hydrated from server)
    const { data: options } = useFilterOptions({
        params: { categories: filters.categories[0] }
    });

    // Fetch Tier Hierarchy (hydrated from server)
    const { data: tierData } = useQuery({
        queryKey: tierKeys.hierarchy(),
        queryFn: getTierHierarchy,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (!options || !tierData) return <FiltersSkeleton />;

    const activeFiltersCount =
        filters.categories.length +
        filters.technologies.length +
        // filters.ratings.length + // HIDDEN - Rating filter removed
        (filters.minPrice > 0 || filters.maxPrice < options.priceRange.max ? 1 : 0);

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            technologies: [],
            ratings: [],
            minPrice: 0,
            maxPrice: 200000,
            page: 1, // Reset page
            search: null // Clear search if any
        });
    };

    // Single category selection - only one category can be selected at a time
    const selectSingleCategory = (value: string) => {
        const currentValues = filters.categories || [];
        const isCurrentlySelected = currentValues.includes(value);
        
        // If clicking the same category, deselect it (clear all)
        // Otherwise, replace with the new single category
        setFilters({
            categories: isCurrentlySelected ? [] : [value],
            page: 1
        });
    };

    // Multi-select for technologies and ratings
    const toggleArrayFilter = (
        key: 'technologies' | 'ratings',
        value: string
    ) => {
        const currentValues = filters[key] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        // Always use empty array instead of null for consistency with parsers
        setFilters({
            [key]: newValues.length > 0 ? newValues : [],
            page: 1
        });
    };

    return (
        <aside
            className="sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
        >
            {/* Header - Fixed at Top */}
            <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white/95 dark:bg-slate-900/95 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#31CDD4]" />
                    <span className="text-base font-bold text-[#1C2A54] dark:text-white">Filters</span>
                </div>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="h-auto p-0 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-transparent"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto pt-16 px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">

                {/* Categories */}
                <FilterSection title="Categories" defaultOpen={true}>
                    <CategorySidebar
                        selectedCategories={filters.categories}
                        onToggleCategory={(slug) => selectSingleCategory(slug)}
                        tiers={tierData}
                    />
                </FilterSection>

                {/* Price Range */}
                <FilterSection
                    title="Price Range"
                    defaultOpen={true}
                    activeCount={filters.minPrice > 0 || filters.maxPrice < options.priceRange.max ? 1 : 0}
                >
                    <div className="space-y-6 pt-2 px-1">
                        <Slider
                            value={[filters.minPrice, filters.maxPrice]}
                            onValueChange={(value) => {
                                setFilters({
                                    minPrice: value[0],
                                    maxPrice: value[1],
                                    page: 1
                                });
                            }}
                            min={options.priceRange.min}
                            max={options.priceRange.max}
                            step={100}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between">
                            <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 block mb-0.5">Min</span>
                                <span className="text-sm font-semibold text-[#1C2A54] dark:text-white">₹{filters.minPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-[1px] w-4 bg-gray-300 dark:bg-gray-600" />
                            <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 block mb-0.5">Max</span>
                                <span className="text-sm font-semibold text-[#1C2A54] dark:text-white">₹{filters.maxPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Technology */}
                <FilterSection
                    title="Technology"
                    defaultOpen={true}
                    activeCount={filters.technologies.length}
                >
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        {options.technologies.map(tech => {
                            const isChecked = filters.technologies.includes(tech.id);
                            return (
                                <div
                                    key={tech.id}
                                    className={cn(
                                        "flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all group",
                                        isChecked
                                            ? "bg-[#31CDD4]/10"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                    onClick={() => toggleArrayFilter('technologies', tech.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            isChecked
                                                ? "bg-[#31CDD4] border-[#31CDD4] shadow-sm shadow-[#31CDD4]/30"
                                                : "border-gray-300 dark:border-gray-600 group-hover:border-[#31CDD4]"
                                        )}>
                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isChecked ? "text-[#1C2A54] dark:text-white" : "text-gray-600 dark:text-gray-300"
                                        )}>
                                            {tech.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </FilterSection>

                {/* Ratings - HIDDEN */}
                {/*
                <FilterSection
                    title="Rating"
                    defaultOpen={false}
                    activeCount={filters.ratings.length}
                >
                    <div className="space-y-1">
                        {options.ratings.map(rating => {
                            const isChecked = filters.ratings.includes(rating.value);
                            return (
                                <div
                                    key={rating.value}
                                    className={cn(
                                        "flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all group",
                                        isChecked
                                            ? "bg-[#31CDD4]/10"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                    onClick={() => toggleArrayFilter('ratings', rating.value)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            isChecked
                                                ? "bg-[#31CDD4] border-[#31CDD4] shadow-sm shadow-[#31CDD4]/30"
                                                : "border-gray-300 dark:border-gray-600 group-hover:border-[#31CDD4]"
                                        )}>
                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                isChecked ? "text-[#1C2A54] dark:text-white" : "text-gray-600 dark:text-gray-300"
                                            )}>
                                                {rating.value}
                                            </span>
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-xs text-gray-400">& Up</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </FilterSection>
                */}

            </div>
        </aside>
    );
}
