import { z } from 'zod';

// Gift card validation schema
export const giftCardValidationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  value: z.number()
    .min(1, 'Value must be at least ₹1')
    .max(100000, 'Value cannot exceed ₹100,000'),

  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Invalid currency format'),

  recipient_email: z.string().email('Invalid email format').optional(),
  recipient_name: z.string().min(2).max(100).optional(),
  sender_name: z.string().min(2).max(100).optional(),
  sender_email: z.string().email('Invalid email format').optional(),

  message: z.string()
    .max(1000, 'Message must not exceed 1000 characters')
    .optional(),

  expires_at: z.date().nullable().optional(),
  send_email: z.boolean().optional(),
});

// Gift card redemption validation
export const giftCardRedemptionValidationSchema = z.object({
  code: z.string()
    .regex(/^[A-Z0-9-]+$/i, 'Invalid gift card code format'),

  amount: z.number()
    .min(1, 'Amount must be at least ₹1')
    .max(50000, 'Amount cannot exceed ₹50,000'),

  order_id: z.string().optional(),
});

// Bulk gift card creation validation
export const bulkGiftCardValidationSchema = z.object({
  count: z.number()
    .min(1, 'Must create at least 1 gift card')
    .max(1000, 'Cannot create more than 1000 gift cards at once'),

  value: z.number()
    .min(1, 'Value must be at least ₹1')
    .max(50000, 'Value cannot exceed ₹50,000'),

  prefix: z.string()
    .max(10, 'Prefix must not exceed 10 characters')
    .regex(/^[A-Z0-9]*$/i, 'Prefix can only contain letters and numbers')
    .optional(),

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  expires_at: z.date().nullable().optional(),
});

// Gift card balance check validation
export const giftCardBalanceValidationSchema = z.object({
  code: z.string()
    .regex(/^[A-Z0-9-]+$/i, 'Invalid gift card code format'),
});

// export type GiftCardFormData = z.infer<typeof giftCardValidationSchema>;