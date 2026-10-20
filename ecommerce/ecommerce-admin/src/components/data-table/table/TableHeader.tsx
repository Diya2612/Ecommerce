/**
 * TableHeader Component
 * Table header with column definitions and sorting
 */

import { memo } from 'react';
import clsx from 'clsx';
import { ArrowUpDown } from 'lucide-react';
import { CustomCheckbox } from '../shared/CustomCheckbox';
import { alignClass, justifyClass, visibilityClasses, cn } from '../utils/styling';
import type { ColumnConfig } from '../GenericTable';

export interface TableHeaderProps<T> {
  /** Column configurations */
  columns: ColumnConfig<T>[];
  /** Whether selection is enabled */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** Whether all rows are selected */
  allSelected?: boolean;
  /** Whether some rows are selected */
  partiallySelected?: boolean;
  /** Callback to toggle select all */
  onToggleSelectAll?: () => void;
  /** Whether expandable rows are enabled */
  expandable?: boolean;
  /** Whether row actions are displayed */
  hasRowActions?: boolean;
  /** Current sort key */
  sortKey?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSortChange?: (sortKey: string, direction: 'asc' | 'desc') => void;
}

/**
 * Table header component
 */
function TableHeaderComponent<T>({
  columns,
  selectable = false,
  selectionMode = 'multiple',
  allSelected = false,
  partiallySelected = false,
  onToggleSelectAll,
  expandable = false,
  hasRowActions = false,
  sortKey,
  sortDirection,
  onSortChange,
}: TableHeaderProps<T>) {
  const handleHeaderSortClick = (col: ColumnConfig<T>) => {
    if (!col.sortable || !onSortChange) return;

    const key = col.sortKey || String(col.key);
    const isActive = sortKey === key;
    const nextDirection: 'asc' | 'desc' =
      isActive && sortDirection === 'asc' ? 'desc' : 'asc';

    onSortChange(key, nextDirection);
  };

  const renderSortIcon = (col: ColumnConfig<T>) => {
    if (!col.sortable) return null;

    const key = col.sortKey || String(col.key);
    const isActive = sortKey === key;

    return (
      <ArrowUpDown
        size={14}
        className={
          'shrink-0 transition-opacity ' +
          (isActive ? 'opacity-100 text-purple-600' : 'opacity-40 group-hover:opacity-80')
        }
      />
    );
  };

  return (
    <thead className="sticky top-0 z-10 font-bold bg-white border-b border-gray-100">
      <tr>
        {selectable && (
          <th className="px-2 py-3 w-[48px] min-w-[48px] max-w-[48px] bg-white font-bold">
            {selectionMode === 'multiple' ? (
              <CustomCheckbox
                checked={allSelected}
                partial={partiallySelected}
                onChange={onToggleSelectAll || (() => {})}
                aria-label="Select all rows"
              />
            ) : (
              <span className="text-[11px] text-gray-400">Sel.</span>
            )}
          </th>
        )}

        {expandable && <th className="px-4 py-4 w-12 bg-white" />}

        {columns.map((col) => (
          <th
            key={String(col.key)}
            className={cn(
              `px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#253154] group select-none whitespace-nowrap ${alignClass(
                col.align
              )}`,
              visibilityClasses(col.hiddenOnMobile, col.hiddenOn),
              col.sortable && 'cursor-pointer'
            )}
            onClick={() => handleHeaderSortClick(col)}
          >
            <div
              className={clsx(
                'flex items-center gap-1.5',
                justifyClass(col.align)
              )}
            >
              {col.label}
              {renderSortIcon(col)}
            </div>
          </th>
        ))}

        {hasRowActions && (
          <th className="px-6 py-4 text-right text-xs font-extrabold uppercase text-[#253154] bg-white">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
}

TableHeaderComponent.displayName = 'TableHeader';

// Export memoized version
export const TableHeader = memo(TableHeaderComponent) as typeof TableHeaderComponent;
