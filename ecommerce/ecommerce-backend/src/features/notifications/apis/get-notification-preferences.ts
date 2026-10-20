import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { sanitizePreferences } from '../shared/interface';
import { preferenceService } from '../services';

/** Retrieves user notification preferences, initializing defaults if none exist. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  let preferences = await preferenceService.getAllUserPreferences(userId);

  if (preferences.length === 0) {
    await preferenceService.initializeUserPreferences(userId);
    preferences = await preferenceService.getAllUserPreferences(userId);
  }

  const sanitized = sanitizePreferences(preferences);
  ResponseFormatter.success(res, sanitized);
};

const router = Router();
router.get('/preferences', requireAuth, handler);

export default router;
