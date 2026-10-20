import { useMemo } from "react";
import { useListState } from "@/hooks/useListState";
import { MOCK_DISCOUNTS } from '../data/discount.constants';

import {
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  Percent,
} from "lucide-react";
import type { MetricItem } from "@/components/metrics";

export const useDiscountList = () => {
  // 1. State Management via centralized hook
  const {
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
    visibleColumns,
    toggleColumn,
    resetFilters
  } = useListState({
    defaultSort: "newest",
    defaultVisibleColumns: [
      { key: "code", label: "Code", visible: true },
      { key: "type", label: "Type", visible: true },
      { key: "value", label: "Value", visible: true },
      { key: "status", label: "Status", visible: true },
      { key: "usage_count", label: "Usage", visible: true },
      { key: "ends_at", label: "Expires", visible: true },
    ]
  });

  // Filter mock data (In a real app, this logic would move to the backend/API wrapper)
  let filteredDiscounts = [...MOCK_DISCOUNTS];

  if (search) {
    filteredDiscounts = filteredDiscounts.filter(
      (d) =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filteredDiscounts = filteredDiscounts.filter(
      (d) => d.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Sort
  if (sort === "newest") {
    filteredDiscounts.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sort === "oldest") {
    filteredDiscounts.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } else if (sort === "usage_desc") {
    filteredDiscounts.sort((a, b) => b.usage_count - a.usage_count);
  } else if (sort === "usage_asc") {
    filteredDiscounts.sort((a, b) => a.usage_count - b.usage_count);
  }

  // Pagination
  const total = filteredDiscounts.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const discounts = filteredDiscounts.slice(startIndex, endIndex);

  // Metrics
  const metrics: MetricItem[] = useMemo(() => {
    const active = MOCK_DISCOUNTS.filter((d) => d.status === "active").length;
    const scheduled = MOCK_DISCOUNTS.filter(
      (d) => d.status === "scheduled"
    ).length;
    const expired = MOCK_DISCOUNTS.filter((d) => d.status === "expired").length;
    const totalUsage = MOCK_DISCOUNTS.reduce(
      (sum, d) => sum + d.usage_count,
      0
    );

    return [
      {
        title: "Total Discounts",
        value: MOCK_DISCOUNTS.length,
        helperText: "All discount codes",
        icon: Tag,
        iconBg: "#735DFF",
      },
      {
        title: "Active",
        value: active,
        helperText: "Currently running",
        icon: CheckCircle,
        iconBg: "#2ECC71",
      },
      {
        title: "Scheduled",
        value: scheduled,
        helperText: "Starting soon",
        icon: Clock,
        iconBg: "#F5A623",
      },
      {
        title: "Expired",
        value: expired,
        helperText: "No longer valid",
        icon: XCircle,
        iconBg: "#E74C3C",
      },
      {
        title: "Total Redemptions",
        value: totalUsage,
        helperText: "All time usage",
        icon: Percent,
        iconBg: "#3498DB",
      },
    ];
  }, []);

  return {
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
    // Map internal hook names to what the UI expects (adapter pattern)
    handleSearchChange: (v: string) => { setSearch(v); setPage(1); },
    status,
    handleStatusfilter: (v: string) => { setStatus(v); setPage(1); },
    sort,
    handleSortChange: (v: string) => { setSort(v); setPage(1); },
    visibleColumns,
    toggleColumn,
    clearFilters: resetFilters,
    isLoading: false,
    error: null,
  };
};
