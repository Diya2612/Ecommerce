import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { notificationIdParamsSchema } from '../shared/validation';
import { notificationActionService } from '../services';

/** Soft deletes a notification record for the authenticated user. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const id = req.params.id as string;
  const deleted = await notificationActionService.deleteNotification(id, userId);

  if (!deleted) throw new HttpException(404, 'Notification not found');

  ResponseFormatter.success(res, null, 'Notification deleted successfully');
};

const router = Router();
router.delete(
  '/:id',
  requireAuth,
  validationMiddleware(notificationIdParamsSchema, 'params'),
  handler,
);

export default router;
