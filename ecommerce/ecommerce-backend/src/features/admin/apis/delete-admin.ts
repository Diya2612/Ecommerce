/**
 * DELETE /api/admins/:id
 * Remove an admin user (soft delete).
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger, HttpException } from '../../../utils';
import { deleteAdminAction } from '../services/admin.service';
import { adminParamsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = adminParamsSchema.parse(req.params);
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'User authentication required');
  }

  logger.info(`Deleting admin ${id}`);

  await deleteAdminAction(id, userId);

  logger.info(`Admin ${id} deleted successfully`);
  return ResponseFormatter.success(res, null, 'Admin deleted successfully');
};

const router = Router();
router.delete(
  '/:id',
  requireAuth,
  requirePermission('admins:delete'),
  validationMiddleware(adminParamsSchema, 'params'),
  handler,
);

export default router;
