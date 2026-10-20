/**
 * GET /:id
 * Retrieves detailed FAQ content, respecting visibility rules for non-admins.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter, uuidSchema, HttpException } from '../../../utils';
import { getFaqById } from '../services/faq.service';
import { requireAuth, validationMiddleware, userHasPermission } from '../../../middlewares';

const paramsSchema = z.object({ id: uuidSchema });

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const isAdmin = await userHasPermission(req, 'faqs:update');

  const result = await getFaqById(id, { isAdmin });
  if (!result) throw new HttpException(404, 'FAQ not found');

  ResponseFormatter.success(res, result, 'FAQ retrieved successfully');
};

const router = Router();
router.get('/:id', requireAuth, validationMiddleware(paramsSchema, 'params'), handler);

export default router;
