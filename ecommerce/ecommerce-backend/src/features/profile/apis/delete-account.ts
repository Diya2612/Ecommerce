import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { eq } from 'drizzle-orm';
import { supabase } from '../../../utils/supabase/client';
import { redisClient } from '../../../utils/database/redis';
import { userCacheService } from '../../user/services/user-cache.service';

const handler = async (req: RequestWithUser, res: Response) => {
  if (!req.userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  // 1. Soft delete the user in Postgres
  await db
    .update(users)
    .set({
      is_deleted: true,
      deleted_by: req.userId,
      deleted_at: new Date(),
    })
    .where(eq(users.id, req.userId));

  // 2. Hard delete the user in Supabase Auth to free up email & prevent login
  if (user.auth_id) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.auth_id);
      if (error) {
        logger.error('Failed to delete user from Supabase Auth:', {
          userId: req.userId,
          authId: user.auth_id,
          error: error.message,
        });
        // We log the error but do not throw, as Postgres soft-delete already committed
      } else {
        logger.info('Successfully deleted user from Supabase Auth', {
          userId: req.userId,
          authId: user.auth_id,
        });
      }
    } catch (err) {
      logger.error('Unexpected error deleting user from Supabase:', err);
    }
  }

  // 3. Purge all Redis sessions for this user
  try {
    if (redisClient.isReady) {
      const pattern = `session:${req.userId}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Purged ${keys.length} session(s) from Redis for user`, { userId: req.userId });
      }
    }
  } catch (redisError) {
    logger.error('Error purging sessions from Redis during account deletion:', redisError);
  }

  // 4. Invalidate User Cache
  await userCacheService.invalidateUser(req.userId, user.email);

  ResponseFormatter.success(res, null, 'Account deleted successfully');
};

const router = Router();
router.delete('/delete-account', requireAuth, handler);

export default router;
