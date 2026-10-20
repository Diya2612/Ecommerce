/**
 * PATCH /api/admins/:id
 * Update an existing admin's user data or organizational profile.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updateAdminAction } from '../services/admin.service';
import { updateAdminSchema, adminParamsSchema } from '../shared/validation';
import { mapToAdminResponse } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = adminParamsSchema.parse(req.params);
  const userId = req.userId;
  const data = req.body;

  const updatedAdmin = await updateAdminAction(id, data, userId);

  if (!updatedAdmin) {
    throw new HttpException(404, 'Admin not found after update');
  }

  return ResponseFormatter.success(
    res,
    mapToAdminResponse(updatedAdmin),
    'Admin updated successfully',
  );
};

const router = Router();
router.patch(
  '/:id',
  requireAuth,
  requirePermission('admins:update'),
  validationMiddleware(adminParamsSchema, 'params'),
  validationMiddleware(updateAdminSchema, 'body'),
  handler,
);

export default router;
