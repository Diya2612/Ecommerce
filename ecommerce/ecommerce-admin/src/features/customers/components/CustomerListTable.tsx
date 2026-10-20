import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { GenericTable } from "@/components/data-table";
import type { Customer, CustomerListTableProps } from '../types';

const CustomerListTable: React.FC<CustomerListTableProps> = ({
  customers,
  page,
  totalPages,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  sort,
  onSortChange,
  filteredColumns,
  renderMobileCard,
  onSelectionChange,
  selectedCustomerIds,
  onSelectionIdsChange
}) => {
  const navigate = useNavigate();

  return (
    <GenericTable<Customer>
      data={customers}
      loading={false}
      page={page}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      totalItems={total}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      getRowId={(row) => row.id}
      columns={filteredColumns}
      selectable={true}
      onSelectionChange={onSelectionChange}
      externalSelectionIds={selectedCustomerIds}
      onSelectionIdsChange={onSelectionIdsChange}
      sortKey={(() => {
        if (sort === 'newest' || sort === 'oldest') return 'created_at';
        const parts = sort.split('_');
        if (parts.length > 1 && (parts[parts.length - 1] === 'asc' || parts[parts.length - 1] === 'desc')) {
          return parts.slice(0, -1).join('_');
        }
        return sort;
      })()}
      sortDirection={(() => {
        if (sort === 'newest') return 'desc';
        if (sort === 'oldest') return 'asc';
        const parts = sort.split('_');
        const direction = parts[parts.length - 1];
        return (direction === 'asc' || direction === 'desc') ? direction : 'desc';
      })()}
      onSortChange={onSortChange}
      forceTableOnMobile={false}
      onRowClick={(row) => navigate(ROUTES.CUSTOMERS.DETAIL(row.id))}
      renderMobileCard={renderMobileCard}
    />
  );
};

export default CustomerListTable;
