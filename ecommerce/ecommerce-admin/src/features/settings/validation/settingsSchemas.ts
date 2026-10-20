import { z } from 'zod';

/**
 * Role validation schema
 */
export const roleValidationSchema = z.object({
  name: z
    .string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Role name must contain only letters'),
  type: z
    .string()
    .min(1, 'Role type is required')
    .refine((val) => ['admin', 'manager', 'staff'].includes(val), 'Invalid role type'),
  permissions: z
    .string()
    .min(1, 'At least one permission is required'),
});

/**
 * Store settings validation schema
 */
export const storeSettingsValidationSchema = z.object({
  storeName: z
    .string()
    .min(3, 'Store name must be at least 3 characters')
    .max(100, 'Store name must be less than 100 characters'),
  storeEmail: z
    .string()
    .email('Invalid email address')
    .min(1, 'Store email is required'),
  storePhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  storeAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase'),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
});

/**
 * Payment settings validation schema
 */
export const paymentSettingsValidationSchema = z.object({
  stripePublishableKey: z
    .string()
    .min(1, 'Stripe publishable key is required')
    .startsWith('pk_', 'Invalid Stripe publishable key'),
  stripeSecretKey: z
    .string()
    .min(1, 'Stripe secret key is required')
    .startsWith('sk_', 'Invalid Stripe secret key'),
  paypalClientId: z
    .string()
    .min(1, 'PayPal client ID is required')
    .optional(),
  paypalClientSecret: z
    .string()
    .min(1, 'PayPal client secret is required')
    .optional(),
  paymentGateway: z
    .string()
    .refine((val) => ['stripe', 'paypal', 'both'].includes(val), 'Invalid payment gateway'),
  testMode: z.boolean().optional(),
  supportedCurrencies: z
    .array(z.string().length(3, 'Currency must be 3 characters'))
    .min(1, 'At least one currency is required'),
});

/**
 * Shipping settings validation schema
 */
export const shippingSettingsValidationSchema = z.object({
  defaultShippingMethod: z
    .string()
    .min(1, 'Default shipping method is required'),
  freeShippingThreshold: z
    .number()
    .min(0, 'Free shipping threshold must be non-negative')
    .optional(),
  handlingFee: z
    .number()
    .min(0, 'Handling fee must be non-negative')
    .optional(),
  shippingZones: z.array(
    z.object({
      name: z.string().min(1, 'Zone name is required'),
      countries: z.array(z.string()).min(1, 'At least one country required'),
      methods: z.array(
        z.object({
          name: z.string().min(1, 'Method name is required'),
          rate: z.number().min(0, 'Rate must be non-negative'),
        })
      ),
    })
  ).optional(),
  weightUnit: z
    .string()
    .refine((val) => ['kg', 'lb', 'g', 'oz'].includes(val), 'Invalid weight unit'),
  dimensionUnit: z
    .string()
    .refine((val) => ['cm', 'in', 'm', 'ft'].includes(val), 'Invalid dimension unit'),
});

// Export types
export type RoleFormData = z.infer<typeof roleValidationSchema>;
export type StoreSettingsFormData = z.infer<typeof storeSettingsValidationSchema>;
export type PaymentSettingsFormData = z.infer<typeof paymentSettingsValidationSchema>;
export type ShippingSettingsFormData = z.infer<typeof shippingSettingsValidationSchema>;