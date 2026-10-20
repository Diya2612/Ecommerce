/**
 * POST /api/inventory/:id/adjust
 * Adjusts inventory quantity with reason tracking.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { validationMiddleware, requireAuth, requirePermission } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { adjustInventory, requireInventoryExists } from '../services';
import { adjustInventorySchema, inventoryIdParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.userId) throw new HttpException(401, 'User authentication required');

  await requireInventoryExists(id);
  const result = await adjustInventory(id, req.body, req.userId);

  ResponseFormatter.success(res, result, 'Inventory adjusted successfully');
};

const router = Router();
router.post(
  '/:id/adjust',
  requireAuth,
  requirePermission('inventory:update'),
  validationMiddleware(inventoryIdParamSchema, 'params'),
  validationMiddleware(adjustInventorySchema),
  handler,
);

export default router;
