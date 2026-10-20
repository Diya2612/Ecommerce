/** Auth Feature Interfaces */
import { z } from 'zod';
import {
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  syncUserSchema,
} from './validation';

export interface SyncUserData {
  email: string;
  name?: string;
  phone_number?: string;
}

export interface AuthResponse {
  data: {
    user: any | null;
    session?: any | null;
  } | null;
  error: any | null;
}

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type RequestPasswordResetDto = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type SyncUserDto = z.infer<typeof syncUserSchema>;
