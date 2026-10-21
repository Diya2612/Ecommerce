"use client";

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { SearchResultsGrid } from './SearchResultsGrid';
import { TrendingTags } from './TrendingTags';
import { useHeaderSearch } from '../hooks/useHeaderSearch';
import type { ExpandedSearchProps } from '../types';

const logoDarkText = '/assets/10d9e162195ae525bf94f3d12e99419e24d10bb6.png';
const logoLightText = '/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png';

export function ExpandedSearch({ onClose }: ExpandedSearchProps) {
    const {
        query,
        setQuery,
        results,
        isLoading,
        recentSearches,
        trendingSearches,
        handleSearch,
        clearRecentSearches,
        navigateToProduct,
        navigateToResults,
        resetSearch,
    } = useHeaderSearch();

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Handle Enter key for search
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            navigateToResults();
            onClose();
        }
    }, [query, navigateToResults, onClose]);

    // Handle product click
    const handleProductClick = useCallback((productId: number | string) => {
        navigateToProduct(productId);
        onClose();
    }, [navigateToProduct, onClose]);

    // Handle tag click
    const handleTagClick = useCallback((term: string) => {
        handleSearch(term);
        setQuery(term);
    }, [handleSearch, setQuery]);

    return (
        <div className="w-full overflow-hidden py-2">
            {/* Header Row: Logo + Close */}
            <div className="flex items-center justify-between px-6 md:px-8 py-4">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    <Link href="/" className="flex items-center shrink-0">
                        <Image
                            src={logoDarkText}
                            alt="Anant Enterprises"
                            width={140}
                            height={35}
                            className="block dark:hidden h-8 w-auto object-contain"
                        />
                        <Image
                            src={logoLightText}
                            alt="Anant Enterprises"
                            width={140}
                            height={35}
                            className="hidden dark:block h-8 w-auto object-contain"
                        />
                    </Link>
                </motion.div>

                {/* Close Button */}
                <motion.div
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:rotate-90 duration-300"
                        aria-label="Close search"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </motion.div>
            </div>

            {/* Search Input - Centered */}
            <div className="flex justify-center px-6 md:px-8 py-6">
                <SearchInput
                    value={query}
                    onChange={setQuery}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            </div>

            {/* Content: Results or Trending/Recent */}
            <AnimatePresence mode="wait">
                {query.trim() ? (
                    <SearchResultsGrid
                        key="results"
                        results={results}
                        onProductClick={handleProductClick}
                        isLoading={isLoading}
                    />
                ) : (
                    <TrendingTags
                        key="trending"
                        trendingSearches={trendingSearches}
                        recentSearches={recentSearches}
                        onTagClick={handleTagClick}
                        onClearRecent={clearRecentSearches}
                    />
                )}
            </AnimatePresence>

            {/* View All Results Link */}
            {query.trim() && results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={() => {
                            navigateToResults();
                            onClose();
                        }}
                        className="text-[#31CDD4] hover:text-[#1C2A54] font-medium"
                    >
                        View all {results.length} results →
                    </Button>
                </motion.div>
            )}

            {/* No Results State */}
            {query.trim() && !isLoading && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No products found for "{query}"</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                </motion.div>
            )}
        </div>
    );
}
