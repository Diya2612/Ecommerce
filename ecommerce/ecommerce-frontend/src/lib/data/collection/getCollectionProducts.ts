import { cache } from 'react';
import type { CollectionProduct, CollectionFilters, CollectionResponse } from '@/types/collection';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { getAllProducts } from '@/queries';

// ============================================================================
// Fallback Data
// ============================================================================

const FALLBACK_PRODUCTS: CollectionProduct[] = [
    {
        id: 1,
        name: "Anant Pure X1",
        tags: ["RO", "UV", "UF"],
        rating: 4.8,
        reviews: 124,
        price: 12999,
        originalPrice: 18999,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
        category: "residential",
        technologies: ["ro", "uv", "uf"]
    },
    {
        id: 2,
        name: "Crystal Clear Pro",
        tags: ["RO", "Mineralizer"],
        rating: 4.7,
        reviews: 89,
        price: 15999,
        originalPrice: 21999,
        image: "https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=600",
        category: "residential",
        technologies: ["ro", "mineralizer"]
    },
    {
        id: 3,
        name: "AquaShield Ultra",
        tags: ["RO", "UV", "Alkaline"],
        rating: 4.9,
        reviews: 156,
        price: 18999,
        originalPrice: 25999,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600",
        isNew: true,
        category: "residential",
        technologies: ["ro", "uv", "alkaline"]
    },
    {
        id: 4,
        name: "Commercial Pro 500",
        tags: ["Industrial", "RO"],
        rating: 4.6,
        reviews: 43,
        price: 45999,
        originalPrice: 59999,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        isNew: true,
        category: "commercial",
        technologies: ["ro", "uv"]
    },
    {
        id: 5,
        name: "Aqua Lite Countertop",
        tags: ["Portable", "UV"],
        rating: 4.5,
        reviews: 78,
        price: 8999,
        originalPrice: 12999,
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600",
        category: "residential",
        technologies: ["uv", "uf"]
    },
    {
        id: 6,
        name: "Industrial Plant 2000",
        tags: ["Industrial", "Heavy Duty"],
        rating: 4.8,
        reviews: 28,
        price: 125999,
        originalPrice: 159999,
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600",
        category: "industrial",
        technologies: ["ro", "uv", "uf"]
    },
    {
        id: 7,
        name: "Copper+ Wellness",
        tags: ["RO", "Copper"],
        rating: 4.7,
        reviews: 91,
        price: 18999,
        originalPrice: 24999,
        image: "https://images.unsplash.com/photo-1612838320302-4b3b3b3b3b3b?auto=format&fit=crop&q=80&w=600",
        category: "residential",
        technologies: ["ro", "copper"]
    },
    {
        id: 8,
        name: "Office Essential 100",
        tags: ["Commercial", "RO", "UV"],
        rating: 4.6,
        reviews: 67,
        price: 32999,
        originalPrice: 42999,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600",
        category: "commercial",
        technologies: ["ro", "uv"]
    },
    {
        id: 9,
        name: "Smart IoT Purifier",
        tags: ["RO", "IoT", "Smart"],
        rating: 4.9,
        reviews: 112,
        price: 22999,
        originalPrice: 29999,
        image: "https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=600",
        isNew: true,
        category: "residential",
        technologies: ["ro", "uv", "alkaline"]
    },
    {
        id: 10,
        name: "Budget Saver Mini",
        tags: ["UV", "UF"],
        rating: 4.3,
        reviews: 234,
        price: 5999,
        originalPrice: 8999,
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600",
        category: "residential",
        technologies: ["uv", "uf"]
    },
    {
        id: 11,
        name: "Premium Alkaline+",
        tags: ["RO", "Alkaline", "Mineral"],
        rating: 4.8,
        reviews: 87,
        price: 24999,
        originalPrice: 32999,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600",
        category: "residential",
        technologies: ["ro", "alkaline"]
    },
    {
        id: 12,
        name: "Filter Cartridge Set",
        tags: ["Spares", "RO"],
        rating: 4.5,
        reviews: 345,
        price: 1499,
        originalPrice: 1999,
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600",
        category: "accessories",
        technologies: ["ro"]
    }
];

// ============================================================================
// Data Fetcher
// ============================================================================

/**
 * Fetches collection products with filtering, sorting, and pagination
 * Uses React cache() for request deduplication
 */
export const getCollectionProducts = cache(async (
    filters: CollectionFilters
): Promise<CollectionResponse> => {

    // Helper for fallback/dev mode
    const getFallback = (): CollectionResponse => {
        let products = [...FALLBACK_PRODUCTS];

        // Apply search filter
        if (filters.search) {
            const lowerQuery = filters.search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }

        // Apply category filter
        if (filters.categories.length > 0) {
            products = products.filter(p =>
                filters.categories.includes(p.category)
            );
        }

        // Apply technology filter
        if (filters.technologies.length > 0) {
            products = products.filter(p =>
                p.technologies.some(t => filters.technologies.includes(t))
            );
        }

        // Apply rating filter
        if (filters.ratings.length > 0) {
            products = products.filter(p => {
                const minRating = Math.min(...filters.ratings.map(r => parseInt(r)));
                return (p.rating ?? 0) >= minRating;
            });
        }

        // Apply price range filter
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
            products = products.filter(p =>
                p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
            );
        }

        // Apply sorting
        switch (filters.sort) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                break;
            default:
                // 'newest' - sort by isNew flag, then by id desc
                products.sort((a, b) => {
                    if (a.isNew && !b.isNew) return -1;
                    if (!a.isNew && b.isNew) return 1;
                    return Number(b.id) - Number(a.id);
                });
                break;
        }

        // Pagination
        const total = products.length;
        const totalPages = Math.ceil(total / filters.limit);
        const start = (filters.page - 1) * filters.limit;
        const paginatedProducts = products.slice(start, start + filters.limit);

        return {
            products: paginatedProducts,
            total,
            totalPages,
            currentPage: filters.page
        };
    };

    // Check if API is configured
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.warn('API URL not configured, using fallback data');
        return getFallback();
    }

    try {
        // Use new API client
        const data = await getAllProducts({
            page: filters.page,
            limit: filters.limit,
            // Categories/Tech/Ratings need to be joined if service expects strings, 
            // but ProductService accepts Record<string, string|number>.
            // Check ProductService implementation: it does Object.entries.
            // If backend expects comma-separated, we join them.
            categories: filters.categories.join(','),
            technologies: filters.technologies.join(','),
            ratings: filters.ratings.join(','),
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            sort: filters.sort?.replace('-', '_') as 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular' | undefined,
            search: filters.search || '',
        });

        // Transform backend products to CollectionProduct format
        // Backend returns: selling_price (string), product_title, primary_image_url, etc.
        // Frontend expects: price (number), name, image, etc.
        const products: CollectionProduct[] = (data.products || []).map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.product_title || p.name || 'Unknown Product',
            price: parseFloat(p.selling_price) || parseFloat(p.price) || 0,
            originalPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : (p.originalPrice ? parseFloat(p.originalPrice) : null),
            image: p.primary_image_url || p.image || '/assets/placeholder.png',
            images: p.additional_images || p.images || [],
            rating: parseFloat(p.rating) || 0,
            reviews: p.review_count || p.reviews || 0,
            tags: p.category_tier_1 ? [p.category_tier_1] : (p.tags || []),
            category: p.category_tier_1 || p.category || 'residential',
            technologies: p.technologies || [],
            inStock: p.inStock !== false && (p.total_stock === undefined || p.total_stock > 0),
            total_stock: p.total_stock,
            isNew: p.isNew || false,
        }));

        return {
            products,
            total: data.total,
            totalPages: Math.ceil(data.total / filters.limit),
            currentPage: filters.page
        };
    } catch (error) {
        console.error('Error fetching collection products:', error);
        return getFallback();
    }
});
