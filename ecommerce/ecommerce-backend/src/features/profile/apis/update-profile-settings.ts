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
      id: users.id,
      metadata: users.metadata,
      timezone: users.timezone,
      preferred_language: users.preferred_language,
    })
    .from(users)
    .where(eq(users.id, req.userId))
    .limit(1);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  const body = req.body;

  // Base metadata or empty object
  const currentMetadata = (user.metadata as any) || {};

  // Appearance settings to save in metadata
  const appearanceSettings = {
    theme: body.theme || currentMetadata.theme || 'light',
    density: body.density || currentMetadata.density || 'comfortable',
    default_landing_page:
      body.default_landing_page || currentMetadata.default_landing_page || 'Dashboard',
    rows_per_page: body.rows_per_page || currentMetadata.rows_per_page || 25,
    remember_filters:
      body.remember_filters !== undefined
        ? body.remember_filters
        : (currentMetadata.remember_filters ?? true),
    date_time_format: body.date_time_format || currentMetadata.date_time_format || 'MM/DD/YYYY',
  };

  const updatedMetadata = {
    ...currentMetadata,
    ...appearanceSettings,
  };

  const updateData: any = {
    metadata: updatedMetadata,
  };

  // Explicit columns
  if (body.timezone) {
    updateData.timezone = body.timezone;
  }
  if (body.preferred_language) {
    updateData.preferred_language = body.preferred_language;
  }

  await db.update(users).set(updateData).where(eq(users.id, req.userId));

  const responseSettings = {
    ...appearanceSettings,
    timezone: body.timezone || user.timezone,
    preferred_language: body.preferred_language || user.preferred_language,
  };

  ResponseFormatter.success(res, responseSettings, 'Profile settings updated successfully');
};

const router = Router();
router.put('/settings', requireAuth, handler);

export default router;
