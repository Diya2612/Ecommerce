import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { settingsService } from '../services/settings.service';

/** Retrieves user's global notification settings. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const settings = await settingsService.getSettings(userId);
  ResponseFormatter.success(res, settings);
};

const router = Router();
router.get('/settings', requireAuth, handler);

export default router;
