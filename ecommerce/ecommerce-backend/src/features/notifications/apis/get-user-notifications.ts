import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { getNotificationsQuerySchema } from '../shared/validation';
import { sanitizeNotifications, INotificationType } from '../shared/interface';
import { notificationReadService } from '../services';

/** Lists paginated notifications for the user with optional type/read filters. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { page = 1, limit = 20, type, is_read, unread_only, category } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const notifications = await notificationReadService.getUserNotifications(userId, {
    limit: Number(limit),
    offset,
    type: type as INotificationType | undefined,
    category: category as any,
    isRead:
      unread_only === 'true'
        ? false
        : is_read === 'true'
          ? true
          : is_read === 'false'
            ? false
            : undefined,
  });

  const unreadCount = await notificationReadService.getUnreadCount(userId);
  const totalCount = await notificationReadService.getTotalCount(userId, category as string);
  const sanitized = sanitizeNotifications(notifications);

  const totalPages = Math.ceil(totalCount / Number(limit));

  ResponseFormatter.success(res, {
    notifications: sanitized,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
      totalPages,
      hasMore: notifications.length === Number(limit),
    },
    unreadCount,
  });
};

const router = Router();
router.get('/', requireAuth, validationMiddleware(getNotificationsQuerySchema, 'query'), handler);

export default router;
