/**
 * TableBody Component
 * Table body with rows and cell rendering
 */

import { memo } from 'react';
import React from 'react';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CustomCheckbox } from '../shared/CustomCheckbox';
import { Badge } from '../shared/Badge';
import { TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { formatValue } from '../utils/formatters';
import { cellClass, visibilityClasses } from '../utils/styling';
import type { ColumnConfig, RowAction } from '../GenericTable';

export interface TableBodyProps<T> {
  /** Data rows */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Column configurations */
  columns: ColumnConfig<T>[];
  /** Function to get unique row ID */
  getRowId: (row: T) => string;
  /** Whether selection is enabled */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** Selected row IDs */
  selectedIds?: string[];
  /** Callback to toggle row selection */
  onToggleSelection?: (row: T) => void;
  /** Whether expandable rows are enabled */
  expandable?: boolean;
  /** Expanded row IDs */
  expandedIds?: string[];
  /** Callback to toggle row expansion */
  onToggleExpand?: (row: T) => void;
  /** Render function for expanded content */
  renderExpandedContent?: (row: T) => ReactNode;
  /** Function to build row actions */
  rowActionsBuilder?: (row: T) => RowAction<T>[];
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void;
  /** Whether clicking row should select it */
  selectOnRowClick?: boolean;
  /** Function to get custom row class */
  getRowClass?: (row: T) => string;
  /** Custom loading state */
  loadingState?: ReactNode;
  /** Custom empty state */
  emptyState?: ReactNode;
}

/**
 * Table body component
 */
function TableBodyComponent<T extends Record<string, any>>({
  data,
  loading = false,
  columns,
  getRowId,
  selectable = false,
  selectionMode = 'multiple',
  selectedIds = [],
  onToggleSelection,
  expandable = false,
  expandedIds = [],
  onToggleExpand,
  renderExpandedContent,
  rowActionsBuilder,
  onRowClick,
  selectOnRowClick = false,
  getRowClass,
  loadingState,
  emptyState,
}: TableBodyProps<T>) {
  const navigate = useNavigate();
  const showSkeleton = loading && data.length === 0;

  const colsCount =
    columns.length +
    (selectable ? 1 : 0) +
    (expandable ? 1 : 0) +
    (rowActionsBuilder ? 1 : 0);

  const handleRowClick = (row: T, e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('input') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="checkbox"]')
    ) {
      return;
    }

    // If selectOnRowClick is enabled, toggle selection
    if (selectOnRowClick && selectable && onToggleSelection) {
      onToggleSelection(row);
      return;
    }

    // First check if onRowClick is provided
    if (onRowClick) {
      onRowClick(row);
      return;
    }

    // Otherwise, find the first column with a link and navigate to it
    const linkColumn = columns.find((col) => col.link);
    if (linkColumn && linkColumn.link) {
      const url = linkColumn.link(row);
      navigate(url);
    }
  };

  const renderCellContent = (col: ColumnConfig<T>, row: T) => {
    const rawValue = row[col.key as keyof T];

    let content: ReactNode;

    if (col.render) {
      content = col.render(rawValue, row);
    } else if (col.type === 'image') {
      content = rawValue ? (
        <img
          src={String(rawValue)}
          className="w-10 h-10 rounded-lg object-cover"
          alt=""
        />
      ) : (
        '—'
      );
    } else if (col.type === 'badge') {
      content = <Badge value={rawValue} variant="auto" />;
    } else {
      content = formatValue(rawValue, col.type, col.currencySymbol);
    }

    if (col.link) {
      content = (
        <Link
          to={col.link(row)}
          className={col.linkClassName || 'text-black font-medium'}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  // Loading skeleton
  if (showSkeleton && !loadingState) {
    return <TableSkeleton columns={colsCount} />;
  }

  // Custom loading state
  if (loading && loadingState) {
    return <EmptyState colSpan={colsCount}>{loadingState}</EmptyState>;
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <EmptyState colSpan={colsCount}>
        {emptyState ?? 'No records found.'}
      </EmptyState>
    );
  }

  // Render data rows
  return (
    <>
      {data.map((row) => {
        const id = getRowId(row);
        const isExpanded = expandedIds.includes(id);
        const isSelected = selectedIds.includes(id);
        const rowClass = getRowClass?.(row) ?? '';
        const rowActions = rowActionsBuilder?.(row) ?? [];

        return (
          <React.Fragment key={id}>
            <tr
              className={clsx(
                'border-t border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer',
                rowClass,
                isSelected && 'bg-purple-50/30'
              )}
              onClick={(e) => handleRowClick(row, e)}
            >
              {selectable && (
                <td
                  className="px-2 py-2.5 align-middle w-[48px] min-w-[48px] max-w-[48px]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {selectionMode === 'multiple' ? (
                    <CustomCheckbox
                      checked={isSelected}
                      onChange={() => onToggleSelection?.(row)}
                      aria-label={`Select row ${id}`}
                    />
                  ) : (
                    <input
                      type="radio"
                      className="rounded border-gray-300"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelection?.(row);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </td>
              )}
              {expandable && (
                <td className="px-4 py-4 align-middle w-12">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand?.(row);
                    }}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </td>
              )}

              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cellClass(
                    col.align,
                    visibilityClasses(col.hiddenOnMobile, col.hiddenOn),
                    col.className
                  )}
                >
                  {renderCellContent(col, row)}
                </td>
              ))}

              {rowActions.length > 0 && (
                <td className="px-6 py-4 text-right text-sm">
                  <div className="inline-flex gap-1">
                    {rowActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] transition-colors ' +
                          (action.danger
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50')
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>

            {
              expandable && isExpanded && renderExpandedContent && (
                <tr className="bg-gray-50/50">
                  <td
                    colSpan={colsCount}
                    className="px-6 py-4 text-sm"
                  >
                    {renderExpandedContent(row)}
                  </td>
                </tr>
              )
            }
          </React.Fragment >
        );
      })}
    </>
  );
}

TableBodyComponent.displayName = 'TableBody';

// Export memoized version
export const TableBody = memo(TableBodyComponent) as typeof TableBodyComponent;
