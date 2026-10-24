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
export const createAddressBodySchema = z.preprocess((val: any) => {
  if (val && typeof val === 'object') {
    const rawType = (val.address_type || val.type || 'home').toLowerCase();
    const type = ['home', 'office', 'other'].includes(rawType) ? rawType : 'home';
    const isDefault = val.isDefaultShipping ?? val.isDefaultBilling ?? val.isDefault ?? false;
    return {
      ...val,
      address_type: type,
      address_name: val.address_name || (type === 'other' ? 'Other' : ''),
      name: val.name || val.recipient_name,
      phone: val.phone || val.phone_number,
      addressLine1: val.addressLine1 || val.address_line1,
      addressLine2: val.addressLine2 || val.address_line2 || '',
      city: val.city,
      state: val.state || val.state_province,
      pincode: val.pincode || val.postal_code,
      country: val.country || 'India',
      isDefaultShipping: isDefault,
      isDefaultBilling: isDefault,
    };
  }
  return val;
}, z
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
);

export const updateAddressBodySchema = z.preprocess((val: any) => {
  if (val && typeof val === 'object') {
    const rawType = val.address_type || val.type ? (val.address_type || val.type).toLowerCase() : undefined;
    const type = rawType && ['home', 'office', 'other'].includes(rawType) ? rawType : undefined;
    const isDefault = val.isDefaultShipping ?? val.isDefaultBilling ?? val.isDefault;
    return {
      ...val,
      ...(type && { address_type: type, address_name: val.address_name || (type === 'other' ? 'Other' : '') }),
      ...(val.name || val.recipient_name ? { name: val.name || val.recipient_name } : {}),
      ...(val.phone || val.phone_number ? { phone: val.phone || val.phone_number } : {}),
      ...(val.addressLine1 || val.address_line1 ? { addressLine1: val.addressLine1 || val.address_line1 } : {}),
      ...(val.addressLine2 !== undefined || val.address_line2 !== undefined ? { addressLine2: val.addressLine2 || val.address_line2 || '' } : {}),
      ...(val.state || val.state_province ? { state: val.state || val.state_province } : {}),
      ...(val.pincode || val.postal_code ? { pincode: val.pincode || val.postal_code } : {}),
      ...(isDefault !== undefined ? { isDefaultShipping: isDefault, isDefaultBilling: isDefault } : {}),
    };
  }
  return val;
}, z
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
