import { cache } from 'react';
import type { ProductDetail } from '@/types/product';
import { CACHE_TAGS, productTag } from '@/lib/cache/tags';

/**
 * Fallback product data for development/error cases
 */
const FALLBACK_PRODUCT: ProductDetail = {
    id: 1,
    name: "Anant Pure X1 Pro",
    subtitle: "Advanced RO + UV + UF Water Purifier",
    tags: ["RO", "UV", "UF"],
    rating: 4.8,
    reviews: 342,
    price: 12999,
    originalPrice: 18999,
    discount: 32,
    image: "https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=800",
    images: [
        "https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1549839731-9652aa56a8cb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1625093440280-42de742a496d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1662647344062-b0cdb1ed7227?auto=format&fit=crop&q=80&w=800"
    ],
    inStock: true,
    sku: "ANT-PX1-PRO-2024",
    category: "Residential Purifiers",
    categoryId: "residential",
    brand: "Anant",
    brandId: "anant",

    features: [
        { icon: 'Shield', title: '5 Year Warranty', description: 'Comprehensive coverage' },
        { icon: 'Truck', title: 'Free Installation', description: 'Expert setup included' },
        { icon: 'RefreshCw', title: '1 Year AMC Free', description: 'Maintenance covered' },
        { icon: 'Award', title: 'ISI Certified', description: 'Quality assured' }
    ],
    highlights: [
        "Multi-stage RO + UV + UF purification",
        "10 Litre storage capacity",
        "Advanced TDS controller",
        "Smart LED indicators",
        "Copper + Alkaline boost technology",
        "Energy efficient operation"
    ]
};

/**
 * Fetches a single product by ID
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getProductById = cache(async (id: string): Promise<ProductDetail> => {
    // Check if API is configured
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.warn(`Product ${id}: API URL not configured, using fallback`);
        return { ...FALLBACK_PRODUCT, id };
    }

    try {
        const { getProductById: fetchProduct } = await import('@/queries');
        const product = await fetchProduct(id);
        return {
            ...product,
            tags: product.tags || [], // Ensure array
            // Map other potentially missing fields if needed
            reviews: product.reviews || 0,
            rating: product.rating || 0,
        } as ProductDetail;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        // Return fallback data during development or when API is unavailable
        return { ...FALLBACK_PRODUCT, id };
    }
});
