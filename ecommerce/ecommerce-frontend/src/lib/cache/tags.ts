/**
 * Cache tag definitions for on-demand revalidation
 */

export const CACHE_TAGS = {
    // Home page tags
    HOME: 'home-page',
    HERO: 'hero-slides',
    PRODUCTS: 'products',
    FEATURED_PRODUCTS: 'featured-products',
    CATEGORIES: 'categories',
    TESTIMONIALS: 'testimonials',
    BRANDS: 'brands',
    DEALS: 'deals',

    // Product page tags
    PRODUCT: 'product',
    PRODUCT_DETAILS: 'product-details',
    PRODUCT_REVIEWS: 'product-reviews',
    RELATED_PRODUCTS: 'related-products',
    BRAND_PRODUCTS: 'brand-products',
    CATEGORY_PRODUCTS: 'category-products',
    PRODUCT_BUNDLES: 'product-bundles',

    // Collection page tags
    COLLECTION: 'collection-products',
    COLLECTION_FILTERS: 'collection-filters',

    // Profile page tags
    PROFILE: 'user-profile',
    USER_ADDRESSES: 'user-addresses',
    USER_ORDERS: 'user-orders',
    USER_WISHLIST: 'user-wishlist',
    USER_AMC: 'user-amc',
} as const;

// Dynamic tag helpers for specific items
export const productTag = (id: string) => `product-${id}` as const;
export const reviewsTag = (productId: string) => `reviews-${productId}` as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

