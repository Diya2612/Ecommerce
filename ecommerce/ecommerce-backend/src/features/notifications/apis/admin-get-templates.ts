import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { sanitizeTemplates } from '../shared/interface';
import { templateService } from '../services';

/** Lists all notification templates with optional category/status filters (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { category, is_active } = req.query;
  const filters: any = {};

  if (category) filters.category = category as string;
  if (is_active !== undefined) filters.isActive = is_active === 'true';

  const templates = await templateService.getAllTemplates(filters);
  const sanitized = sanitizeTemplates(templates);

  ResponseFormatter.success(res, sanitized);
};

const router = Router();
router.get('/', requireAuth, requirePermission('notification_templates:view'), handler);

export default router;
