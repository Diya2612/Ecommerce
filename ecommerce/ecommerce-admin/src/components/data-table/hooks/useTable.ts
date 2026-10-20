/**
 * useTable Hook
 * Main API hook for table with built-in state management
 */

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { useSelection } from './useSelection';
import { usePagination } from './usePagination';
import type { SelectionMode } from '../GenericTable';

export interface UseTableOptions<T> {
  data: T[];
  getRowId: (row: T) => string;
  
  // Initial state
  initialPage?: number;
  initialRowsPerPage?: number;
  initialSelectedIds?: string[];
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
  
  // Selection config
  selectable?: boolean;
  selectionMode?: SelectionMode;
  
  // Callbacks
  onSelectionChange?: (selectedRows: T[], selectedIds: string[]) => void;
  onSortChange?: (sortKey: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  
  // Persistence
  persistKey?: string;
}

export interface UseTableReturn<T> {
  // Data
  data: T[];
  currentPageData: T[];
  
  // Pagination
  page: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  
  // Selection
  selectedIds: string[];
  selectedRows: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  toggleSelection: (row: T) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  setSelectedIds: (ids: string[]) => void;
  
  // Sorting
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  setSort: (key: string, direction: 'asc' | 'desc') => void;
  clearSort: () => void;
  
  // Expansion
  expandedIds: string[];
  isExpanded: (id: string) => boolean;
  toggleExpand: (id: string) => void;
  setExpandedIds: (ids: string[]) => void;
  
  // Search
  search: string;
  debouncedSearch: string;
  setSearch: (search: string) => void;
  
  // Column visibility
  visibleColumns: Record<string, boolean>;
  isColumnVisible: (key: string) => boolean;
  toggleColumnVisibility: (key: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
}

/**
 * Main hook for table functionality with built-in state management
 */
export function useTable<T>({
  data,
  getRowId,
  initialPage = 1,
  initialRowsPerPage = 10,
  initialSelectedIds,
  initialSortKey,
  initialSortDirection,
  selectionMode = 'multiple',
  onSelectionChange,
  onSortChange,
  onPageChange,
  onRowsPerPageChange,
  persistKey,
}: UseTableOptions<T>): UseTableReturn<T> {
  // Load persisted preferences
  const loadPersistedPrefs = useCallback(() => {
    if (!persistKey || typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(`table_prefs_${persistKey}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, [persistKey]);

  const persisted = loadPersistedPrefs();

  // Pagination
  const {
    page,
    rowsPerPage,
    totalPages,
    goToPage: internalGoToPage,
    changeRowsPerPage: internalChangeRowsPerPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({
    totalItems: data.length,
    initialPage: persisted.page || initialPage,
    initialRowsPerPage: persisted.rowsPerPage || initialRowsPerPage,
  });

  // Selection
  const {
    selectedIds,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
    setSelectedIds,
    allSelected,
    partiallySelected,
    getSelectedRows,
  } = useSelection<T>({
    mode: selectionMode,
    getRowId,
    selectedIds: initialSelectedIds || persisted.selectedIds,
    onSelectionChange,
  });

  // Sorting
  const [sortKey, setSortKey] = useState<string | undefined>(
    persisted.sortKey || initialSortKey
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(
    persisted.sortDirection || initialSortDirection
  );

  const setSort = useCallback(
    (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
      onSortChange?.(key, direction);
      
      // Persist
      if (persistKey) {
        const prefs = loadPersistedPrefs();
        localStorage.setItem(
          `table_prefs_${persistKey}`,
          JSON.stringify({ ...prefs, sortKey: key, sortDirection: direction })
        );
      }
    },
    [onSortChange, persistKey, loadPersistedPrefs]
  );

  const clearSort = useCallback(() => {
    setSortKey(undefined);
    setSortDirection(undefined);
  }, []);

  // Expansion
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const isExpanded = useCallback(
    (id: string) => expandedIds.includes(id),
    [expandedIds]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  }, []);

  // Search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    persisted.visibleColumns || {}
  );

  const isColumnVisible = useCallback(
    (key: string) => visibleColumns[key] !== false,
    [visibleColumns]
  );

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      setVisibleColumns((prev) => {
        const newState = { ...prev, [key]: !prev[key] };
        
        // Persist
        if (persistKey) {
          const prefs = loadPersistedPrefs();
          localStorage.setItem(
            `table_prefs_${persistKey}`,
            JSON.stringify({ ...prefs, visibleColumns: newState })
          );
        }
        
        return newState;
      });
    },
    [persistKey, loadPersistedPrefs]
  );

  const showAllColumns = useCallback(() => {
    setVisibleColumns((prev) => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = true;
      });
      return newState;
    });
  }, []);

  const hideAllColumns = useCallback(() => {
    setVisibleColumns((prev) => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);

  // Wrapped setters for persistence
  const setPage = useCallback(
    (newPage: number) => {
      internalGoToPage(newPage);
      onPageChange?.(newPage);
    },
    [internalGoToPage, onPageChange]
  );

  const setRowsPerPage = useCallback(
    (rows: number) => {
      internalChangeRowsPerPage(rows);
      onRowsPerPageChange?.(rows);
      
      // Persist
      if (persistKey) {
        const prefs = loadPersistedPrefs();
        localStorage.setItem(
          `table_prefs_${persistKey}`,
          JSON.stringify({ ...prefs, rowsPerPage: rows })
        );
      }
    },
    [internalChangeRowsPerPage, onRowsPerPageChange, persistKey, loadPersistedPrefs]
  );

  // Current page data
  const currentPageData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  // Compute selectedRows, isAllSelected, isPartiallySelected for current page
  const selectedRows = useMemo(() => getSelectedRows(data), [getSelectedRows, data]);
  const isAllSelected = useMemo(() => allSelected(currentPageData), [allSelected, currentPageData]);
  const isPartiallySelected = useMemo(() => partiallySelected(currentPageData), [partiallySelected, currentPageData]);

  // Wrapped toggleSelectAll for current page
  const toggleSelectAll = useCallback(() => {
    toggleAll(currentPageData);
  }, [toggleAll, currentPageData]);

  return {
    // Data
    data,
    currentPageData,
    
    // Pagination
    page,
    rowsPerPage,
    totalPages,
    totalItems: data.length,
    setPage,
    setRowsPerPage,
    goToNextPage,
    goToPreviousPage,
    
    // Selection
    selectedIds,
    selectedRows,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggleSelection: toggleOne,
    toggleSelectAll,
    clearSelection,
    setSelectedIds,
    
    // Sorting
    sortKey,
    sortDirection,
    setSort,
    clearSort,
    
    // Expansion
    expandedIds,
    isExpanded,
    toggleExpand,
    setExpandedIds,
    
    // Search
    search,
    debouncedSearch,
    setSearch,
    
    // Column visibility
    visibleColumns,
    isColumnVisible,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}
