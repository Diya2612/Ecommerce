import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { statsQuerySchema } from '../shared/validation';
import { notificationReadService } from '../services';

/** Retrieves aggregate notification statistics (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { user_id } = req.query;
  const stats = await notificationReadService.getStats(user_id as string | undefined);

  ResponseFormatter.success(res, stats);
};

const router = Router();
router.get(
  '/stats',
  requireAuth,
  requirePermission('notifications:view_stats'),
  validationMiddleware(statsQuerySchema, 'query'),
  handler,
);

export default router;
