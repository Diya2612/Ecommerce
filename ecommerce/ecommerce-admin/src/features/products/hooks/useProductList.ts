import { useMemo, useState, useCallback } from 'react';
import { useListState } from '@/hooks/useListState';
import {
    ShoppingBag,
    CheckCircle,
    Eye,
    AlertTriangle
} from 'lucide-react';
import { useProducts, useProductStats } from './useProducts';
import type { Product } from '../types';
import type { MetricItem } from "@/components/metrics";
import type { VisibleColumnConfig } from "../config/columns.config";

export interface UseProductListReturn {
    products: Product[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    error: Error | null;
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
    search: string;
    setSearch: (search: string) => void;
    status: string[];
    setStatus: (status: string[]) => void;
    dateRange: import('react-day-picker').DateRange | undefined;
    setDateRange: (range: import('react-day-picker').DateRange | undefined) => void;
    sort: string;
    setSort: (sort: string) => void;
    // New sorting fields
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (key: string, direction: 'asc' | 'desc') => void;

    // New Filters
    quickFilters: string[];
    setQuickFilters: (filters: string[]) => void;
    category: string[];
    setCategory: (category: string[]) => void;

    visibleColumns: VisibleColumnConfig[];
    toggleColumn: (key: string) => void;
    metrics: MetricItem[];
    resetFilters: () => void;
}

export function useProductList(): UseProductListReturn {
    // 1. State Management via centralized hook
    const {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        search,
        setSearch,
        dateRange,
        setDateRange,
        sort,
        setSort,
        visibleColumns,
        toggleColumn,
        resetFilters: resetListFilters
    } = useListState({
        defaultVisibleColumns: [
            { key: "primary_image_url", label: "Image", visible: true },
            { key: "product_title", label: "Product", visible: true },
            { key: "selling_price", label: "Selling Price", visible: true },
            { key: "total_stock", label: "Stock", visible: true },
            { key: "status", label: "Status", visible: true },
            { key: "featured", label: "Featured", visible: true },
            { key: "sku", label: "SKU", visible: false },
            { key: "cost_price", label: "Cost Price", visible: false },
            { key: "compare_at_price", label: "Compare Price", visible: false },
            { key: "barcode", label: "Barcode", visible: false },
            { key: "hsn_code", label: "HSN", visible: false },
            { key: "category_tier_1", label: "Category", visible: false },
            { key: "weight", label: "Weight", visible: false },
            { key: "tags", label: "Tags", visible: false },
            { key: "created_at", label: "Created", visible: false },
            { key: "updated_at", label: "Updated", visible: false },
        ]
    });

    // Local filter state for multi-select (not supported by useListState)
    const [status, setStatus] = useState<string[]>([]);
    const [category, setCategory] = useState<string[]>([]);
    const [quickFilters, setQuickFilters] = useState<string[]>([]);

    // Sorting State
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Handle preset sort options from dropdown
    const handlePresetSort = useCallback((value: string) => {
        setSort(value);
        const presets: Record<string, { by: string; order: 'asc' | 'desc' }> = {
            newest: { by: 'created_at', order: 'desc' },
            oldest: { by: 'created_at', order: 'asc' },
            price_desc: { by: 'selling_price', order: 'desc' },
            price_asc: { by: 'selling_price', order: 'asc' },
        };
        
        const preset = presets[value];
        if (preset) {
            setSortBy(preset.by);
            setSortOrder(preset.order);
        }
    }, [setSort]);

    // Handle column sorting from table headers
    const handleHeaderSort = useCallback((key: string, direction: 'asc' | 'desc') => {
        setSortBy(key);
        setSortOrder(direction);
        setSort(`${key}_${direction}`);
    }, [setSort]);

    // Derive stockStatus from quickFilters
    const derivedStockStatus: string[] = [];
    if (quickFilters.includes('low-stock')) derivedStockStatus.push('low_stock');
    if (quickFilters.includes('zero-available')) derivedStockStatus.push('out_of_stock');

    // 2. Fetch data from API using React Query
    const { data, isLoading, error } = useProducts({
        page,
        limit: rowsPerPage,
        search: search || undefined,
        status: status.length > 0 ? status : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        stockStatus: derivedStockStatus.length > 0 ? (derivedStockStatus as any) : undefined,
        category_tier_1: category.length > 0 ? category : undefined,
        quickFilter: quickFilters.filter(f => !['low-stock', 'zero-available'].includes(f)),
        startDate: (() => {
            if (!dateRange?.from) return undefined;
            const d = new Date(dateRange.from);
            d.setHours(0, 0, 0, 0);
            return d.toISOString();
        })(),
        endDate: (() => {
            if (dateRange?.to) {
                const d = new Date(dateRange.to);
                d.setHours(23, 59, 59, 999);
                return d.toISOString();
            } else if (dateRange?.from) {
                const d = new Date(dateRange.from);
                d.setHours(23, 59, 59, 999);
                return d.toISOString();
            }
            return undefined;
        })(),
    });

    // Extract products and pagination from API response
    const products = data?.products || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    // 3. Metrics Calculation (Global Stats)
    const { data: statsData } = useProductStats();

    const metrics: MetricItem[] = useMemo(() => {
        // Use global stats if available, otherwise default to 0 (rendering logic handles loading state usually, or just 0)
        const globalStats = statsData || { total: 0, active: 0, featured: 0, out_of_stock: 0, low_stock: 0 };

        return [
            { title: "Total Products", value: globalStats.total, helperText: "All products", icon: ShoppingBag, iconBg: "#735DFF" },
            { title: "Active", value: globalStats.active, helperText: "Available for sale", icon: CheckCircle, iconBg: "#2ECC71" },
            { title: "Featured", value: globalStats.featured, helperText: "Promoted products", icon: Eye, iconBg: "#F5A623" },
            { title: "Out of Stock", value: globalStats.out_of_stock, helperText: "Unavailable items", icon: AlertTriangle, iconBg: "#E74C3C" },
            { title: "Low Stock (≤ 5)", value: globalStats.low_stock, helperText: "Running low", icon: AlertTriangle, iconBg: "#F39C12" },
        ];
    }, [statsData]);


    return {
        // Data & State
        products,
        total,
        totalPages,
        isLoading,
        error: error as Error | null,

        // Pagination
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,

        // Filters
        search,
        setSearch,
        status,
        setStatus,
        dateRange,
        setDateRange,
        sort,
        setSort: handlePresetSort,

        // Expanded Sorting
        sortBy,
        sortOrder,
        onSortChange: handleHeaderSort,

        // Additional Filters
        quickFilters,
        setQuickFilters,
        category,
        setCategory,

        // View Config
        visibleColumns,
        toggleColumn,

        // Metrics
        metrics,
        
        // Reset
        resetFilters: useCallback(() => {
            resetListFilters();
            setStatus([]);
            setQuickFilters([]);
            setCategory([]);
            setSortBy('created_at');
            setSortOrder('desc');
        }, [resetListFilters]),
    };
}
