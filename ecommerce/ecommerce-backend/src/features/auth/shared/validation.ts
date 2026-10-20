/** Auth Module Validations */
import { z } from 'zod';
import {
  shortTextSchema,
  emailSchema,
  optionalPhoneSchema,
  longTextSchema,
} from '../../../utils/validation/common-schemas';

export const refreshTokenSchema = z.object({
  refreshToken: shortTextSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  access_token: longTextSchema,
  new_password: shortTextSchema,
});

export const syncUserSchema = z.object({
  name: shortTextSchema.optional(),
  first_name: shortTextSchema.optional(),
  last_name: shortTextSchema.optional(),
  phone_number: optionalPhoneSchema,
});
