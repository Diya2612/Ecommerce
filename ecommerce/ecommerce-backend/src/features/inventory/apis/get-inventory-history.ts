/**
 * GET /api/inventory/:id/history
 * Retrieves adjustment history for a specific inventory entry.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { getInventoryHistory, requireInventoryExists } from '../services';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { inventoryIdParamSchema, inventoryHistoryQuerySchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const { limit } = req.query as { limit?: number };

  await requireInventoryExists(id);
  const history = await getInventoryHistory(id, limit);

  ResponseFormatter.success(res, history, 'Inventory history retrieved successfully');
};

const router = Router();
router.get(
  '/:id/history',
  requireAuth,
  requirePermission('inventory:read'),
  validationMiddleware(inventoryIdParamSchema, 'params'),
  validationMiddleware(inventoryHistoryQuerySchema, 'query'),
  handler,
);

export default router;
