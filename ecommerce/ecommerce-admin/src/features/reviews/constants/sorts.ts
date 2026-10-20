export const REVIEW_SORT_OPTIONS = (
    sort: { key: string; direction: 'asc' | 'desc' },
    handleSort: (key: string, dir: 'asc' | 'desc') => void,
    setPage: (p: number) => void
) => [
    {
        label: "Newest First",
        value: "created_at_desc",
        direction: "desc" as const,
        isActive: sort.key === 'created_at' && sort.direction === 'desc',
        onSelect: () => { handleSort('created_at', 'desc'); setPage(1); }
    },
    {
        label: "Oldest First",
        value: "created_at_asc",
        direction: "asc" as const,
        isActive: sort.key === 'created_at' && sort.direction === 'asc',
        onSelect: () => { handleSort('created_at', 'asc'); setPage(1); }
    },
    {
        label: "Highest Rating",
        value: "rating_desc",
        direction: "desc" as const,
        isActive: sort.key === 'rating' && sort.direction === 'desc',
        onSelect: () => { handleSort('rating', 'desc'); setPage(1); }
    },
    {
        label: "Lowest Rating",
        value: "rating_asc",
        direction: "asc" as const,
        isActive: sort.key === 'rating' && sort.direction === 'asc',
        onSelect: () => { handleSort('rating', 'asc'); setPage(1); }
    }
];
