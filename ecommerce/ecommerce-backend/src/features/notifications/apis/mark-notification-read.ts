import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { notificationIdParamsSchema } from '../shared/validation';
import { sanitizeNotification } from '../shared/interface';
import { notificationActionService } from '../services';

/** Marks a single notification as read, if owned by the user. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const id = req.params.id as string;
  const notification = await notificationActionService.markAsRead(id, userId);

  if (!notification) throw new HttpException(404, 'Notification not found');

  const sanitized = sanitizeNotification(notification);
  ResponseFormatter.success(res, sanitized, 'Notification marked as read');
};

const router = Router();
router.patch(
  '/:id/read',
  requireAuth,
  validationMiddleware(notificationIdParamsSchema, 'params'),
  handler,
);

export default router;
