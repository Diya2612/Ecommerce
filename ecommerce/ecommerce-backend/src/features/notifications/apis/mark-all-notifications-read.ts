import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { notificationActionService } from '../services';

/** Marks all unread, active notifications for the current user as read. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const updatedCount = await notificationActionService.markAllAsRead(userId);
  ResponseFormatter.success(res, { updatedCount }, 'All notifications marked as read');
};

const router = Router();
router.patch('/read-all', requireAuth, handler);

export default router;
