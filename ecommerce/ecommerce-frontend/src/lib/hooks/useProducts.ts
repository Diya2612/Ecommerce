import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProducts, productKeys } from '@/queries';
import type { CollectionFilters } from '@/types/collection';

export const useProducts = (filters: CollectionFilters) => {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () => getProducts({
            page: filters.page,
            limit: filters.limit,
            categories: filters.categories?.join(','),
            technologies: filters.technologies?.join(','),
            ratings: filters.ratings?.join(','),
            minPrice: filters.priceRange?.[0],
            maxPrice: filters.priceRange?.[1],
            sort: filters.sort as any,
            search: filters.search,
        }),
        placeholderData: keepPreviousData
    });
};
