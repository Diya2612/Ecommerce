import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import clsx from "clsx";
import { MobileRecordCard } from './MobileRecordCard';
import type { MobileRecordCardProps } from "./MobileRecordCard";
import { MobileSkeleton, TableSkeleton } from './shared/LoadingSkeleton';
import { formatValue, type ColumnType } from './utils/formatters';
import {
    tableWrapperClass,
    mobileCardContainerClass,
    type ColumnAlign,
    type ColumnVisibilityConfig
} from './utils/styling';
import { TableHeader } from './table/TableHeader';
import { TableBody } from './table/TableBody';
import { TablePagination } from './table/TablePagination';
import { TableSelectionBar } from './table/TableSelectionBar';
import { EmptyState } from './table/EmptyState';

export type SelectionMode = "none" | "single" | "multiple";

export interface ColumnConfig<T> {
    key: keyof T | string;
    label: string;
    type?: ColumnType;
    align?: ColumnAlign;
    className?: string; // Additional classes for styling
    hiddenOnMobile?: boolean;
    hiddenOn?: ColumnVisibilityConfig;
    currencySymbol?: string;
    render?: (value: unknown, row: T) => ReactNode;
    link?: (row: T) => string;
    sortable?: boolean;
    sortKey?: string;
    linkClassName?: string;
}

export interface RowAction<T> {
    label: string;
    onClick: (row: T) => void;
    icon?: ReactNode;
    danger?: boolean;
}

export interface GenericTableProps<T> {
    data: T[];
    loading: boolean;

    page: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
    rowsPerPageOptions?: number[];

    getRowId: (row: T) => string;
    columns: ColumnConfig<T>[];

    selectable?: boolean;
    selectionMode?: SelectionMode;
    onSelectionChange?: (selected: T[]) => void;

    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSortChange?: (sortKey: string, direction: "asc" | "desc") => void;

    /** Row interactions */
    onRowClick?: (row: T) => void;
    selectOnRowClick?: boolean;
    getRowClass?: (row: T) => string;
    rowActionsBuilder?: (row: T) => RowAction<T>[];

    /** Expandable rows */
    expandable?: boolean;
    renderExpandedContent?: (row: T) => ReactNode;

    /** Mobile card renderer */
    renderMobileCard?: (row: T) => MobileRecordCardProps;

    /** External selection state */
    externalSelectionIds?: string[];
    onSelectionIdsChange?: (ids: string[]) => void;

    /** Custom states */
    emptyState?: ReactNode;
    loadingState?: ReactNode;
    /** Force table view on mobile */
    forceTableOnMobile?: boolean;
    /** Allow table to fill parent height */
    fullHeight?: boolean;
}

function GenericTable<T extends Record<string, any>>({
    data,
    loading,
    page,
    totalPages,
    rowsPerPage,
    totalItems,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [10, 25, 50],
    getRowId,
    columns,
    selectable = true,
    selectionMode = "multiple",
    onSelectionChange,
    sortKey,
    sortDirection,
    onSortChange,
    onRowClick,
    selectOnRowClick = false,
    getRowClass,
    rowActionsBuilder,
    expandable = false,
    renderExpandedContent,
    renderMobileCard,
    emptyState,
    loadingState,
    forceTableOnMobile,
    fullHeight = false,
    externalSelectionIds,
    onSelectionIdsChange,
}: GenericTableProps<T>) {
    console.log('[GenericTable] Props:', { page, totalPages, rowsPerPage, totalItems, dataLength: data.length });
    const navigate = useNavigate();
    const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

    // Use external state if provided, otherwise fallback to internal
    const isControlled = externalSelectionIds !== undefined;
    const selectedIds = isControlled ? externalSelectionIds : internalSelectedIds;

    const setSelectedIds = (next: string[] | ((prev: string[]) => string[])) => {
        if (isControlled) {
            const nextVal = typeof next === 'function' ? next(externalSelectionIds) : next;
            onSelectionIdsChange?.(nextVal);
        } else {
            setInternalSelectedIds(next);
        }
    };

    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const isSelectionEnabled = selectable && selectionMode !== "none";
    const showSkeleton = loading && data.length === 0;

    const allSelected = useMemo(
        () => data.length > 0 && selectedIds.length === data.length,
        [data, selectedIds]
    );

    const partiallySelected = useMemo(
        () => isSelectionEnabled && selectedIds.length > 0 && !allSelected,
        [isSelectionEnabled, selectedIds, allSelected]
    );

    const toggleSelectAll = () => {
        if (!isSelectionEnabled || selectionMode !== "multiple") return;

        if (allSelected) {
            // Remove all current page IDs from selection
            const currentPageIds = data.map(row => getRowId(row));
            const next = selectedIds.filter(id => !currentPageIds.includes(id));
            setSelectedIds(next);

            if (onSelectionChange) {
                // If we have access to all objects, we should return them, but we don't.
                // For now, we return empty if it's the only page, or the remaining objects if we had them.
                // But onSelectionChange signature is T[], and we don't have all objects.
                // This is a limitation. We'll return filtered data objects.
                onSelectionChange(data.filter(r => next.includes(getRowId(r))));
            }
        } else {
            // Add all current page IDs to selection, avoiding duplicates
            const currentPageIds = data.map(row => getRowId(row));
            const next = Array.from(new Set([...selectedIds, ...currentPageIds]));
            setSelectedIds(next);

            if (onSelectionChange) {
                // Return current items selected + whatever else is in selectedIds (if we had them)
                // Since we only have current page objects, we can only return those + what matches in current data
                onSelectionChange(data.filter(r => next.includes(getRowId(r))));
            }
        }
    };

    const toggleSelectOne = (row: T) => {
        if (!isSelectionEnabled) return;
        const id = getRowId(row);

        let next: string[] = [];

        if (selectionMode === "single") {
            next = selectedIds.includes(id) ? [] : [id];
        } else {
            const exists = selectedIds.includes(id);
            next = exists ? selectedIds.filter((pid) => pid !== id) : [...selectedIds, id];
        }

        setSelectedIds(next);

        if (onSelectionChange) {
            const selectedRows = data.filter((r) => next.includes(getRowId(r)));
            onSelectionChange(selectedRows);
        }
    };

    const toggleExpand = (row: T) => {
        const id = getRowId(row);
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
        );
    };

    // Handler for table body (doesn't need event)
    const handleTableRowClick = onRowClick || ((row: T) => {
        // Find the first column with a link and navigate to it
        const linkColumn = columns.find(col => col.link);
        if (linkColumn && linkColumn.link) {
            const url = linkColumn.link(row);
            navigate(url);
        }
    });

    return (
        <div className={clsx(
            "bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden",
            fullHeight && "flex flex-col h-full"
        )}>
            {/* Selection bar */}
            {isSelectionEnabled && selectedIds.length > 0 && (
                <TableSelectionBar
                    selectedCount={selectedIds.length}
                    onClear={() => {
                        setSelectedIds([]);
                        onSelectionChange?.([]);
                    }}
                />
            )}

            {/* Desktop table */}
            <div className={tableWrapperClass(fullHeight, forceTableOnMobile)}>
                <table className="w-full">
                    <TableHeader
                        columns={columns}
                        selectable={isSelectionEnabled}
                        selectionMode={selectionMode}
                        allSelected={allSelected}
                        partiallySelected={partiallySelected}
                        onToggleSelectAll={toggleSelectAll}
                        expandable={expandable}
                        hasRowActions={!!rowActionsBuilder}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                    />

                    <tbody className="divide-y divide-gray-50">
                        {showSkeleton && !loadingState ? (
                            <TableSkeleton
                                columns={
                                    columns.length +
                                    (isSelectionEnabled ? 1 : 0) +
                                    (expandable ? 1 : 0) +
                                    (rowActionsBuilder ? 1 : 0)
                                }
                            />
                        ) : loading && loadingState ? (
                            <EmptyState
                                colSpan={
                                    columns.length +
                                    (isSelectionEnabled ? 1 : 0) +
                                    (expandable ? 1 : 0) +
                                    (rowActionsBuilder ? 1 : 0)
                                }
                            >
                                {loadingState}
                            </EmptyState>
                        ) : !loading && data.length === 0 ? (
                            <EmptyState
                                colSpan={
                                    columns.length +
                                    (isSelectionEnabled ? 1 : 0) +
                                    (expandable ? 1 : 0) +
                                    (rowActionsBuilder ? 1 : 0)
                                }
                                message={typeof emptyState === 'string' ? emptyState : undefined}
                            >
                                {typeof emptyState !== 'string' ? emptyState : null}
                            </EmptyState>
                        ) : (
                            <TableBody
                                data={data}
                                columns={columns}
                                getRowId={getRowId}
                                selectable={isSelectionEnabled}
                                selectionMode={selectionMode}
                                selectedIds={selectedIds}
                                onToggleSelection={toggleSelectOne}
                                expandable={expandable}
                                expandedIds={expandedIds}
                                onToggleExpand={toggleExpand}
                                renderExpandedContent={renderExpandedContent}
                                rowActionsBuilder={rowActionsBuilder}
                                getRowClass={getRowClass}
                                onRowClick={handleTableRowClick}
                                selectOnRowClick={selectOnRowClick}
                            />
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className={mobileCardContainerClass(forceTableOnMobile)}>
                {showSkeleton && !loadingState && <MobileSkeleton />}

                {loading && loadingState && !showSkeleton && (
                    <p className="text-center text-gray-400 text-sm">{loadingState}</p>
                )}

                {!loading && data.length === 0 && !showSkeleton && (
                    <p className="text-center text-gray-400 text-sm">
                        {emptyState ?? "No records found."}
                    </p>
                )}

                {!loading &&
                    data.map((row) => {
                        const id = getRowId(row);
                        const cardProps: MobileRecordCardProps | null = renderMobileCard
                            ? renderMobileCard(row)
                            : {
                                title: String(row[columns[0]?.key as keyof T] ?? "Record"),
                                fields: columns.slice(1).map((col) => ({
                                    label: col.label,
                                    value: formatValue(
                                        row[col.key as keyof T],
                                        col.type,
                                        col.currencySymbol
                                    ),
                                })),
                            };

                        if (!cardProps) return null;
                        return (
                            <MobileRecordCard
                                key={id}
                                {...cardProps}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                            />
                        );
                    })}
            </div>

            {/* Pagination */}
            <TablePagination
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={totalItems}
                currentPageSize={data.length}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={rowsPerPageOptions}
            />
        </div>
    );
}

export { GenericTable };
