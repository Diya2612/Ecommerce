'use client';

import { useState, useEffect } from 'react';
import { useQueryStates } from 'nuqs';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { searchParamsParsers } from '@/lib/search-params';
import { useFilterOptions } from '@/hooks/products';

/**
 * MobileFiltersClient - Client Component
 * 
 * Mobile filter sheet with floating button - matches original ProductFilters design.
 * Uses useQueryStates to sync with URL parameters.
 */
interface MobileFiltersClientProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function MobileFiltersClient({ isOpen, onOpenChange }: MobileFiltersClientProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled or uncontrolled state
    const open = isOpen !== undefined ? isOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    // Use shared parsers to sync state with URL
    const [filters, setFilters] = useQueryStates(searchParamsParsers, {
        shallow: true, // Client-side filtering
        history: 'push'
    });

    // Fetch dynamic filter options (hydrated from server)
    const { data: options } = useFilterOptions({
        params: { categories: filters.categories[0] }
    });

    // Local state for price slider to prevent excessive URL updates while dragging
    const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

    // Sync local state when filters change externally
    useEffect(() => {
        setPriceRange([filters.minPrice, filters.maxPrice]);
    }, [filters.minPrice, filters.maxPrice]);


    if (!options) return null;

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

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            technologies: [],
            ratings: [],
            minPrice: 0,
            maxPrice: 200000,
            page: 1,
            search: null
        });
    };

    const activeFiltersCount =
        filters.categories.length +
        filters.technologies.length +
        // filters.ratings.length + // HIDDEN - Rating filter removed
        (filters.minPrice > 0 || filters.maxPrice < options.priceRange.max ? 1 : 0);

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Active Filters Count */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-[14px] font-semibold text-[#0B1F51]">
                        {activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Applied
                    </span>
                    <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="text-[14px] text-[#00C4CC] hover:text-[#0B1F51] p-0 h-auto font-semibold"
                    >
                        Clear All
                    </Button>
                </div>
            )}

            {/* Price Range */}
            <div>
                <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-6">Price Range</h3>
                <div className="space-y-6">
                    <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        onValueCommit={(value) => {
                            setFilters({
                                minPrice: value[0],
                                maxPrice: value[1],
                                page: 1
                            });
                        }}
                        min={options.priceRange.min}
                        max={options.priceRange.max}
                        step={100}
                        className="w-full py-4"
                    />
                    <div className="flex items-center justify-between">
                        <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="text-[12px] text-gray-500 block mb-1">Min Price</span>
                            <span className="text-[16px] font-bold text-[#0B1F51]">₹{priceRange[0].toLocaleString('en-IN')}</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="text-[12px] text-gray-500 block mb-1">Max Price</span>
                            <span className="text-[16px] font-bold text-[#0B1F51]">₹{priceRange[1].toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category */}
            <div>
                <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-4">Category</h3>
                <div className="space-y-3">
                    {options.categories.map(category => (
                        <div key={category.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`mobile-cat-${category.id}`}
                                    checked={filters.categories.includes(category.id)}
                                    onCheckedChange={() => selectSingleCategory(category.id)}
                                    className="border-2 border-gray-300 data-[state=checked]:bg-[#0B1F51] data-[state=checked]:border-[#0B1F51]"
                                />
                                <label
                                    htmlFor={`mobile-cat-${category.id}`}
                                    className="text-[14px] font-medium text-gray-700 cursor-pointer group-hover:text-[#0B1F51] transition-colors"
                                >
                                    {category.label}
                                </label>
                            </div>
                            <span className="text-[12px] text-gray-400 font-medium">({category.count})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technology */}
            <div>
                <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-4">Technology</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {options.technologies.map(tech => (
                        <div key={tech.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`mobile-tech-${tech.id}`}
                                    checked={filters.technologies.includes(tech.id)}
                                    onCheckedChange={() => toggleArrayFilter('technologies', tech.id)}
                                    className="border-2 border-gray-300 data-[state=checked]:bg-[#0B1F51] data-[state=checked]:border-[#0B1F51]"
                                />
                                <label
                                    htmlFor={`mobile-tech-${tech.id}`}
                                    className="text-[14px] font-medium text-gray-700 cursor-pointer group-hover:text-[#0B1F51] transition-colors"
                                >
                                    {tech.label}
                                </label>
                            </div>
                            <span className="text-[12px] text-gray-400 font-medium">({tech.count})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customer Ratings */}
            <div>
                <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-4">Customer Rating</h3>
                <div className="space-y-3">
                    {options.ratings.map(rating => (
                        <div key={rating.value} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`mobile-rating-${rating.value}`}
                                    checked={filters.ratings.includes(rating.value)}
                                    onCheckedChange={() => toggleArrayFilter('ratings', rating.value)}
                                    className="border-2 border-gray-300 data-[state=checked]:bg-[#0B1F51] data-[state=checked]:border-[#0B1F51]"
                                />
                                <label
                                    htmlFor={`mobile-rating-${rating.value}`}
                                    className="text-[14px] font-medium text-gray-700 cursor-pointer group-hover:text-[#0B1F51] transition-colors"
                                >
                                    {rating.value}★ & above
                                </label>
                            </div>
                            <span className="text-[12px] text-gray-400 font-medium">({rating.count})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <Drawer open={open} onOpenChange={setOpen}>

            <DrawerContent className="h-[85vh] flex flex-col rounded-t-[28px]">
                <div className="flex-none px-6 pb-2 pt-2">
                    <DrawerTitle className="text-[22px] font-bold text-[#0B1F51] dark:text-white">
                        Filter Products
                    </DrawerTitle>
                    <DrawerDescription className="sr-only">
                        Filter products by category, technology, price range and ratings
                    </DrawerDescription>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4 pb-32">
                    <FilterContent />
                </div>

                <div className="flex-none p-6 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <Button
                        onClick={() => setOpen(false)}
                        className="w-full bg-[#0B1F51] hover:bg-[#152C6B] text-white rounded-input h-14 text-[16px] font-semibold transition-all active:scale-[0.98]"
                    >
                        Apply Filters
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
