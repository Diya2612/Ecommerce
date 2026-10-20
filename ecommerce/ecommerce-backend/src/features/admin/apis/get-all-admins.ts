/**
 * GET /api/admins
 * Retrieve all admins with filtering and pagination.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger } from '../../../utils';
import { getAllAdmins } from '../services/admin.service';
import { adminQuerySchema } from '../shared/validation';
import { IAdminFilters, mapToAdminResponse } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  const query = req.query as unknown as IAdminFilters;
  logger.info('GET /admins request received', { query });

  const result = await getAllAdmins(query);
  logger.info(`Found ${result.admins.length} admins`);

  return ResponseFormatter.success(
    res,
    {
      data: result.admins.map(mapToAdminResponse),
      pagination: {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (Number(query.limit) || 10)),
      },
    },
    'Admins retrieved successfully',
  );
};

const router = Router();
router.get(
  '/',
  requireAuth,
  requirePermission('admins:read'),
  validationMiddleware(adminQuerySchema, 'query'),
  handler,
);

export default router;
