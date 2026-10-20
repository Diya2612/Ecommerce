/**
 * useSelection Hook
 * Manages selection state for table rows
 */

import { useState, useCallback, useMemo } from 'react';

export type SelectionMode = 'none' | 'single' | 'multiple';

export interface UseSelectionOptions<T> {
  /** Selection mode */
  mode?: SelectionMode;
  /** Function to get unique ID from a row */
  getRowId: (row: T) => string;
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[], selectedIds: string[]) => void;
  /** External controlled selection IDs */
  selectedIds?: string[];
  /** Callback for external control */
  onSelectedIdsChange?: (ids: string[]) => void;
}

export interface UseSelectionReturn<T> {
  /** Currently selected row IDs */
  selectedIds: string[];
  /** Check if a row is selected */
  isSelected: (rowId: string) => boolean;
  /** Toggle selection for a single row */
  toggleOne: (row: T) => void;
  /** Toggle selection for all rows on current page */
  toggleAll: (rows: T[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if all rows are selected */
  allSelected: (rows: T[]) => boolean;
  /** Check if some (but not all) rows are selected */
  partiallySelected: (rows: T[]) => boolean;
  /** Get selected rows from a dataset */
  getSelectedRows: (allRows: T[]) => T[];
  /** Set selected IDs directly */
  setSelectedIds: (ids: string[]) => void;
}

/**
 * Hook for managing table row selection
 */
export function useSelection<T>({
  mode = 'multiple',
  getRowId,
  onSelectionChange,
  selectedIds: externalSelectedIds,
  onSelectedIdsChange,
}: UseSelectionOptions<T>): UseSelectionReturn<T> {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  // Determine if we're in controlled mode
  const isControlled = externalSelectedIds !== undefined;
  const selectedIds = isControlled ? externalSelectedIds : internalSelectedIds;

  // Memoize selected IDs as a Set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  /**
   * Update selected IDs (handles both controlled and uncontrolled)
   */
  const updateSelectedIds = useCallback(
    (newIds: string[], rows?: T[]) => {
      if (isControlled) {
        onSelectedIdsChange?.(newIds);
      } else {
        setInternalSelectedIds(newIds);
      }

      // Trigger selection change callback if provided
      if (onSelectionChange && rows) {
        const selectedRows = rows.filter((row) => newIds.includes(getRowId(row)));
        onSelectionChange(selectedRows, newIds);
      }
    },
    [isControlled, onSelectedIdsChange, onSelectionChange, getRowId]
  );

  /**
   * Check if a row is selected
   */
  const isSelected = useCallback(
    (rowId: string): boolean => {
      return selectedSet.has(rowId);
    },
    [selectedSet]
  );

  /**
   * Toggle selection for a single row
   */
  const toggleOne = useCallback(
    (row: T) => {
      if (mode === 'none') return;

      const rowId = getRowId(row);

      let newIds: string[];
      if (mode === 'single') {
        // Single selection: toggle on/off
        newIds = selectedSet.has(rowId) ? [] : [rowId];
      } else {
        // Multiple selection: add or remove
        if (selectedSet.has(rowId)) {
          newIds = selectedIds.filter((id) => id !== rowId);
        } else {
          newIds = [...selectedIds, rowId];
        }
      }

      updateSelectedIds(newIds, [row]);
    },
    [mode, getRowId, selectedIds, selectedSet, updateSelectedIds]
  );

  /**
   * Toggle selection for all rows
   */
  const toggleAll = useCallback(
    (rows: T[]) => {
      if (mode !== 'multiple') return;

      const currentPageIds = rows.map(getRowId);
      const allCurrentSelected = currentPageIds.every((id) => selectedSet.has(id));

      let newIds: string[];
      if (allCurrentSelected) {
        // Deselect all from current page
        newIds = selectedIds.filter((id) => !currentPageIds.includes(id));
      } else {
        // Select all from current page (avoid duplicates)
        const idsToAdd = currentPageIds.filter((id) => !selectedSet.has(id));
        newIds = [...selectedIds, ...idsToAdd];
      }

      updateSelectedIds(newIds, rows);
    },
    [mode, getRowId, selectedIds, selectedSet, updateSelectedIds]
  );

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    updateSelectedIds([]);
  }, [updateSelectedIds]);

  /**
   * Check if all rows are selected
   */
  const allSelected = useCallback(
    (rows: T[]): boolean => {
      if (rows.length === 0) return false;
      return rows.every((row) => selectedSet.has(getRowId(row)));
    },
    [selectedSet, getRowId]
  );

  /**
   * Check if some (but not all) rows are selected
   */
  const partiallySelected = useCallback(
    (rows: T[]): boolean => {
      if (rows.length === 0) return false;
      const selectedCount = rows.filter((row) => selectedSet.has(getRowId(row))).length;
      return selectedCount > 0 && selectedCount < rows.length;
    },
    [selectedSet, getRowId]
  );

  /**
   * Get selected rows from a dataset
   */
  const getSelectedRows = useCallback(
    (allRows: T[]): T[] => {
      return allRows.filter((row) => selectedSet.has(getRowId(row)));
    },
    [selectedSet, getRowId]
  );

  /**
   * Set selected IDs directly
   */
  const setSelectedIds = useCallback(
    (ids: string[]) => {
      updateSelectedIds(ids);
    },
    [updateSelectedIds]
  );

  return {
    selectedIds,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
    allSelected,
    partiallySelected,
    getSelectedRows,
    setSelectedIds,
  };
}
