import type { ReviewStatus } from './domain.types';

export interface ReviewModerateFormData {
    status?: ReviewStatus;
    adminReply?: string | null;
}
