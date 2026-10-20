/**
 * Tier Sort Options Factory
 * Creates sort options with state handlers for FiltersBar component
 * 
 * @param sort - Current sort value
 * @param setSort - Sort setter function
 * @param setPage - Page setter to reset pagination
 * @returns Array of sort options with handlers
 */
export const TIER_SORT_OPTIONS = (
  sort: string,
  setSort: (sort: string) => void,
  setPage: (page: number) => void
) => [
    {
      label: 'Newest First',
      value: 'created_at:desc',
      isActive: sort === 'created_at:desc',
      onSelect: () => {
        setSort('created_at:desc');
        setPage(1);
      },
    },
    {
      label: 'Oldest First',
      value: 'created_at:asc',
      isActive: sort === 'created_at:asc',
      onSelect: () => {
        setSort('created_at:asc');
        setPage(1);
      },
    },
    {
      label: 'Name (A-Z)',
      value: 'name:asc',
      isActive: sort === 'name:asc',
      onSelect: () => {
        setSort('name:asc');
        setPage(1);
      },
    },
    {
      label: 'Name (Z-A)',
      value: 'name:desc',
      isActive: sort === 'name:desc',
      onSelect: () => {
        setSort('name:desc');
        setPage(1);
      },
    },
  ];
