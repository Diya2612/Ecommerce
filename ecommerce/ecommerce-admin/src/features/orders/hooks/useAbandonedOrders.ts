/**
 * useAbandonedOrders Hook
 *
 * Provides state management and actions for abandoned orders page.
 * Now uses real API via useAbandonedCartsApi hooks.
 */

import { useState } from "react";
import { useDateRange } from "@/hooks";
import {
  useAbandonedCartsApi,
  useAbandonedCartsMetrics,
  useSendRecoveryEmail,
} from "./useAbandonedCartsApi";
import type { AbandonedOrder } from "../types";
import type { AbandonedCartsQueryParams } from "../services/abandonedCartsApi.types";

// Email templates (can be fetched from API later)
const EMAIL_TEMPLATES = [
  { id: "1", name: "Friendly Reminder", subject: "You left something behind!" },
  { id: "2", name: "Special Offer", subject: "10% off to complete your order" },
  { id: "3", name: "Last Chance", subject: "Your cart is about to expire" },
];

export type ViewMode = "idle" | "send-email" | "view-cart";

export const useAbandonedOrders = () => {
  const { dateRange, setDateRange } = useDateRange();

  // Filter State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");

  // Sort State
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "abandonedAt",
    direction: "desc",
  });

  // Build query params for API
  const queryParams: AbandonedCartsQueryParams = {
    page,
    limit: rowsPerPage,
    search: searchQuery || undefined,
    status: (statusFilter as AbandonedCartsQueryParams["status"]) || undefined,
    channel:
      (channelFilter as AbandonedCartsQueryParams["channel"]) || undefined,
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
    sort_by: sortConfig.key,
    sort_order: sortConfig.direction,
  };

  // Fetch abandoned carts from API
  const { data, isLoading, error } = useAbandonedCartsApi(queryParams);

  // Fetch metrics
  const { data: metricsData } = useAbandonedCartsMetrics();

  const { mutate: sendRecoveryEmails, isPending: isSendingEmails } = useSendRecoveryEmail();

  // Extract data with fallbacks
  const orders = data?.carts || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // Selection & View Mode State
  const [selectedCarts, setSelectedCarts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [selectedCartForView, setSelectedCartForView] =
    useState<AbandonedOrder | null>(null);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCarts(new Set(orders.map((c) => c.id)));
    } else {
      setSelectedCarts(new Set());
    }
  };

  const handleSelectCart = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedCarts);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCarts(newSelected);
  };

  const isAllSelected =
    orders.length > 0 && selectedCarts.size === orders.length;

  const handleSendEmail = (cartIds?: string[]) => {
    if (cartIds && cartIds.length > 0) {
      setSelectedCarts(new Set(cartIds));
    }
    setViewMode("send-email");
  };

  const handleViewCart = (cart: AbandonedOrder) => {
    setSelectedCartForView(cart);
    setViewMode("view-cart");
  };

  const handleCloseModal = () => {
    setViewMode("idle");
    setSelectedCartForView(null);
  };

  const handleConfirmSendEmail = () => {
    const ids = Array.from(selectedCarts);
    if (ids.length > 0) {
      sendRecoveryEmails(
        { cart_ids: ids },
        {
          onSuccess: () => {
            setViewMode("idle");
            setSelectedCarts(new Set());
          },
        },
      );
    }
  };

  return {
    // Data
    orders,
    total,
    totalPages,
    emailTemplates: EMAIL_TEMPLATES,
    isLoading,
    error,

    // Metrics (from API)
    metrics: metricsData,

    // Pagination
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,

    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,

    // Sorting
    sortConfig,
    setSortConfig,

    // Selection
    selectedCarts,
    isAllSelected,
    handleSelectAll,
    handleSelectCart,

    // View Mode & Actions
    viewMode,
    selectedCartForView,
    handleSendEmail,
    handleViewCart,
    handleCloseModal,
    handleConfirmSendEmail,
    isSendingEmail: isSendingEmails,

    // Date Range
    dateRange,
    setDateRange,
  };
};
