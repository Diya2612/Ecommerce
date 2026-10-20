import { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileEdit,
  // Copy,
  // FileText,
  // Printer,
  AlertCircle,
  CheckCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";

import { MetricsGrid, type MetricItem } from "@/components/metrics";
import { FiltersBar, type SortOption } from "@/components/data-table";
import {
  GenericTable,
  type ColumnConfig,
} from "@/components/data-table";
import { DateRangePicker } from "@/components/forms/inputs/DateRangePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  useDraftOrders,
  useConfirmDraft,
} from "@/features/orders/hooks/useOrdersApi";
import { useListState } from "@/hooks/useListState";
import { ROUTES } from "@/lib/constants";
import type { Order } from "../types";
// import { notifyInfo } from "@/utils";
// import { formatCurrency } from "../utils/orderCalculations";

const DraftOrdersPage = () => {
  const navigate = useNavigate();

  const {
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    dateRange,
    setDateRange,
    sort,
    setSort,
    // status,
    // setStatus,
    visibleColumns,
    toggleColumn,
    resetFilters,
  } = useListState({
    defaultSort: "created_at_desc",
    defaultVisibleColumns: [
      { key: "orderNumber", label: "Order Number", visible: true },
      { key: "orderDate", label: "Order Date", visible: true },
      { key: "customer", label: "Customer", visible: true },
      { key: "paymentStatus", label: "Payment Status", visible: true },
      { key: "itemsCount", label: "Items", visible: true },
      { key: "confirm", label: "Confirm", visible: true },
      //{ key: "grandTotal", label: "Total", visible: false },
      //{ key: "salesChannel", label: "Channel", visible: false },
      //{ key: "fulfillmentStatus", label: "Fulfillment Status", visible: false },
      // { key: "deliveryPrice", label: "Delivery Price", visible: false },
      //{ key: "returnAmount", label: "Return Amount", visible: false },
      // { key: "discountAmount", label: "Discount Amount", visible: false },
      //{ key: "orderStatus", label: "Order Status", visible: false },
      //{ key: "customerEmail", label: "Customer Email", visible: false },
      { key: "lastModified", label: "Last Modified", visible: false },
    ],
  });

  // Range Filter States
  const [itemRanges, setItemRanges] = useState<string[]>([]);

  const toggleRangeFilter = (current: string[], value: string, setter: (val: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
    setPage(1);
  };

  // Map frontend sort keys to backend fields if necessary
  const getBackendSortKey = (key: string) => {
    switch (key) {
      case "orderNumber":
        return "order_number";
      case "orderDate":
        return "created_at";
      case "grandTotal":
        return "total_amount";
      default:
        return key;
    }
  };

  const lastUnderscoreIndex = sort.lastIndexOf("_");
  const [sortField, sortDirection] = lastUnderscoreIndex !== -1
    ? [sort.substring(0, lastUnderscoreIndex), sort.substring(lastUnderscoreIndex + 1)]
    : [sort, "desc"];

  const sortBy = getBackendSortKey(sortField);

  // Parse dates with day boundaries
  const getFromDate = useCallback(() => {
    if (!dateRange?.from) return undefined;
    const d = new Date(dateRange.from);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [dateRange?.from]);

  const getToDate = useCallback(() => {
    if (!dateRange?.from) return undefined;
    const targetDate = dateRange.to || dateRange.from;
    const d = new Date(targetDate);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }, [dateRange?.from, dateRange?.to]);

  // Fetch draft orders
  const { data: draftsResponse, isLoading } = useDraftOrders({
    page,
    limit: rowsPerPage,
    search: search || undefined,
    from_date: getFromDate(),
    to_date: getToDate(),
    sort_by: sortBy,
    sort_order: sortDirection as "asc" | "desc",
    // @ts-ignore
    item_ranges: itemRanges.length > 0 ? itemRanges.join(',') : undefined,
    // @ts-ignore
    // payment_status: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
  });

  // Mutations
  const confirmDraft = useConfirmDraft();

  // Extract data
  const drafts = draftsResponse?.data?.drafts || [];
  const pagination = draftsResponse?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleConfirmDraft = (draftId: string) => {
    confirmDraft.mutate({ id: draftId, sendEmail: true });
  };

  // Metrics
  const metrics: MetricItem[] = useMemo(() => {
    const pending = drafts.filter((o) => o.paymentStatus === "pending").length;
    // const overdue = drafts.filter((o) => o.paymentStatus === "Overdue").length;
    // const partiallyPaid = drafts.filter(
    //   (o) => o.paymentStatus === "Partially Paid",
    // ).length;

    const totalItems = drafts.reduce((acc, order) => acc + (order.itemsCount || 0), 0);

    return [
      {
        title: "Total Drafts",
        value: total.toString(),
        helperText: "Pending confirmation",
        icon: FileEdit,
        iconBg: "#735DFF",
      },
      {
        title: "Total Items",
        value: totalItems.toString(),
        helperText: "Across all drafts",
        icon: ShoppingBag,
        iconBg: "#10B981",
      },
      {
        title: "Pending",
        value: pending.toString(),
        helperText: "Processing",
        icon: AlertCircle,
        iconBg: "#F5A623",
      },
      // {
      //   title: "Overdue",
      //   value: overdue.toString(),
      //   helperText: "Action required",
      //   icon: AlertCircle,
      //   iconBg: "#3498DB",
      // },
      // {
      //   title: "Partially Paid",
      //   value: partiallyPaid.toString(),
      //   helperText: "Payment pending",
      //   icon: AlertCircle,
      //   iconBg: "#E74C3C",
      // },
    ];
  }, [drafts, total]);

  // Extract unique items from drafts for the filter
  /*
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
    {
      label: "Overdue",
      value: "overdue",
      onSelect: () => toggleRangeFilter(statusFilters, "overdue", setStatusFilters),
      isActive: statusFilters.includes("overdue"),
    },
    {
      label: "Partially Paid",
      value: "partially_paid",
      onSelect: () => toggleRangeFilter(statusFilters, "partially_paid", setStatusFilters),
      isActive: statusFilters.includes("partially_paid"),
    },
  ], [statusFilters]);
  */

  // Filter Configuration
  const filterGroups = useMemo(() => [
    /*
    {
      id: "status",
      label: "Status",
      options: statusFilterOptions,
    },
    */
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
  ], [/* statusFilterOptions, */ itemRanges]);

  const handleToggleColumn = useCallback((key: string) => {
    toggleColumn(key);
  }, [toggleColumn]);

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

  // All Column Definitions
  const allColumns = useMemo((): ColumnConfig<Order>[] => [
    {
      key: "orderNumber",
      label: "ORDER NUMBER",
      type: "text",
      sortable: true,
      sortKey: "order_number",
      render: (val: unknown) => (
        <span className="font-medium text-slate-900">{String(val)}</span>
      ),
    },
    {
      key: "customer",
      label: "CUSTOMER",
      type: "text",
      sortable: true,
      sortKey: "customer_name",
      render: (val: unknown) => {
        const customer = val as { name: string; email: string };
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 leading-none mb-1">
              {customer.name}
            </span>
            <span className="text-[11px] text-slate-500 leading-none">
              {customer.email}
            </span>
          </div>
        );
      },
    },
    {
      key: "orderDate",
      label: "ORDER DATE",
      type: "date",
      sortable: true,
      sortKey: "created_at",
      hiddenOnMobile: true,
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
      key: "paymentStatus",
      label: "PAYMENT STATUS",
      type: "badge",
      sortable: false,
      sortKey: "payment_status",
      render: (val) => {
        const statusVal = val as string;

        return (
          <Badge
            variant={getStatusVariant(statusVal)}
            className="rounded-md"
          >
            {statusVal}
          </Badge>
        );
      },
    },
    {
      key: "itemsCount",
      label: "ITEM",
      align: "left",
      sortable: true,
      sortKey: "total_quantity",
      hiddenOnMobile: true,
      render: (val) => {
        const itemCount = val as number;
        return (
          <span className="text-slate-700">
            <span className="font-medium">{itemCount}</span> items
          </span>
        );
      },
    },
    // {
    //   key: "grandTotal",
    //   label: "TOTAL",
    //   align: "right",
    //   sortable: true,
    //   sortKey: "total_amount",
    //   render: (val, row) => (
    //     <span className="font-medium text-slate-900">
    //       {formatCurrency(val as number, row.currency)}
    //     </span>
    //   ),
    // },
    // {
    //   key: "salesChannel",
    //   label: "CHANNEL",
    //   type: "text",
    //   sortable: true,
    //   sortKey: "channel",
    //   hiddenOnMobile: true,
    //   render: (val: unknown) => (
    //     <span className="text-slate-700 capitalize">{String(val)}</span>
    //   ),
    // },
    // {
    //   key: "fulfillmentStatus",
    //   label: "FULFILLMENT",
    //   type: "badge",
    //   sortable: true,
    //   sortKey: "fulfillment_status",
    //   hiddenOnMobile: true,
    //   render: (val) => {
    //     const statusVal = val as string;
    //     let variant: "default" | "secondary" | "outline" | "destructive" =
    //       "secondary";
    //     if (statusVal === "Fulfilled") variant = "default";
    //     else if (statusVal === "Pending") variant = "outline";
    //     else if (statusVal === "Cancelled") variant = "destructive";
    //
    //     return <Badge variant={variant}>{statusVal}</Badge>;
    //   },
    // },
    // {
    //   key: "deliveryPrice",
    //   label: "DELIVERY PRICE",
    //   align: "right",
    //   sortable: true,
    //   sortKey: "delivery_price",
    //   hiddenOnMobile: true,
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
    //   sortKey: "return_amount",
    //   hiddenOnMobile: true,
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
    //   sortKey: "discount_amount",
    //   hiddenOnMobile: true,
    //   render: (val, row) => (
    //     <span className="text-slate-700">
    //       {formatCurrency(val as number, row.currency)}
    //     </span>
    //   ),
    // },
    // {
    //   key: "orderStatus",
    //   label: "ORDER STATUS",
    //   type: "badge",
    //   sortable: true,
    //   sortKey: "order_status",
    //   hiddenOnMobile: true,
    //   render: (val) => (
    //     <Badge variant="outline" className="capitalize">{String(val)}</Badge>
    //   ),
    // },
    // {
    //   key: "customerEmail",
    //   label: "CUSTOMER EMAIL",
    //   type: "text",
    //   sortable: true,
    //   sortKey: "customer_email",
    //   hiddenOnMobile: true,
    //   render: (_, row) => (
    //     <span className="text-slate-600 text-sm">{row.customer.email}</span>
    //   ),
    // },
    {
      key: "lastModified",
      label: "LAST MODIFIED",
      type: "date",
      sortable: true,
      sortKey: "updated_at",
      hiddenOnMobile: true,
      render: (val) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="h-3 w-3" />
          <span className="text-[11px]">
            {new Date(val as string).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "confirm",
      label: "CONFIRM",
      align: "center",
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleConfirmDraft(row.orderId)}
          disabled={confirmDraft.isPending}
          className="gap-1.5"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {confirmDraft.isPending ? "Confirming..." : "Confirm"}
        </Button>
      ),
    },
  ], [confirmDraft.isPending]);

  // Filter columns based on visibility preferences
  const columns = useMemo(() => {
    return allColumns.filter((col) => {
      const visibleCol = visibleColumns.find((vc) => vc.key === col.key);
      return visibleCol?.visible !== false;
    });
  }, [allColumns, visibleColumns]);

  const sortOptions = useMemo((): SortOption[] => [
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
  ], [sort, setSort]);

  const actions: any[] = [
    // {
    //   label: "Copy",
    //   icon: <Copy size={16} />,
    //   onClick: () => notifyInfo("Copy feature not implemented"),
    // },
    // {
    //   label: "CSV",
    //   icon: <FileText size={16} />,
    //   onClick: () => notifyInfo("CSV export not implemented"),
    // },
    // {
    //   label: "PDF",
    //   icon: <FileText size={16} />,
    //   onClick: () => notifyInfo("PDF export not implemented"),
    // },
    // {
    //   label: "Print",
    //   icon: <Printer size={16} />,
    //   onClick: () => notifyInfo("Print feature not implemented"),
    // },
  ];

  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      {/* Header Section */}
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
      </div>

      {/* Metrics */}
      <MetricsGrid metrics={metrics} />

      {/* Filters & Actions */}
      <FiltersBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filterGroups={filterGroups}
        sortOptions={sortOptions}
        actions={actions}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onClearFilters={() => {
          resetFilters();
          setItemRanges([]);
        }}
      />

      {/* Table */}
      <GenericTable<Order>
        data={drafts}
        loading={isLoading}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
        sortKey={sortField}
        sortDirection={sortDirection as "asc" | "desc"}
        onSortChange={(k, d) => setSort(`${k}_${d}`)}
        getRowId={(row) => row.orderId}
        onRowClick={(row) => navigate(ROUTES.ORDERS.DRAFT_DETAIL(row.orderId))}
        forceTableOnMobile={false}
        renderMobileCard={(row) => ({
          title: row.customer?.name || "N/A",
          subtitle: row.orderNumber,
          primaryValue: row.itemsCount + " items",
          badges: (
            <Badge variant="secondary" className="rounded-md">
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
          ],
        })}
      />
    </div>
  );
};

export default DraftOrdersPage;
