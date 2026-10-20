import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updateNotificationSettingsSchema } from '../shared/validation';
import { settingsService } from '../services/settings.service';

/** Updates user's global notification settings. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const settings = await settingsService.updateSettings(userId, req.body);
  ResponseFormatter.success(res, settings);
};

const router = Router();
router.patch(
  '/settings',
  requireAuth,
  validationMiddleware(updateNotificationSettingsSchema, 'body'),
  handler,
);

export default router;
