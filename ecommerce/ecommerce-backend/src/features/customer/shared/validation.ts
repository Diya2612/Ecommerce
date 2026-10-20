import { z } from 'zod';
import { shortTextSchema, emailSchema, uuidSchema } from '../../../utils';
// Enums removed per user request
import { customerAccountStatusEnum } from '../shared/customer-profiles.schema';

// ============================================
// CREATE CUSTOMER SCHEMA
// ============================================

export const createCustomerSchema = z.object({
  // Required User Fields
  first_name: shortTextSchema,
  middle_name: shortTextSchema.optional(),
  last_name: shortTextSchema,
  email: emailSchema,
  phone_number: z.string().optional(),
  secondary_email: z.string().email().optional(),
  secondary_phone_number: z.string().optional(),
  // DEPRECATED: user_type removed - create appropriate profile instead
  tags: z.array(z.string()).optional(),
  profile_image_url: z.string().optional(),

  // Optional User Fields
  display_name: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  preferred_language: z.string().optional(),
  languages: z.array(z.string()).optional(),

  // Customer (Individual) Profile Fields
  segments: z.array(z.enum(['new', 'regular', 'vip', 'at_risk'])).optional(),
  notes: z.string().optional(),

  // Business (B2B) Profile Fields - Removed
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;

// ============================================
// UPDATE CUSTOMER SCHEMA
// ============================================

export const updateCustomerSchema = z.object({
  // User Fields
  first_name: shortTextSchema.optional(),
  middle_name: shortTextSchema.optional().nullable(),
  last_name: shortTextSchema.optional(),
  email: emailSchema.optional(),
  email_type: z.string().optional(),
  phone_number: z.string().optional(),
  phone_type: z.string().optional(),
  secondary_email: z.string().email().optional().nullable(),
  secondary_email_type: z.string().optional(),
  secondary_phone_number: z.string().optional().nullable(),
  secondary_phone_type: z.string().optional(),
  // Verification status fields for primary/secondary swap
  email_verified: z.boolean().optional(),
  secondary_email_verified: z.boolean().optional(),
  // DEPRECATED: user_type removed - use profile tables
  tags: z.array(z.string()).optional(),
  display_name: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  preferred_language: z.string().optional(),
  languages: z.array(z.string()).optional(),
  profile_image_url: z.string().optional().nullable(),

  // Customer (Individual) Profile Fields
  segments: z.array(z.enum(['new', 'regular', 'vip', 'at_risk'])).optional(),
  notes: z.string().optional(), // Shared with Business profile conceptually, but stored in respective table
  account_status: z.enum(customerAccountStatusEnum.enumValues).optional(),
  store_credit_balance: z.number().or(z.string()).optional(),

  // Business (B2B) Profile Fields - Removed

  // Marketing Preferences
  marketing_opt_in: z.boolean().optional(),
  sms_opt_in: z.boolean().optional(),
  email_opt_in: z.boolean().optional(),
  whatsapp_opt_in: z.boolean().optional(),

  // Risk & Loyalty & Subscription (New Fields)
  risk_profile: z.string().optional(),
  loyalty_enrolled: z.boolean().optional(),
  loyalty_tier: z.string().optional(),
  loyalty_points: z.number().or(z.string()).optional(),
  loyalty_enrollment_date: z.string().optional(),
  subscription_plan: z.string().optional(),
  subscription_status: z.string().optional(),
  billing_cycle: z.string().optional(),
  subscription_start_date: z.string().optional(),
  auto_renew: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

// ============================================
// BULK DELETE SCHEMA
// ============================================

export const bulkDeleteSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
});

export type BulkDeleteDto = z.infer<typeof bulkDeleteSchema>;



// ============================================
// CUSTOMER ACTIVITY & PARAM SCHEMAS
// ============================================

export const customerIdParamsSchema = z.object({
  id: uuidSchema,
});

export const customerActivityQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  category: z
    .enum(['all', 'order', 'payment', 'account', 'cart', 'wishlist'])
    .optional()
    .default('all'),
});

export type CustomerActivityQueryDto = z.infer<typeof customerActivityQuerySchema>;

// ============================================
// GET ALL CUSTOMERS QUERY SCHEMA
// ============================================

export const getAllCustomersQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  tags: z.string().optional(),
  ordersStatus: z.string().optional(),
  sort: z.string().optional().default('newest'),
  type: z.enum(['all', 'individual', 'none']).optional().default('all'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
