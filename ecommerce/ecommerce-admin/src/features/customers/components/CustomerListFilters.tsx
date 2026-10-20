import React from 'react';
import { FiltersBar } from "@/components/data-table";
import type { CustomerListFiltersProps } from '../types';

const CustomerListFilters: React.FC<CustomerListFiltersProps> = ({
  search,
  onSearchChange,
  setPage,
  visibleColumns,
  onToggleColumn,
  onClearFilters,
  statusFilterOptions,
  genderFilterOptions,
  dateFilterOptions,
  ordersFilterOptions,
  tagsFilterOptions,
  sortOptions,
  actions,
}) => {
  return (
    <FiltersBar
      search={search}
      onSearchChange={(v) => { onSearchChange(v); setPage(1); }}
      filterGroups={[
        {
          id: 'status',
          label: 'Status',
          options: statusFilterOptions
        },
        {
          id: 'gender',
          label: 'Gender',
          options: genderFilterOptions
        },
        {
          id: 'date',
          label: 'Date',
          options: dateFilterOptions
        },
        {
          id: 'orders',
          label: 'Orders',
          options: ordersFilterOptions
        },
        {
          id: 'tags',
          label: 'Tags',
          options: tagsFilterOptions
        }
      ]}
      sortOptions={sortOptions}
      visibleColumns={visibleColumns}
      onToggleColumn={onToggleColumn}
      actions={actions}
      onClearFilters={onClearFilters}
    />
  );
};

export default CustomerListFilters;
