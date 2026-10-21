"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/home';
import { useSearchProducts } from '@/queries/products/useSearchProducts';
import { getFeaturedProducts } from '@/queries/products/queries';
import { productKeys } from '@/queries/products/keys';

const TRENDING_SEARCHES = ["RO Purifier", "Filter Kit", "AMC Plan", "Smart Water"];
const RECENT_SEARCHES_KEY = 'recentSearches';
const DEBOUNCE_MS = 300;

export function useHeaderSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const router = useRouter();

    // Use the new TanStack Query hook
    const { data, isLoading } = useSearchProducts(debouncedQuery);
    const results = data?.products || [];

    // Fetch featured products for recommendations
    const { data: featuredProducts = [] } = useQuery({
        queryKey: productKeys.featured(),
        queryFn: getFeaturedProducts,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const recommendedProducts = featuredProducts.slice(0, 4);

    // Load recent searches from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch {
                setRecentSearches([]);
            }
        }
    }, []);

    // Debounce query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, DEBOUNCE_MS);

        return () => clearTimeout(handler);
    }, [query]);

    // Add to recent searches
    const addToRecentSearches = useCallback((term: string) => {
        if (!term.trim()) return;

        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }, [recentSearches]);

    // Clear recent searches
    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    }, []);

    // Navigate to product
    const navigateToProduct = useCallback((productId: number | string) => {
        router.push(`/collections/${productId}`);
    }, [router]);

    // Navigate to search results page
    const navigateToResults = useCallback((searchTerm?: string) => {
        const term = searchTerm || query;
        if (term.trim()) {
            addToRecentSearches(term);
            router.push(`/collections?search=${encodeURIComponent(term)}`);
        }
    }, [query, router, addToRecentSearches]);

    // Handle search submission
    const handleSearch = useCallback((term: string) => {
        if (!term.trim()) return;
        setQuery(term);
        addToRecentSearches(term);
    }, [addToRecentSearches]);

    // Reset search state
    const resetSearch = useCallback(() => {
        setQuery("");
        setDebouncedQuery("");
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        recentSearches,
        trendingSearches: TRENDING_SEARCHES,
        handleSearch,
        addToRecentSearches,
        clearRecentSearches,
        navigateToProduct,
        navigateToResults,
        resetSearch,
        recommendedProducts,
    };
}
