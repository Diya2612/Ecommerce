import { useState } from "react";

export type DateRangeValue = {
  from: Date | null;
  to: Date | null;
};

export interface UseDateRangeReturn {
  dateRange: DateRangeValue;
  setDateRange: (value: DateRangeValue) => void;
  clearDateRange: () => void;
}

export const useDateRange = (initialValue: DateRangeValue = { from: null, to: null }): UseDateRangeReturn => {
  const [dateRange, setDateRange] = useState<DateRangeValue>(initialValue);

  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(value);
  };

  const clearDateRange = () => {
    setDateRange({ from: null, to: null });
  };

  return {
    dateRange,
    setDateRange: handleDateRangeChange,
    clearDateRange,
  };
};
