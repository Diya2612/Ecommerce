import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updateTemplateSchema } from '../shared/validation';
import { sanitizeTemplate } from '../shared/interface';
import { templateService } from '../services';

/** Updates an existing notification template identified by code (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const code = req.params.code as string;
  const exists = await templateService.getTemplateByCode(code);
  if (!exists) throw new HttpException(404, 'Template not found');

  const template = await templateService.upsertTemplate({ code, ...req.body });
  const sanitized = sanitizeTemplate(template);

  ResponseFormatter.success(res, sanitized, 'Template updated successfully');
};

const router = Router();
router.put(
  '/:code',
  requireAuth,
  requirePermission('notification_templates:update'),
  validationMiddleware(updateTemplateSchema),
  handler,
);

export default router;
