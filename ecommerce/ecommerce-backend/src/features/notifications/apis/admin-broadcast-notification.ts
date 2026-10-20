import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { broadcastNotificationSchema } from '../shared/validation';
import { sanitizeNotifications } from '../shared/interface';
import { notificationCoreService } from '../services';

/** Broadcasts a notification to multiple users (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { user_ids, ...notificationData } = req.body;
  const notifications = await notificationCoreService.broadcast(user_ids, notificationData);
  const sanitized = sanitizeNotifications(notifications);

  ResponseFormatter.success(
    res,
    { sent: notifications.length, notifications: sanitized },
    `Broadcast sent to ${notifications.length} users`,
    201,
  );
};

const router = Router();
router.post(
  '/broadcast',
  requireAuth,
  requirePermission('notifications:broadcast'),
  validationMiddleware(broadcastNotificationSchema),
  handler,
);

export default router;
