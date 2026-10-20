import React from "react";
import { useDiscountList } from "../hooks/useDiscountList";
import { DiscountMetrics } from "../components/list/DiscountMetrics";
import { DiscountListHeader } from "../components/list/DiscountListHeader";
import { DiscountListFilters } from "../components/list/DiscountListFilters";
import { DiscountListTable } from "../components/list/DiscountListTable";

const DiscountListPage: React.FC = () => {
  const {
    discounts,
    metrics,
    total,
    totalPages,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    dateRange,
    setDateRange,
    search,
    handleSearchChange,
    status,
    handleStatusfilter,
    sort,
    handleSortChange,
    visibleColumns,
    toggleColumn,
    clearFilters,
    isLoading,
  } = useDiscountList();

  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      <DiscountListHeader
        dateRange={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
        setDateRange={(val) => setDateRange(val.from ? { from: val.from, to: val.to ?? undefined } : undefined)}
        totalItems={total}
      />

      <DiscountMetrics metrics={metrics} />

      <DiscountListFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusfilter}
        sort={sort}
        onSortChange={handleSortChange}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onClearFilters={clearFilters}
      />

      <DiscountListTable
        discounts={discounts}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalItems={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        sort={sort}
        onSortChange={handleSortChange}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

export default DiscountListPage;

