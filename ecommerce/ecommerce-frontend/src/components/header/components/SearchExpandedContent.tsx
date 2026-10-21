import { Clock, TrendingUp, Sparkles, Search } from "lucide-react";
import { SearchResultsGrid } from "./SearchResultsGrid";
import type { Product } from "@/types/home";
import type { TierNode } from "@/types/tier";

interface SearchExpandedContentProps {
    recentSearches: string[];
    trendingSearches: string[];
    recommendedProducts: Product[];
    onTermClick: (term: string) => void;
    onProductClick: (productId: number | string) => void;
    onViewAllClick?: () => void;
    results?: Product[];
    query?: string;
    isLoading?: boolean;
    tiers?: TierNode[];
}

export function SearchExpandedContent({
    recentSearches,
    trendingSearches,
    recommendedProducts = [],
    onTermClick,
    onProductClick,
    onViewAllClick,
    results = [],
    query = "",
    isLoading = false,
    tiers = []
}: SearchExpandedContentProps) {
    const hasQuery = query.trim().length > 0;

    return (
        <div className="w-full max-h-[80vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 grid grid-cols-12 gap-0 relative">
            {/* Left Column: Recent & Trending - Hide when searching */}
            {!hasQuery && (
                <div className="col-span-12 md:col-span-3 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col md:sticky md:top-0 h-fit">
                    <div className="p-6 space-y-8">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Recent Searches</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => onTermClick(term)}
                                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#31CDD4] hover:bg-white dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-left shadow-sm border border-gray-100 dark:border-gray-800"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Trending Now</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {trendingSearches.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => onTermClick(term)}
                                        className="group flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#31CDD4] hover:bg-white dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all"
                                    >
                                        <span>{term}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all text-[#31CDD4]">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Column: Results & Recommendations - Full width when searching */}
            <div className={`flex flex-col col-span-12 ${!hasQuery ? 'md:col-span-9' : ''} pb-24`}>
                <div className="p-6 md:p-8 space-y-8">
                    {/* Search Results */}
                    {hasQuery && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Search Results for "{query}"</span>
                                </div>
                                {!isLoading && results.length > 0 && (
                                    <span className="text-xs text-gray-400">{results.length} results found</span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="text-sm text-gray-500">Searching...</span>
                                </div>
                            ) : results.length > 0 ? (
                                <SearchResultsGrid
                                    results={results}
                                    onProductClick={onProductClick}
                                    onViewAllClick={onViewAllClick}
                                    isLoading={isLoading}
                                    className="px-0 pb-0 w-full"
                                    tiers={tiers}
                                />
                            ) : (
                                <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No results found for "{query}"
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recommended Products */}
                    {recommendedProducts.length > 0 && (
                        <div className={hasQuery ? "opacity-75 transition-opacity" : ""}>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Recommended For You</span>
                            </div>

                            <SearchResultsGrid
                                results={recommendedProducts}
                                onProductClick={onProductClick}
                                isLoading={false}
                                className="px-0 pb-0 w-full"
                                tiers={tiers}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
