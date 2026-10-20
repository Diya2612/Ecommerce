import type { Customer } from './customer.types';
import type { ColumnConfig, MobileRecordCardProps } from '@/components/data-table';

export interface CustomerListTableProps {
  customers: Customer[];
  page: number;
  totalPages: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  sort: string;
  onSortChange: (key: string, direction: 'asc' | 'desc') => void;
  filteredColumns: ColumnConfig<Customer>[];
  renderMobileCard?: (row: Customer) => MobileRecordCardProps;
  onSelectionChange?: (selected: Customer[]) => void;
  selectedCustomerIds?: string[];
  onSelectionIdsChange?: (ids: string[]) => void;
}

export interface CustomerListFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  setPage: (p: number) => void;
  visibleColumns: { key: string; label: string; visible: boolean }[];
  onToggleColumn: (key: string) => void;
  onClearFilters: () => void;
  page: number; // needed for setPage reset
  statusFilterOptions: any[];
  // typeFilterOptions: any[];
  genderFilterOptions: any[]; // New
  dateFilterOptions: any[]; // New
  ordersFilterOptions: any[]; // New
  tagsFilterOptions: any[]; // New
  sortOptions: any[];
  actions: any[];
}
