'use client';

import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useProfile } from '@/contexts/ProfileContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { PaginationClient } from './PaginationClient';
import { useProducts } from '@/lib/hooks/useProducts';
import { useQueryStates } from 'nuqs';
import { searchParamsParsers, normalizeFilters } from '@/lib/search-params';
import { Skeleton } from '@/components/ui/skeleton';
import { SortSelectClient, SORT_OPTIONS } from './SortSelectClient';
import { Product } from '@/components/shared/ProductCard';
import type { CollectionProduct } from '@/types/collection';
import { MobileActionBar } from './MobileActionBar';
import { MobileFiltersClient } from './MobileFiltersClient';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { SearchInput } from '../SearchInput';
import { useQuery } from '@tanstack/react-query';
import { getTierHierarchy, tierKeys } from '@/queries';
import type { TierNode } from '@/types/tier';

// Helper function to find tier by code (recursively) - outside component for stability
function findTierByCode(code: string, nodes: TierNode[]): TierNode | null {
    for (const node of nodes) {
        if (node.code === code) return node;
        if (node.children && node.children.length > 0) {
            const found = findTierByCode(code, node.children);
            if (found) return found;
        }
    }
    return null;
}

export function ProductGridClient() {
    // Read current filters from URL using nuqs (matches server-side parsing)
    const [filters, setFilters] = useQueryStates(searchParamsParsers, {
        shallow: true,
        history: 'push'
    });

    // Use memoized filters to ensure referential stability for query key
    // This prevents unnecessary re-renders and hook dependency churn
    const queryFilters = useMemo(() => normalizeFilters(filters as any), [filters]);

    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useProfile();

    // Fetch tier hierarchy for dynamic page title
    const { data: tiers = [] } = useQuery({
        queryKey: tierKeys.hierarchy(),
        queryFn: getTierHierarchy,
    });

    // Calculate dynamic page title based on selected categories
    const pageTitle = useMemo(() => {
        if (filters.categories.length === 1) {
            const tier = findTierByCode(filters.categories[0], tiers);
            return tier ? tier.name : 'All Products';
        }
        return 'All Products';
    }, [filters.categories, tiers]);

    // Fetch products using React Query (hydrated from server)
    const { data, isLoading, isPlaceholderData } = useProducts(queryFilters);

    const products = data?.products || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;
    const currentPage = data?.page || 1;

    // State for mobile drawers
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Active filters count for badge
    const activeFiltersCount =
        filters.categories.length +
        filters.technologies.length +
        // filters.ratings.length + // HIDDEN - Rating filter removed
        (filters.minPrice > 0 || filters.maxPrice < 200000 ? 1 : 0);

    const isProductInWishlist = (productId: number | string): boolean => {
        return wishlist.some(item => item.id === productId);
    };

    const handleWishlistToggle = (product: Product) => {
        const isInWishlist = isProductInWishlist(product.id);
        if (isInWishlist) {
            removeFromWishlist(String(product.id));
        } else {
            addToWishlist({
                id: String(product.id),
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || 0,
                rating: product.rating || 0,
                reviews: product.reviews || 0,
                image: product.image,
                inStock: true
            });
        }
    };

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: String(product.id),
            quantity: 1,
            variant: (product as CollectionProduct).category || '',
            preventDuplicates: true
        });
    };

    const handleNotifyMe = (product: Product) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Registering your request...',
                success: `We'll notify you when ${product.name} is back in stock!`,
                error: 'Something went wrong',
            }
        );
    };

    if (isLoading && !products.length) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={`space-y-6 transition-opacity duration-200 ${isPlaceholderData ? 'opacity-70' : 'opacity-100'} pb-20 lg:pb-0`}>
                {/* Search Bar */}
                <div className="pt-4">
                    <SearchInput
                        value={filters.search}
                        onChange={(value) => setFilters({ search: value, page: 1 })}
                        onClear={() => setFilters({ search: '', page: 1 })}
                        isSearching={isPlaceholderData && filters.search.length > 0}
                        placeholder="Search for products..."
                    />
                </div>

                {/* Header Section (Moved from Server Component) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1C2A54] dark:text-white mb-2 font-outfit">
                            {pageTitle}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                            {total > 0 ? (
                                <>
                                    Showing <span className="text-[#31CDD4] font-bold">{((currentPage - 1) * filters.limit) + 1}-{Math.min(currentPage * filters.limit, total)}</span> of <span className="text-[#1C2A54] dark:text-white font-bold">{total}</span>
                                </>
                            ) : (
                                "No results found"
                            )}
                        </p>
                    </div>
                    <div className="hidden lg:block w-full sm:w-auto">
                        <SortSelectClient currentSort={filters.sort} />
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isInWishlist={isProductInWishlist(product.id)}
                                onAddToCart={handleAddToCart}
                                onNotifyMe={handleNotifyMe}
                                onWishlistToggle={handleWishlistToggle}
                                productHref={`/products/${product.slug || product.id}`}
                                showQuickView={true}
                                imageHeight="aspect-square"
                                animateEntrance={false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-[18px] font-medium text-[#0B1F51] mb-2">No products found</p>
                        <p className="text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <PaginationClient currentPage={currentPage} totalPages={totalPages} />
                )}
            </div>

            {/* Mobile Action Bar & Drawers */}
            <MobileActionBar
                onSortClick={() => setIsSortOpen(true)}
                onFilterClick={() => setIsFilterOpen(true)}
                filterCount={activeFiltersCount}
            />

            <MobileFiltersClient
                isOpen={isFilterOpen}
                onOpenChange={setIsFilterOpen}
            />

            {/* Mobile Sort Sheet */}
            <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
                <DrawerContent className="flex flex-col rounded-t-[28px]">
                    <div className="p-6 pb-2">
                        <DrawerTitle className="text-[22px] font-semibold text-[#0B1F51] dark:text-white">
                            Sort By
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">Sort products</DrawerDescription>
                    </div>

                    <div className="p-6 pt-2 pb-10 space-y-2">
                        {SORT_OPTIONS.map((option) => {
                            const isSelected = filters.sort === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setFilters({ sort: option.value as any, page: 1 });
                                        setIsSortOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${isSelected
                                        ? 'bg-[#0B1F51]/5 text-[#0B1F51] font-bold border border-[#0B1F51]/10'
                                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <span className="text-[16px]">{option.label}</span>
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-[#0B1F51] text-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
