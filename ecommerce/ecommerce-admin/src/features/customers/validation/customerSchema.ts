import { z } from "zod";

/**
 * Customer validation schema using Zod
 * This ensures type safety and runtime validation for customer forms
 */

// Basic contact info schema - Exported to avoid unused variable warning and allow reuse
export const contactInfoSchema = z.object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
    alternatePhone: z.string().optional().or(z.literal("")),
});

// Address schema
export const addressSchema = z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^\d+$/, "Pincode must contain only numbers").optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    location: z.string().optional(),
    landmark: z.string().optional(),
});

// Main customer schema
export const customerSchema = z.object({
    // Basic Information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    // Additional fields
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    companyName: z.string().optional().or(z.literal("")),

    // Contact Information
    profileImage: z.any().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    alternatePhone: z.string().optional().or(z.literal("")),

    // Customer Type & Status
    customerType: z.enum(["Distributor", "Retail", "Wholesale"]),
    status: z.enum(["Active", "Inactive"]).default("Active"),

    // Business Details
    gstNumber: z.string().optional().or(z.literal("")),
    panNumber: z.string().optional().or(z.literal("")),

    // Address
    billingAddress: addressSchema.optional(),
    shippingAddress: addressSchema.optional(),
    sameAsShipping: z.boolean().default(false),

    // Financial
    creditLimit: z.number().min(0).optional(),
    paymentTerms: z.string().optional().or(z.literal("")),

    // Metadata
    notes: z.string().optional().or(z.literal("")),
    tags: z.array(z.string()).optional(),
});

// Type inference from schema
export type CustomerSchemaType = z.infer<typeof customerSchema>;

// Partial schema for updates
export const partialCustomerSchema = customerSchema.partial();

// Validation helper functions
export const validateCustomer = (data: unknown) => {
    return customerSchema.safeParse(data);
};

export const validatePartialCustomer = (data: unknown) => {
    return partialCustomerSchema.safeParse(data);
};
