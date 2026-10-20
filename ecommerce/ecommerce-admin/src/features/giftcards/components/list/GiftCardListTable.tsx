import React, { useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { GenericTable, type ColumnConfig, type MobileRecordCardProps } from "@/components/data-table";
import type { GiftCard } from '../../types/giftcard.types';

interface GiftCardListTableProps {
  giftCards: GiftCard[];
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

export const GiftCardListTable: React.FC<GiftCardListTableProps> = ({
  giftCards,
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

  const columns: ColumnConfig<GiftCard>[] = [
    {
      key: "code",
      label: "Code",
      type: "text",
      sortable: true,
      sortKey: "code",
      link: (row) => `/giftcards/${row.id}`,
      linkClassName: "text-[#253154] font-medium",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-[#253154]">{row.code}</p>
          <p className="text-xs text-gray-500">{row.title}</p>
        </div>
      ),
    },
    {
      key: "value",
      label: "Value",
      type: "currency",
      currencySymbol: "₹",
      sortable: true,
      sortKey: "value",
    },
    {
      key: "balance",
      label: "Balance",
      type: "text",
      sortable: true,
      sortKey: "balance",
      render: (_, row) => {
        const percentUsed =
          row.value > 0 ? ((row.value - row.balance) / row.value) * 100 : 0;
        return (
          <div className="space-y-1">
            <span className="text-sm font-medium">₹{row.balance}</span>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${100 - percentUsed}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      sortable: true,
      sortKey: "status",
    },
    {
      key: "recipient",
      label: "Recipient",
      type: "text",
      sortable: false,
      render: (_, row) =>
        row.recipient_name ? (
          <div>
            <p className="text-sm">{row.recipient_name}</p>
            <p className="text-[11px] text-gray-500">{row.recipient_email}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not assigned</span>
        ),
    },
    {
      key: "expires_at",
      label: "Expires",
      type: "date",
      sortable: true,
      sortKey: "expires_at",
      render: (_, row) =>
        row.expires_at ? (
          <span className="text-sm">
            {new Date(row.expires_at).toLocaleDateString()}
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

  const renderMobileCard = (row: GiftCard): MobileRecordCardProps => {
    const statusStyles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      redeemed: "bg-blue-50 text-blue-700 border-blue-200",
      expired: "bg-red-50 text-red-700 border-red-200",
      inactive: "bg-gray-100 text-gray-600 border-gray-200",
    };

    return {
      title: row.code,
      subtitle: row.title,
      primaryValue: `₹${row.value}`,
      badges: (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] border ${statusStyles[row.status]}`}
        >
          {row.status}
        </span>
      ),
      fields: [
        {
          label: "Balance",
          value: `₹${row.balance}`,
        },
        {
          label: "Recipient",
          value: row.recipient_name || "Not assigned",
        },
        {
          label: "Expires",
          value: row.expires_at
            ? new Date(row.expires_at).toLocaleDateString()
            : "No expiry",
        },
      ],
    };
  };

  return (
    <GenericTable<GiftCard>
      data={giftCards}
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
      onRowClick={(row) => navigate(`/giftcards/${row.id}`)}
    />
  );
};
