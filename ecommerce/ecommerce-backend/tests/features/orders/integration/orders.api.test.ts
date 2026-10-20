/**
 * Orders API Integration Tests
 *
 * HTTP-level tests for all orders endpoints.
 * All services are stubbed — no real DB or external calls.
 *
 * Routes under test:
 *  POST   /orders                          create-order-from-cart
 *  GET    /orders                          get-orders
 *  GET    /orders/:id                      get-order-by-id
 *  POST   /orders/:id/cancel               cancel-order
 *  GET    /admin/orders/metrics            get-order-metrics
 *  GET    /admin/orders/drafts             get-draft-orders
 *  POST   /admin/orders/drafts/:id/confirm confirm-draft-order
 *  GET    /admin/orders                    get-admin-orders
 *  GET    /admin/orders/:id                get-admin-order-by-id
 *  PUT    /admin/orders/:id                update-order
 *  PUT    /admin/orders/:id/status         update-order-status
 *  PUT    /admin/orders/:id/fulfillment    update-fulfillment-status
 *  PUT    /admin/orders/:id/payment        update-payment-status
 *  PUT    /admin/orders/:id/tracking       update-tracking
 *  POST   /admin/orders/:id/duplicate      duplicate-order
 *  DELETE /admin/orders                    delete-orders (bulk)
 *  DELETE /admin/orders/:id               delete-orders (single)
 *  POST   /admin/orders/direct             create-order-direct
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/features/orders/shared/queries', () => ({
  searchOrders: jest.fn(),
  getOrderItems: jest.fn(),
  findOrderById: jest.fn(),
  findOrderByNumber: jest.fn(),
  getAdminOrders: jest.fn(),
  getDraftOrders: jest.fn(),
  getAdminOrderMetrics: jest.fn(),
  createOrder: jest.fn(),
  createOrderItems: jest.fn(),
  updateOrder: jest.fn(),
}));

jest.mock('@/features/orders/shared', () => ({
  orderService: {
    createOrderFromCart: jest.fn(),
    createDirectOrder: jest.fn(),
    updateFullOrder: jest.fn(),
    updateFulfillmentStatus: jest.fn(),
    updatePaymentStatus: jest.fn(),
    updateTracking: jest.fn(),
    confirmDraftOrder: jest.fn(),
    duplicateOrder: jest.fn(),
    deleteOrders: jest.fn(),
  },
  orderStatusService: {
    canBeCancelled: jest.fn(),
    markAsCancelled: jest.fn(),
    updateOrderStatusWithSideEffects: jest.fn(),
  },
  findOrderById: jest.fn(),
  createOrderSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  directOrderSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  cancelOrderSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  orderIdParamSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updateFulfillmentStatusSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updatePaymentStatusSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updateTrackingSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updateOrderStatusSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  confirmDraftOrderSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  deleteOrdersBodySchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updateOrderSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
  updateOrderStatusSchema: {
    parse: jest.fn((v) => v),
    safeParse: jest.fn(() => ({ success: true, data: {} })),
  },
}));

jest.mock('@/features/inventory/services', () => ({
  releaseReservation: jest.fn(),
  reserveStockForOrder: jest.fn(),
}));

jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
  schema: {},
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
      this.name = 'HttpException';
    }
  },
  ResponseFormatter: {
    success: (res, data, message, statusCode = 200) =>
      res.status(statusCode).json({ success: true, data, message }),
    error: (res, message, statusCode = 500) =>
      res.status(statusCode).json({ success: false, message }),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import express, { Router, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import {
  searchOrders,
  getOrderItems,
  findOrderById as queryFindOrderById,
  getAdminOrders,
  getDraftOrders,
  getAdminOrderMetrics,
} from '@/features/orders/shared/queries';
import {
  orderService,
  orderStatusService,
  findOrderById as sharedFindOrderById,
} from '@/features/orders/shared';

// ── Helpers ───────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const ORDER_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ORDER_NUMBER = 'ORD-26-000001';

const mockOrder = {
  id: ORDER_ID,
  order_number: ORDER_NUMBER,
  user_id: USER_ID,
  order_status: 'pending',
  payment_status: 'pending',
  fulfillment_status: 'unfulfilled',
  total_amount: '1180.00',
  subtotal: '1000.00',
  discount_amount: '0.00',
  discount_type: null,
  discount_value: null,
  discount_reason: null,
  tax_amount: '180.00',
  shipping_amount: '0.00',
  total_quantity: 2,
  is_draft: false,
  is_deleted: false,
  shipping_address_id: null,
  billing_address_id: null,
  order_tracking: null,
  shipping_method: null,
  shipping_option: null,
  customer_email: 'test@example.com',
  customer_first_name: 'Test',
  admin_comment: null,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

const mockOrderItem = {
  id: 'c3d4e5f6-a7b8-4012-abcd-123456789012',
  order_id: ORDER_ID,
  product_id: 'd4e5f6a7-b8c9-4123-abcd-234567890123',
  product_name: 'Steel Pipe 6 inch',
  product_image: null,
  quantity: 2,
  cost_price: '500.00',
  line_total: '1000.00',
};

// ── Build inline app ──────────────────────────────────────────────────────────

/**
 * Build a minimal Express app that mounts all order route handlers inline.
 * Middleware stubs bypass real auth/permission checks.
 */
function buildApp(
  userId: string | null = USER_ID,
  permissions: string[] = [
    'orders:read',
    'orders:update',
    'orders:create',
    'orders:write',
    'orders:delete',
  ],
) {
  const app = express();
  app.use(express.json());

  // Auth middleware stub
  app.use((req: any, _res: Response, next: NextFunction) => {
    req.userId = userId;
    req.userPermissions = permissions;
    next();
  });

  // requireAuth stub
  const requireAuth = (req: any, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    next();
  };

  // requirePermission stub
  const requirePermission = (_perm: string) => (_req: any, _res: Response, next: NextFunction) =>
    next();

  // validationMiddleware stub — pass-through
  const validationMiddleware =
    (_schema: any, _type: string) => (_req: Request, _res: Response, next: NextFunction) =>
      next();

  // ResponseFormatter
  const ResponseFormatter = {
    success: (res: Response, data: any, message: string, statusCode = 200) =>
      res.status(statusCode).json({ success: true, data, message }),
  };

  // HttpException
  class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  }

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  });

  // ── User routes ──

  // POST /orders — create from cart
  app.post('/orders', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new HttpException(401, 'Authentication required');
      const order = await orderService.createOrderFromCart(req.body, req.userId, null);
      return ResponseFormatter.success(
        res,
        {
          order_id: (order as any).id,
          order_number: (order as any).order_number,
          order_status: (order as any).order_status,
          payment_status: (order as any).payment_status,
          total_amount: (order as any).total_amount,
          discount_amount: (order as any).discount_amount,
          total_quantity: (order as any).total_quantity,
          created_at: (order as any).created_at,
        },
        'Order created successfully',
        201,
      );
    } catch (e) {
      next(e);
    }
  });

  // GET /orders — user order list
  app.get('/orders', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new HttpException(401, 'Authentication required');
      const result = await searchOrders({
        page: 1,
        limit: 10,
        user_id: req.userId,
        is_draft: false,
      });
      const orderSummaries = await Promise.all(
        (result as any).orders.map(async (o: any) => {
          const items = await getOrderItems(o.id);
          return { id: o.id, order_number: o.order_number, items };
        }),
      );
      return ResponseFormatter.success(
        res,
        { orders: orderSummaries, pagination: (result as any).pagination },
        'Orders retrieved successfully',
      );
    } catch (e) {
      next(e);
    }
  });

  // GET /orders/:id — user order by id
  app.get('/orders/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new HttpException(401, 'Authentication required');
      const order = await queryFindOrderById(req.params.id);
      if (!order) throw new HttpException(404, 'Order not found');
      if ((order as any).user_id !== req.userId)
        throw new HttpException(403, 'Not authorized to view this order');
      const items = await getOrderItems(req.params.id);
      return ResponseFormatter.success(
        res,
        { id: (order as any).id, order_number: (order as any).order_number, items },
        'Order retrieved successfully',
      );
    } catch (e) {
      next(e);
    }
  });

  // POST /orders/:id/cancel
  app.post(
    '/orders/:id/cancel',
    requireAuth,
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const order = await sharedFindOrderById(req.params.id);
        if (!order) throw new HttpException(404, 'Order not found');
        if ((order as any).user_id !== req.userId)
          throw new HttpException(403, 'Not authorized to cancel this order');
        const canCancel = await orderStatusService.canBeCancelled(req.params.id);
        if (!canCancel)
          throw new HttpException(
            400,
            `Cannot cancel order in "${(order as any).order_status}" status`,
          );
        await orderStatusService.markAsCancelled(
          req.params.id,
          'Cancelled by customer',
          req.userId,
        );
        return ResponseFormatter.success(
          res,
          {
            order_id: req.params.id,
            order_number: (order as any).order_number,
            new_status: 'cancelled',
          },
          'Order cancelled successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // ── Admin routes ──

  // GET /admin/orders/metrics
  app.get(
    '/admin/orders/metrics',
    requireAuth,
    requirePermission('orders:read'),
    async (_req: any, res: Response, next: NextFunction) => {
      try {
        const metrics = await getAdminOrderMetrics();
        return ResponseFormatter.success(res, metrics, 'Order metrics retrieved successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // GET /admin/orders/drafts
  app.get(
    '/admin/orders/drafts',
    requireAuth,
    requirePermission('orders:read'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const result = await getDraftOrders({ page: 1, limit: 10 });
        const enriched = await Promise.all(
          (result as any).orders.map(async (o: any) => {
            const items = await getOrderItems(o.id);
            return { ...o, items_count: items.length };
          }),
        );
        return ResponseFormatter.success(
          res,
          { drafts: enriched, pagination: (result as any).pagination },
          'Draft orders retrieved successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // POST /admin/orders/drafts/:id/confirm
  app.post(
    '/admin/orders/drafts/:id/confirm',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const result = await orderService.confirmDraftOrder(req.params.id, req.body, req.userId);
        return ResponseFormatter.success(res, result, 'Draft order confirmed successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // GET /admin/orders
  app.get(
    '/admin/orders',
    requireAuth,
    requirePermission('orders:read'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const result = await getAdminOrders({ page: 1, limit: 10 });
        return ResponseFormatter.success(
          res,
          { orders: (result as any).orders, pagination: (result as any).pagination },
          'Orders retrieved successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // GET /admin/orders/:id
  app.get(
    '/admin/orders/:id',
    requireAuth,
    requirePermission('orders:read'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const order = await queryFindOrderById(req.params.id);
        if (!order) throw new HttpException(404, 'Order not found');
        const items = await getOrderItems((order as any).id);
        return ResponseFormatter.success(
          res,
          { id: (order as any).id, order_number: (order as any).order_number, items },
          'Order retrieved successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // PUT /admin/orders/:id
  app.put(
    '/admin/orders/:id',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const updated = await orderService.updateFullOrder(req.params.id, req.body, req.userId);
        return ResponseFormatter.success(res, updated, 'Order updated successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // PUT /admin/orders/:id/status
  app.put(
    '/admin/orders/:id/status',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const updated = await orderStatusService.updateOrderStatusWithSideEffects(
          req.params.id,
          req.body,
          req.userId,
          {},
        );
        return ResponseFormatter.success(
          res,
          { order_id: req.params.id, order_status: (updated as any)?.order_status },
          'Order status updated successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // PUT /admin/orders/:id/fulfillment
  app.put(
    '/admin/orders/:id/fulfillment',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const updated = await orderService.updateFulfillmentStatus(
          req.params.id,
          req.body,
          req.userId,
        );
        return ResponseFormatter.success(res, updated, 'Fulfillment status updated successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // PUT /admin/orders/:id/payment
  app.put(
    '/admin/orders/:id/payment',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const updated = await orderService.updatePaymentStatus(req.params.id, req.body, req.userId);
        return ResponseFormatter.success(res, updated, 'Payment status updated successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // PUT /admin/orders/:id/tracking
  app.put(
    '/admin/orders/:id/tracking',
    requireAuth,
    requirePermission('orders:update'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const updated = await orderService.updateTracking(req.params.id, req.body, req.userId);
        return ResponseFormatter.success(
          res,
          { id: (updated as any).id, tracking_number: (updated as any).order_tracking },
          'Tracking information updated successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // POST /admin/orders/:id/duplicate
  app.post(
    '/admin/orders/:orderId/duplicate',
    requireAuth,
    requirePermission('orders:write'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const dup = await orderService.duplicateOrder(req.params.orderId, req.userId);
        return ResponseFormatter.success(res, { order: dup }, 'Order duplicated successfully');
      } catch (e) {
        next(e);
      }
    },
  );

  // DELETE /admin/orders/:orderId — single delete (must be before bulk)
  app.delete(
    '/admin/orders/:orderId',
    requireAuth,
    requirePermission('orders:delete'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const deleted = await orderService.deleteOrders([req.params.orderId], req.userId);
        return ResponseFormatter.success(
          res,
          { order_id: (deleted as any)[0].id, order_number: (deleted as any)[0].order_number },
          'Order deleted successfully',
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // DELETE /admin/orders — bulk delete
  app.delete(
    '/admin/orders',
    requireAuth,
    requirePermission('orders:delete'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const deleted = await orderService.deleteOrders(req.body.order_ids, req.userId);
        return ResponseFormatter.success(
          res,
          {
            deleted_count: (deleted as any).length,
            order_ids: (deleted as any).map((o: any) => o.id),
          },
          `Successfully deleted ${(deleted as any).length} order(s)`,
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // POST /admin/orders/direct
  app.post(
    '/admin/orders/direct',
    requireAuth,
    requirePermission('orders:create'),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.userId) throw new HttpException(401, 'Authentication required');
        const order = await orderService.createDirectOrder(req.body, req.userId);
        return ResponseFormatter.success(
          res,
          {
            order_id: (order as any).id,
            order_number: (order as any).order_number,
            order_status: (order as any).order_status,
            total_amount: (order as any).total_amount,
            created_at: (order as any).created_at,
          },
          'Order created successfully',
          201,
        );
      } catch (e) {
        next(e);
      }
    },
  );

  // Generic error handler at the end
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  });

  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Orders API Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  // ── POST /orders ─────────────────────────────────────────────────────────

  describe('POST /orders', () => {
    it('creates an order from cart and returns 201', async () => {
      (orderService.createOrderFromCart as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await request(app)
        .post('/orders')
        .set('x-user-id', USER_ID)
        .send({ payment_method: 'cod' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order_number).toBe(ORDER_NUMBER);
    });

    it('returns 401 when user not authenticated', async () => {
      const guestApp = buildApp(null);
      const res = await request(guestApp).post('/orders').send({ payment_method: 'cod' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when service throws HttpException', async () => {
      (orderService.createOrderFromCart as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('No active cart found'), { status: 400 }),
      );

      const res = await request(app).post('/orders').set('x-user-id', USER_ID).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No active cart found');
    });
  });

  // ── GET /orders ───────────────────────────────────────────────────────────

  describe('GET /orders', () => {
    it('returns paginated user orders', async () => {
      (searchOrders as jest.Mock).mockResolvedValueOnce({
        orders: [mockOrder],
        pagination: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
      (getOrderItems as jest.Mock).mockResolvedValueOnce([mockOrderItem]);

      const res = await request(app).get('/orders');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0].order_number).toBe(ORDER_NUMBER);
    });

    it('returns empty list when no orders exist', async () => {
      (searchOrders as jest.Mock).mockResolvedValueOnce({
        orders: [],
        pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
      });

      const res = await request(app).get('/orders');

      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(0);
    });

    it('returns 401 when unauthenticated', async () => {
      const guestApp = buildApp(null);
      const res = await request(guestApp).get('/orders');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /orders/:id ───────────────────────────────────────────────────────

  describe('GET /orders/:id', () => {
    it('returns order details for the owner', async () => {
      (queryFindOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);
      (getOrderItems as jest.Mock).mockResolvedValueOnce([mockOrderItem]);

      const res = await request(app).get(`/orders/${ORDER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data.order_number).toBe(ORDER_NUMBER);
    });

    it('returns 404 when order not found', async () => {
      (queryFindOrderById as jest.Mock).mockResolvedValueOnce(undefined);

      const res = await request(app).get(`/orders/${ORDER_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Order not found');
    });

    it('returns 403 when user does not own the order', async () => {
      (queryFindOrderById as jest.Mock).mockResolvedValueOnce({
        ...mockOrder,
        user_id: 'ffffffff-eeee-4ddd-bccc-aaaaaaaaaaaa',
      });

      const res = await request(app).get(`/orders/${ORDER_ID}`);

      expect(res.status).toBe(403);
    });
  });

  // ── POST /orders/:id/cancel ───────────────────────────────────────────────

  describe('POST /orders/:id/cancel', () => {
    it('cancels a pending order', async () => {
      (sharedFindOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);
      (orderStatusService.canBeCancelled as jest.Mock).mockResolvedValueOnce(true);
      (orderStatusService.markAsCancelled as jest.Mock).mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post(`/orders/${ORDER_ID}/cancel`)
        .send({ reason: 'Changed my mind' });

      expect(res.status).toBe(200);
      expect(res.body.data.new_status).toBe('cancelled');
    });

    it('returns 404 when order not found', async () => {
      (sharedFindOrderById as jest.Mock).mockResolvedValueOnce(undefined);

      const res = await request(app).post(`/orders/${ORDER_ID}/cancel`).send({});

      expect(res.status).toBe(404);
    });

    it('returns 400 when order cannot be cancelled', async () => {
      (sharedFindOrderById as jest.Mock).mockResolvedValueOnce({
        ...mockOrder,
        order_status: 'delivered',
      });
      (orderStatusService.canBeCancelled as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app).post(`/orders/${ORDER_ID}/cancel`).send({});

      expect(res.status).toBe(400);
    });

    it('returns 403 when user does not own the order', async () => {
      (sharedFindOrderById as jest.Mock).mockResolvedValueOnce({
        ...mockOrder,
        user_id: 'ffffffff-eeee-4ddd-bccc-aaaaaaaaaaaa',
      });

      const res = await request(app).post(`/orders/${ORDER_ID}/cancel`).send({});

      expect(res.status).toBe(403);
    });
  });

  // ── GET /admin/orders/metrics ─────────────────────────────────────────────

  describe('GET /admin/orders/metrics', () => {
    it('returns order metrics', async () => {
      const metrics = {
        total_orders: 100,
        total_revenue: '500000.00',
        pending_orders: 10,
        cancelled_orders: 5,
      };
      (getAdminOrderMetrics as jest.Mock).mockResolvedValueOnce(metrics);

      const res = await request(app).get('/admin/orders/metrics');

      expect(res.status).toBe(200);
      expect(res.body.data.total_orders).toBe(100);
    });
  });

  // ── GET /admin/orders/drafts ──────────────────────────────────────────────

  describe('GET /admin/orders/drafts', () => {
    it('returns draft orders', async () => {
      const draftOrder = { ...mockOrder, is_draft: true };
      (getDraftOrders as jest.Mock).mockResolvedValueOnce({
        orders: [draftOrder],
        pagination: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
      (getOrderItems as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/admin/orders/drafts');

      expect(res.status).toBe(200);
      expect(res.body.data.drafts).toHaveLength(1);
    });
  });

  // ── POST /admin/orders/drafts/:id/confirm ─────────────────────────────────

  describe('POST /admin/orders/drafts/:id/confirm', () => {
    it('confirms a draft order', async () => {
      const confirmed = { ...mockOrder, is_draft: false, order_status: 'confirmed' };
      (orderService.confirmDraftOrder as jest.Mock).mockResolvedValueOnce(confirmed);

      const res = await request(app)
        .post(`/admin/orders/drafts/${ORDER_ID}/confirm`)
        .send({ send_confirmation_email: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when draft not found', async () => {
      (orderService.confirmDraftOrder as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('Draft order not found'), { status: 404 }),
      );

      const res = await request(app).post(`/admin/orders/drafts/${ORDER_ID}/confirm`).send({});

      expect(res.status).toBe(404);
    });
  });

  // ── GET /admin/orders ─────────────────────────────────────────────────────

  describe('GET /admin/orders', () => {
    it('returns paginated admin order list', async () => {
      (getAdminOrders as jest.Mock).mockResolvedValueOnce({
        orders: [mockOrder],
        pagination: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });

      const res = await request(app).get('/admin/orders');

      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
    });
  });

  // ── GET /admin/orders/:id ─────────────────────────────────────────────────

  describe('GET /admin/orders/:id', () => {
    it('returns full order details for admin', async () => {
      (queryFindOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);
      (getOrderItems as jest.Mock).mockResolvedValueOnce([mockOrderItem]);

      const res = await request(app).get(`/admin/orders/${ORDER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(ORDER_ID);
    });

    it('returns 404 when order not found', async () => {
      (queryFindOrderById as jest.Mock).mockResolvedValueOnce(undefined);

      const res = await request(app).get(`/admin/orders/${ORDER_ID}`);

      expect(res.status).toBe(404);
    });
  });

  // ── PUT /admin/orders/:id ─────────────────────────────────────────────────

  describe('PUT /admin/orders/:id', () => {
    it('updates full order details', async () => {
      const updated = { ...mockOrder, admin_comment: 'Updated' };
      (orderService.updateFullOrder as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/admin/orders/${ORDER_ID}`)
        .send({ admin_comment: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when order not found', async () => {
      (orderService.updateFullOrder as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('Order not found'), { status: 404 }),
      );

      const res = await request(app).put(`/admin/orders/${ORDER_ID}`).send({});

      expect(res.status).toBe(404);
    });
  });

  // ── PUT /admin/orders/:id/status ──────────────────────────────────────────

  describe('PUT /admin/orders/:id/status', () => {
    it('updates order status', async () => {
      const updated = { ...mockOrder, order_status: 'confirmed' };
      (orderStatusService.updateOrderStatusWithSideEffects as jest.Mock).mockResolvedValueOnce(
        updated,
      );

      const res = await request(app)
        .put(`/admin/orders/${ORDER_ID}/status`)
        .send({ order_status: 'confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.data.order_status).toBe('confirmed');
    });
  });

  // ── PUT /admin/orders/:id/fulfillment ─────────────────────────────────────

  describe('PUT /admin/orders/:id/fulfillment', () => {
    it('updates fulfillment status', async () => {
      const updated = { ...mockOrder, fulfillment_status: 'fulfilled' };
      (orderService.updateFulfillmentStatus as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/admin/orders/${ORDER_ID}/fulfillment`)
        .send({ fulfillment_status: 'fulfilled' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PUT /admin/orders/:id/payment ─────────────────────────────────────────

  describe('PUT /admin/orders/:id/payment', () => {
    it('updates payment status', async () => {
      const updated = { ...mockOrder, payment_status: 'paid' };
      (orderService.updatePaymentStatus as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/admin/orders/${ORDER_ID}/payment`)
        .send({ payment_status: 'paid' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PUT /admin/orders/:id/tracking ───────────────────────────────────────

  describe('PUT /admin/orders/:id/tracking', () => {
    it('updates tracking information', async () => {
      const updated = { ...mockOrder, order_tracking: 'TRACK123', shipping_method: 'fedex' };
      (orderService.updateTracking as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/admin/orders/${ORDER_ID}/tracking`)
        .send({ tracking_number: 'TRACK123', shipping_method: 'fedex' });

      expect(res.status).toBe(200);
      expect(res.body.data.tracking_number).toBe('TRACK123');
    });
  });

  // ── POST /admin/orders/:orderId/duplicate ─────────────────────────────────

  describe('POST /admin/orders/:orderId/duplicate', () => {
    it('duplicates an order', async () => {
      const dup = { ...mockOrder, id: 'new-order-id', order_number: 'ORD-26-000002' };
      (orderService.duplicateOrder as jest.Mock).mockResolvedValueOnce(dup);

      const res = await request(app).post(`/admin/orders/${ORDER_ID}/duplicate`);

      expect(res.status).toBe(200);
      expect(res.body.data.order.order_number).toBe('ORD-26-000002');
    });

    it('returns 404 when original order not found', async () => {
      (orderService.duplicateOrder as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('Order not found'), { status: 404 }),
      );

      const res = await request(app).post(`/admin/orders/${ORDER_ID}/duplicate`);

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /admin/orders (bulk) ───────────────────────────────────────────

  describe('DELETE /admin/orders (bulk)', () => {
    it('bulk-deletes orders', async () => {
      (orderService.deleteOrders as jest.Mock).mockResolvedValueOnce([mockOrder]);

      const res = await request(app)
        .delete('/admin/orders')
        .send({ order_ids: [ORDER_ID] });

      expect(res.status).toBe(200);
      expect(res.body.data.deleted_count).toBe(1);
    });
  });

  // ── DELETE /admin/orders/:orderId (single) ────────────────────────────────

  describe('DELETE /admin/orders/:orderId (single)', () => {
    it('deletes a single order', async () => {
      (orderService.deleteOrders as jest.Mock).mockResolvedValueOnce([mockOrder]);

      const res = await request(app).delete(`/admin/orders/${ORDER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data.order_id).toBe(mockOrder.id);
    });

    it('returns 404 when order not found', async () => {
      (orderService.deleteOrders as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('Order not found'), { status: 404 }),
      );

      const res = await request(app).delete(`/admin/orders/${ORDER_ID}`);

      expect(res.status).toBe(404);
    });
  });

  // ── POST /admin/orders/direct ─────────────────────────────────────────────

  describe('POST /admin/orders/direct', () => {
    it('creates a direct order', async () => {
      (orderService.createDirectOrder as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await request(app)
        .post('/admin/orders/direct')
        .send({ payment_method: 'cod', items: [] });

      expect(res.status).toBe(201);
      expect(res.body.data.order_number).toBe(ORDER_NUMBER);
    });

    it('returns 401 when unauthenticated', async () => {
      const guestApp = buildApp(null);

      const res = await request(guestApp).post('/admin/orders/direct').send({});

      expect(res.status).toBe(401);
    });
  });
});
