/**
 * GET /customer/:id
 * Retrieves rich profile data (User + Profile + Addresses) from cache or database.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException } from '../../../utils';
import { customerCacheService } from '../services/customer-cache.service';
import { customerIdParamsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await customerCacheService.getCustomerById(id);
  if (!result) throw new HttpException(404, 'Customer not found');

  ResponseFormatter.success(res, result, 'Customer retrieved successfully');
};

const router = Router();
router.get(
  '/customer/:id',
  requireAuth,
  validationMiddleware(customerIdParamsSchema, 'params'),
  requirePermission('users:read'),
  handler,
);

export default router;
