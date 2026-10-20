/**
 * User Validation
 * Zod schemas for user-related requests.
 */

import { z } from 'zod';
import { shortTextSchema, emailSchema, uuidSchema, phoneSchema } from '../../../utils';
import { customerSegmentEnum } from '../../customer/shared/customer-profiles.schema';

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Create Customer Schema
 */
export const createCustomerSchema = z.object({
  first_name: shortTextSchema,
  last_name: shortTextSchema,
  email: emailSchema,
  phone_number: z.string().optional(),
  secondary_email: z.string().email().optional(),
  secondary_phone_number: z.string().optional(),
  user_type: z.enum(['individual', 'business']).default('individual'),
  tags: z.array(z.string()).optional(),
  profile_image_url: z.string().optional(),
  display_name: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  preferred_language: z.string().optional(),
  languages: z.array(z.string()).optional(),
  segment: z.enum(customerSegmentEnum.enumValues).optional(),
  notes: z.string().optional(),
});

/**
 * Send OTP Schema
 */
export const sendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(['email_verification', 'password_reset']).default('email_verification'),
});

/**
 * Verify OTP Schema
 */
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['email_verification', 'password_reset']).default('email_verification'),
});

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  first_name: shortTextSchema.optional(),
  last_name: shortTextSchema.optional().or(z.literal('')),
  display_name: z.string().max(100).optional(),
  email: emailSchema.optional(),
  secondary_email: emailSchema.optional().or(z.literal('')),
  phone_number: phoneSchema.optional().or(z.literal('')),
  secondary_phone_number: phoneSchema.optional().or(z.literal('')),
  timezone: z.string().max(100).optional(),
  preferred_language: z.string().max(50).optional(),
  preferred_currency: z.string().max(50).optional(),
  user_type: z.enum(['individual', 'business']).optional(),
  date_of_birth: z.string().datetime().or(z.string()).optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  profile_image_url: z.string().url().optional(),
});

/**
 * ID Params Schema
 */
export const userIdParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
