import { z } from 'zod';
import { uuidSchema, shortTextSchema } from '../../../utils';

// Params
const userIdParam = z.union([uuidSchema, z.literal('me')]);

export const createAddressParamsSchema = z.object({
  userId: userIdParam,
});

export const updateAddressParamsSchema = z.object({
  userId: userIdParam,
  id: uuidSchema,
});

export const deleteAddressParamsSchema = z.object({
  userId: userIdParam,
  id: uuidSchema,
});

export const getAddressesParamsSchema = z.object({
  userId: userIdParam,
});

export const setDefaultAddressParamsSchema = z.object({
  userId: userIdParam,
  id: uuidSchema,
});

// Body
export const createAddressBodySchema = z
  .object({
    address_type: z.enum(['home', 'office', 'other']).default('home'),
    address_name: z.string().max(255).optional().or(z.literal('')),
    name: shortTextSchema,
    phone: shortTextSchema,
    addressLine1: shortTextSchema,
    addressLine2: z.string().max(255).optional().or(z.literal('')),
    city: shortTextSchema,
    state: shortTextSchema,
    pincode: shortTextSchema,
    country: z.string().max(255).optional().or(z.literal('')),
    isDefaultShipping: z.boolean().optional(),
    isDefaultBilling: z.boolean().optional(),
    deliveryInstructions: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.address_type === 'other' && !data.address_name) return false;
      return true;
    },
    {
      message: "address_name is required when address_type is 'other'",
      path: ['address_name'],
    },
  );

export const updateAddressBodySchema = z
  .object({
    address_type: z.enum(['home', 'office', 'other']).optional(),
    address_name: z.string().max(255).optional().or(z.literal('')),
    name: shortTextSchema.optional(),
    phone: shortTextSchema.optional(),
    addressLine1: shortTextSchema.optional(),
    addressLine2: z.string().max(255).optional().or(z.literal('')),
    city: shortTextSchema.optional(),
    state: shortTextSchema.optional(),
    pincode: shortTextSchema.optional(),
    country: z.string().max(255).optional().or(z.literal('')),
    isDefaultShipping: z.boolean().optional(),
    isDefaultBilling: z.boolean().optional(),
    deliveryInstructions: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.address_type === 'other' && !data.address_name) return false;
      return true;
    },
    {
      message: "address_name is required if updating address_type to 'other'",
      path: ['address_name'],
    },
  );

// Query
export const setDefaultAddressQuerySchema = z.object({
  type: z.enum(['shipping', 'billing', 'both']).default('both'),
});

// Types
export type CreateAddressParams = z.infer<typeof createAddressParamsSchema>;
export type UpdateAddressParams = z.infer<typeof updateAddressParamsSchema>;
export type DeleteAddressParams = z.infer<typeof deleteAddressParamsSchema>;
export type GetAddressesParams = z.infer<typeof getAddressesParamsSchema>;
export type SetDefaultAddressParams = z.infer<typeof setDefaultAddressParamsSchema>;
export type CreateAddressBody = z.infer<typeof createAddressBodySchema>;
export type UpdateAddressBody = z.infer<typeof updateAddressBodySchema>;
export type SetDefaultAddressQuery = z.infer<typeof setDefaultAddressQuerySchema>;
