import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    MoreHorizontal,
    ChevronDown,
} from "lucide-react";

import {
    SearchInput,
    FilterButton,
    SortDropdown,
    ColumnToggle,
    ActionsDropdown
} from "./filters";

import DropdownMenu from "../ui/CustomDropdownMenu";
import { CustomCheckbox } from './shared/CustomCheckbox';
import { useDebounce } from './hooks/useDebounce';
import { useTouchGesture } from './hooks/useTouchGesture';
import {
    filterButtonClass,
} from './utils/styling';
import { MOBILE_GESTURE, Z_INDEX } from './utils/constants';

export interface FilterOption {
    label: string;
    value: string;
    onSelect: (value: string) => void;
    isActive?: boolean;
    icon?: React.ReactNode;
}

export interface SortOption {
    label: string;
    value: string;
    onSelect: (value: string) => void;
    isActive?: boolean;
    direction?: "asc" | "desc";
}

interface ColumnItem {
    key: string;
    label: string;
    visible: boolean;
}

interface ActionItem {
    label: string;
    icon: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

export interface FilterGroup {
    id: string;
    label?: string;
    options: FilterOption[];
}

interface FiltersBarProps {
    search: string;
    onSearchChange: (value: string) => void;

    // Support both flat and grouped filters
    filters?: FilterOption[];
    filterGroups?: FilterGroup[];

    sortOptions: SortOption[];

    visibleColumns: ColumnItem[];
    onToggleColumn: (key: string) => void;

    actions: ActionItem[];

    onClearFilters?: () => void;

    /** Optional placeholder for search */
    searchPlaceholder?: string;

    /** Optional custom content (e.g. location selector) */
    customContent?: React.ReactNode;

    /** Optional extra content to render inside the expandable filter panel */
    extraFilterContent?: React.ReactNode;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
    search,
    onSearchChange,
    filters = [],
    filterGroups = [],
    sortOptions,
    visibleColumns,
    onToggleColumn,
    actions,
    onClearFilters,
    searchPlaceholder = "Search",
    customContent,
    extraFilterContent,
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Use touch gesture hook for mobile drawer
    const { handlers: touchHandlers, dragOffset: dragY } = useTouchGesture({
        onDragThreshold: () => setMobileOpen(false),
        threshold: MOBILE_GESTURE.dragThreshold,
        damping: MOBILE_GESTURE.dragDamping,
    });

    // Local search state for immediate input updates
    const [localSearch, setLocalSearch] = useState(search);

    // Use debounce hook for search
    const debouncedSearch = useDebounce(localSearch, 300);

    // Sync debounced search with parent
    useEffect(() => {
        // Only call if actually different to prevent unnecessary resets (especially page resets)
        if (debouncedSearch !== search) {
            onSearchChange(debouncedSearch);
        }
    }, [debouncedSearch, onSearchChange, search]);

    // Update local search when prop changes (e.g., from external reset)
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    const activeFiltersCount = useMemo(() => {
        const isActuallyActive = (f: FilterOption) =>
            f.isActive && f.value !== "" && f.value !== "all" && f.value !== "all-dates";

        const flatActive = filters.filter(isActuallyActive).length;
        const groupActive = filterGroups.reduce(
            (acc, grp) => acc + grp.options.filter(isActuallyActive).length,
            0
        );

        return flatActive + groupActive;
    }, [filters, filterGroups]);

    const activeSort = useMemo(
        () => sortOptions.find((o) => o.isActive),
        [sortOptions]
    );

    const handleShowAllColumns = () => {
        visibleColumns.forEach((col) => {
            if (!col.visible) onToggleColumn(col.key);
        });
    };

    const handleHideAllColumns = () => {
        visibleColumns.forEach((col) => {
            if (col.visible) onToggleColumn(col.key);
        });
    };

    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-4 flex-nowrap">
                {/* SEARCH */}
                <div className="flex-1">
                    <SearchInput
                        value={localSearch}
                        onChange={setLocalSearch}
                        placeholder={searchPlaceholder}
                    />
                </div>

                {/* CUSTOM CONTENT (e.g. Location Selector) */}
                {customContent && (
                    <div className="hidden md:block">
                        {customContent}
                    </div>
                )}

                {/* DESKTOP BUTTONS */}
                <div className="hidden md:flex items-center gap-3">
                    {/* FILTER TOGGLE */}
                    <FilterButton
                        active={showFilters}
                        activeCount={activeFiltersCount}
                        onClick={() => setShowFilters(!showFilters)}
                    />

                    {/* SORT */}
                    <SortDropdown
                        options={sortOptions}
                        hasActiveSort={!!activeSort}
                    />

                    {/* COLUMNS */}
                    <ColumnToggle
                        columns={visibleColumns}
                        onToggle={onToggleColumn}
                        onShowAll={handleShowAllColumns}
                        onHideAll={handleHideAllColumns}
                    />

                    {/* ACTIONS */}
                    <ActionsDropdown actions={actions} />
                </div>

                {/* MOBILE 3 DOT BUTTON */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden h-[50px] w-[50px] rounded-xl border border-gray-200 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    type="button"
                    aria-label="Open filters & actions"
                >
                    <MoreHorizontal size={20} strokeWidth={1.5} />
                </button>
            </div>

            {/* EXPANDABLE FILTER PANEL */}
            {showFilters && (
                <div className="mb-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-200 overflow-visible">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3">
                            {/* FILTER GROUPS */}
                            {filterGroups.map(group => {
                                const activeCount = group.options.filter(o =>
                                    o.isActive && o.value !== "" && o.value !== "all" && o.value !== "all-dates"
                                ).length;
                                return (
                                    <div key={group.id} className="relative">
                                        <DropdownMenu
                                            align="left"
                                            trigger={
                                                <button
                                                    type="button"
                                                    className={filterButtonClass(activeCount > 0, activeCount)}
                                                >
                                                    {group.label}
                                                    {activeCount > 0 && (
                                                        <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                                                            {activeCount}
                                                        </span>
                                                    )}
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </button>
                                            }
                                        >
                                            <div className="p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                                                {group.options.map(option => (
                                                    <div
                                                        key={option.value}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            option.onSelect(option.value);
                                                        }}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <CustomCheckbox
                                                            checked={!!option.isActive}
                                                            onChange={() => option.onSelect(option.value)}
                                                            aria-label={option.label}
                                                        />
                                                        <span className={`text-sm ${option.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </DropdownMenu>
                                    </div>
                                );
                            })}

                            {/* FLAT FILTERS */}
                            {filters.length > 0 && (
                                <div className="relative">
                                    <DropdownMenu
                                        trigger={
                                            <button
                                                type="button"
                                                className={filterButtonClass(
                                                    filters.filter(f => f.isActive && f.value !== "" && f.value !== "all").length > 0,
                                                    filters.filter(f => f.isActive && f.value !== "" && f.value !== "all").length
                                                )}
                                            >
                                                General
                                                {filters.filter(f => f.isActive && f.value !== "" && f.value !== "all").length > 0 && (
                                                    <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                                                        {filters.filter(f => f.isActive && f.value !== "" && f.value !== "all").length}
                                                    </span>
                                                )}
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </button>
                                        }
                                        align="left"
                                    >
                                        <div className="p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                                            {filters.map(filter => (
                                                <div
                                                    key={filter.value}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        filter.onSelect(filter.value);
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <CustomCheckbox
                                                        checked={!!filter.isActive}
                                                        onChange={() => filter.onSelect(filter.value)}
                                                        aria-label={filter.label}
                                                    />
                                                    <span className={`text-sm ${filter.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                        {filter.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* EXTRA FILTER CONTENT */}
                            {extraFilterContent}
                        </div>

                        {/* CLEAR FILTERS BUTTON */}
                        {onClearFilters && activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={onClearFilters}
                                className="text-xs text-purple-700 font-semibold hover:text-purple-800 whitespace-nowrap"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* MOBILE BOTTOM SHEET */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:hidden" style={{ zIndex: Z_INDEX.mobileSheet }}>
                    <div
                        className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
                        style={{ transform: `translateY(${Math.max(0, dragY)}px)` }}
                        {...touchHandlers}
                    >
                        {/* DRAG HANDLE */}
                        <div className="pt-3 pb-2 flex justify-center">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {/* SEARCH */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Search</h3>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        type="search"
                                    />
                                </div>
                            </div>

                            {/* CUSTOM CONTENT */}
                            {customContent && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">Location</h3>
                                    {customContent}
                                </div>
                            )}

                            {/* FILTER GROUPS */}
                            {filterGroups.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">Filters</h3>
                                    <div className="space-y-4">
                                        {filterGroups.map(group => (
                                            <div key={group.id}>
                                                {group.label && (
                                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                                        {group.label}
                                                    </h4>
                                                )}
                                                <div className="space-y-1">
                                                    {group.options.map(option => (
                                                        <label
                                                            key={option.value}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <CustomCheckbox
                                                                checked={!!option.isActive}
                                                                onChange={() => option.onSelect(option.value)}
                                                                aria-label={option.label}
                                                            />
                                                            <span className={`text-sm ${option.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                                {option.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FLAT FILTERS */}
                            {filters.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">General Filters</h3>
                                    <div className="space-y-1">
                                        {filters.map(filter => (
                                            <label
                                                key={filter.value}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            >
                                                <CustomCheckbox
                                                    checked={!!filter.isActive}
                                                    onChange={() => filter.onSelect(filter.value)}
                                                    aria-label={filter.label}
                                                />
                                                <span className={`text-sm ${filter.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                    {filter.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SORT */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Sort By</h3>
                                <div className="space-y-1">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => option.onSelect(option.value)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${option.isActive
                                                ? 'bg-purple-50 text-purple-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            type="button"
                                        >
                                            <span>{option.label}</span>
                                            {option.isActive && option.direction && (
                                                <span className="text-xs uppercase text-purple-600">
                                                    {option.direction}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* COLUMNS */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-900">Visible Columns</h3>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleShowAllColumns}
                                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        >
                                            Show all
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleHideAllColumns}
                                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        >
                                            Hide all
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {visibleColumns.map(col => (
                                        <label
                                            key={col.key}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={col.visible}
                                                onChange={() => onToggleColumn(col.key)}
                                                className="accent-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Actions</h3>
                                <div className="space-y-1">
                                    {actions.map(item => (
                                        <button
                                            key={item.label}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${item.danger
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            type="button"
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CLEAR FILTERS */}
                            {onClearFilters && activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClearFilters();
                                        setMobileOpen(false);
                                    }}
                                    className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-colors"
                                >
                                    Clear all filters ({activeFiltersCount})
                                </button>
                            )}
                        </div>

                        {/* CLOSE BUTTON */}
                        <div className="border-t border-gray-100 p-4">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export { FiltersBar };
