import React from 'react';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons } from '@/components/data-table';
import { MetricsGrid } from '@/components/metrics';
import { useCustomerList } from '../hooks/useCustomerList';

import CustomerListTable from '../components/CustomerListTable';
import CustomerListFilters from '../components/CustomerListFilters';

import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

// Main Customer List Page Component
const CustomerListPage: React.FC = () => {
  const {
    dateRange,
    setDateRange,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sort,
    customers,
    total,
    totalPages,
    metrics,
    onClearFilters,
    visibleColumns,
    toggleColumn,
    filteredColumns,
    renderMobileCard,
    handleSortChange,
    statusFilterOptions,
    genderFilterOptions,
    dateFilterOptions,
    ordersFilterOptions,
    tagsFilterOptions,
    sortOptions,
    actions,
    handleSelectionChange,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleConfirmDelete,
    selectedCustomers,
    selectedCustomerIds,
    handleSelectionIdsChange
  } = useCustomerList();




  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      <div className="flex justify-between items-center">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <ActionButtons
          primaryLabel="Create Customer"
          primaryTo="/customers/new"
          totalItems={total}
          supportsDateRange={true}
          allowUpdate={true}
        />
      </div>

      <MetricsGrid metrics={metrics} />

      <CustomerListFilters
        search={search}
        page={page}
        onSearchChange={setSearch}
        setPage={setPage}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onClearFilters={onClearFilters}
        statusFilterOptions={statusFilterOptions}
        genderFilterOptions={genderFilterOptions}
        dateFilterOptions={dateFilterOptions}
        ordersFilterOptions={ordersFilterOptions}
        tagsFilterOptions={tagsFilterOptions}
        sortOptions={sortOptions}
        actions={actions}
      />

      <CustomerListTable
        customers={customers}
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        sort={sort}
        onSortChange={handleSortChange}
        filteredColumns={filteredColumns}
        renderMobileCard={renderMobileCard}
        onSelectionChange={handleSelectionChange}
        selectedCustomerIds={selectedCustomerIds}
        onSelectionIdsChange={handleSelectionIdsChange}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedCustomers.length} Customer(s)`}
        description="Are you sure you want to delete the selected customers? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CustomerListPage;
