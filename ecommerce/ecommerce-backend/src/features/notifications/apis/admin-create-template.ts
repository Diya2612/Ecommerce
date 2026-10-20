import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { createTemplateSchema } from '../shared/validation';
import { sanitizeTemplate } from '../shared/interface';
import { templateService } from '../services';

/** Creates a new notification template (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const template = await templateService.upsertTemplate(req.body);
  const sanitized = sanitizeTemplate(template);

  ResponseFormatter.success(res, sanitized, 'Template created successfully', 201);
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('notification_templates:create'),
  validationMiddleware(createTemplateSchema),
  handler,
);

export default router;
