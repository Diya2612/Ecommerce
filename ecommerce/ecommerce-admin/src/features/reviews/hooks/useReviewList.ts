import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquareText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils';
import { useListState } from '@/hooks/useListState';
import type { MetricItem } from '@/components/metrics';
import type { Review, ReviewSummary } from '../types';
import { reviewService } from '../services';

export interface UseReviewListReturn {
    reviews: Review[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
    search: string;
    setSearch: (search: string) => void;
    statusFilter: string[];
    setStatusFilter: (status: string[]) => void;
    ratingFilter: string[];
    setRatingFilter: (ratings: string[]) => void;
    onClearFilters: () => void;
    sort: { key: string; direction: 'asc' | 'desc' };
    handleSortChange: (key: string, direction: 'asc' | 'desc') => void;
    metrics: MetricItem[];
    getRowId: (row: Review) => string;
    refreshData: () => void;
    handleDelete: (review: Review) => Promise<void>;
    visibleColumns: any[]; // Matches VisibleColumnConfig from useListState
    toggleColumn: (key: string) => void;
    dateRange: import('react-day-picker').DateRange | undefined;
    setDateRange: (range: import('react-day-picker').DateRange | undefined) => void;
    toggleFilter: (current: string[], value: string) => string[];
}

export function useReviewList(): UseReviewListReturn {
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
        visibleColumns,
        toggleColumn,
        resetFilters: resetListFilters
    } = useListState({
        defaultVisibleColumns: [
            { key: 'productName', label: 'Product', visible: true },
            { key: 'userName', label: 'Customer', visible: true },
            { key: 'rating', label: 'Rating', visible: true },
            { key: 'title', label: 'Review Title', visible: true },
            { key: 'status', label: 'Status', visible: true },
            { key: 'createdAt', label: 'Date', visible: true },
        ]
    });

    // Local filter state for multi-select (not supported by useListState)
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [ratingFilter, setRatingFilter] = useState<string[]>([]);
    
    // Sorting State
    const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
    
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({ pending: 0, approved: 0, rejected: 0 });

    // Helper to toggle multi-select filters
    const toggleFilter = useCallback((current: string[], value: string) => {
        if (value === "") return [];
        return current.includes(value) 
            ? current.filter(c => c !== value) 
            : [...current, value];
    }, []);

    // Fetch Data
    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await reviewService.getReviews({
                page,
                limit: rowsPerPage,
                status: statusFilter.length === 1 ? statusFilter[0] : undefined, // Backend currently supports single status in this implementation pattern based on the API schema, but if it expects multiple we might need to adjust
                // We will just pass the first one for now if multiple are selected, ideally the backend should accept comma separated values for status like invitations
                // But from our backend inspection: status: z.enum(['pending', 'approved', 'rejected']).optional() -> only accepts one
                // As a quick fix, if multiple are selected we clear the filter at API level as it's handled differently or send the first one. Let's adapt it to single selection for API matching.
                // Wait, if it allows multiple we should map it. Let's join by comma as the API might handle it despite the narrow schema, or we just pass undefined to fetch all and filter locally if it's strictly enum.
                // Actually, the API strictly expects a SINGLE enum value. So `status: statusFilter.length > 0 ? statusFilter[0] : undefined`.
                ...(statusFilter.length === 1 && { status: statusFilter[0] }),
                rating: ratingFilter.length === 1 ? parseInt(ratingFilter[0]) : undefined,
                from_date: (() => {
                    if (!dateRange?.from) return undefined;
                    const d = new Date(dateRange.from);
                    d.setHours(0, 0, 0, 0);
                    return d.toISOString();
                })(),
                to_date: (() => {
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
                sortBy: sort.key, // API might not support sorting currently, but good to send
                sortOrder: sort.direction,
                // search: search || undefined -> Product name search if supported, backend currently uses 'product_id', we'll rely on backend structure. The backend didn't expose 'search' in query schema
            });

            // If we have multiple selections, we'll filter locally for now to honor the UI selection, since backend API is limited.
            let filteredReviews = data.list.reviews;
            if (statusFilter.length > 1) {
                filteredReviews = filteredReviews.filter(r => statusFilter.includes(r.status));
            }
            if (ratingFilter.length > 1) {
                filteredReviews = filteredReviews.filter(r => ratingFilter.includes(r.rating.toString()));
            }

            setReviews(filteredReviews);
            setTotal(data.list.total);
            setSummary(data.summary);
        } catch (error) {
            notifyError('Failed to load reviews');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage, statusFilter, ratingFilter, dateRange, sort]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Metrics
    const metrics: MetricItem[] = useMemo(() => {
        const totalReviews = summary.pending + summary.approved + summary.rejected;
        
        return [
            { title: 'Total Reviews', value: totalReviews, helperText: 'All customer feedback', icon: MessageSquareText, iconBg: '#6C63FF' },
            { title: 'Pending', value: summary.pending, helperText: 'Awaiting moderation', icon: Clock, iconBg: '#F59E0B' },
            { title: 'Approved', value: summary.approved, helperText: 'Visible on storefront', icon: CheckCircle, iconBg: '#10B981' },
            { title: 'Rejected', value: summary.rejected, helperText: 'Hidden from public', icon: XCircle, iconBg: '#EF4444' },
        ];
    }, [summary]);

    // Handlers
    const handleDelete = async (review: Review) => {
        if (!confirm(`Are you sure you want to delete this review?`)) return;
        try {
            await reviewService.deleteReview(review.id);
            notifySuccess('Review deleted successfully');
            fetchReviews();
        } catch (error) {
            notifyError('Failed to delete review');
        }
    };

    const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
        setSort({ key, direction });
    }, []);

    const resetFilters = useCallback(() => {
        resetListFilters();
        setStatusFilter([]);
        setRatingFilter([]);
        setSort({ key: 'created_at', direction: 'desc' });
    }, [resetListFilters]);

    return {
        reviews,
        total,
        totalPages: Math.ceil(total / rowsPerPage),
        isLoading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        ratingFilter,
        setRatingFilter,
        onClearFilters: resetFilters,
        sort,
        handleSortChange,
        metrics,
        getRowId: (row) => String(row.id),
        refreshData: fetchReviews,
        handleDelete,
        visibleColumns,
        toggleColumn,
        dateRange,
        setDateRange,
        toggleFilter,
    };
}
