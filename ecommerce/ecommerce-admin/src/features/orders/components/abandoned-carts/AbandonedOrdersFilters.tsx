import {
  FiltersBar,
  type FilterGroup,
} from "@/components/data-table/FiltersBar";

import type { AbandonedOrdersFiltersProps } from "../../types";

export const AbandonedOrdersFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter,
  valueFilter,
  setValueFilter,
  onFilterChange,
}: AbandonedOrdersFiltersProps) => {
  const filterGroups: FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      options: [
        {
          label: "Not Contacted",
          value: "not-contacted",
          isActive: statusFilter === "not-contacted",
          onSelect: (val) => {
            setStatusFilter(statusFilter === val ? "" : val); // toggle logic behavior
            onFilterChange();
          },
        },
        {
          label: "Email Sent",
          value: "email-sent",
          isActive: statusFilter === "email-sent",
          onSelect: (val) => {
            setStatusFilter(statusFilter === val ? "" : val);
            onFilterChange();
          },
        },
        {
          label: "Recovered",
          value: "recovered",
          isActive: statusFilter === "recovered",
          onSelect: (val) => {
            setStatusFilter(statusFilter === val ? "" : val);
            onFilterChange();
          },
        },
      ],
    },
    {
      id: "channel",
      label: "Channel",
      options: [
        {
          label: "Web",
          value: "web",
          isActive: channelFilter === "web",
          onSelect: (val) => {
            setChannelFilter(val);
            onFilterChange();
          },
        },
        {
          label: "App",
          value: "app",
          isActive: channelFilter === "app",
          onSelect: (val) => {
            setChannelFilter(val);
            onFilterChange();
          },
        },
      ],
    },
    {
      id: "value",
      label: "Value",
      options: [
        {
          label: "Under ₹20K",
          value: "under-20k",
          isActive: valueFilter === "under-20k",
          onSelect: (val) => {
            setValueFilter(val);
            onFilterChange();
          },
        },
        {
          label: "₹20K - ₹50K",
          value: "20k-50k",
          isActive: valueFilter === "20k-50k",
          onSelect: (val) => {
            setValueFilter(val);
            onFilterChange();
          },
        },
        {
          label: "Above ₹50K",
          value: "above-50k",
          isActive: valueFilter === "above-50k",
          onSelect: (val) => {
            setValueFilter(val);
            onFilterChange();
          },
        },
      ],
    },
  ];

  return (
    <FiltersBar
      search={searchQuery}
      onSearchChange={(val) => {
        setSearchQuery(val);
        onFilterChange();
      }}
      searchPlaceholder="Search by name, email, or cart ID..."
      filterGroups={filterGroups}
      sortOptions={[]} // No sort options exposed in original UI
      visibleColumns={[]} // Columns toggle not in original UI
      onToggleColumn={() => { }}
      actions={[]} // Actions handled in table rows or separate header
      onClearFilters={() => {
        setStatusFilter("");
        setChannelFilter("");
        setValueFilter("");
        setSearchQuery("");
        onFilterChange();
      }}
    />
  );
};
