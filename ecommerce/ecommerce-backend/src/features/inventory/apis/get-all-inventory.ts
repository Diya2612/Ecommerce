/**
 * GET /api/inventory
 * Retrieves paginated list of inventory items with filtering.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getInventoryList } from '../services';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { inventoryListQuerySchema } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const result = await getInventoryList(req.query);

  ResponseFormatter.paginated(
    res,
    result.items,
    { page: result.page, limit: result.limit, total: result.total },
    'Inventory retrieved successfully',
  );
};

const router = Router();
router.get(
  '/',
  requireAuth,
  requirePermission('inventory:read'),
  validationMiddleware(inventoryListQuerySchema, 'query'),
  handler,
);

export default router;
