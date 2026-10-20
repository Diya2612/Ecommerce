import { HttpException } from '../../../utils';
import { logger } from '../../../utils';
import { supabaseAnon } from '../../../utils/supabase/client';
import { verifySupabaseToken, requestPasswordReset, updatePassword } from './supabase-auth.service';
import {
  getUserByAuthIdQuery,
  getUserByEmail,
  updateUserEmailVerification,
  linkUserToAuth,
  insertNewUser,
  insertCustomerProfile,
} from '../shared/queries';
import { SyncUserDto } from '../shared/interface';

/** Auth Service Logic */

export async function handleRefreshToken(refreshToken: string) {
  // Refresh via Supabase Auth
  const { data: authData, error } = await supabaseAnon.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !authData?.user || !authData?.session) {
    throw new HttpException(401, 'Invalid refresh token');
  }

  const publicUser = await getUserByAuthIdQuery(authData.user.id);

  if (!publicUser) {
    throw new HttpException(500, 'User sync failed');
  }

  return {
    user: {
      id: publicUser.id,
      auth_id: authData.user.id,
      first_name: publicUser.first_name,
      middle_name: publicUser.middle_name,
      last_name: publicUser.last_name,
      email: publicUser.email,
      phone_number: publicUser.phone_number || undefined,
      created_at: publicUser.created_at,
      updated_at: publicUser.updated_at,
    },
    token: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
  };
}

export async function handleRequestPasswordReset(email: string) {
  const { error } = await requestPasswordReset(email);

  if (error) {
    // Don't reveal if email exists
  }

  return {
    message: 'If the email exists, a password reset link has been sent',
  };
}

export async function handleResetPassword(accessToken: string, newPassword: string) {
  const { error } = await updatePassword(accessToken, newPassword);

  if (error) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Password reset failed';
    throw new HttpException(400, errorMessage);
  }

  return {
    message: 'Password reset successfully',
  };
}

export async function syncUser(token: string, bodyData: SyncUserDto) {
  const authPayload = await verifySupabaseToken(token);
  if (!authPayload) {
    throw new HttpException(401, 'Invalid or expired token');
  }

  const emailVerified = !!authPayload.email_confirmed_at;
  const emailVerifiedAt = authPayload.email_confirmed_at
    ? new Date(authPayload.email_confirmed_at as string)
    : null;

  let existingUser = await getUserByAuthIdQuery(authPayload.sub as string);

  if (existingUser) {
    if (existingUser.email_verified !== emailVerified) {
      await updateUserEmailVerification(existingUser.id, emailVerified, emailVerifiedAt);
      logger.info('Updated email verification status for user', {
        userId: existingUser.id,
        authId: authPayload.sub,
        emailVerified,
      });
    }

    return {
      id: existingUser.id,
      synced: false,
      message: 'User already exists',
    };
  }

  existingUser = await getUserByEmail(authPayload.email as string);

  if (existingUser) {
    await linkUserToAuth(
      existingUser.id,
      authPayload.sub as string,
      emailVerified,
      emailVerifiedAt,
    );
    logger.info('Linked existing user to Supabase Auth', {
      userId: existingUser.id,
      authId: authPayload.sub,
      emailVerified,
    });

    return {
      id: existingUser.id,
      synced: true,
      message: 'Linked existing user',
    };
  }

  let first_name = bodyData.first_name;
  let last_name = bodyData.last_name;

  if (!first_name) {
    const userMetadata = authPayload.user_metadata as Record<string, any> | undefined;
    const fullName =
      bodyData.name || userMetadata?.name || (authPayload.email as string)?.split('@')[0] || 'User';
    const nameParts = fullName.trim().split(' ');
    first_name = nameParts[0] || 'User';
    if (!last_name) {
      last_name = nameParts.slice(1).join(' ') || '';
    }
  }

  if (!last_name) last_name = '';

  const newUser = await insertNewUser({
    auth_id: authPayload.sub as string,
    display_id: `USER-${Date.now().toString().slice(-10)}`,
    first_name,
    last_name,
    email: authPayload.email as string,
    phone_number: bodyData.phone_number || (authPayload.phone as string) || '',
    email_verified: emailVerified,
    email_verified_at: emailVerifiedAt,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  await insertCustomerProfile({
    user_id: newUser.id,
    account_status: 'active',
  });

  logger.info('Created new user and profile from Supabase Auth', {
    userId: newUser.id,
    authId: authPayload.sub,
    email: authPayload.email,
    emailVerified,
  });

  return {
    isNew: true,
    id: newUser.id,
    synced: true,
    message: 'New user created',
  };
}
