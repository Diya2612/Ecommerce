import { cache } from 'react';
import type { ProductReview, ReviewsResponse } from '@/types/product';
import { CACHE_TAGS, reviewsTag } from '@/lib/cache/tags';

/**
 * Fallback reviews data for development/error cases
 */
const FALLBACK_REVIEWS: ProductReview[] = [
    {
        id: 1,
        author: "Rajesh Kumar",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        rating: 5,
        date: "2 weeks ago",
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        content: "Excellent water purifier! The water quality improved dramatically after installation. The taste is noticeably better and the TDS levels are perfect. Highly recommend for families.",
        helpful: 24,
        images: []
    },
    {
        id: 2,
        author: "Priya Sharma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        rating: 5,
        date: "1 month ago",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        content: "Very happy with this purchase. The installation team was professional and the purifier works flawlessly. The copper boost feature is a great addition for health benefits.",
        helpful: 18,
        images: ["/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png"]
    },
    {
        id: 3,
        author: "Amit Patel",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
        rating: 4,
        date: "1 month ago",
        timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        content: "Living in an area with high TDS, this purifier works like a charm. The TDS controller ensures minerals are retained. Installation team was professional and explained everything clearly.",
        helpful: 15,
        images: []
    },
    {
        id: 4,
        author: "Sneha Reddy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        rating: 5,
        date: "2 months ago",
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        content: "Best water purifier I've owned. The smart LED indicators make it easy to know when filters need replacement. Great value for money with the free AMC.",
        helpful: 22,
        images: []
    }
];

/**
 * Fetches product reviews with pagination
 * Server-side only - called in Server Components
 */
export const getProductReviews = cache(async (
    productId: string,
    page = 1,
    limit = 10
): Promise<ReviewsResponse> => {
    // Helper to create fallback response
    const createFallbackResponse = (): ReviewsResponse => {
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        FALLBACK_REVIEWS.forEach(r => {
            ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
        });
        const totalRating = FALLBACK_REVIEWS.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / FALLBACK_REVIEWS.length;
        return {
            reviews: FALLBACK_REVIEWS,
            total: FALLBACK_REVIEWS.length,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution
        };
    };

    // Check if API is configured
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.warn(`Reviews for ${productId}: API URL not configured, using fallback`);
        return createFallbackResponse();
    }

    try {
        const response = await fetch(
            `${apiUrl}/products/${productId}/reviews?page=${page}&limit=${limit}`,
            {
                next: {
                    revalidate: 1800,
                    tags: [CACHE_TAGS.PRODUCT_REVIEWS, reviewsTag(productId)],
                },
            }
        );

        if (!response.ok) {
            console.warn(`Reviews API returned ${response.status} for product ${productId}, using fallback`);
            return createFallbackResponse();
        }

        const apiResponse = await response.json();

        // Extract data from API response
        const data = apiResponse.data || apiResponse;

        // Transform reviews if they exist
        if (data.reviews && Array.isArray(data.reviews)) {
            const { transformBackendReview } = await import('@/lib/transformers');
            const transformedReviews = data.reviews.map(transformBackendReview);

            return {
                reviews: transformedReviews,
                total: data.total || transformedReviews.length,
                averageRating: data.averageRating || 0,
                ratingDistribution: data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        return createFallbackResponse();
    } catch (error) {
        console.error(`Error fetching reviews for ${productId}:`, error);
        return createFallbackResponse();
    }
});
