/**
 * GET /api/inventory/:id
 * Retrieves a single inventory record with full product details.
 */

import { Router, Response, NextFunction } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { validationMiddleware } from '../../../middlewares';
import { inventoryIdParamSchema } from '../shared/validation';
import { requireInventoryExists } from '../services';

const handler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  if (!id) return next('route');

  const item = await requireInventoryExists(id);
  ResponseFormatter.success(res, item, 'Inventory item retrieved successfully');
};

const router = Router();
router.get('/:id', validationMiddleware(inventoryIdParamSchema, 'params'), handler);

export default router;
