import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { notificationIdParamsSchema } from '../shared/validation';
import { sanitizeNotification } from '../shared/interface';
import { notificationReadService } from '../services';

/** Retrieves details for a specific notification, verifying user ownership. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const id = req.params.id as string;
  const notification = await notificationReadService.getNotificationById(id, userId);

  if (!notification) throw new HttpException(404, 'Notification not found');

  const sanitized = sanitizeNotification(notification);
  ResponseFormatter.success(res, sanitized);
};

const router = Router();
router.get(
  '/:id',
  requireAuth,
  validationMiddleware(notificationIdParamsSchema, 'params'),
  handler,
);

export default router;
