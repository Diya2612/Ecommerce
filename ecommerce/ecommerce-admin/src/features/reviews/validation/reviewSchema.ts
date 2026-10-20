import { z } from 'zod';

export const moderateReviewSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    adminReply: z.string().max(1000, 'Reply cannot exceed 1000 characters').optional().nullable(),
});

export type ModerateReviewFormData = z.infer<typeof moderateReviewSchema>;
