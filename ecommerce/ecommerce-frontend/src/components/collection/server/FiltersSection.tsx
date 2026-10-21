import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import getQueryClient from '@/lib/query-client';
import { getFilterOptions, productKeys, tierKeys, getTierHierarchy } from '@/queries';
import { FiltersClient } from '../client/FiltersClient';
import { MobileFiltersClient } from '../client/MobileFiltersClient';
import type { CollectionFilters } from '@/types/collection';

interface FiltersSectionProps {
    filters: CollectionFilters;
    searchParams?: any; // kept for backward compatibility if needed, but unused
}

/**
 * FiltersSection - Server Component
 * 
 * Responsible for prefetching filter options and dehydrating state.
 * Client components will wake up with this data and take over via useFilterOptions hook.
 */
export async function FiltersSection({ filters }: FiltersSectionProps) {
    // Get primary category context from normalized filters
    const categorySlug = filters.categories?.[0];

    // Explicitly define params object for consistent key generation
    const filterParams = { categories: categorySlug };

    // Prefetch filter options and tier hierarchy on server
    const queryClient = getQueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: productKeys.filters(filterParams),
            queryFn: () => getFilterOptions(filterParams),
        }),
        queryClient.prefetchQuery({
            queryKey: tierKeys.hierarchy(),
            queryFn: getTierHierarchy,
        })
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {/* Desktop Filters - visible on lg+ screens */}
            <aside className="hidden lg:block">
                <FiltersClient />
            </aside>

            {/* Mobile Filters moved to ProductGridClient */}
            {/* <div className="lg:hidden mb-6">
                <MobileFiltersClient />
            </div> */}
        </HydrationBoundary>
    );
}
