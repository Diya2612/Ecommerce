import { useState, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';

export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export interface UseListStateProps<TColumn extends ColumnConfig> {
    defaultPage?: number;
    defaultRowsPerPage?: number;
    defaultSort?: string;
    defaultVisibleColumns?: TColumn[];
}

export interface UseListStateReturn<TColumn extends ColumnConfig> {
    // Pagination
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;

    // Search & Filter
    search: string;
    setSearch: (search: string) => void;
    status: string;
    setStatus: (status: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;

    // Sorting
    sort: string;
    setSort: (sort: string) => void;

    // Columns
    visibleColumns: TColumn[];
    toggleColumn: (key: string) => void;
    setVisibleColumns: (columns: TColumn[]) => void;

    // Utilities
    resetFilters: () => void;
}

export function useListState<TColumn extends ColumnConfig = ColumnConfig>({
    defaultPage = 1,
    defaultRowsPerPage = 10,
    defaultSort = '',
    defaultVisibleColumns = [],
}: UseListStateProps<TColumn> = {}): UseListStateReturn<TColumn> {
    // Pagination
    const [page, setPage] = useState(defaultPage);
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('rowsPerPage');
            return stored ? Number(stored) : defaultRowsPerPage;
        }
        return defaultRowsPerPage;
    });

    // Search & Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Sorting
    const [sort, setSort] = useState(defaultSort);

    // Columns
    const [visibleColumns, setVisibleColumns] = useState<TColumn[]>(defaultVisibleColumns);

    const toggleColumn = useCallback((key: string) => {
        setVisibleColumns((prev) =>
            prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)) as TColumn[]
        );
    }, []);

    const resetFilters = useCallback(() => {
        setSearch('');
        setStatus('');
        setDateRange(undefined);
        setPage(1);
        setSort(defaultSort);
    }, [defaultSort]);

    // Reset page when filters change (optional but recommended UX)
    const handleSetSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    const handleSetStatus = useCallback((value: string) => {
        setStatus(value);
        setPage(1);
    }, []);

    return {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        search,
        setSearch: handleSetSearch,
        status,
        setStatus: handleSetStatus,
        dateRange,
        setDateRange,
        sort,
        setSort,
        visibleColumns,
        toggleColumn,
        setVisibleColumns,
        resetFilters,
    };
}
