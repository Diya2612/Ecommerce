/**
 * Admin Validation Schemas
 * Zod schemas for admin-related API request validation.
 */

import { z } from 'zod';
import { shortTextSchema, emailSchema, uuidSchema, optionalPhoneSchema } from '../../../utils';

// Filter/Query Schema
export const adminQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  is_active: z.enum(['true', 'false', 'all']).optional(),
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
  limit: z.preprocess((val) => Number(val) || 10, z.number().min(1).max(100)),
  sort_by: z.enum(['created_at', 'name', 'department']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Params Schema
export const adminParamsSchema = z.object({
  id: uuidSchema,
});

// Create Admin Schema
export const createAdminSchema = z.object({
  // Required User Fields
  first_name: shortTextSchema,
  middle_name: shortTextSchema.optional(),
  last_name: shortTextSchema,
  email: emailSchema,
  phone_number: optionalPhoneSchema,
  secondary_email: z.string().email().optional(),
  secondary_phone_number: optionalPhoneSchema,
  tags: z.array(z.string()).optional(),
  profile_image_url: z.string().optional(),

  // Optional User Fields
  display_name: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  preferred_language: z.string().optional(),
  languages: z.array(z.string()).optional(),

  // Admin Profile Fields
  employee_number: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  is_active: z.boolean().default(true),
});

// Update Admin Schema
export const updateAdminSchema = z.object({
  // User Fields
  first_name: shortTextSchema.optional(),
  middle_name: shortTextSchema.optional().nullable(),
  last_name: shortTextSchema.optional(),
  email: emailSchema.optional(),
  phone_number: optionalPhoneSchema.nullable(),
  secondary_email: z.string().email().optional().nullable(),
  secondary_phone_number: optionalPhoneSchema.nullable(),
  email_verified: z.boolean().optional(),
  secondary_email_verified: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  display_name: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  preferred_language: z.string().optional(),
  languages: z.array(z.string()).optional(),
  profile_image_url: z.string().optional().nullable(),

  // Admin Profile Fields
  employee_number: z.string().max(50).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional(),
});
