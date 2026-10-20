import React, { useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { GenericTable, type ColumnConfig, type MobileRecordCardProps } from "@/components/data-table";
import type { Discount } from '../../types/discount.types';

interface DiscountListTableProps {
  discounts: Discount[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  visibleColumns: { key: string; label: string; visible: boolean }[];
}

export const DiscountListTable: React.FC<DiscountListTableProps> = ({
  discounts,
  isLoading,
  page,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  sort,
  onSortChange,
  visibleColumns,
}) => {
  const navigate = useNavigate();

  const columns: ColumnConfig<Discount>[] = [
    {
      key: "code",
      label: "Code",
      type: "text",
      sortable: true,
      sortKey: "code",
      link: (row) => `/discounts/${row.id}`,
      linkClassName: "text-[#253154] font-medium",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-[#253154]">{row.code}</p>
          <p className="text-xs text-gray-500">{row.title}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      type: "badge",
      sortable: false,
      render: (_, row) => {
        const typeLabels: Record<string, string> = {
          percentage: "Percentage",
          fixed: "Fixed Amount",
          buy_x_get_y: "Buy X Get Y",
          free_shipping: "Free Shipping",
        };
        return (
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
            {typeLabels[row.type] || row.type}
          </span>
        );
      },
    },
    {
      key: "value",
      label: "Value",
      type: "text",
      sortable: false,
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      sortable: true,
      sortKey: "status",
    },
    {
      key: "usage_count",
      label: "Usage",
      type: "text",
      sortable: true,
      sortKey: "usage",
      render: (_, row) => (
        <span className="text-sm">
          {row.usage_count}
          {row.usage_limit && (
            <span className="text-gray-400"> / {row.usage_limit}</span>
          )}
        </span>
      ),
    },
    {
      key: "ends_at",
      label: "Expires",
      type: "date",
      sortable: true,
      sortKey: "ends_at",
      render: (_, row) =>
        row.ends_at ? (
          <span className="text-sm">
            {new Date(row.ends_at).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-sm text-gray-400">No expiry</span>
        ),
    },
  ];

  const filteredColumns = useMemo(
    () =>
      columns.filter((col) =>
        visibleColumns.find((v) => v.key === col.key)?.visible
      ),
    [visibleColumns]
  );

  const renderMobileCard = (row: Discount): MobileRecordCardProps => {
    const statusStyles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      scheduled: "bg-amber-50 text-amber-700 border-amber-200",
      expired: "bg-red-50 text-red-700 border-red-200",
      inactive: "bg-gray-100 text-gray-600 border-gray-200",
    };

    return {
      title: row.code,
      subtitle: row.title,
      primaryValue: row.value,
      badges: (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] border ${statusStyles[row.status]}`}
        >
          {row.status}
        </span>
      ),
      fields: [
        {
          label: "Usage",
          value: row.usage_limit
            ? `${row.usage_count} / ${row.usage_limit}`
            : `${row.usage_count}`,
        },
        {
          label: "Expires",
          value: row.ends_at
            ? new Date(row.ends_at).toLocaleDateString()
            : "No expiry",
        },
      ],
    };
  };

  return (
    <GenericTable<Discount>
      data={discounts}
      loading={isLoading}
      page={page}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      getRowId={(row) => row.id}
      columns={filteredColumns}
      selectable={true}
      sortKey={sort.split("_")[0] || ""}
      sortDirection={(sort.split("_")[1] as "asc" | "desc") || "asc"}
      onSortChange={(key, direction) => {
        const sortValue = `${key}_${direction}`;
        onSortChange(sortValue);
      }}
      renderMobileCard={renderMobileCard}
      onRowClick={(row) => navigate(`/discounts/${row.id}`)}
    />
  );
};
