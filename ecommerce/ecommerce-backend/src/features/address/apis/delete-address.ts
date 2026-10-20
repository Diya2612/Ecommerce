/**
 * DELETE /api/users/:userId/addresses/:id
 * Remove a user address (soft delete).
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { deleteAddressParamsSchema } from '../shared/validation';
import { deleteAddress } from '../services/address.service';

const handler = async (req: RequestWithUser, res: Response) => {
  let { userId } = req.params as { userId: string };
  const { id: addressId } = req.params as { id: string };

  if (userId === 'me') {
    if (!req.userId) {
      throw new HttpException(401, 'Authentication required');
    }
    userId = req.userId;
  }

  await deleteAddress(userId, addressId, {
    requestUserId: req.userId,
    ipAddress: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  ResponseFormatter.success(res, null, 'Address deleted successfully');
};

const router = Router();
router.delete(
  '/:userId/addresses/:id',
  requireAuth,
  validationMiddleware(deleteAddressParamsSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:delete'),
  handler,
);

export default router;
