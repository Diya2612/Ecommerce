/**
 * PUT /customer/:id
 * Updates customer profile and user data, triggering audit logs and cache invalidation.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { customerService } from '../services/customer.service';
import { customerCacheService } from '../services/customer-cache.service';
import { updateCustomerSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const data = req.body;

  const result = await customerService.updateCustomer(id, data, req.userId, {
    ipAddress: req.ip || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  await customerCacheService.invalidateCustomer(id);

  ResponseFormatter.success(res, result, 'Customer updated successfully');
};

const router = Router();
router.put(
  '/customer/:id',
  requireAuth,
  validationMiddleware(updateCustomerSchema, 'body'),
  requirePermission('users:update'),
  handler,
);

export default router;
