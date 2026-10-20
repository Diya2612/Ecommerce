/**
 * TableSelectionBar Component
 * Displays selection count and clear action
 */

import { memo } from 'react';

export interface TableSelectionBarProps {
  /** Number of selected rows */
  selectedCount: number;
  /** Callback to clear selection */
  onClear: () => void;
}

/**
 * Selection bar displayed when rows are selected
 */
const TableSelectionBarComponent: React.FC<TableSelectionBarProps> = ({
  selectedCount,
  onClear,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="px-6 py-3 bg-purple-50 border-b border-purple-100 text-xs text-[#253154] flex items-center justify-between">
      <span>
        {selectedCount} record{selectedCount > 1 ? 's' : ''} selected.
      </span>
      <button
        type="button"
        className="font-semibold text-purple-700 hover:text-purple-800 transition-colors"
        onClick={onClear}
      >
        Clear selection
      </button>
    </div>
  );
};

// Export memoized version
export const TableSelectionBar = memo(TableSelectionBarComponent);

TableSelectionBar.displayName = 'TableSelectionBar';
