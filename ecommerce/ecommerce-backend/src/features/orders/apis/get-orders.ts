/**
 * GET /api/orders
 * Get user's order history with pagination
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { HttpException, logger } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { searchOrders, getOrderItems } from '../shared/queries';
import { getOrdersQuerySchema, GetOrdersQuery } from '../shared/validation';
import { IOrderListItem, IOrderItemSummary } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  logger.info(`[GetOrders] Request received for user: ${userId}`);
  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const { page, limit, status } = req.query as unknown as GetOrdersQuery;

  logger.info(
    `[GetOrders] Fetching orders - Page: ${page}, Limit: ${limit}, Status: ${status || 'all'}`,
  );

  // Use query function to get user orders
  const result = await searchOrders({
    page,
    limit,
    user_id: userId,
    status,
    is_draft: false,
  });

  logger.info(`[GetOrders] Total orders found: ${result.pagination.total}`);

  // Build order list items with all fields the frontend expects
  const orderSummaries: (IOrderListItem & { items_count: number; items: IOrderItemSummary[] })[] =
    await Promise.all(
      result.orders.map(async (order) => {
        const items = await getOrderItems(order.id);

        const itemSummaries: IOrderItemSummary[] = items.map((item) => ({
          id: item.id,
          product_name: item.product_name,
          product_image_url: item.product_image,
          quantity: item.quantity,
          unit_price: item.cost_price,
          line_total: item.line_total,
        }));

        return {
          id: order.id,
          order_number: order.order_number,
          order_status: order.order_status,
          payment_status: order.payment_status,
          payment_method: order.payment_method ?? null,
          fulfillment_status: order.fulfillment_status,
          total_amount: order.total_amount,
          total_quantity: order.total_quantity,
          currency: order.currency,
          customer_name: order.customer_first_name
            ? `${order.customer_first_name} ${order.customer_last_name ?? ''}`.trim()
            : null,
          customer_email: order.customer_email ?? null,
          created_at: order.created_at,
          updated_at: order.updated_at,
          is_draft: order.is_draft,
          items_count: items.length,
          items: itemSummaries,
        };
      }),
    );

  return ResponseFormatter.success(
    res,
    {
      orders: orderSummaries,
      pagination: result.pagination,
    },
    'Orders retrieved successfully',
  );
};

const router = Router();
router.get('/', requireAuth, validationMiddleware(getOrdersQuerySchema, 'query'), handler);

export default router;
