import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { supabase } from '../../../utils/supabase/client';
import { redisClient } from '../../../utils/database/redis';
import * as crypto from 'crypto';

const logoutSessionSchema = z.object({
  sessionId: z.string().optional(),
  scope: z.enum(['current', 'all', 'others', 'single']).default('current'),
});

const handler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new HttpException(401, 'Authentication required');
    }

    const authHeader = req.headers.authorization;
    const jwt = authHeader?.replace('Bearer ', '');

    if (!jwt) {
      throw new HttpException(401, 'No valid session token found');
    }

    const body = req.body || {};
    const { scope, sessionId } = logoutSessionSchema.parse(body);
    const currentSessionHash = crypto.createHash('sha256').update(jwt).digest('hex');

    try {
      if (redisClient.isReady) {
        const pattern = `session:${userId}:*`;
        const keys = await redisClient.keys(pattern);

        if (scope === 'all') {
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        } else if (scope === 'others') {
          const keysToDelete = keys.filter((key) => !key.endsWith(`:${currentSessionHash}`));
          if (keysToDelete.length > 0) {
            await redisClient.del(keysToDelete);
          }
        } else if (scope === 'current') {
          const currentKey = `session:${userId}:${currentSessionHash}`;
          await redisClient.del(currentKey);
        } else if (scope === 'single' && sessionId) {
          const specificKey = `session:${userId}:${sessionId}`;
          await redisClient.del(specificKey);
        }
      }
    } catch (redisError) {
      logger.error('Failed to clean up Redis sessions:', redisError);
    }

    if (scope === 'all') {
      const result = await supabase.auth.admin.signOut(jwt, 'global');
      if (result.error) logger.warn('Supabase global signOut warning:', result.error.message);
      return ResponseFormatter.success(res, null, 'All sessions revoked successfully.');
    }

    if (scope === 'others') {
      return ResponseFormatter.success(res, null, 'Other sessions revoked successfully.');
    }

    if (scope === 'single') {
      return ResponseFormatter.success(res, null, 'Session logged out successfully.');
    }

    const { error } = await supabase.auth.admin.signOut(jwt, 'local');
    if (error) logger.warn('Supabase local signOut warning:', error.message);

    return ResponseFormatter.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
    return;
  }
};

const router = Router();
router.post('/sessions/logout', requireAuth, handler);

export default router;
