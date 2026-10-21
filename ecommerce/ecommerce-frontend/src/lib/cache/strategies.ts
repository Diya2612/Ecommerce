/**
 * Caching strategies for home page data
 */

export const CACHE_STRATEGIES = {
    // Static content - revalidate daily
    STATIC_DAILY: {
        revalidate: 86400, // 24 hours
    },

    // Semi-dynamic - revalidate hourly
    SEMI_DYNAMIC: {
        revalidate: 3600, // 1 hour
    },

    // Dynamic - revalidate every 5 minutes
    DYNAMIC: {
        revalidate: 300, // 5 minutes
    },

    // Real-time - no caching
    REAL_TIME: {
        cache: 'no-store' as const,
    },
} as const;

// Apply to specific content types
export const HOME_PAGE_CACHE = {
    heroSlides: CACHE_STRATEGIES.STATIC_DAILY,
    categories: CACHE_STRATEGIES.STATIC_DAILY,
    brands: CACHE_STRATEGIES.STATIC_DAILY,
    featuredProducts: CACHE_STRATEGIES.SEMI_DYNAMIC,
    testimonials: CACHE_STRATEGIES.SEMI_DYNAMIC,
    deals: CACHE_STRATEGIES.DYNAMIC,
    comparisonProducts: CACHE_STRATEGIES.SEMI_DYNAMIC,
} as const;
