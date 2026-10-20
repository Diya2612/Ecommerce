/**
 * GET /api/admin/orders/drafts
 * Get all draft orders with pagination and filtering
 */

import { Router, Response } from 'express';
import { ResponseFormatter, logger } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { getDraftOrders, getOrderItems } from '../shared/queries';
import { draftOrdersQuerySchema, DraftOrdersQuery } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const params = req.query as unknown as DraftOrdersQuery;

  logger.info('GET /api/admin/orders/drafts', { params });

  // Use query function to get draft orders
  const result = await getDraftOrders({
    page: params.page,
    limit: params.limit,
    search: params.search,
    from_date: params.from_date,
    to_date: params.to_date,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
  });

  // Enrich with items count and preview
  const enrichedOrders = await Promise.all(
    result.orders.map(async (order) => {
      const items = await getOrderItems(order.id);

      return {
        id: order.id,
        order_number: order.order_number,
        order_status: order.order_status,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        total_quantity: order.total_quantity,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user_id: order.user_id,
        customer_email: order.customer_email,
        customer_name: order.customer_first_name,
        items_count: items.length,
        items_preview: items.slice(0, 3).map((item) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          line_total: item.line_total,
        })),
      };
    }),
  );

  return ResponseFormatter.success(
    res,
    {
      drafts: enrichedOrders,
      pagination: result.pagination,
    },
    'Draft orders retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/orders/drafts',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(draftOrdersQuerySchema, 'query'),
  handler,
);

export default router;
