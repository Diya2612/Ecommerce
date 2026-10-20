import React from 'react';
import { useGiftCardList } from "../hooks/useGiftCardList";
import { GiftCardMetrics } from "../components/list/GiftCardMetrics";
import { GiftCardListHeader } from "../components/list/GiftCardListHeader";
import { GiftCardListFilters } from "../components/list/GiftCardListFilters";
import { GiftCardListTable } from "../components/list/GiftCardListTable";

const GiftCardListPage: React.FC = () => {
  const {
    giftCards,
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
  } = useGiftCardList();

  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      <GiftCardListHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        totalItems={total}
      />

      <GiftCardMetrics metrics={metrics} />

      <GiftCardListFilters
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

      <GiftCardListTable
        giftCards={giftCards}
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

export default GiftCardListPage;
