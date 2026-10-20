/**
 * Payments API Integration Tests (Mocked)
 * Tests for all payment endpoints with mocked service layer
 */

import request from 'supertest';
import express from 'express';

const TEST_USER_ID = 'user-uuid-1';
const TEST_ORDER_ID = 'order-uuid-1';
const TEST_PAYMENT_ID = 'pay_test123456';
const TEST_RAZORPAY_ORDER_ID = 'order_test123456';
const TEST_TRANSACTION_ID = 'txn-123456';

jest.mock('@/middlewares', () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).userId = TEST_USER_ID;
    next();
  },
  requirePermission:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
}));

jest.mock('@/utils', () => ({
  ResponseFormatter: {
    success: jest.fn((res: express.Response, data: any, message: string, status = 200) => {
      res.status(status).json({ success: true, data, message });
    }),
    error: jest.fn((res: express.Response, message: string, status = 500) => {
      res.status(status).json({ success: false, message });
    }),
  },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('@/features/payments/services/razorpay.service', () => ({
  RazorpayService: {
    createOrder: jest.fn(),
    verifyPaymentSignature: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    getKeyId: jest.fn().mockReturnValue('rzp_test_key'),
    isTestMode: jest.fn().mockReturnValue(true),
    getPayment: jest.fn(),
    createRefund: jest.fn(),
  },
}));

jest.mock('@/features/payments/services/payment-lock.service', () => ({
  paymentLockService: {
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    isLocked: jest.fn(),
  },
}));

jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    transaction: jest.fn(),
    limit: jest.fn(),
    query: {
      orders: { findFirst: jest.fn() },
      paymentTransactions: { findFirst: jest.fn() },
    },
  },
}));

jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn().mockResolvedValue(undefined) },
}));

const mockRazorpayOrder = {
  id: TEST_RAZORPAY_ORDER_ID,
  entity: 'order',
  amount: 100000,
  amount_paid: 0,
  amount_due: 100000,
  currency: 'INR',
  receipt: TEST_ORDER_ID,
  status: 'created',
  attempts: 0,
  notes: {},
  created_at: Date.now(),
};

describe('Payments API Integration Tests (Mocked)', () => {
  let app: express.Application;
  let razorpayServiceMock: any;
  let paymentLockServiceMock: any;
  let dbMock: any;

  beforeAll(async () => {
    app = express();
    app.use(
      express.json({
        verify: (req: any, _res, buf) => {
          req.rawBody = buf.toString();
        },
      }),
    );

    const { RazorpayService } = await import('@/features/payments/services/razorpay.service');
    razorpayServiceMock = RazorpayService;

    const { paymentLockService } =
      await import('@/features/payments/services/payment-lock.service');
    paymentLockServiceMock = paymentLockService;

    const { db } = await import('@/database');
    dbMock = db;

    // Instantiate the route class and use its router (not the class itself)
    const { default: PaymentsRoute } = await import('@/features/payments/index');
    const paymentsRoute = new PaymentsRoute();
    app.use('/api', paymentsRoute.router);

    // Register Webhook Handler
    const { default: webhookRouter } = await import('@/features/payments/apis/webhook-handler');
    app.use('/api/webhooks/razorpay', webhookRouter);

    // Allow async initializeRoutes() to complete before tests run
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Restore critical mock implementations to prevent timeouts/errors
    const { ResponseFormatter } = jest.requireMock('@/utils');
    const { RazorpayService } = jest.requireMock('@/features/payments/services/razorpay.service');
    const { paymentLockService } = jest.requireMock(
      '@/features/payments/services/payment-lock.service',
    );

    // ResponseFormatter defaults
    (ResponseFormatter.success as jest.Mock).mockImplementation(
      (res: express.Response, data: any, message: string, status = 200) => {
        res.status(status).json({ success: true, data, message });
      },
    );
    (ResponseFormatter.error as jest.Mock).mockImplementation(
      (res: express.Response, message: string, status = 500) => {
        res.status(status).json({ success: false, message });
      },
    );

    // Razorpay defaults
    (RazorpayService.getKeyId as jest.Mock).mockReturnValue('rzp_test_key');
    (RazorpayService.isTestMode as jest.Mock).mockReturnValue(true);

    // Lock defaults
    (paymentLockService.acquireLock as jest.Mock).mockResolvedValue(true);
    (paymentLockService.releaseLock as jest.Mock).mockResolvedValue(undefined);

    // Database defaults
    // Default: Transaction found
    (dbMock.query.paymentTransactions.findFirst as jest.Mock).mockResolvedValue({
      id: TEST_TRANSACTION_ID,
      order_id: TEST_ORDER_ID,
      status: 'initiated',
      webhook_verified: false,
      razorpay_order_id: TEST_RAZORPAY_ORDER_ID,
    });

    // Default: Order found
    (dbMock.limit as jest.Mock).mockResolvedValue([
      {
        id: TEST_ORDER_ID,
        user_id: TEST_USER_ID,
        status: 'pending',
        is_deleted: false,
        total_amount: 1000,
        payment_status: 'pending',
        order_number: 'ORD-123456',
        cart_id: 'cart-123',
      },
    ]);
  });

  // ==================== POST /api/payments/create-order ====================

  describe('POST /api/payments/create-order', () => {
    it('should create a Razorpay order successfully', async () => {
      razorpayServiceMock.createOrder.mockResolvedValue(mockRazorpayOrder);

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({
          order_id: TEST_ORDER_ID,
          amount: 100000,
          currency: 'INR',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(razorpayServiceMock.createOrder).toHaveBeenCalledTimes(1);
    });

    it('should reject request with missing order_id', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ amount: 100000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid amount', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ order_id: TEST_ORDER_ID, amount: -100 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle Razorpay API errors', async () => {
      const { HttpException } = await import('@/utils');
      razorpayServiceMock.createOrder.mockRejectedValue(
        new HttpException(500, 'Failed to create payment order'),
      );

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ order_id: TEST_ORDER_ID, amount: 100000 })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /api/payments/verify ====================

  describe('POST /api/payments/verify', () => {
    const validVerifyData = {
      razorpay_order_id: TEST_RAZORPAY_ORDER_ID,
      razorpay_payment_id: TEST_PAYMENT_ID,
      razorpay_signature: 'valid_signature_hash',
      order_id: TEST_ORDER_ID,
    };

    it('should verify valid payment signature', async () => {
      razorpayServiceMock.verifyPaymentSignature.mockReturnValue(true);
      (dbMock.where as jest.Mock).mockResolvedValue([{ id: TEST_ORDER_ID, status: 'pending' }]);

      const response = await request(app)
        .post('/api/payments/verify')
        .send(validVerifyData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid payment signature', async () => {
      razorpayServiceMock.verifyPaymentSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/verify')
        .send({ ...validVerifyData, razorpay_signature: 'invalid_signature' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .send({ razorpay_order_id: TEST_RAZORPAY_ORDER_ID })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle concurrent payment verification (lock conflict)', async () => {
      paymentLockServiceMock.acquireLock.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/payments/verify')
        .send(validVerifyData)
        .expect(409); // Now expects 409 Conflict

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /api/webhooks/razorpay ====================

  describe('POST /api/webhooks/razorpay', () => {
    it('should process valid webhook event', async () => {
      razorpayServiceMock.verifyWebhookSignature.mockReturnValue(true);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: TEST_PAYMENT_ID,
              order_id: TEST_RAZORPAY_ORDER_ID,
              status: 'captured',
            },
          },
        },
      };

      const response = await request(app)
        .post('/api/webhooks/razorpay')
        .set('x-razorpay-signature', 'valid_webhook_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should reject webhook with invalid signature', async () => {
      razorpayServiceMock.verifyWebhookSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/webhooks/razorpay')
        .set('x-razorpay-signature', 'invalid_signature')
        .send({ event: 'payment.captured' })
        .expect(401); // 401 Unauthorized for invalid signature

      expect(response.body.status).toBe('error');
    });

    it('should reject webhook without signature header', async () => {
      const response = await request(app)
        .post('/api/webhooks/razorpay')
        .send({ event: 'payment.captured' })
        .expect(401); // 401 Unauthorized for missing signature

      expect(response.body.status).toBe('error');
    });
  });

  // ==================== GET /api/payments/key ====================

  describe('GET /api/payments/key', () => {
    it('should return Razorpay key ID', async () => {
      razorpayServiceMock.getKeyId.mockReturnValue('rzp_test_key123');

      const response = await request(app).get('/api/payments/key').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('key_id');
    });
  });
});
