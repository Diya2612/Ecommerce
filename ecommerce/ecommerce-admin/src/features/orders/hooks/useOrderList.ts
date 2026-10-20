import { useMemo } from 'react';
import { useListState } from '@/hooks/useListState';
import { useOrders } from './useOrdersApi';
import { CheckCircle, XCircle, Server, UserCog } from 'lucide-react';
import type { MetricItem } from '@/components/metrics';
import type { Order } from '../types';
import type { DateRangeValue } from '@/hooks/useDateRange';
import type { OrdersQueryParams } from '../services/ordersApi.types';

export interface UseOrderListReturn {
  search: string;
  status: string;
  sort: string;
  dateRange: DateRangeValue;
  page: number;
  rowsPerPage: number;
  orders: Order[];
  total: number;
  totalPages: number;
  metrics: MetricItem[];
  setSearch: (val: string) => void;
  setStatus: (status: string) => void;
  setSort: (sort: string) => void;
  setDateRange: (range: DateRangeValue) => void;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleClearFilters: () => void;
}

export const useOrderList = (): UseOrderListReturn => {
  // 1. Centralized State
  const {
    search,
    setSearch,
    status,
    setStatus,
    sort,
    setSort,
    dateRange,
    setDateRange,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    resetFilters
  } = useListState({
    defaultSort: "date_desc"
  });

  // 2. Build API query params
  const queryParams: OrdersQueryParams = useMemo(() => ({
    page,
    limit: rowsPerPage,
    search: search || undefined,
    status: status || undefined,
    sort: sort || undefined,
    from_date: (() => {
      if (!dateRange?.from) return undefined;
      const d = new Date(dateRange.from);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    })(),
    to_date: (() => {
      if (dateRange?.to) {
        const d = new Date(dateRange.to);
        d.setHours(23, 59, 59, 999);
        return d.toISOString();
      } else if (dateRange?.from) {
        const d = new Date(dateRange.from);
        d.setHours(23, 59, 59, 999);
        return d.toISOString();
      }
      return undefined;
    })(),
  }), [page, rowsPerPage, search, status, sort, dateRange]);

  // 3. Fetch orders from API
  const { data: ordersResponse } = useOrders(queryParams);

  // 4. Extract data from API response
  const orders = ordersResponse?.data?.orders || [];
  const total = ordersResponse?.data?.pagination?.total || 0;
  const totalPages = ordersResponse?.data?.pagination?.totalPages || 1;

  // 5. Metrics Logic - Calculate from current orders data
  // Note: For accurate metrics, we might need a separate API call for all orders
  // For now, calculating from current filtered results
  const metrics: MetricItem[] = useMemo(() => {
    const activeCount = orders.filter((order: Order) => ['Pending', 'Partial'].includes(order.fulfillmentStatus)).length;
    const inactiveCount = orders.filter((order: Order) => ['Fulfilled', 'Cancelled'].includes(order.fulfillmentStatus)).length;

    return [
      {
        title: "Active",
        value: activeCount,
        helperText: "Pending & Partial",
        icon: CheckCircle,
        iconBg: "#10B981",
      },
      {
        title: "Inactive",
        value: inactiveCount,
        helperText: "Fulfilled & Cancelled",
        icon: XCircle,
        iconBg: "#F59E0B",
      },
      {
        title: "Automated",
        value: 0,
        helperText: "System generated",
        icon: Server,
        iconBg: "#3B82F6",
      },
      {
        title: "Manual",
        value: 2,
        helperText: "Manually created",
        icon: UserCog,
        iconBg: "#8B5CF6",
      }
    ];
  }, [orders]);

  return {
    // State
    search,
    status,
    sort,
    // Safe conversion from DateRange (react-day-picker) to DateRangeValue (app)
    dateRange: dateRange ? { from: dateRange.from || null, to: dateRange.to || null } : { from: null, to: null },
    page,
    rowsPerPage,

    // Data
    orders,
    total,
    totalPages,
    metrics,

    // Setters & Handlers
    setSearch: (v) => { setSearch(v); setPage(1); },
    setStatus: (v) => { setStatus(v); setPage(1); },
    setSort: (v) => { setSort(v); setPage(1); },
    setDateRange: (v: DateRangeValue) => setDateRange(v.from ? { from: v.from, to: v.to ?? undefined } : undefined),
    setPage,
    setRowsPerPage,
    handleClearFilters: resetFilters,
  };
};
