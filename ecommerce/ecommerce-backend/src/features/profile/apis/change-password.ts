import { Router, Response } from 'express';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { db } from '../../../database';
import { supabase } from '../../../utils/supabase/client';
import { users } from '../../user/shared/user.schema';
import { userCacheService } from '../../user/services/user-cache.service';
import { logger } from '../../../utils/logging/logger';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  if (!newPassword) {
    throw new HttpException(400, 'New password is required');
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  if (user.password) {
    if (!currentPassword) {
      throw new HttpException(400, 'Current password is required');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error || !data.user) {
        throw new HttpException(400, 'Invalid current password');
      }
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));

  await userCacheService.invalidateUser(userId, user.email);

  if (user.auth_id) {
    try {
      const { error: supabaseError } = await supabase.auth.admin.updateUserById(user.auth_id, {
        password: newPassword,
      });

      if (supabaseError) {
        logger.error('Failed to update password in Supabase Auth:', {
          userId,
          authId: user.auth_id,
          error: supabaseError.message,
        });

        throw new HttpException(
          500,
          `Failed to update authentication service: ${supabaseError.message}`,
        );
      }

      logger.info('Successfully updated password in both local DB and Supabase Auth', {
        userId,
        authId: user.auth_id,
      });
    } catch (err) {
      if (err instanceof HttpException) throw err;

      logger.error('Unexpected error syncing password to Supabase:', err);
      throw new HttpException(500, 'Failed to sync password with authentication service');
    }
  } else {
    logger.warn('User has no auth_id, skipping Supabase password update', { userId });
  }

  ResponseFormatter.success(res, null, 'Password updated successfully');
};

const router = Router();
router.put('/change-password', requireAuth, handler);

export default router;
