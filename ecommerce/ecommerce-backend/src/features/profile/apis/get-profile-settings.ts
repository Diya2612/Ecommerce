import { Router, Response } from 'express';
import { eq } from 'drizzle-orm';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';

const handler = async (req: RequestWithUser, res: Response) => {
  if (!req.userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const [user] = await db
    .select({
      timezone: users.timezone,
      preferred_language: users.preferred_language,
      preferred_currency: users.preferred_currency,
      metadata: users.metadata,
    })
    .from(users)
    .where(eq(users.id, req.userId))
    .limit(1);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  const metadata = (user.metadata as any) || {};

  const settings = {
    timezone: user.timezone,
    preferred_language: user.preferred_language,
    date_time_format: metadata.date_time_format || 'MM/DD/YYYY',
    theme: metadata.theme || 'light',
    density: metadata.density || 'comfortable',
    default_landing_page: metadata.default_landing_page || 'Dashboard',
    rows_per_page: metadata.rows_per_page || 25,
    remember_filters: metadata.remember_filters !== undefined ? metadata.remember_filters : true,
  };

  ResponseFormatter.success(res, settings, 'Profile settings retrieved successfully');
};

const router = Router();
router.get('/settings', requireAuth, handler);

export default router;
