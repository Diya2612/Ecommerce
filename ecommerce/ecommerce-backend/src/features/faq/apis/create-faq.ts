/**
 * POST /
 * Creates a new FAQ item. Requires administrative permissions.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { createFaqSchema, CreateFaqDto } from '../shared/validation';
import { createFaqAction } from '../services/faq.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const data: CreateFaqDto = req.body;
  const result = await createFaqAction(data, req.userId);
  ResponseFormatter.success(res, result, 'FAQ created successfully', 201);
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('faqs:create'),
  validationMiddleware(createFaqSchema),
  handler,
);

export default router;
