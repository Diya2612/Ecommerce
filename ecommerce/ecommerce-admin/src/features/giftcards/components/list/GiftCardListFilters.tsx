import React from 'react';
import { FiltersBar, type SortOption } from "@/components/data-table";
import {
  Copy,
  Pencil,
  Archive,
  Trash2,
} from "lucide-react";

interface GiftCardListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  visibleColumns: { key: string; label: string; visible: boolean }[];
  onToggleColumn: (key: string) => void;
  onClearFilters: () => void;
}

export const GiftCardListFilters: React.FC<GiftCardListFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  visibleColumns,
  onToggleColumn,
  onClearFilters,
}) => {
  const statusFilterOptions = [
    {
      label: "All Status",
      value: "",
      onSelect: () => onStatusChange(""),
      isActive: status === "",
    },
    {
      label: "Active",
      value: "active",
      onSelect: () => onStatusChange("active"),
      isActive: status === "active",
    },
    {
      label: "Redeemed",
      value: "redeemed",
      onSelect: () => onStatusChange("redeemed"),
      isActive: status === "redeemed",
    },
    {
      label: "Expired",
      value: "expired",
      onSelect: () => onStatusChange("expired"),
      isActive: status === "expired",
    },
    {
      label: "Inactive",
      value: "inactive",
      onSelect: () => onStatusChange("inactive"),
      isActive: status === "inactive",
    },
  ];

  const sortOptions = [
    {
      label: "Newest First",
      value: "newest",
      direction: "desc",
      isActive: sort === "newest",
      onSelect: () => onSortChange("newest"),
    },
    {
      label: "Oldest First",
      value: "oldest",
      direction: "asc",
      isActive: sort === "oldest",
      onSelect: () => onSortChange("oldest"),
    },
    {
      label: "Highest Value",
      value: "value_desc",
      direction: "desc",
      isActive: sort === "value_desc",
      onSelect: () => onSortChange("value_desc"),
    },
    {
      label: "Lowest Value",
      value: "value_asc",
      direction: "asc",
      isActive: sort === "value_asc",
      onSelect: () => onSortChange("value_asc"),
    },
  ] as const satisfies SortOption[];

  const actions = [
    {
      label: "Duplicate",
      icon: <Copy size={16} className="text-gray-400" />,
      onClick: () => console.log("Duplicate"),
    },
    {
      label: "Edit",
      icon: <Pencil size={16} className="text-gray-400" />,
      onClick: () => console.log("Edit"),
    },
    {
      label: "Deactivate",
      icon: <Archive size={16} className="text-gray-400" />,
      onClick: () => console.log("Deactivate"),
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} className="text-gray-400" />,
      danger: true,
      onClick: () => console.log("Delete"),
    },
  ];

  return (
    <FiltersBar
      search={search}
      onSearchChange={onSearchChange}
      filters={statusFilterOptions}
      sortOptions={sortOptions}
      visibleColumns={visibleColumns}
      onToggleColumn={onToggleColumn}
      actions={actions}
      onClearFilters={onClearFilters}
    />
  );
};
