/**
 * DELETE /:id
 * Soft-deletes an FAQ and invalidates related caches.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, uuidSchema } from '../../../utils';
import { deleteFaqAction } from '../services/faq.service';

const paramsSchema = z.object({ id: uuidSchema });

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  await deleteFaqAction(id, req.userId);
  ResponseFormatter.success(res, null, 'FAQ deleted successfully');
};

const router = Router();
router.delete(
  '/:id',
  requireAuth,
  requirePermission('faqs:delete'),
  validationMiddleware(paramsSchema, 'params'),
  handler,
);

export default router;
