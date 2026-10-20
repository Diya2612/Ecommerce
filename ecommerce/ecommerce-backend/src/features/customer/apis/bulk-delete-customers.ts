/**
 * DELETE /bulk
 * Bulk soft-delete users by IDs. Related profile data is handled via cascade.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { bulkDeleteSchema, BulkDeleteDto } from '../shared/validation';
import { customerService } from '../services/customer.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const data: BulkDeleteDto = req.body;
  logger.info(`Bulk deleting ${data.ids.length} users`);

  logger.info(`Bulk deleting users: ${data.ids.length} records`);

  if (!req.userId) {
    throw new HttpException(401, 'Unauthorized');
  }

  // Prevent deleting self
  if (data.ids.includes(req.userId)) {
    throw new HttpException(400, 'Cannot delete your own account');
  }

  const result = await customerService.bulkDeleteCustomers(data.ids, req.userId);

  ResponseFormatter.success(
    res,
    {
      deleted_count: result.length,
      ids: result.map((u) => u.id),
    },
    `Successfully deleted ${result.length} users`,
  );
};

const router = Router();
router.delete(
  '/bulk',
  requireAuth,
  requirePermission('users:delete'),
  validationMiddleware(bulkDeleteSchema),
  handler,
);

export default router;
