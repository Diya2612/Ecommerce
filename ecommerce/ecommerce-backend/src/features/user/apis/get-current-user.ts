/**
 * GET /api/users/me
 * Retrieve current user's profile.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { sanitizeUser } from '../shared/interface';
import { HttpException } from '../../../utils';
import { findUserById } from '../shared/queries';
import { IUser } from '../shared/interface';

async function getCurrentUser(id: string): Promise<IUser> {
  const user = await findUserById(id);

  if (!user) {
    throw new HttpException(404, 'User not found');
  }

  return user as IUser;
}

const handler = async (req: RequestWithUser, res: Response) => {
  if (!req.userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const user = await getCurrentUser(req.userId);
  const userResponse = sanitizeUser(user);

  ResponseFormatter.success(res, userResponse, 'User retrieved successfully');
};

const router = Router();
router.get('/me', requireAuth, handler);

export default router;
