import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { notificationReadService } from '../services';

/** Returns the total count of unread, active notifications for the user. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const count = await notificationReadService.getUnreadCount(userId);
  ResponseFormatter.success(res, { count });
};

const router = Router();
router.get('/unread-count', requireAuth, handler);

export default router;
