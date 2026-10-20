import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updatePreferenceSchema } from '../shared/validation';
import { sanitizePreference } from '../shared/interface';
import { preferenceService } from '../services';

/** Updates channel and frequency settings for a notification type. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { notification_type, ...settings } = req.body;
  const updated = await preferenceService.updatePreference(userId, notification_type, settings);
  const sanitized = sanitizePreference(updated);

  ResponseFormatter.success(res, sanitized, 'Notification preferences updated successfully');
};

const router = Router();
router.put('/preferences', requireAuth, validationMiddleware(updatePreferenceSchema), handler);

export default router;
