/**
 * FAQ Validation Schemas
 * Zod definitions for incoming request payloads.
 */

import { z } from 'zod';

/** Schema for creating a new FAQ. */
export const createFaqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  answer: z.string().min(1, 'Answer is required'),
  section: z.enum([
    'general',
    'account',
    'orders',
    'payments',
    'shipping',
    'returns',
    'products',
    'policies',
  ]),
  position: z.number().int().min(0).optional().default(0),
  status: z.boolean().optional().default(true),
});

/** Schema for updating an existing FAQ. */
export const updateFaqSchema = createFaqSchema.partial();

/** Query parameters for filtering and searching FAQs. */
export const faqFiltersSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  section: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),
});
export const faqQuerySchema = faqFiltersSchema;

/** FAQ import request payload. */
export const importFaqSchema = z.object({
  mode: z.enum(['create', 'update', 'upsert']).default('upsert'),
  data: z.array(
    z.object({
      id: z.string().uuid().optional(),
      question: z.string().min(1),
      answer: z.string().min(1),
      section: z.string().optional().default('general'),
      position: z.number().int().optional().default(0),
      status: z.boolean().optional().default(true),
    }),
  ),
});
export const faqImportSchema = importFaqSchema;
export const faqImportRequestSchema = importFaqSchema;
export const faqExportSchema = faqFiltersSchema;
export const faqIdParamSchema = z.object({ id: z.string().uuid() });

export type CreateFaqDto = z.infer<typeof createFaqSchema>;
export type UpdateFaqDto = z.infer<typeof updateFaqSchema>;
export type FaqFiltersDto = z.infer<typeof faqFiltersSchema>;
export type ImportFaqDto = z.infer<typeof importFaqSchema>;
