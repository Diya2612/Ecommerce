import { cache } from 'react';
import type { ProductDetail } from '@/types/product';
import { CACHE_TAGS } from '@/lib/cache/tags';

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
 * Fetches product details by slug
 * Server-side only
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail> => {
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        console.warn(`Product slug ${slug}: API URL not configured, using fallback`);
        return { ...FALLBACK_PRODUCT, sku: slug };
    }

    try {
        const response = await fetch(`${apiUrl}/products/slug/${slug}`, {
            next: {
                revalidate: 3600,
                tags: [CACHE_TAGS.PRODUCT_DETAILS, `product-${slug}`]
            }
        });

        if (!response.ok) {
            console.warn(`Failed to fetch product by slug ${slug}: ${response.status}`);
            if (response.status === 404) {
                // In a real app we might want to redirect or throw 404
                // For now returning fallback to prevent crash if that's desired behavior, 
                // or throw error to let Next.js handle 404 page.
                // The user requests "remove mock data i want data from backend".
                // So I should throw if not found.
                throw new Error(`Product not found: ${slug}`);
            }
            throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse;

        // Debug: Log what backend actually sends


        // Transform backend response to ProductDetail
        const result: ProductDetail = {
            id: data.id,
            name: data.product_title,
            subtitle: data.secondary_title || data.short_description,
            description: data.full_description || data.short_description,
            tags: data.tags || [],
            rating: Number(data.rating) || 0,
            reviews: Number(data.review_count) || 0,
            price: Number(data.selling_price),
            originalPrice: data.compare_at_price ? Number(data.compare_at_price) : undefined,
            discount: data.discount,
            image: data.primary_image_url || FALLBACK_PRODUCT.image,
            images: data.images && data.images.length > 0 ? data.images : [data.primary_image_url || FALLBACK_PRODUCT.image],
            // Fix: Prioritize inStock from backend, with proper fallback
            inStock: data.inStock !== undefined ? Boolean(data.inStock) : (data.total_stock !== undefined && data.total_stock !== null ? Number(data.total_stock) > 0 : true),
            total_stock: data.total_stock !== undefined && data.total_stock !== null ? Number(data.total_stock) : undefined,
            sku: data.sku,
            category: data.category_tier_1 || "Residential",
            categoryId: (data.category_tier_1 || "").toLowerCase().replace(/\s+/g, '-'),
            brand: "Anant Enterprises", // Hardcoded or from backend if available
            brandId: "anant",

            // Map features if backend provides them, else use default or empty
            features: data.features || FALLBACK_PRODUCT.features,

            // Map colors if backend provides them
            colors: data.colors || [],

            highlights: data.highlights || [data.short_description].filter(Boolean),

            // Map product variants
            has_variants: Boolean(data.has_variants),
            variants: data.variants && Array.isArray(data.variants) ? data.variants.map((v: any) => ({
                id: v.id,
                product_id: v.product_id,
                option_name: v.option_name,
                option_value: v.option_value,
                sku: v.sku,
                barcode: v.barcode || null,
                cost_price: v.cost_price,
                selling_price: v.selling_price,
                compare_at_price: v.compare_at_price || null,
                image_url: v.image_url || null,
                thumbnail_url: v.thumbnail_url || null,
                is_default: Boolean(v.is_default),
                is_active: Boolean(v.is_active),
                inventory_quantity: v.inventory_quantity !== undefined ? Number(v.inventory_quantity) : undefined,
            })) : [],
        };



        return result;

    } catch (error) {
        console.error(`Error fetching product by slug ${slug}:`, error);
        // Throwing error allows page.tsx to catch it or Next.js to show error page.
        // User explicitly asked for backend data, so we shouldn't silently show fallback if it fails definitively.
        throw error;
    }
});
