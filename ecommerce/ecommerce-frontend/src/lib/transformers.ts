
import { ProductReview } from '@/types/product';
import { Product } from '@/types/home';

export const transformBackendReview = (review: any): ProductReview => {
    return {
        id: review.id,
        author: review.user_name || review.author,
        avatar: review.user_avatar || review.avatar,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(),
        timestamp: review.created_at,
        verified: review.is_verified || false,
        content: review.comment || review.content,
        helpful: review.helpful_count || 0,
        images: review.images || []
    };
};

export const transformSimplifiedProduct = (product: any): Product => {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        tags: product.tags || [],
        rating: product.rating || 0,
        reviews: product.review_count || 0,
        price: product.price,
        originalPrice: product.original_price,
        image: product.image_url || product.image,
        category: product.category,
        isNew: product.is_new
    };
};
