/**
 * SearchInput Component
 * Search input with debouncing and clear button
 */

import { memo } from 'react';
import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input height */
  height?: number;
}

/**
 * Search input component with clear button
 */
const SearchInputComponent: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search',
  height = 50,
}) => {
  return (
    <div
      className="relative flex items-center bg-white border border-gray-200 rounded-xl shadow-sm"
      style={{ height }}
    >
      <span className="pointer-events-none absolute left-4 text-gray-400">
        <Search size={20} strokeWidth={1.5} />
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-full bg-transparent
          pl-12 pr-10
          text-[16px] font-medium
          text-gray-600 placeholder:text-gray-400
          rounded-xl
          focus:outline-none
        "
        type="search"
        aria-label="Search"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="
            absolute right-3
            w-8 h-8 rounded-full
            flex items-center justify-center
            text-gray-400 hover:text-gray-600 hover:bg-gray-100
            transition-colors
          "
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Export memoized version
export const SearchInput = memo(SearchInputComponent);

SearchInput.displayName = 'SearchInput';
