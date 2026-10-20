/**
 * GET /api/users/:id
 * Retrieve user profile by ID.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requireOwnerOrPermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { sanitizeUser } from '../shared/interface';
import { HttpException } from '../../../utils';
import { findUserById } from '../shared/queries';
import { IUser } from '../shared/interface';
import { userIdParamsSchema } from '../shared/validation';

async function getUserById(id: string): Promise<IUser> {
  const user = await findUserById(id);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  return user as IUser;
}

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };

  const user = await getUserById(id);
  const userResponse = sanitizeUser(user);

  ResponseFormatter.success(res, userResponse, 'User retrieved successfully');
};

const router = Router();
router.get(
  '/:id',
  requireAuth,
  validationMiddleware(userIdParamsSchema, 'params'),
  requireOwnerOrPermission('id', 'users:read'),
  handler,
);

export default router;
