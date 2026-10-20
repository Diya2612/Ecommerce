/**
 * PATCH /:id
 * Updates an existing FAQ record. Requires administrative permissions.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, uuidSchema } from '../../../utils';
import { updateFaqSchema, UpdateFaqDto } from '../shared/validation';
import { updateFaqAction } from '../services/faq.service';

const paramsSchema = z.object({ id: uuidSchema });

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const data: UpdateFaqDto = req.body;

  const result = await updateFaqAction(id, data, req.userId);
  ResponseFormatter.success(res, result, 'FAQ updated successfully');
};

const router = Router();
router.patch(
  '/:id',
  requireAuth,
  requirePermission('faqs:update'),
  validationMiddleware(paramsSchema, 'params'),
  validationMiddleware(updateFaqSchema),
  handler,
);

export default router;
