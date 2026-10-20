/**
 * GET /api/admin/orders
 * Admin: Get all orders with filters
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { getAdminOrders } from '../shared/queries';
import { adminOrdersQuerySchema, AdminOrdersQuery } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const params = req.query as unknown as AdminOrdersQuery;

  // Use the query function to get orders with all filters
  const result = await getAdminOrders({
    page: params.page,
    limit: params.limit,
    status: params.status,
    payment_status: params.payment_status,
    fulfillment_status: params.fulfillment_status,
    from_date: params.from_date,
    to_date: params.to_date,
    search: params.search,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
    amount_ranges: params.amount_ranges,
    item_ranges: params.item_ranges,
    user_id: params.user_id,
  });

  return ResponseFormatter.success(
    res,
    {
      orders: result.orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        order_status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        fulfillment_status: order.fulfillment_status,
        total_amount: order.total_amount,
        total_quantity: order.total_quantity,
        created_at: order.created_at,
        user_id: order.user_id,
        customer_email: order.customer_email,
        customer_name: order.customer_first_name,
      })),
      pagination: result.pagination,
    },
    'Orders retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/orders',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(adminOrdersQuerySchema, 'query'),
  handler,
);

export default router;
