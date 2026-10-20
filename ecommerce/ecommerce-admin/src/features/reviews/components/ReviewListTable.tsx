import React from 'react';
import { GenericTable } from '@/components/data-table/GenericTable';
import type { ColumnConfig } from '@/components/data-table/GenericTable';
import type { Review } from '../types';

interface ReviewListTableProps {
    reviews: Review[];
    loading: boolean;
    page: number;
    totalPages: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
    columns: ColumnConfig<Review>[];
    getRowId: (row: Review) => string;
    sortKey: string;
    sortDirection: 'asc' | 'desc';
    onSortChange: (key: string, direction: 'asc' | 'desc') => void;
    forceTableOnMobile?: boolean;
    onSelectionChange?: (selected: Review[]) => void;
    renderMobileCard?: (row: Review) => {
        title: string;
        subtitle?: string;
        primaryValue?: string;
        badges?: React.ReactNode;
        fields?: { label: string; value: string | React.ReactNode }[];
    };
    onRowClick?: (row: Review) => void;
}

export const ReviewListTable: React.FC<ReviewListTableProps> = ({
    reviews,
    loading,
    page,
    totalPages,
    rowsPerPage,
    total,
    onPageChange,
    onRowsPerPageChange,
    columns,
    getRowId,
    sortKey,
    sortDirection,
    onSortChange,
    forceTableOnMobile = false,
    onSelectionChange,
    renderMobileCard,
    onRowClick,
}) => {
    return (
        <GenericTable<Review>
            data={reviews}
            loading={loading}
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={total}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            getRowId={getRowId}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            selectable={true}
            onSelectionChange={onSelectionChange}
            forceTableOnMobile={forceTableOnMobile}
            renderMobileCard={renderMobileCard}
            onRowClick={onRowClick}
            emptyState={
                <div className="text-center py-8">
                    <p className="text-gray-500 font-medium">No reviews found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        There are no reviews matching your current filters.
                    </p>
                </div>
            }
        />
    );
};
