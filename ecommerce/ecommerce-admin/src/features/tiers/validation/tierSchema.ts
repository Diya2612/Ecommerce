import { z } from 'zod';

/**
 * Main Tier Validation Schema
 * Validates tier creation and updates
 */
export const tierValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, 'Tier name must be at least 2 characters')
    .max(100, 'Tier name must not exceed 100 characters')
    .trim(),

  code: z.string()
    .regex(/^[a-z0-9-]*$/, 'Code must contain only lowercase letters, numbers, and hyphens')
    .max(100, 'Code must not exceed 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),

  level: z.coerce.number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(4, 'Level must not exceed 4'),

  parentId: z.string().nullable().optional(),

  status: z.enum(['active', 'inactive']).default('active'),

  // Metadata fields
  usageCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TierSchemaData = z.infer<typeof tierValidationSchema>;
