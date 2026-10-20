import { supabaseAnon, supabase } from '../../../utils/supabase/client';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../utils/logging/logger';
import type { SyncUserData, AuthResponse } from '../shared/interface';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Initialize JWKS (JSON Web Key Set) for JWT verification
// This fetches Supabase's public keys and caches them for token verification
const SUPABASE_JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

/**
 * Supabase Auth Service
 *
 * This service provides SERVER-SIDE utilities for Supabase Auth integration.
 *
 * IMPORTANT: Authentication (sign up, sign in, sign out) should be handled
 * by the FRONTEND using Supabase client libraries (@supabase/supabase-js).
 *
 * Backend responsibilities:
 * 1. Verify JWT tokens from Supabase Auth
 * 2. Sync users to public.users table (handled by auth middleware on first API request)
 * 3. Manage RBAC permissions
 * 4. Handle password reset flows
 *
 * Frontend responsibilities (using @supabase/supabase-js):
 * 1. supabase.auth.signUp() - User registration
 * 2. supabase.auth.signInWithPassword() - User login
 * 3. supabase.auth.signOut() - User logout
 * 4. supabase.auth.getSession() - Get current session
 */

/** Verify Supabase Auth JWT and return payload. */
export async function verifySupabaseToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SUPABASE_JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });

    logger.debug('Supabase token verified', {
      userId: payload.sub,
      email: payload.email,
    });

    return payload;
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    return null;
  }
}

/** Request password reset for a user. */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
    });

    if (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }

    logger.info('Password reset email sent', { email });
    return { data: null, error: null };
  } catch (error) {
    logger.error('Failed to request password reset:', error);
    return { data: null, error };
  }
}

/** Update password for an authenticated user using a recovery token. */
export async function updatePassword(
  accessToken: string,
  newPassword: string,
): Promise<AuthResponse> {
  try {
    // 1. Verify the token first to get the user ID
    const payload = await verifySupabaseToken(accessToken);
    if (!payload || !payload.sub) {
      throw new Error('Invalid or expired reset token');
    }

    // 2. Use admin client to update password for this specific user
    const { data, error } = await supabase.auth.admin.updateUserById(payload.sub as string, {
      password: newPassword,
    });

    if (error) {
      logger.error('Admin password update error:', error);
      throw error;
    }

    logger.info('Password updated successfully via admin client', {
      userId: data.user?.id,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Failed to update password:', error);
    return { data: null, error };
  }
}

/** Sync Supabase Auth user to public.users table. */
export async function syncUserToPublicTable(authId: string, userData: SyncUserData): Promise<void> {
  try {
    // Check if user already exists with this email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user with auth_id
      await db
        .update(users)
        .set({
          auth_id: authId,
          updated_at: new Date(),
        })
        .where(eq(users.id, existingUser[0].id));

      logger.info('Synced Supabase Auth user to existing public.users record', {
        userId: existingUser[0].id,
        authId,
      });
    } else {
      // Create new user record with auth_id
      const fullName = userData.name || 'User';
      const nameParts = fullName.trim().split(' ');
      const first_name = nameParts[0] || 'User';
      const last_name = nameParts.slice(1).join(' ') || '';

      await db.insert(users).values({
        auth_id: authId,
        display_id: `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        first_name,
        last_name,
        email: userData.email,
        phone_number: userData.phone_number || '',
        password: '', // Placeholder - Supabase manages actual password
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      logger.info('Created new public.users record from Supabase Auth', {
        authId,
        email: userData.email,
      });
    }
  } catch (error) {
    logger.error('Failed to sync user to public.users:', error);
    throw error;
  }
}

/** Get user by Supabase Auth ID. */
export async function getUserByAuthId(authId: string) {
  try {
    const user = await db.select().from(users).where(eq(users.auth_id, authId)).limit(1);

    return user[0] || null;
  } catch (error) {
    logger.error('Failed to get user by auth_id:', error);
    return null;
  }
}

/** Login with Supabase Auth (legacy compatibility). */
export async function loginWithSupabase(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      logger.error('Supabase login error:', error);
      throw error;
    }

    logger.info('User logged in via Supabase Auth', {
      userId: data.user?.id,
      email: credentials.email,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Failed to login with Supabase:', error);
    return { data: null, error };
  }
}
export async function migrateUserToSupabaseAuth(
  userId: string,
  password: string,
): Promise<AuthResponse> {
  try {
    // Get existing user
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!existingUser[0]) {
      throw new Error('User not found');
    }

    const user = existingUser[0];

    // Create Supabase Auth account
    const { data, error } = await supabaseAnon.auth.signUp({
      email: user.email,
      password,
      options: {
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          migrated: true,
          original_user_id: userId,
        },
      },
    });

    if (error) {
      logger.error('Failed to migrate user to Supabase Auth:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Migration succeeded but no user returned');
    }

    // Update public.users - remove password since Supabase manages it now
    await db
      .update(users)
      .set({
        password: '', // Empty string instead of null (until migration)
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    logger.info('User migrated to Supabase Auth', {
      userId,
      authId: data.user.id,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Failed to migrate user:', error);
    return { data: null, error };
  }
}
