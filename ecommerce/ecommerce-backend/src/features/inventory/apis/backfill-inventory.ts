/**
 * POST /api/inventory/backfill
 * Ensures all existing products have associated inventory records.
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { backfillInventorySchema } from '../shared/validation';
import { backfillInventoryForProducts } from '../services';

const handler = async (req: RequestWithUser, res: Response) => {
  const result = await backfillInventoryForProducts(req.body);
  ResponseFormatter.success(res, result, result.message);
};

const router = Router();
router.post(
  '/backfill',
  requireAuth,
  requirePermission('inventory:create'),
  validationMiddleware(backfillInventorySchema, 'body'),
  handler,
);

export default router;
