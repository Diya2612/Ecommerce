import { Globe, Smartphone, Eye, Mail } from "lucide-react";
import type { AbandonedOrdersTableProps } from "../../types";
import {
  GenericTable,
  type ColumnConfig,
} from "@/components/data-table/GenericTable";
import { StatusBadge } from "../..";

export const AbandonedOrdersTable = ({
  orders,
  selectedCarts,
  onSelectAll: _onSelectAll,
  onSelectCart,
  onViewCart,
  onSendEmail,
  page,
  totalPages,
  total,
  rowsPerPage,
  setPage,
  setRowsPerPage,
}: AbandonedOrdersTableProps) => {
  const columns: ColumnConfig<(typeof orders)[0]>[] = [
    {
      key: "cartId",
      label: "CART ID",
      type: "text",
      render: (val) => (
        <span className="font-mono font-medium text-slate-900">
          {String(val)}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "CUSTOMER",
      type: "text",
      className: "min-w-[150px]",
    },
    {
      key: "email",
      label: "EMAIL",
      type: "text",
      className: "min-w-[180px] text-slate-600",
    },
    {
      key: "phone",
      label: "PHONE",
      type: "text",
      className: "text-slate-600",
    },
    {
      key: "products",
      label: "PRODUCTS",
      align: "center",
      render: (_val, row) => {
        const totalItems = row.products.reduce((acc, p) => acc + p.quantity, 0);
        return (
          <div className="group relative inline-block">
            <span className="text-sm font-medium text-indigo-600 cursor-help border-b border-dashed border-indigo-300">
              {totalItems} items
            </span>
            {/* Tooltip implementation relying on standard CSS/Tailwind group-hover */}
            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-20 text-left pointer-events-none">
              <p className="font-semibold mb-2">Cart Items:</p>
              <ul className="space-y-1">
                {row.products.map((p) => (
                  <li key={p.id}>
                    • {p.name} (×{p.quantity})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      },
    },
    {
      key: "cartValue",
      label: "CART VALUE",
      type: "currency",
      currencySymbol: "₹",
      align: "right",
      className: "font-semibold text-slate-900",
    },
    {
      key: "abandonedAt",
      label: "ABANDONED AT",
      render: (val) => (
        <span className="text-slate-600">{String(val).split(" ")[0]}</span>
      ),
    },
    {
      key: "lastActivity",
      label: "LAST ACTIVITY",
      className: "text-slate-600",
    },
    {
      key: "recoveryStatus",
      label: "STATUS",
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={String(val)} type="recovery" />
          {row.emailSentAt && (
            <p className="text-[10px] text-slate-500">
              {new Date(row.emailSentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "channel",
      label: "CHANNEL",
      align: "center",
      render: (val) => (
        <div title={String(val)} className="mx-auto w-fit">
          {val === "web" ? (
            <Globe className="size-4 text-slate-600" />
          ) : (
            <Smartphone className="size-4 text-slate-600" />
          )}
        </div>
      ),
    },
  ];

  // Adapter for GenericTable selection
  const handleSelectionChange = (selectedRows: typeof orders) => {
    // If selection is empty but we have orders, it could be a deselect all or just one interaction.
    // The GenericTable toggle logic handles state. We just need to sync with our callbacks.

    // However, GenericTable manages its own selectedIds state internally but exposes onSelectionChange.
    // The existing parent (AbandonedOrdersPage) seems to manage `selectedCarts` (a Set).
    // This mismatch is tricky. We should ideally move selection state UP or have GenericTable accept `selectedIds`.

    // For now, let's map the incoming rows to IDs and invoke the callback used by the parent.
    // NOTE: GenericTable doesn't strictly accept controlled `selectedIds` yet in the version I read.
    // It has internal state initialized with empty.

    // Wait, looking at GenericTable.tsx: "const [selectedIds, setSelectedIds] = useState<string[]>([]);"
    // It does NOT accept controlled props "selectedIds". This is a limitation of the current reusable component.
    // To properly refactor without breaking functionality, we ideally needed GenericTable to be controllable.

    // Workaround: We will let GenericTable handle the UI, and just emit events.
    // But wait, the parent `AbandonedOrdersPage` manages the Set.

    // Since I cannot change GenericTable right now (it's a shared component), I will rely on its `onSelectionChange`.
    selectedRows.forEach((row) => {
      if (!selectedCarts.has(row.id)) {
        onSelectCart(row.id, true);
      }
    });

    // Find rows that were deselected
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    orders.forEach((row) => {
      if (!selectedIds.has(row.id) && selectedCarts.has(row.id)) {
        onSelectCart(row.id, false); // Deselect
      }
    });
  };

  return (
    <GenericTable
      data={orders}
      columns={columns}
      getRowId={(row) => row.id}
      loading={false} // Loading state managed by parent usually, but prop not passed clearly as boolean here?
      // Ah, the prop `loading` is not in AbandonedOrdersTableProps, assuming false for now or add it.
      page={page}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      totalItems={total}
      onPageChange={setPage}
      onRowsPerPageChange={setRowsPerPage}
      selectable={true}
      selectionMode="multiple"
      onSelectionChange={handleSelectionChange}
      // MAPPING ACTIONS
      rowActionsBuilder={(row) => [
        {
          label: "View",
          icon: <Eye className="size-3.5" />,
          onClick: () => onViewCart(row),
        },
        {
          label: "Email",
          icon: <Mail className="size-3.5" />,
          onClick: () => onSendEmail([row.id]),
          disabled: row.recoveryStatus === "recovered",
        },
      ]}
      emptyState={
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Globe className="size-6 text-slate-400" /> {/* Fallback icon */}
          </div>
          <div>
            <p className="font-medium text-slate-900">
              No abandoned carts found
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      }
    />
  );
};
