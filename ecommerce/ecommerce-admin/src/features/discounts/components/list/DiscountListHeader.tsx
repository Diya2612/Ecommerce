import React from 'react';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons } from "@/components/data-table";
import type { DateRangeValue } from "@/hooks/useDateRange";

interface DiscountListHeaderProps {
  dateRange: DateRangeValue;
  setDateRange: (range: DateRangeValue) => void;
  totalItems?: number;
}

export const DiscountListHeader: React.FC<DiscountListHeaderProps> = ({
  dateRange,
  setDateRange,
  totalItems: _totalItems,
}) => {
  return (
    <div className="flex justify-between items-center">
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <ActionButtons
        primaryLabel="Create Discount"
        primaryTo="/discounts/new"
      />
    </div>
  );
};
