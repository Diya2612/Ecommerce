export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
    id: string;
    productId: string;
    productName: string | null;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    rating: number;
    title: string | null;
    comment: string | null;
    mediaUrls: string[] | null;
    isVerifiedPurchase: boolean;
    status: ReviewStatus;
    adminReply: string | null;
    helpfulVotes: number;
    createdAt: string;
}

export interface ReviewList {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReviewSummary {
    pending: number;
    approved: number;
    rejected: number;
}
