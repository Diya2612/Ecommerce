/**
 * POST /api/admins
 * Create a new admin user and organizational profile.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { createAdminAction } from '../services/admin.service';
import { createAdminSchema } from '../shared/validation';
import { mapToAdminResponse } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  const data = req.body;
  const userId = req.userId;

  const newAdmin = await createAdminAction(data, userId);

  return ResponseFormatter.success(
    res,
    mapToAdminResponse(newAdmin),
    'Admin created successfully',
    201,
  );
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('admins:create'),
  validationMiddleware(createAdminSchema, 'body'),
  handler,
);

export default router;
