// ============================================================================
// Form Validation Schemas (Zod + React Hook Form)
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Base Validators
// ============================================================================

/**
 * Phone number validator - Indian format (accepts with or without +91)
 */
export const phoneSchema = z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => {
        const cleaned = val.replace(/[\s\-\+]/g, '').replace(/^91/, '');
        return /^[6-9]\d{9}$/.test(cleaned);
    }, 'Please enter a valid 10-digit phone number');

/**
 * Email validator
 */
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address');

/**
 * PIN code validator - 6 digits
 */
export const pincodeSchema = z
    .string()
    .min(1, 'PIN code is required')
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code');

/**
 * Name validator
 */
export const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters');

/**
 * Address validator
 */
export const addressSchema = z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Please enter a complete address')
    .max(500, 'Address is too long');

/**
 * City validator
 */
export const citySchema = z
    .string()
    .min(1, 'City is required')
    .min(2, 'City name is too short')
    .max(100, 'City name is too long');

/**
 * Password validator
 */
export const passwordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Message/textarea validator
 */
export const messageSchema = z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long');

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Shipping Address Form Schema
 */
export const shippingAddressSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    addressLine1: addressSchema,
    addressLine2: z.string().optional(),
    city: citySchema,
    state: z.string().min(1, 'State is required'),
    pincode: pincodeSchema,
    country: z.string().default('India'),
    type: z.enum(['Home', 'Office', 'Other']).default('Home'),
    isDefault: z.boolean().default(false),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: z.string().optional().or(phoneSchema),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
    message: messageSchema,
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Profile Update Form Schema
 */
export const profileFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    dob: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

/**
 * Login Form Schema
 */
export const loginFormSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Register Form Schema
 */
export const registerFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

/**
 * Service Booking Form Schema
 */
export const serviceBookingSchema = z.object({
    serviceType: z.enum(['installation', 'amc', 'repair', 'filter']),
    date: z.string().min(1, 'Please select a date'),
    timeSlot: z.string().min(1, 'Please select a time slot'),
    name: nameSchema,
    phone: phoneSchema,
    address: addressSchema,
    notes: z.string().max(500, 'Notes too long').optional(),
});

export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>;

/**
 * Payment Form Schema
 */
export const paymentFormSchema = z.object({
    cardNumber: z.string()
        .min(1, 'Card number is required')
        .regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
    cardName: z.string().min(1, 'Cardholder name is required'),
    expiryDate: z.string()
        .min(1, 'Expiry date is required')
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter a valid expiry date (MM/YY)'),
    cvv: z.string()
        .min(1, 'CVV is required')
        .regex(/^\d{3,4}$/, 'Please enter a valid CVV'),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats phone number to Indian format
 */
export const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return `+91 ${cleaned.slice(-10, -5)} ${cleaned.slice(-5)}`;
};

/**
 * Formats PIN code
 */
export const formatPincode = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 6);
};

/**
 * Formats card number with spaces
 */
export const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
};

/**
 * Formats expiry date
 */
export const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
};

// ============================================================================
// Exports
// ============================================================================

export const schemas = {
    phone: phoneSchema,
    email: emailSchema,
    pincode: pincodeSchema,
    name: nameSchema,
    address: addressSchema,
    city: citySchema,
    password: passwordSchema,
    message: messageSchema,
    shippingAddress: shippingAddressSchema,
    contact: contactFormSchema,
    profile: profileFormSchema,
    login: loginFormSchema,
    register: registerFormSchema,
    serviceBooking: serviceBookingSchema,
    payment: paymentFormSchema,
};

export default schemas;
