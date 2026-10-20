/**
 * GET /api/admins/:id
 * Retrieve a specific admin by ID with their profile.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { getAdminById } from '../services/admin.service';
import { mapToAdminResponse } from '../shared/interface';
import { adminParamsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  logger.info(`GET /admins/${id} request received`);

  const admin = await getAdminById(id);

  if (!admin || !admin.profile) {
    throw new HttpException(404, 'Admin not found');
  }

  logger.info(`Admin found: ${admin.id}`);

  return ResponseFormatter.success(res, mapToAdminResponse(admin), 'Admin retrieved successfully');
};

const router = Router();
router.get(
  '/:id',
  requireAuth,
  requirePermission('admins:read'),
  validationMiddleware(adminParamsSchema, 'params'),
  handler,
);

export default router;
