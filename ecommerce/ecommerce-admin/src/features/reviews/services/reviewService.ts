import { logger } from '@/lib/utils/logger';
import type {
    ReviewQueryParams,
    ReviewModerateFormData,
    Review,
    ReviewList,
    ReviewSummary,
} from '../types';

const MOCK_REVIEWS: Review[] = [
    {
        id: 'rev_1',
        productId: 'prod_1',
        productName: 'Premium Leather Wallet',
        userId: 'usr_1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        rating: 5,
        title: 'Excellent Quality!',
        comment: 'The leather feels amazing and it holds all my cards perfectly.',
        mediaUrls: [],
        isVerifiedPurchase: true,
        status: 'pending',
        adminReply: null,
        helpfulVotes: 12,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'rev_2',
        productId: 'prod_2',
        productName: 'Wireless Noise-Canceling Headphones',
        userId: 'usr_2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        rating: 4,
        title: 'Good, but could be louder',
        comment: 'Noise cancellation is top tier, but max volume is a bit low.',
        mediaUrls: ['https://placehold.co/400'],
        isVerifiedPurchase: true,
        status: 'approved',
        adminReply: 'Thanks for the feedback Jane! We will pass this to our product team.',
        helpfulVotes: 5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'rev_3',
        productId: 'prod_3',
        productName: 'Smart Fitness Watch',
        userId: 'usr_3',
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        rating: 2,
        title: 'Battery life is terrible',
        comment: 'I have to charge it twice a day. Very disappointed.',
        mediaUrls: [],
        isVerifiedPurchase: false,
        status: 'rejected',
        adminReply: null,
        helpfulVotes: 2,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    }
];

export const reviewService = {
    /**
     * Get list of reviews with optional filtering and pagination
     */
    getReviews: async (params: ReviewQueryParams): Promise<{ list: ReviewList, summary: ReviewSummary }> => {
        logger.debug('[ReviewService] Fetching MOCK reviews with params', params);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let filteredReviews = [...MOCK_REVIEWS];

        if (params.status) {
            filteredReviews = filteredReviews.filter(r => params.status === r.status);
        }

        if (params.rating) {
            filteredReviews = filteredReviews.filter(r => params.rating === r.rating);
        }

        if ((params as any).search) {
             const searchLower = (params as any).search.toLowerCase();
             filteredReviews = filteredReviews.filter(r => 
                 r.title?.toLowerCase().includes(searchLower) || 
                 r.productName?.toLowerCase().includes(searchLower)
             );
        }

        const page = params.page || 1;
        const limit = params.limit || 10;
        const total = filteredReviews.length;
        const startIndex = (page - 1) * limit;
        
        const paginatedReviews = filteredReviews.slice(startIndex, startIndex + limit);

        const summary: ReviewSummary = {
            pending: MOCK_REVIEWS.filter(r => r.status === 'pending').length,
            approved: MOCK_REVIEWS.filter(r => r.status === 'approved').length,
            rejected: MOCK_REVIEWS.filter(r => r.status === 'rejected').length,
        };

        return {
            list: {
                reviews: paginatedReviews,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            summary,
        };
    },

    /**
     * Moderate a review (approve/reject/reply)
     */
    moderateReview: async (id: string, data: ReviewModerateFormData): Promise<Review> => {
        logger.debug('[ReviewService] Moderating MOCK review', { id, data });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const reviewIndex = MOCK_REVIEWS.findIndex(r => r.id === id);
        if (reviewIndex === -1) {
             throw new Error("Review not found");
        }

        // Update mock data so the UI reflects changes
        const updatedReview = {
             ...MOCK_REVIEWS[reviewIndex],
             ...(data.status ? { status: data.status } : {}),
             ...(data.adminReply !== undefined ? { adminReply: data.adminReply } : {})
        };
        
        MOCK_REVIEWS[reviewIndex] = updatedReview;

        return updatedReview;
    },

    /**
     * Delete a review (Mock)
     */
    deleteReview: async (id: string): Promise<void> => {
        logger.debug('[ReviewService] Deleting MOCK review', { id });
        await new Promise(resolve => setTimeout(resolve, 500));

        const reviewIndex = MOCK_REVIEWS.findIndex(r => r.id === id);
        if (reviewIndex > -1) {
            MOCK_REVIEWS.splice(reviewIndex, 1);
        }
    },
};
