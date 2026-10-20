/**
 * GET /api/admin/abandoned-carts/email-templates
 * Admin: Get email templates for abandoned cart recovery
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getActiveEmailTemplatesByCategory } from '../shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';

const handler = async (req: RequestWithUser, res: Response) => {
  // Get all active abandoned cart email templates
  const templates = await getActiveEmailTemplatesByCategory('abandoned-cart');

  return ResponseFormatter.success(
    res,
    {
      templates,
      total: templates.length,
    },
    'Email templates retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/abandoned-carts/email-templates',
  requireAuth,
  requirePermission('orders:read'),
  handler,
);

export default router;
