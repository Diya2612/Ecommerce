import { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
  isActive?: boolean;
}

export const useFilters = <T extends Record<string, any>>(initialFilters: T) => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const resetFilter = <K extends keyof T>(key: K) => {
    setFilters((prev) => ({ ...prev, [key]: initialFilters[key] }));
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    resetFilter,
    setFilters,
  };
};
