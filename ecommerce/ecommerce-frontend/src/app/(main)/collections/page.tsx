import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/lib/query-client';
import { getProducts, productKeys } from '@/queries';
import { searchParamsCache, normalizeFilters } from '@/lib/search-params';
import {
  CollectionBannerSection,
  FiltersSection,
  ProductGridSection,
  PromotionSection,
  CollectionCTASection,
} from '@/components/collection/server';

// ============================================================================
// Page Configuration
// ============================================================================

export const dynamic = 'force-dynamic';

// ============================================================================
// Page Props
// ============================================================================

interface CollectionPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ============================================================================
// Skeleton Components
// ============================================================================

function FiltersSkeleton() {
  return (
    <aside className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-pulse">
      {/* Header Skeleton */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-8">
        {/* Categories Section */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3 pl-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
          <div className="flex justify-between">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
          </div>
        </div>

        {/* Tech Section */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileFiltersSkeleton() {
  return (
    <div className="lg:hidden mb-6">
      <div className="h-12 bg-white rounded-xl border border-gray-200 animate-pulse" />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-11 bg-gray-200 rounded-xl w-[200px]" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-card border border-gray-100 overflow-hidden">
            <div className="h-[280px] bg-gray-100" />
            <div className="p-5">
              <div className="flex gap-2 mb-3">
                <div className="h-5 bg-gray-100 rounded-full w-12" />
                <div className="h-5 bg-gray-100 rounded-full w-10" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-10 bg-gray-100 rounded-xl w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  // Parse URL search params into filter state using nuqs cache
  const params = await searchParams;
  const filters = searchParamsCache.parse(params);

  // Normalize filters for consistent query keys between Server and Client
  // This replaces manual mapping ensures the object structure is identical to what Client produces
  const normalizedFilters = normalizeFilters(filters);

  // Prefetch data on the server using a request-scoped query client
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: productKeys.list(normalizedFilters),
    queryFn: () => getProducts({
      page: normalizedFilters.page,
      limit: normalizedFilters.limit,
      categories: normalizedFilters.categories?.join(','),
      technologies: normalizedFilters.technologies?.join(','),
      ratings: normalizedFilters.ratings?.join(','),
      minPrice: normalizedFilters.priceRange?.[0],
      maxPrice: normalizedFilters.priceRange?.[1],
      sort: normalizedFilters.sort as any,
      search: normalizedFilters.search,
    }),
  });

  return (
    <>
      {/* Banner - Server Rendered */}
      {/* <CollectionBannerSection /> */}

      {/* Main Content - Filters + Products */}
      <section className="pt-32 pb-16 bg-[#F9FBFD]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[300px_1fr] gap-10">
            {/* Filters Sidebar */}
            <Suspense fallback={<><FiltersSkeleton /><MobileFiltersSkeleton /></>}>
              <FiltersSection filters={normalizedFilters} />
            </Suspense>

            {/* Product Grid - Hydrated from server cache */}
            <div className="space-y-6">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<ProductGridSkeleton />}>
                  {/* 
                      Pass normalizedFilters to ProductGridSection so it can pass them to Client.
                      Data is implicit via HydrationBoundary.
                   */}
                  <ProductGridSection
                    filters={normalizedFilters}
                  />
                </Suspense>
              </HydrationBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions - Server Rendered */}
      {/* <PromotionSection /> */}

      {/* CTA - Server Rendered */}
      <CollectionCTASection />
    </>
  );
}
