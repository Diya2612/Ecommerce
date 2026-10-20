/**
 * DELETE /api/users/:id
 * Soft-delete a user (Admin only).
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { userService } from '../services/user.service';
import { userIdParamsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = userIdParamsSchema.parse(req.params);
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'User authentication required');
  }

  await userService.softDeleteUser(id, userId);

  ResponseFormatter.success(res, null, 'User deleted successfully');
};

const router = Router();
router.delete(
  '/:id',
  requireAuth,
  requirePermission('users:delete'),
  validationMiddleware(userIdParamsSchema, 'params'),
  handler,
);

export default router;
