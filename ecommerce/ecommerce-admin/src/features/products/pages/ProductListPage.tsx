
import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Copy,
    XCircle
} from 'lucide-react';
import { useProductList } from "../hooks/useProductList";
import { useTiers } from "@/features/tiers/hooks/useTiers";
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons, FiltersBar, GenericTable, type MobileRecordCardProps } from "@/components/data-table";
import { MetricsGrid } from "@/components/metrics";
import { ROUTES } from "@/lib/constants";
import { useBulkDeleteProducts, useDuplicateProducts } from "../hooks/useProducts";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { useDialog } from "@/hooks";
import { PRODUCT_FILTER_OPTIONS, PRODUCT_SORT_OPTIONS } from "../constants";
import { getProductColumnConfig } from "../config/columns.config";
import { getProductStatusBadge } from "../constants/statuses";

const ProductListPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        products,
        total,
        isLoading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        search,
        setSearch,
        status,
        setStatus,
        dateRange,
        setDateRange,
        sort,
        setSort,
        sortBy,
        sortOrder,
        onSortChange,
        quickFilters,
        setQuickFilters,
        category,
        setCategory,
        visibleColumns,
        toggleColumn,
        metrics,
        resetFilters
    } = useProductList();

    // Track selected rows for bulk actions
    const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    // Dialog management
    const deleteDialog = useDialog();

    const bulkDeleteMutation = useBulkDeleteProducts();

    const duplicateProductMutation = useDuplicateProducts();

    const { data: tiersData } = useTiers({ level: 1, status: 'active' });
    const tiers = tiersData || [];


    const handleDeleteClick = () => {
        if (selectedRows.length === 0) return;
        deleteDialog.open();
    };

    const handleConfirmDelete = () => {
        const ids = selectedRows.map(row => row.id);

        bulkDeleteMutation.mutate(ids, {
            onSuccess: () => {
                deleteDialog.close();
                setSelectedRows([]); // Clear selection after delete
                setSelectedIds([]); // Clear selection IDs
            }
        });
    };

    const handleDuplicateProducts = () => {
        if (selectedRows.length === 0) return;

        const ids = selectedRows.map(row => row.id);
        duplicateProductMutation.mutate(ids, {
            onSuccess: () => {
                setSelectedIds([]); // Clear selection IDs
                setSelectedRows([]); // Clear selection
            }
        });
    };





    const actions = [
        {
            label: "Duplicate Product",
            icon: <Copy size={16} />,
            disabled: selectedRows.length === 0,
            onClick: handleDuplicateProducts
        },
        {
            label: "Delete Product",
            icon: <XCircle size={16} />,
            danger: true,
            disabled: selectedRows.length === 0,
            onClick: handleDeleteClick
        },
    ];

    const renderMobileCard = React.useCallback((row: any): MobileRecordCardProps => {
        const statusStr = (row.status || "").toLowerCase();
        const badgeStyle = getProductStatusBadge(statusStr);

        return {
            title: row.product_title,
            subtitle: row.sku || row.id,
            primaryValue: row.selling_price ? `₹${row.selling_price}` : undefined,
            imageUrl: row.primary_image_url || undefined,
            badges: (
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeStyle} capitalize`}>
                    {row.status || "—"}
                </span>
            ),
            fields: [
                {
                    label: "Stock",
                    value: String(row.total_stock ?? 0),
                },
                {
                    label: "Category",
                    value: row.category_tier_1 ? (tiers.find((t: any) => t.id === row.category_tier_1)?.name || "—") : "—",
                },
                {
                    label: "Updated",
                    value: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—",
                },
            ],
        };
    }, [tiers]);

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Date range + Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-auto">
                        <DateRangePicker
                            value={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
                            onChange={(val) => setDateRange(val.from ? { from: val.from, to: val.to ?? undefined } : undefined)}
                        />
                    </div>
                </div>
                <ActionButtons
                    primaryLabel="Create Product"
                    primaryTo="/products/add"
                />
            </div>



            {/* Metrics */}
            <MetricsGrid metrics={metrics} />

            {/* Filters Bar */}
            <FiltersBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                filterGroups={[
                    PRODUCT_FILTER_OPTIONS.STATUS(status, setStatus, setPage),
                    PRODUCT_FILTER_OPTIONS.QUICK_FILTERS(quickFilters, setQuickFilters, setPage),
                    PRODUCT_FILTER_OPTIONS.CATEGORY(category, setCategory, setPage, tiers),
                ]}
                sortOptions={PRODUCT_SORT_OPTIONS(sort, setSort, setPage)}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                actions={actions}
                onClearFilters={resetFilters}
            />

            {/* Table */}
            <GenericTable
                data={products}
                loading={isLoading}
                externalSelectionIds={selectedIds}
                onSelectionIdsChange={setSelectedIds}
                onSelectionChange={setSelectedRows}
                page={page}
                totalPages={Math.ceil(total / rowsPerPage)}
                rowsPerPage={rowsPerPage}
                totalItems={total}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                getRowId={(row) => row.id}
                columns={getProductColumnConfig(visibleColumns, tiers)}
                sortKey={sortBy}
                sortDirection={sortOrder}
                onSortChange={onSortChange}
                onRowClick={(row) => navigate(ROUTES.PRODUCTS.DETAIL(row.id))}
                renderMobileCard={renderMobileCard}
            />

            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={deleteDialog.close}
                onConfirm={handleConfirmDelete}
                title={`Delete ${selectedRows.length} Product(s)`}
                description="Are you sure you want to delete the selected products? This action cannot be undone."
                confirmText={bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                variant="destructive"
                isLoading={bulkDeleteMutation.isPending}
            />
        </div>
    );
};

export default ProductListPage;
