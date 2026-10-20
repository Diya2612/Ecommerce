import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  payment_method: z.enum(['razorpay', 'cod']).default('razorpay'),
  save_payment_method: z.boolean().optional().default(false),
});

export const retryPaymentSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

export const initiateRefundSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  amount: z.number().positive().optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(200),
  refund_speed: z.enum(['normal', 'optimum']).optional().default('normal'),
});

export type CreatePaymentOrderDto = z.infer<typeof createPaymentOrderSchema>;
export type RetryPaymentDto = z.infer<typeof retryPaymentSchema>;
export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
export type InitiateRefundDto = z.infer<typeof initiateRefundSchema>;
