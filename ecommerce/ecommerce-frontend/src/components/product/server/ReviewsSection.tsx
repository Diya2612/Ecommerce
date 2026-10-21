import { getProductReviews } from '@/lib/data/product';
import { ReviewsClientWrapper } from '../client/ReviewsClientWrapper';
import type { ReviewsSectionProps } from '@/types/product';

/**
 * ReviewsSection - Server Component
 * 
 * Fetches reviews data on the server
 * Uses ReviewsClientWrapper for lazy loading (ssr: false)
 */
export async function ReviewsSection({ productId }: ReviewsSectionProps) {
    const reviewsData = await getProductReviews(productId);

    return (
        <section id="reviews" className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <ReviewsClientWrapper
                    initialReviews={reviewsData.reviews}
                    totalReviews={reviewsData.total}
                    productId={productId}
                    averageRating={reviewsData.averageRating}
                />
            </div>
        </section>
    );
}
