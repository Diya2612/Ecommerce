
import {
  ICreateAdmin,
  IUpdateAdmin,
  IAdminFilters,
  IAdminUser,
} from '../shared/interface';

import { HttpException, logger } from '../../../utils';

import {
  baseFindAdminById,
  baseSoftDeleteAdminProfile,
  baseFindUserByEmail,
  baseFindAdminByEmployeeNumber,
  baseGetAllAdmins,
  baseFindEmailVerificationOtp,
  baseCreateAdminTransaction,
  baseUpdateAdminTransaction,
  baseCheckSuperAdminDeletionConstraints,
} from '../shared/queries';

/**
 * Get a single admin by ID with their profile.
 */
export const getAdminById = async (
  id: string,
): Promise<IAdminUser | undefined> => {
  return baseFindAdminById(id);
};

/**
 * Get all admins with filtering and pagination.
 */
export const getAllAdmins = async (filters: IAdminFilters) => {
  return await baseGetAllAdmins(filters);
};

/**
 * Create a new admin user and profile.
 */
export const createAdminAction = async (
  data: ICreateAdmin,
  operatorId: string,
) => {
  logger.info('Creating new admin', { email: data.email });

  // Check for existing user or employee number
  const existingUser = await baseFindUserByEmail(data.email);

  if (existingUser) {
    throw new HttpException(
      409,
      'A user with this email already exists',
    );
  }

  if (data.employee_number) {
    const existingEmployee = await baseFindAdminByEmployeeNumber(
      data.employee_number,
    );

    if (existingEmployee) {
      throw new HttpException(
        409,
        'An admin with this employee number already exists',
      );
    }
  }

  // Verify email verification status if available
  const verifiedOtp = await baseFindEmailVerificationOtp(data.email);

  const isEmailVerified = verifiedOtp?.verified_at != null;
  const emailVerifiedAt = verifiedOtp?.verified_at || null;

  let isSecondaryEmailVerified = false;

  if (data.secondary_email) {
    const secOtp = await baseFindEmailVerificationOtp(
      data.secondary_email,
    );

    isSecondaryEmailVerified = secOtp?.verified_at != null;
  }

  // Prepare user data
  const userData = {
    first_name: data.first_name,
    middle_name: data.middle_name || null,
    last_name: data.last_name,
    email: data.email.toLowerCase(),
    phone_number: data.phone_number || null,
    secondary_email: data.secondary_email?.toLowerCase() || null,
    secondary_phone_number: data.secondary_phone_number || null,
    secondary_email_verified: isSecondaryEmailVerified,
    display_name: data.display_name || null,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    tags: data.tags || [],
    profile_image_url: data.profile_image_url || null,
    preferred_language: data.preferred_language || 'en',
    languages: data.languages || [],
    email_verified: isEmailVerified,
    email_verified_at: emailVerifiedAt,
  } as any;

  // Prepare admin profile data
  const profileData = {
    employee_number: data.employee_number || null,
    department: data.department || null,
    job_title: data.job_title || null,
    is_active: data.is_active,
  };

  // Create user and admin profile in a transaction
  const result = await baseCreateAdminTransaction(
    userData,
    profileData,
  );

  return result;
};

/**
 * Update an existing admin's user data and profile.
 */
export const updateAdminAction = async (
  id: string,
  data: IUpdateAdmin,
  operatorId: string,
) => {
  logger.info(`Updating admin ${id}`);

  // Fetch existing admin
  const existing = await baseFindAdminById(id);

  if (!existing || !existing.profile) {
    throw new HttpException(404, 'Admin not found');
  }

  // Prepare user updates
  const userUpdates: Record<string, any> = {};

  if (data.first_name) userUpdates.first_name = data.first_name;
  if (data.middle_name !== undefined) {
    userUpdates.middle_name = data.middle_name;
  }
  if (data.last_name) userUpdates.last_name = data.last_name;
  if (data.email) userUpdates.email = data.email.toLowerCase();
  if (data.phone_number !== undefined) {
    userUpdates.phone_number = data.phone_number;
  }
  if (data.tags) userUpdates.tags = data.tags;
  if (data.display_name !== undefined) {
    userUpdates.display_name = data.display_name;
  }
  if (data.date_of_birth !== undefined) {
    userUpdates.date_of_birth = data.date_of_birth;
  }
  if (data.gender !== undefined) userUpdates.gender = data.gender;
  if (data.profile_image_url !== undefined) {
    userUpdates.profile_image_url = data.profile_image_url;
  }
  if (data.preferred_language !== undefined) {
    userUpdates.preferred_language = data.preferred_language;
  }
  if (data.languages !== undefined) {
    userUpdates.languages = data.languages;
  }
  if (data.secondary_email !== undefined) {
    userUpdates.secondary_email =
      data.secondary_email?.toLowerCase() || null;
  }
  if (data.secondary_phone_number !== undefined) {
    userUpdates.secondary_phone_number =
      data.secondary_phone_number;
  }

  if (data.email_verified !== undefined) {
    userUpdates.email_verified = data.email_verified;
    userUpdates.email_verified_at = data.email_verified
      ? new Date()
      : null;
  }

  if (data.secondary_email_verified !== undefined) {
    userUpdates.secondary_email_verified =
      data.secondary_email_verified;
  }

  userUpdates.updated_at = new Date();

  // Prepare profile updates
  const profileUpdates: Record<string, any> = {};

  if (data.employee_number !== undefined) {
    profileUpdates.employee_number = data.employee_number;
  }
  if (data.department !== undefined) {
    profileUpdates.department = data.department;
  }
  if (data.job_title !== undefined) {
    profileUpdates.job_title = data.job_title;
  }
  if (data.is_active !== undefined) {
    profileUpdates.is_active = data.is_active;
  }

  profileUpdates.updated_at = new Date();

  // Update user and profile in a transaction
  await baseUpdateAdminTransaction(
    id,
    userUpdates,
    profileUpdates,
  );

  return await baseFindAdminById(id);
};

/**
 * Deletes an admin user (soft delete).
 * Cannot delete the last active superadmin.
 */
export const deleteAdminAction = async (
  id: string,
  operatorId: string,
) => {
  if (id === operatorId) {
    throw new HttpException(
      400,
      'Cannot delete your own account',
    );
  }

  // Fetch existing admin
  const existing = await baseFindAdminById(id);

  if (!existing || !existing.profile) {
    throw new HttpException(404, 'Admin not found');
  }

  // Check superadmin deletion constraints
  const canDelete = await baseCheckSuperAdminDeletionConstraints(id);

  if (!canDelete) {
    throw new HttpException(
      400,
      'Cannot delete the last active superadmin. Assign another user first.',
    );
  }

  // Soft delete admin profile
  await baseSoftDeleteAdminProfile(id, operatorId);

  // Invalidate cache
  const { userCacheService } = await import(
    '../../user/services/user-cache.service'
  );

  await userCacheService.invalidateUser(id, existing.email);
};
