import type { Review } from './domain.types';

export interface ReviewDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    review: Review | null;
}

export interface CreateReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export interface EditReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    review: Review | null;
}
