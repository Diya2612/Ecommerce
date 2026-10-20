
import { ROUTES } from "@/lib/constants/routes";

import {
  ActionButtons,
  FiltersBar,
  GenericTable,
  type ColumnConfig,
  type SortOption,
} from "@/components/data-table";
import { MetricsGrid, type MetricItem } from "@/components/metrics";
import { DateRangePicker } from "@/components/forms/inputs/DateRangePicker";
import { useListState } from "@/hooks/useListState";

import { Badge } from "@/components/ui/badge";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";

import {
  useOrders,
  useOrderMetrics,
  // useDuplicateOrder,
  useBulkDeleteOrders,
  useUpdateFulfillment,
} from "@/features/orders/hooks/useOrdersApi";
import type { Order } from "../types";
// import { notifyInfo } from "@/utils";
import { formatCurrency } from "../utils/orderCalculations";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Server,
  XCircle,
  UserCog,
  // ChevronDown,
  // Copy,
  // Trash2,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";

const OrderListPage = () => {
  const navigate = useNavigate();

  // State management
  const {
    search,
    setSearch,
    sort,
    setSort,
    dateRange,
    setDateRange,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    visibleColumns,
    toggleColumn,
    resetFilters,
  } = useListState({
    defaultSort: "created_at_desc",
    defaultVisibleColumns: [
      { key: "orderNumber", label: "Order Number", visible: true },
      { key: "customer", label: "Customer", visible: true },
      { key: "orderDate", label: "Order Date", visible: true },
      { key: "itemsCount", label: "Items", visible: true },
      { key: "grandTotal", label: "Total", visible: true },
      // { key: "deliveryPartners", label: "Delivery Partner", visible: false },
      // { key: "deliveryPrice", label: "Delivery Price", visible: false },
      // { key: "returnAmount", label: "Return", visible: false },
      // { key: "discountAmount", label: "Discount", visible: false },
      { key: "paymentStatus", label: "Status", visible: true },
    ] as { key: string; label: string; visible: boolean }[],
  });

  // Range Filter States
  const [amountRanges, setAmountRanges] = useState<string[]>([]);
  const [itemRanges, setItemRanges] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const toggleRangeFilter = (current: string[], value: string, setter: (val: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
    setPage(1);
  };

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setAmountRanges([]);
    setItemRanges([]);
    setStatusFilters([]);
  }, [resetFilters]);

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, [setSearch, setPage]);

  const handleToggleColumn = useCallback((key: string) => {
    toggleColumn(key);
  }, [toggleColumn]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((r: number) => {
    setRowsPerPage(r);
  }, [setRowsPerPage]);

  const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
    setSort(`${key}_${direction}`);
  }, [setSort]);

  const getRowId = useCallback((row: Order) => row.orderNumber, []);

  // Split sort state "key_direction"
  const lastUnderscoreIndex = sort.lastIndexOf("_");
  const [sortField, sortDirection] = lastUnderscoreIndex !== -1
    ? [sort.substring(0, lastUnderscoreIndex), sort.substring(lastUnderscoreIndex + 1)]
    : [sort, "desc"];

  // Map frontend sort keys to backend fields
  const getBackendSortKey = (key: string) => {
    switch (key) {
      case "orderDate":
      case "date":
        return "created_at";
      case "orderNumber":
      case "id":
        return "order_number";
      case "grandTotal":
      case "total":
        return "total_amount";
      case "customer":
        return "customer_name";
      case "paymentStatus":
        return "payment_status";
      case "lastModified":
        return "updated_at";
      default:
        return key;
    }
  };

  const sortBy = getBackendSortKey(sortField);

  // Parse dates with day boundaries
  const getFromDate = () => {
    if (!dateRange?.from) return undefined;
    const d = new Date(dateRange.from);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const getToDate = () => {
    if (!dateRange?.from) return undefined;
    // If 'to' is specified, use end of that day. 
    // If 'to' is missing (single date), use end of 'from' day.
    const targetDate = dateRange.to || dateRange.from;
    const d = new Date(targetDate);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  // Fetch orders with filters
  const { data: ordersResponse, isLoading } = useOrders({
    page,
    limit: rowsPerPage,
    search: search || undefined,
    payment_status: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
    amount_ranges: amountRanges.length > 0 ? amountRanges.join(',') : undefined,
    item_ranges: itemRanges.length > 0 ? itemRanges.join(',') : undefined,
    from_date: getFromDate(),
    to_date: getToDate(),
    sort_by: sortBy,
    sort_order: sortDirection as "asc" | "desc",
  });

  // Fetch metrics
  const { data: metricsData } = useOrderMetrics();

  // Extract data with fallbacks
  const orders = ordersResponse?.data?.orders || [];
  const pagination = ordersResponse?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  // Transform metrics for UI
  const metrics: MetricItem[] = metricsData
    ? [
      {
        title: "Active",
        value: metricsData.active_orders,
        helperText: "Pending & Partial",
        icon: CheckCircle,
        iconBg: "#10B981",
      },
      {
        title: "Fulfilled",
        value: metricsData.fulfilled_orders,
        helperText: "Completed orders",
        icon: Server,
        iconBg: "#3B82F6",
      },
      {
        title: "Cancelled",
        value: metricsData.cancelled_orders,
        helperText: "Cancelled orders",
        icon: XCircle,
        iconBg: "#F59E0B",
      },
      {
        title: "Total Revenue",
        value: `₹${parseFloat(metricsData.total_revenue).toFixed(2)}`,
        helperText: "From paid orders",
        icon: UserCog,
        iconBg: "#8B5CF6",
      },
    ]
    : [];

  // Helpers for badges
  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "paid":
        return "emerald"; // Green
      case "fulfilled":
        return "emerald"; // Green
      case "pending":
        return "amber"; // Amber/Yellow
      case "overdue":
        return "destructive"; // Red
      case "partially paid":
      case "partial":
        return "blue"; // Blue
      case "failed":
        return "destructive"; // Red
      case "refunded":
        return "slate"; // Gray
      default:
        return "slate"; // Gray
    }
  };

  // Mutations
  const updateFulfillmentMutation = useUpdateFulfillment();

  const statusFilterOptions = useMemo(() => [
    {
      label: "All Status",
      value: "",
      onSelect: () => setStatusFilters([]),
      isActive: statusFilters.length === 0,
    },
    {
      label: "Paid",
      value: "paid",
      onSelect: () => toggleRangeFilter(statusFilters, "paid", setStatusFilters),
      isActive: statusFilters.includes("paid"),
    },
    {
      label: "Pending",
      value: "pending",
      onSelect: () => toggleRangeFilter(statusFilters, "pending", setStatusFilters),
      isActive: statusFilters.includes("pending"),
    },
    // {
    //   label: "Overdue",
    //   value: "overdue",
    //   onSelect: () => toggleRangeFilter(statusFilters, "overdue", setStatusFilters),
    //   isActive: statusFilters.includes("overdue"),
    // },
    // {
    //   label: "Partially Paid",
    //   value: "partially_paid",
    //   onSelect: () => toggleRangeFilter(statusFilters, "partially_paid", setStatusFilters),
    //   isActive: statusFilters.includes("partially_paid"),
    // },
  ], [statusFilters]);

  // Filter Configuration
  const filterGroups = useMemo(() => [
    {
      id: "status",
      label: "Status",
      options: statusFilterOptions,
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      options: [
        {
          label: "All Amount",
          value: "",
          onSelect: () => setAmountRanges([]),
          isActive: amountRanges.length === 0,
        },
        ...[
          { label: "Under ₹1,000", value: "0-1000" },
          { label: "₹1,000 - ₹5,000", value: "1000-5000" },
          { label: "₹5,000 - ₹10,000", value: "5000-10000" },
          { label: "Over ₹10,000", value: "Over-10000" },
        ].map(opt => ({
          ...opt,
          onSelect: () => toggleRangeFilter(amountRanges, opt.value, setAmountRanges),
          isActive: amountRanges.includes(opt.value),
        })),
      ],
    },
    {
      id: "totalItems",
      label: "Total Items",
      options: [
        {
          label: "All Items",
          value: "",
          onSelect: () => setItemRanges([]),
          isActive: itemRanges.length === 0,
        },
        ...[
          { label: "1-2 items", value: "1-2" },
          { label: "3-5 items", value: "3-5" },
          { label: "6-10 items", value: "6-10" },
          { label: "Over 10 items", value: "Over-10" },
        ].map(opt => ({
          ...opt,
          onSelect: () => toggleRangeFilter(itemRanges, opt.value, setItemRanges),
          isActive: itemRanges.includes(opt.value),
        })),
      ],
    },
  ], [statusFilterOptions, amountRanges, itemRanges]);

  // Full column definitions with custom renderers
  const allColumns = useMemo((): ColumnConfig<Order>[] => [
    {
      key: "orderNumber",
      label: "ORDER NUMBER",
      type: "text",
      sortable: true,
      sortKey: "orderNumber",
      render: (val: unknown) => (
        <span className="font-medium text-slate-900">{String(val)}</span>
      ),
    },
    {
      key: "customer",
      label: "CUSTOMER",
      type: "text",
      sortable: true,
      sortKey: "customer",
      render: (val: unknown) => {
        const customer = val as { name: string; email?: string };
        return <span className="text-slate-700">{customer.name}</span>;
      },
    },
    {
      key: "orderDate",
      label: "ORDER CREATION",
      type: "date",
      sortable: true,
      sortKey: "orderDate",
      render: (val) => (
        <span className="text-slate-600">
          {new Date(val as string).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "itemsCount",
      label: "ITEMS",
      align: "left",
      sortable: true,
      sortKey: "total_quantity",
      render: (val, row) => {
        const itemCount = val as number;
        const isFulfilled = row.fulfillmentStatus === "fulfilled";

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateFulfillmentMutation.mutate({
                id: row.orderId,
                data: { fulfillment_status: isFulfilled ? "pending" : "fulfilled" } as any
              });
            }}
            className="group flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="font-semibold text-sm">{itemCount}</span>
            <span className="text-sm text-slate-500">items</span>
          </button>
        );
      },
    },
    {
      key: "grandTotal",
      label: "TOTAL",
      type: "text",
      sortable: true,
      sortKey: "grandTotal",
      align: "right",
      render: (val, row) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(val as number, row.currency)}
        </span>
      ),
    },
    // {
    //   key: "deliveryPartners",
    //   label: "DELIVERY PARTNER",
    //   sortable: false,
    //   render: (val: unknown) => {
    //     const partners = val as string[];
    //     if (!partners || partners.length === 0)
    //       return <span className="text-slate-400">—</span>;
    //     if (partners.length === 1)
    //       return <span className="text-slate-700">{partners[0]}</span>;
    //     return (
    //       <Popover>
    //         <PopoverTrigger asChild>
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             className="h-8 gap-1.5 text-slate-700 font-normal hover:bg-slate-100"
    //           >
    //             <span className="font-medium">{partners.length} partners</span>
    //             <ChevronDown className="size-3.5 opacity-50" />
    //           </Button>
    //         </PopoverTrigger>
    //         <PopoverContent className="w-48 p-1" align="start">
    //           {partners.map((p, i) => (
    //             <div
    //               key={i}
    //               className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    //             >
    //               {p}
    //             </div>
    //           ))}
    //         </PopoverContent>
    //       </Popover>
    //     );
    //   },
    // },
    // {
    //   key: "deliveryPrice",
    //   label: "DELIVERY PRICE",
    //   align: "right",
    //   sortable: true,
    //   sortKey: "deliveryPrice",
    //   render: (val, row) => (
    //     <span className="text-slate-700">
    //       {formatCurrency(val as number, row.currency)}
    //     </span>
    //   ),
    // },
    // {
    //   key: "returnAmount",
    //   label: "RETURN",
    //   align: "right",
    //   sortable: true,
    //   sortKey: "returnAmount",
    //   render: (val, row) => (
    //     <span className="text-slate-700">
    //       {formatCurrency(val as number, row.currency)}
    //     </span>
    //   ),
    // },
    // {
    //   key: "discountAmount",
    //   label: "DISCOUNT",
    //   align: "right",
    //   sortable: true,
    //   sortKey: "discountAmount",
    //   render: (val, row) => (
    //     <span className="text-slate-700">
    //       {formatCurrency(val as number, row.currency)}
    //     </span>
    //   ),
    // },
    {
      key: "paymentStatus",
      label: "STATUS",
      type: "badge",
      sortable: false,
      sortKey: "paymentStatus",
      render: (val) => {
        const status = val as string;

        return (
          <Badge
            variant={getStatusVariant(status)}
            className="rounded-md"
          >
            {status}
          </Badge>
        );
      },
    },
  ], [updateFulfillmentMutation]);

  // Filter columns based on visibility
  const columns = useMemo(() => {
    return allColumns.filter((col) => {
      const visibleCol = visibleColumns.find((vc) => vc.key === col.key);
      return visibleCol?.visible !== false;
    });
  }, [allColumns, visibleColumns]);

  const sortOptions: SortOption[] = [
    {
      label: "Newest First",
      value: "created_at_desc",
      direction: "desc",
      isActive: sort === "created_at_desc",
      onSelect: () => setSort("created_at_desc"),
    },
    {
      label: "Oldest First",
      value: "created_at_asc",
      direction: "asc",
      isActive: sort === "created_at_asc",
      onSelect: () => setSort("created_at_asc"),
    },
    {
      label: "Total (High-Low)",
      value: "total_amount_desc",
      direction: "desc",
      isActive: sort === "total_amount_desc",
      onSelect: () => setSort("total_amount_desc"),
    },
    {
      label: "Total (Low-High)",
      value: "total_amount_asc",
      direction: "asc",
      isActive: sort === "total_amount_asc",
      onSelect: () => setSort("total_amount_asc"),
    },
    {
      label: "Order # (A-Z)",
      value: "order_number_asc",
      direction: "asc",
      isActive: sort === "order_number_asc",
      onSelect: () => setSort("order_number_asc"),
    },
    {
      label: "Order # (Z-A)",
      value: "order_number_desc",
      direction: "desc",
      isActive: sort === "order_number_desc",
      onSelect: () => setSort("order_number_desc"),
    },
    {
      label: "Last Modified",
      value: "updated_at_desc",
      direction: "desc",
      isActive: sort === "updated_at_desc",
      onSelect: () => setSort("updated_at_desc"),
    },
  ];

  // Duplicate & Delete Order Logic
  // const duplicateOrderMutation = useDuplicateOrder();
  const bulkDeleteMutation = useBulkDeleteOrders();
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle Duplicate Order
  // const handleDuplicateOrder = (orderId: string) => {
  //   duplicateOrderMutation.mutate(orderId);
  // };

  // const handleBulkDelete = () => {
  //   setShowDeleteConfirm(true);
  // };

  const handleConfirmDelete = async () => {
    if (selectedOrders.length > 0) {
      const orderIds = selectedOrders.map((orders) => orders.orderId);

      try {
        await bulkDeleteMutation.mutateAsync(orderIds);
        setShowDeleteConfirm(false);
        setSelectedOrders([]);
        setSelectedIds([]);
      } catch (error) {
        // Error handled by mutation hook
        console.error("Failed to delete orders", error);
      }
    }
  };

  const actions: any[] = [
    // {
    //   label: "Duplicate",
    //   icon: <Copy size={16} />,
    //   onClick: () => {
    //     if (selectedOrders.length === 1) {
    //       handleDuplicateOrder(selectedOrders[0].orderId);
    //     } else {
    //       notifyInfo("Please select exactly one order to duplicate");
    //     }
    //   },
    //   disabled: selectedOrders.length !== 1 || duplicateOrderMutation.isPending,
    // },
    // {
    //   label: `Delete (${selectedOrders.length})`,
    //   icon: <Trash2 size={16} />,
    //   onClick: handleBulkDelete,
    //   disabled: selectedOrders.length === 0,
    //   danger: true,
    // },
  ];

  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-auto">
            <DateRangePicker
              value={
                dateRange
                  ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
                  : { from: null, to: null }
              }
              onChange={(val) =>
                setDateRange(
                  val.from
                    ? { from: val.from, to: val.to ?? undefined }
                    : undefined,
                )
              }
            />
          </div>
        </div>

        <ActionButtons
          primaryLabel="Create Order"
          primaryTo={ROUTES.ORDERS.CREATE}
        />
      </div>

      {/* Metrics */}
      <MetricsGrid metrics={metrics} />

      {/* Filters Action Bar */}
      <FiltersBar
        search={search}
        onSearchChange={handleSearchChange}
        filterGroups={filterGroups}
        sortOptions={sortOptions}
        actions={actions}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onClearFilters={handleResetFilters}
      />

      {/* Table */}
      <GenericTable
        data={orders}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalItems={total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        getRowId={getRowId}
        columns={columns}
        sortKey={sortField}
        sortDirection={sortDirection as "asc" | "desc"}
        onSortChange={handleSortChange}
        selectable={true}
        onSelectionChange={(selected) => setSelectedOrders(selected)}
        externalSelectionIds={selectedIds}
        onSelectionIdsChange={setSelectedIds}
        renderMobileCard={(row) => ({
          title: row.customer?.name || "N/A",
          subtitle: row.orderNumber,
          primaryValue: formatCurrency(row.grandTotal, row.currency),
          badges: (
            <Badge
              variant={getStatusVariant(row.paymentStatus)}
              className="rounded-md"
            >
              {row.paymentStatus}
            </Badge>
          ),
          fields: [
            {
              label: "Date",
              value: new Date(row.orderDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            },
            { label: "Items", value: `${row.itemsCount} items` },
          ],
        })}
        onRowClick={(row) => navigate(`/orders/${row.orderNumber}`)}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedOrders.length} Order${selectedOrders.length !== 1 ? "s" : ""}`}
        description={`Are you sure you want to delete ${selectedOrders.length} selected order${selectedOrders.length !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default OrderListPage;

