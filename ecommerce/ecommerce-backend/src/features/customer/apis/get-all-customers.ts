/**
 * GET /
 * Retrieves a paginated list of customers with advanced filtering and search.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { customerService } from '../services/customer.service';
import { getAllCustomersQuerySchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { page, limit, ...filters } = req.query as unknown as z.infer<
    typeof getAllCustomersQuerySchema
  >;

  const { users, total } = await customerService.getCustomers(page, limit, filters);

  ResponseFormatter.success(
    res,
    {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Customers retrieved successfully',
  );
};

const router = Router();
router.get(
  '/',
  requireAuth,
  requirePermission('users:read'),
  validationMiddleware(getAllCustomersQuerySchema, 'query'),
  handler,
);

export default router;
