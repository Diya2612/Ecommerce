/**
 * User Service
 * Core business logic for user management.
 */

import { eq, and, sql } from 'drizzle-orm';
import { rbacCacheService } from '../../rbac';
import { userCacheService } from '../services/user-cache.service';
import { HttpException, logger } from '../../../utils';
import { db } from '../../../database';
import { users } from '../shared/user.schema';
import { emailOtps } from '../shared/email-otp.schema';
import { IUser } from '../shared/interface';
import { findUserById, findUserByEmail } from '../shared/queries';
import { type UpdateUserDto } from '../shared/validation';
import { supabase } from '../../../utils/supabase/client';

export interface CreateUserParams {
  first_name: string;
  last_name: string;
  email: string;
  middle_name?: string | null;
  display_name?: string;
  phone_number?: string;
  tags?: string[];
  date_of_birth?: string | Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferred_language?: string;
  languages?: string[];
  profile_image_url?: string;
  secondary_email?: string;
  secondary_phone_number?: string;
  email_verified?: boolean;
  secondary_email_verified?: boolean;
}

export class UserService {
  /**
   * Create a new user.
   * Note: Duplicate email check should be done by the caller (customerService) before calling this.
   */
  async createUser(data: CreateUserParams, tx: any = db): Promise<IUser> {
    logger.info('[UserService] Creating new user:', { email: data.email });

    // Email check is done by customerService before transaction starts
    // Additional check inside transaction using tx to prevent race conditions
    const [existingUser] = await tx
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      throw new HttpException(409, 'A customer with this email already exists');
    }

    let isEmailVerified = data.email_verified ?? false;
    let emailVerifiedAt: Date | null = isEmailVerified ? new Date() : null;

    if (data.email_verified === undefined) {
      const [verifiedOtp] = await tx
        .select()
        .from(emailOtps)
        .where(
          and(
            eq(emailOtps.email, data.email.toLowerCase()),
            eq(emailOtps.purpose, 'email_verification'),
          ),
        )
        .limit(1);

      if (verifiedOtp?.verified_at) {
        isEmailVerified = true;
        emailVerifiedAt = verifiedOtp.verified_at;
      }
    }

    let isSecondaryEmailVerified = data.secondary_email_verified ?? false;

    if (data.secondary_email && data.secondary_email_verified === undefined) {
      const [secondaryVerifiedOtp] = await tx
        .select()
        .from(emailOtps)
        .where(
          and(
            eq(emailOtps.email, data.secondary_email.toLowerCase()),
            eq(emailOtps.purpose, 'email_verification'),
          ),
        )
        .limit(1);

      if (secondaryVerifiedOtp?.verified_at) {
        isSecondaryEmailVerified = true;
      }
    }

    // Generate timestamp-based display_id (no DB query needed, zero collision)
    const displayId = `CUST-${Date.now().toString().slice(-10)}`;

    const rawInsertData = {
      display_id: displayId,
      first_name: data.first_name,
      middle_name: data.middle_name || null,
      last_name: data.last_name,
      email: data.email,
      display_name: data.display_name,
      phone_number: data.phone_number,
      tags: data.tags || [],
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      preferred_language: data.preferred_language || 'en',
      languages: data.languages || [],
      profile_image_url: data.profile_image_url,
      email_verified: isEmailVerified,
      email_verified_at: emailVerifiedAt,
      secondary_email: data.secondary_email,
      secondary_email_verified: isSecondaryEmailVerified,
      secondary_phone_number: data.secondary_phone_number,
    };

    // Strip undefined properties to avoid Drizzle ORM parameter misalignment
    // Also explicitly cast empty arrays to ARRAY[]::text[] to prevent Postgres errors
    const insertData = Object.fromEntries(
      Object.entries(rawInsertData)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => {
          if (Array.isArray(v) && v.length === 0) {
            return [k, sql`ARRAY[]::text[]`];
          }
          return [k, v];
        }),
    );

    try {
      const [newUser] = await tx.insert(users).values(insertData).returning();
      return newUser as IUser;
    } catch (error: any) {
      logger.error('User insert failed:', {
        error: error?.message,
        code: error?.code,
        constraint: error?.constraint,
        detail: error?.detail,
      });

      // Handle unique constraint violations
      if (error?.code === '23505') {
        const constraintName = error?.constraint || '';
        if (constraintName.includes('email')) {
          throw new HttpException(409, 'A customer with this email already exists');
        }
        if (constraintName.includes('display_id')) {
          throw new HttpException(409, 'Customer ID conflict. Please try again.');
        }
        throw new HttpException(409, 'A record with this information already exists');
      }

      // Handle other common errors
      if (error?.code === '23502') {
        throw new HttpException(400, `Missing required field: ${error?.column || 'unknown'}`);
      }

      throw error;
    }
  }

  /**
   * Update a user's profile.
   */
  async updateCoreUser(
    id: string,
    data: UpdateUserDto,
    requesterId: string,
    tx: any = db,
  ): Promise<IUser> {
    const existingUser = await findUserById(id);

    if (!existingUser) {
      throw new HttpException(404, 'User not found');
    }

    const isOwnProfile = id === requesterId;

    if (!isOwnProfile) {
      const canUpdateOthers = await rbacCacheService.hasPermission(requesterId, 'users:update');
      if (!canUpdateOthers) {
        throw new HttpException(403, 'You can only update your own profile');
      }
    }

    const emailChanged = data.email && data.email !== existingUser.email;

    if (emailChanged) {
      const existingUserWithEmail = await findUserByEmail(data.email as string);

      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new HttpException(409, 'Email already exists');
      }
    }

    const updateData: Partial<IUser> = {
      ...data,
      updated_by: requesterId,
    };

    const [result] = await tx
      .update(users)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!result) {
      throw new HttpException(500, 'Failed to update user');
    }

    // Sync email change to Supabase Auth so login works with new email
    if (emailChanged && result.auth_id) {
      try {
        // Use direct Postgres RPC to update auth.users reliably
        // (supabase.auth.admin.updateUserById has email change confirmation quirks)
        const { error: rpcError } = await supabase.rpc('sync_auth_email', {
          p_auth_id: result.auth_id,
          p_new_email: data.email,
        });

        if (rpcError) {
          logger.error('[UserService] Failed to sync email to Supabase Auth via RPC:', {
            userId: id,
            authId: result.auth_id,
            error: rpcError.message,
          });
          throw new HttpException(
            500,
            `Profile updated but failed to sync email to auth service: ${rpcError.message}`,
          );
        }

        logger.info('[UserService] Email synced to Supabase Auth successfully', {
          userId: id,
          authId: result.auth_id,
          newEmail: data.email,
        });
      } catch (err) {
        if (err instanceof HttpException) throw err;
        logger.error('[UserService] Unexpected error syncing email to Supabase:', err);
        throw new HttpException(500, 'Failed to sync email with authentication service');
      }
    }

    await userCacheService.invalidateUser(result.id, result.email);

    return result as IUser;
  }

  /**
   * Soft delete a user.
   */
  async softDeleteUser(id: string, deletedBy: string, tx: any = db): Promise<{ email: string }> {
    if (id === deletedBy) {
      throw new HttpException(400, 'Cannot delete your own account');
    }

    const existingUser = await findUserById(id);
    if (!existingUser) {
      throw new HttpException(404, 'User not found');
    }

    await tx
      .update(users)
      .set({
        is_deleted: true,
        deleted_by: deletedBy,
        deleted_at: new Date(),
      })
      .where(eq(users.id, id));

    await userCacheService.invalidateUser(id, existingUser.email);

    return { email: existingUser.email };
  }
}

export const userService = new UserService();
