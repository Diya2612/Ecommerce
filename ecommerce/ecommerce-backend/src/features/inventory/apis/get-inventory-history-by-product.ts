/**
 * GET /api/inventory/products/:productId/history
 * Retrieves adjustment history for a product and its variants.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { getInventoryHistoryByProductId } from '../services';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { productIdParamSchema, inventoryHistoryByProductQuerySchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { productId } = req.params as { productId: string };
  const { page, limit } = req.query as { page?: number; limit?: number };

  const result = await getInventoryHistoryByProductId(productId, page, limit);

  ResponseFormatter.paginated(
    res,
    result.items,
    { page: result.page, limit: result.limit, total: result.total },
    'Inventory history retrieved successfully',
  );
};

const router = Router();
router.get(
  '/products/:productId/history',
  requireAuth,
  requirePermission('inventory:read'),
  validationMiddleware(productIdParamSchema, 'params'),
  validationMiddleware(inventoryHistoryByProductQuerySchema, 'query'),
  handler,
);

export default router;
