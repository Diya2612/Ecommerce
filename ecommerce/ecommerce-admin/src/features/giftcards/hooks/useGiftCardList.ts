import { useState, useMemo } from "react";
import { usePagination, useSearch, useDateRange } from "@/hooks";
import { MOCK_GIFT_CARDS } from '../data/giftcard.constants';
import {
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
} from "lucide-react";
import type { MetricItem } from '@/components/metrics';

export const useGiftCardList = () => {
  const { dateRange, setDateRange } = useDateRange();
  const { search, setSearch } = useSearch();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [visibleColumns, setVisibleColumns] = useState([
    { key: "code", label: "Code", visible: true },
    { key: "value", label: "Value", visible: true },
    { key: "balance", label: "Balance", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "recipient", label: "Recipient", visible: true },
    { key: "expires_at", label: "Expires", visible: true },
  ]);

  // Filter mock data
  let filteredGiftCards = [...MOCK_GIFT_CARDS];

  if (search) {
    filteredGiftCards = filteredGiftCards.filter(
      (g) =>
        g.code.toLowerCase().includes(search.toLowerCase()) ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
        g.recipient_email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filteredGiftCards = filteredGiftCards.filter(
      (g) => g.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Sort
  if (sort === "newest") {
    filteredGiftCards.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sort === "oldest") {
    filteredGiftCards.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } else if (sort === "value_desc") {
    filteredGiftCards.sort((a, b) => b.value - a.value);
  } else if (sort === "value_asc") {
    filteredGiftCards.sort((a, b) => a.value - b.value);
  } else if (sort === "balance_desc") {
    filteredGiftCards.sort((a, b) => b.balance - a.balance);
  } else if (sort === "balance_asc") {
    filteredGiftCards.sort((a, b) => a.balance - b.balance);
  }

  // Pagination
  const total = filteredGiftCards.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const giftCards = filteredGiftCards.slice(startIndex, endIndex);

  // Metrics
  const metrics: MetricItem[] = useMemo(() => {
    const active = MOCK_GIFT_CARDS.filter((g) => g.status === "active").length;
    const redeemed = MOCK_GIFT_CARDS.filter(
      (g) => g.status === "redeemed"
    ).length;
    const expired = MOCK_GIFT_CARDS.filter((g) => g.status === "expired").length;
    const totalValue = MOCK_GIFT_CARDS.reduce((sum, g) => sum + g.value, 0);
    const totalBalance = MOCK_GIFT_CARDS.reduce((sum, g) => sum + g.balance, 0);

    return [
      {
        title: "Total Gift Cards",
        value: MOCK_GIFT_CARDS.length,
        helperText: "All gift cards",
        icon: Gift,
        iconBg: "#735DFF",
      },
      {
        title: "Active",
        value: active,
        helperText: "Ready to use",
        icon: CheckCircle,
        iconBg: "#2ECC71",
      },
      {
        title: "Redeemed",
        value: redeemed,
        helperText: "Fully used",
        icon: CreditCard,
        iconBg: "#3498DB",
      },
      {
        title: "Expired",
        value: expired,
        helperText: "No longer valid",
        icon: XCircle,
        iconBg: "#E74C3C",
      },
      {
        title: "Total Value",
        value: `₹${(totalValue / 100).toLocaleString()}`,
        helperText: `₹${(totalBalance / 100).toLocaleString()} remaining`,
        icon: Clock,
        iconBg: "#F5A623",
      },
    ];
  }, []);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleStatusfilter = (v: string) => {
    setStatus(v);
    setPage(1);
  };

  const handleSortChange = (v: string) => {
    setSort(v);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus("");
    setSearch("");
    setSort("newest");
    setPage(1);
  };

  return {
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
    isLoading: false,
    error: null,
  };
};
