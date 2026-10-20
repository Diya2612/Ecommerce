/**
 * User Interfaces
 * TypeScript types for user-related data.
 */

import { User } from './user.schema';
import { omitFields } from '../../../utils';

export type IUser = User;

/**
 * Sanitized user type without sensitive fields.
 */
export type SanitizedUser = Omit<IUser, 'password'> & { hasPassword: boolean };

/**
 * Remove sensitive fields from a user object.
 */
export const sanitizeUser = (user: IUser): SanitizedUser => {
  const sanitized = omitFields(user, ['password']);
  return {
    ...sanitized,
    hasPassword: !!user.password,
  };
};

/**
 * Remove sensitive fields from an array of user objects.
 */
export const sanitizeUsers = (users: IUser[]): SanitizedUser[] => {
  return users.map(sanitizeUser);
};
