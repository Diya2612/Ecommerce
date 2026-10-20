/**
 * PUT /api/inventory/:id
 * Updates specific inventory fields (location, condition, etc.).
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updateInventory, requireInventoryExists } from '../services';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { updateInventorySchema, inventoryIdParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.userId) throw new HttpException(401, 'User authentication required');

  await requireInventoryExists(id);
  const updated = await updateInventory(id, req.body, req.userId);

  ResponseFormatter.success(res, updated, 'Inventory updated successfully');
};

const router = Router();
router.put(
  '/:id',
  requireAuth,
  requirePermission('inventory:update'),
  validationMiddleware(inventoryIdParamSchema, 'params'),
  validationMiddleware(updateInventorySchema),
  handler,
);

export default router;
