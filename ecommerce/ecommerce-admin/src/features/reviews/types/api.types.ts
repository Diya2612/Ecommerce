import type { ReviewStatus } from './domain.types';
import type { ApiResponse, PaginationParams } from '@/types/api';

export interface BackendReview {
    id: string;
    product_id: string;
    product_name: string | null;
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    rating: number;
    title: string | null;
    comment: string | null;
    media_urls: string[] | null;
    is_verified_purchase: boolean;
    status: ReviewStatus;
    admin_reply: string | null;
    helpful_votes: number;
    created_at: string;
}

export interface ReviewQueryParams extends PaginationParams {
    status?: string;
    product_id?: string;
    rating?: number;
    is_verified?: boolean;
    from_date?: string;
    to_date?: string;
    sortBy?: string;      // Expected to match field name visually, map to proper column locally if needed
    sortOrder?: 'asc' | 'desc';
}

export interface ReviewListResponse extends ApiResponse<{
    reviews: BackendReview[];
    summary: {
        pending: number;
        approved: number;
        rejected: number;
    };
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}> {}
