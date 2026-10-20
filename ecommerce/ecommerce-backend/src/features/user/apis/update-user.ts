/**
 * PUT /api/users/:id
 * Update user profile information.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { sanitizeUser } from '../shared/interface';
import { HttpException } from '../../../utils';
import { userService } from '../services/user.service';
import { updateUserSchema, userIdParamsSchema, type UpdateUserDto } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new HttpException(401, 'User authentication required');
  }

  const { id } = userIdParamsSchema.parse(req.params);
  const updateData: UpdateUserDto = req.body;

  const user = await userService.updateCoreUser(id, updateData, userId);
  const userResponse = sanitizeUser(user);

  ResponseFormatter.success(res, userResponse, 'User updated successfully');
};

const meHandler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new HttpException(401, 'User authentication required');
  }

  const updateData: UpdateUserDto = req.body;

  const user = await userService.updateCoreUser(userId, updateData, userId);
  const userResponse = sanitizeUser(user);

  ResponseFormatter.success(res, userResponse, 'Profile updated successfully');
};

const router = Router();

router.put('/me', requireAuth, validationMiddleware(updateUserSchema), meHandler);

router.put(
  '/:id',
  requireAuth,
  validationMiddleware(updateUserSchema),
  validationMiddleware(userIdParamsSchema, 'params'),
  handler,
);

export default router;
