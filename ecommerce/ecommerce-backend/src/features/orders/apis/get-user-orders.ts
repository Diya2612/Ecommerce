/**
 * GET /api/users/:userId/orders
 * Get user orders
 * - Users can view their own orders
 * - Users with orders:read permission can view any user's orders
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, uuidSchema, paginationSchema } from '../../../utils';
import { searchOrders, getOrderItems } from '../shared/queries';
import { ISimpleOrderItemResponse, ISimpleOrderResponse } from '../shared/interface';

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const paramsSchema = z.object({
  userId: uuidSchema,
});

const querySchema = paginationSchema;

const handler = async (req: RequestWithUser, res: Response) => {
  const { userId } = req.params as unknown as { userId: string };
  const { page, limit } = req.query as unknown as z.infer<typeof querySchema>;

  // Use query function to get user orders
  const result = await searchOrders({
    page,
    limit,
    user_id: userId,
    is_draft: false,
  });

  // Fetch items for these orders and map to response format
  const ordersWithItems = await Promise.all(
    result.orders.map(async (order) => {
      const items = await getOrderItems(order.id);

      const orderItemsMapped: ISimpleOrderItemResponse[] = items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.line_total),
        image: item.product_image || '',
      }));

      // Format dates and map to response
      const orderResponse: ISimpleOrderResponse = {
        id: order.order_number,
        date: formatDate(order.created_at),
        status: order.order_status,
        total: Number(order.total_amount),
        deliveryDate: undefined, // Not available in searchOrders result
        trackingNumber: undefined, // Not available in searchOrders result
        items: orderItemsMapped,
      };

      return orderResponse;
    }),
  );

  ResponseFormatter.paginated(
    res,
    ordersWithItems,
    {
      page,
      limit,
      total: result.pagination.total,
    },
    'Orders retrieved successfully',
  );
};

const router = Router();
router.get(
  '/:userId/orders',
  requireAuth,
  validationMiddleware(paramsSchema, 'params'),
  validationMiddleware(querySchema, 'query'),
  requireOwnerOrPermission('userId', 'orders:read'), // specific permission check: user sees own, or admin with perm sees others
  handler,
);

export default router;
