import  { useState } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { MetricsGrid } from '@/components/metrics';
import { FiltersBar } from '@/components/data-table/FiltersBar';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { notifySuccess, notifyError } from '@/utils';
import { reviewService } from '../services';
import { useReviewList } from '../hooks';
import { REVIEW_FILTER_CONFIG } from '../constants/filters';
import { REVIEW_SORT_OPTIONS } from '../constants/sorts';
import { getReviewColumnConfig } from '../config/columns.config';
import { ReviewListTable, ReviewDetailModal } from '../components';
import type { Review } from '../types';

export const ReviewListPage = () => {
    const listState = useReviewList();
    const columns = getReviewColumnConfig();

    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Bulk action state
    const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
    const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const filterGroups = REVIEW_FILTER_CONFIG(
        listState.statusFilter,
        listState.setStatusFilter,
        listState.ratingFilter,
        listState.setRatingFilter,
        listState.toggleFilter,
        listState.setPage
    );

    const sortOptions = REVIEW_SORT_OPTIONS(
        listState.sort,
        listState.handleSortChange,
        listState.setPage
    );

    const handleRowClick = (review: Review) => {
        setSelectedReview(review);
        setIsDetailModalOpen(true);
    };

    const handleBulkAction = async (action: 'approved' | 'rejected' | 'delete') => {
        if (!selectedIds.length) return;
        setIsProcessing(true);
        try {
            if (action === 'delete') {
                for (const id of selectedIds) {
                    await reviewService.deleteReview(id);
                }
                notifySuccess(`Successfully deleted ${selectedIds.length} review(s)`);
            } else {
                for (const id of selectedIds) {
                    await reviewService.moderateReview(id, { status: action });
                }
                notifySuccess(`Successfully ${action} ${selectedIds.length} review(s)`);
            }
            setSelectedIds([]);
            listState.refreshData();
        } catch (error: any) {
             notifyError(`Failed to ${action} some reviews`);
        } finally {
            setIsProcessing(false);
            setIsBulkApproveOpen(false);
            setIsBulkRejectOpen(false);
            setIsBulkDeleteOpen(false);
        }
    };

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <DateRangePicker
                    value={{ from: listState.dateRange?.from || null, to: listState.dateRange?.to || null }}
                    onChange={(val) => listState.setDateRange({ from: val.from || undefined, to: val.to || undefined })}
                    className="w-full md:w-auto"
                />
            </div>

            {/* Metrics */}
            <MetricsGrid metrics={listState.metrics} />

            {/* Filters */}
            <FiltersBar
                search={listState.search}
                onSearchChange={listState.setSearch}
                filterGroups={filterGroups}
                sortOptions={sortOptions}
                visibleColumns={listState.visibleColumns}
                onToggleColumn={listState.toggleColumn}
                onClearFilters={listState.onClearFilters}
                actions={
                    selectedIds.length > 0
                        ? [
                              {
                                  label: `Approve (${selectedIds.length})`,
                                  icon: <CheckCircle className="w-4 h-4" />,
                                  onClick: () => setIsBulkApproveOpen(true),
                              },
                              {
                                  label: `Reject (${selectedIds.length})`,
                                  icon: <XCircle className="w-4 h-4" />,
                                  danger: true,
                                  onClick: () => setIsBulkRejectOpen(true),
                              },
                              {
                                  label: `Delete (${selectedIds.length})`,
                                  icon: <Trash2 className="w-4 h-4" />,
                                  danger: true,
                                  onClick: () => setIsBulkDeleteOpen(true),
                              }
                          ]
                        : []
                }
            />

            {/* Table */}
            <ReviewListTable
                reviews={listState.reviews}
                loading={listState.isLoading}
                page={listState.page}
                totalPages={listState.totalPages}
                rowsPerPage={listState.rowsPerPage}
                total={listState.total}
                onPageChange={listState.setPage}
                onRowsPerPageChange={listState.setRowsPerPage}
                columns={columns.filter(col => listState.visibleColumns.find(vc => vc.key === col.key)?.visible)}
                getRowId={listState.getRowId}
                sortKey={listState.sort.key}
                sortDirection={listState.sort.direction}
                onSortChange={listState.handleSortChange}
                onSelectionChange={(selected) => setSelectedIds(selected.map(r => r.id))}
                onRowClick={handleRowClick}
            />

            <ReviewDetailModal
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                review={selectedReview}
                onSuccess={() => {
                    listState.refreshData();
                    setSelectedReview(null);
                }}
            />

            {/* Bulk Action Confirmations */}
            <ConfirmationDialog
                isOpen={isBulkApproveOpen}
                onClose={() => setIsBulkApproveOpen(false)}
                title="Approve Reviews"
                description={`Are you sure you want to approve ${selectedIds.length} review(s)? This will make them visible to customers.`}
                confirmText="Approve Reviews"
                variant="default"
                onConfirm={() => handleBulkAction('approved')}
                isLoading={isProcessing}
            />

            <ConfirmationDialog
                isOpen={isBulkRejectOpen}
                onClose={() => setIsBulkRejectOpen(false)}
                title="Reject Reviews"
                description={`Are you sure you want to reject ${selectedIds.length} review(s)? They will not be visible to customers.`}
                confirmText="Reject Reviews"
                variant="destructive"
                onConfirm={() => handleBulkAction('rejected')}
                isLoading={isProcessing}
            />

            <ConfirmationDialog
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                title="Delete Reviews"
                description={`Are you sure you want to completely delete ${selectedIds.length} review(s)? This cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => handleBulkAction('delete')}
                isLoading={isProcessing}
            />
        </div>
    );
};

export default ReviewListPage;
