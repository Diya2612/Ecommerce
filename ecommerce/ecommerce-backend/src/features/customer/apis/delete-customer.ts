/**
 * DELETE /customer/:id
 * Soft deletes a customer and invalidates their cache.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { customerService } from '../services/customer.service';
import { customerCacheService } from '../services/customer-cache.service';
import { customerIdParamsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.userId) throw new HttpException(401, 'Unauthorized');

  await customerService.deleteCustomer(id, req.userId);
  await customerCacheService.invalidateCustomer(id);

  ResponseFormatter.success(res, null, 'Customer deleted successfully');
};

const router = Router();

router.delete(
  '/customer/:id',
  requireAuth,
  requirePermission('users:delete'),
  validationMiddleware(customerIdParamsSchema, 'params'),
  handler,
);

export default router;
