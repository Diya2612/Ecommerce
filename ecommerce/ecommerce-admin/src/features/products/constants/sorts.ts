/**
 * Product Sort Options Factory
 * Creates sort options with state handlers for FiltersBar component
 * 
 * @param sort - Current sort value
 * @param setSort - Sort setter function
 * @param setPage - Page setter to reset pagination
 * @returns Array of sort options with handlers
 */
export const PRODUCT_SORT_OPTIONS = (
  sort: string,
  setSort: (sort: string) => void,
  setPage: (page: number) => void
) => [
  {
    label: 'Newest First',
    value: 'newest',
    direction: 'desc' as const,
    isActive: sort === 'newest',
    onSelect: () => {
      setSort('newest');
      setPage(1);
    },
  },
  {
    label: 'Oldest First',
    value: 'oldest',
    direction: 'asc' as const,
    isActive: sort === 'oldest',
    onSelect: () => {
      setSort('oldest');
      setPage(1);
    },
  },
  {
    label: 'Price (High-Low)',
    value: 'price_desc',
    direction: 'desc' as const,
    isActive: sort === 'price_desc',
    onSelect: () => {
      setSort('price_desc');
      setPage(1);
    },
  },
  {
    label: 'Price (Low-High)',
    value: 'price_asc',
    direction: 'asc' as const,
    isActive: sort === 'price_asc',
    onSelect: () => {
      setSort('price_asc');
      setPage(1);
    },
  },
];

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

