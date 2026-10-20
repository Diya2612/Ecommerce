import { useState } from "react";

export interface UseSearchReturn {
  search: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
}

export const useSearch = (initialValue = ""): UseSearchReturn => {
  const [search, setSearch] = useState(initialValue);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return {
    search,
    setSearch: handleSearchChange,
    clearSearch,
  };
};
