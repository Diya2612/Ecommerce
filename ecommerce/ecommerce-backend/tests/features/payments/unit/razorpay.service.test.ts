/**
 * RazorpayService Unit Tests
 * Tests for signature verification, order creation, and refund operations
 */

import crypto from 'crypto';

// Mock config
jest.mock('@/utils/config/validate-env', () => ({
  config: {
    RAZORPAY_KEY_ID: 'rzp_test_testKeyId123',
    RAZORPAY_KEY_SECRET: 'testKeySecret123456',
    RAZORPAY_WEBHOOK_SECRET: 'testWebhookSecret123',
  },
}));

// Mock logger
jest.mock('@/utils', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

// Mock Razorpay SDK
jest.mock('razorpay', () => {
  const mockOrders = {
    create: jest.fn(),
    fetch: jest.fn(),
  };
  const mockPayments = {
    fetch: jest.fn(),
    refund: jest.fn(),
    fetchRefund: jest.fn(),
  };
  return jest.fn().mockImplementation(() => ({
    orders: mockOrders,
    payments: mockPayments,
  }));
});

// We need to access these mocks in our tests, so we need a way to export them from the mock
// Or we can just spy on the prototypes if we had access, but since we mock the module constructor:
// A common pattern is to assign them to a global or imported variable, but that's hard with hoisting.
// Instead, we can re-require or just accept that we can't easily access the inner mocks without some trickery.
// BUT, for simplicity in this generated test, let's use the 'require' approach within tests or just mock the instance method on the service if possible.
// Actually, the cleanest way with Jest hoisting is to define variables outside and use `jest.mock` with a factory that closes over them, IF the variables are named `mock...`.
// Jest only allows variables starting with `mock` to be used in factory.

const mockRazorpayOrders = {
  create: jest.fn(),
  fetch: jest.fn(),
};

const mockRazorpayPayments = {
  fetch: jest.fn(),
  refund: jest.fn(),
  fetchRefund: jest.fn(),
};

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: mockRazorpayOrders,
    payments: mockRazorpayPayments,
  }));
});

import { RazorpayServiceClass } from '@/features/payments/services/razorpay.service';

// Helper to generate valid HMAC signature
function generateSignature(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

const KEY_SECRET = 'testKeySecret123456';
const WEBHOOK_SECRET = 'testWebhookSecret123';

describe('RazorpayService - Unit Tests', () => {
  let service: RazorpayServiceClass;

  beforeEach(() => {
    service = new RazorpayServiceClass();
  });

  // ==================== getKeyId ====================

  describe('getKeyId', () => {
    it('should return the Razorpay key ID', () => {
      const keyId = service.getKeyId();
      expect(keyId).toBe('rzp_test_testKeyId123');
    });
  });

  // ==================== isTestMode ====================

  describe('isTestMode', () => {
    it('should return true for test key IDs', () => {
      expect(service.isTestMode()).toBe(true);
    });
  });

  // ==================== createOrder ====================

  describe('createOrder', () => {
    it('should create a Razorpay order with correct parameters', async () => {
      const mockOrder = {
        id: 'order_test123',
        entity: 'order',
        amount: 100000,
        currency: 'INR',
        receipt: 'order-uuid-1',
        status: 'created',
        attempts: 0,
        notes: {},
        created_at: Date.now(),
      };

      mockRazorpayOrders.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder({
        amount: 100000,
        currency: 'INR',
        receipt: 'order-uuid-1',
      });

      expect(result.id).toBe('order_test123');
      expect(result.amount).toBe(100000);
      expect(mockRazorpayOrders.create).toHaveBeenCalledWith({
        amount: 100000,
        currency: 'INR',
        receipt: 'order-uuid-1',
        notes: {},
      });
    });

    it('should default currency to INR if not provided', async () => {
      mockRazorpayOrders.create.mockResolvedValue({
        id: 'order_test123',
        amount: 50000,
        currency: 'INR',
        receipt: 'order-uuid-2',
        status: 'created',
        attempts: 0,
        notes: {},
        created_at: Date.now(),
      });

      await service.createOrder({ amount: 50000, receipt: 'order-uuid-2' });

      expect(mockRazorpayOrders.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'INR' }),
      );
    });

    it('should throw HttpException when Razorpay API fails', async () => {
      mockRazorpayOrders.create.mockRejectedValue(new Error('Network error'));

      await expect(
        service.createOrder({ amount: 100000, receipt: 'order-uuid-1' }),
      ).rejects.toMatchObject({ status: 500 });
    });

    it('should include custom notes when provided', async () => {
      mockRazorpayOrders.create.mockResolvedValue({
        id: 'order_test123',
        amount: 100000,
        currency: 'INR',
        receipt: 'order-uuid-1',
        status: 'created',
        attempts: 0,
        notes: { customer: 'John Doe' },
        created_at: Date.now(),
      });

      await service.createOrder({
        amount: 100000,
        receipt: 'order-uuid-1',
        notes: { customer: 'John Doe' },
      });

      expect(mockRazorpayOrders.create).toHaveBeenCalledWith(
        expect.objectContaining({ notes: { customer: 'John Doe' } }),
      );
    });
  });

  // ==================== verifyPaymentSignature ====================

  describe('verifyPaymentSignature', () => {
    const orderId = 'order_test123';
    const paymentId = 'pay_test456';

    it('should return true for valid signature', () => {
      const message = `${orderId}|${paymentId}`;
      const validSignature = generateSignature(message, KEY_SECRET);

      const result = service.verifyPaymentSignature(orderId, paymentId, validSignature);
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const result = service.verifyPaymentSignature(orderId, paymentId, 'invalid_signature_hex00');
      expect(result).toBe(false);
    });

    it('should return false when orderId is missing', () => {
      const result = service.verifyPaymentSignature('', paymentId, 'some_signature');
      expect(result).toBe(false);
    });

    it('should return false when paymentId is missing', () => {
      const result = service.verifyPaymentSignature(orderId, '', 'some_signature');
      expect(result).toBe(false);
    });

    it('should return false when signature is missing', () => {
      const result = service.verifyPaymentSignature(orderId, paymentId, '');
      expect(result).toBe(false);
    });

    it('should return false for tampered signature', () => {
      const message = `${orderId}|${paymentId}`;
      const validSignature = generateSignature(message, KEY_SECRET);
      const tamperedSignature = validSignature.replace(/[a-f]/, 'z');

      const result = service.verifyPaymentSignature(orderId, paymentId, tamperedSignature);
      expect(result).toBe(false);
    });
  });

  // ==================== verifyRefundSignature ====================

  describe('verifyRefundSignature', () => {
    const paymentId = 'pay_test456';
    const refundId = 'rfnd_test789';

    it('should return true for valid refund signature', () => {
      const message = `${paymentId}|${refundId}`;
      const validSignature = generateSignature(message, KEY_SECRET);

      const result = service.verifyRefundSignature(paymentId, refundId, validSignature);
      expect(result).toBe(true);
    });

    it('should return false for invalid refund signature', () => {
      const result = service.verifyRefundSignature(paymentId, refundId, 'invalid_signature_hex00');
      expect(result).toBe(false);
    });

    it('should return false when any parameter is missing', () => {
      expect(service.verifyRefundSignature('', refundId, 'sig')).toBe(false);
      expect(service.verifyRefundSignature(paymentId, '', 'sig')).toBe(false);
      expect(service.verifyRefundSignature(paymentId, refundId, '')).toBe(false);
    });
  });

  // ==================== verifyWebhookSignature ====================

  describe('verifyWebhookSignature', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', payload: {} });

    it('should return true for valid webhook signature', () => {
      const validSignature = generateSignature(rawBody, WEBHOOK_SECRET);

      const result = service.verifyWebhookSignature(rawBody, validSignature);
      expect(result).toBe(true);
    });

    it('should return false for invalid webhook signature', () => {
      const result = service.verifyWebhookSignature(rawBody, 'invalid_webhook_sig_hex00');
      expect(result).toBe(false);
    });

    it('should return false when rawBody is missing', () => {
      const result = service.verifyWebhookSignature('', 'some_signature');
      expect(result).toBe(false);
    });

    it('should return false when signature is missing', () => {
      const result = service.verifyWebhookSignature(rawBody, '');
      expect(result).toBe(false);
    });

    it('should return false for tampered body', () => {
      const validSignature = generateSignature(rawBody, WEBHOOK_SECRET);
      const tamperedBody = rawBody + 'extra';

      const result = service.verifyWebhookSignature(tamperedBody, validSignature);
      expect(result).toBe(false);
    });
  });

  // ==================== createRefund ====================

  describe('createRefund', () => {
    it('should create a full refund', async () => {
      const mockRefund = {
        id: 'rfnd_test123',
        entity: 'refund',
        amount: 100000,
        currency: 'INR',
        payment_id: 'pay_test456',
        notes: {},
        status: 'pending',
        speed_requested: 'normal',
        created_at: Date.now(),
      };

      mockRazorpayPayments.refund.mockResolvedValue(mockRefund);

      const result = await service.createRefund('pay_test456');

      expect(result.id).toBe('rfnd_test123');
      expect(mockRazorpayPayments.refund).toHaveBeenCalledWith(
        'pay_test456',
        expect.objectContaining({ speed: 'normal' }),
      );
    });

    it('should create a partial refund with specified amount', async () => {
      const mockRefund = {
        id: 'rfnd_partial123',
        entity: 'refund',
        amount: 50000,
        currency: 'INR',
        payment_id: 'pay_test456',
        notes: {},
        status: 'pending',
        speed_requested: 'normal',
        created_at: Date.now(),
      };

      mockRazorpayPayments.refund.mockResolvedValue(mockRefund);

      const result = await service.createRefund('pay_test456', { amount: 50000 });

      expect(result.amount).toBe(50000);
    });

    it('should throw HttpException when refund fails', async () => {
      mockRazorpayPayments.refund.mockRejectedValue(new Error('Refund failed'));

      await expect(service.createRefund('pay_test456')).rejects.toMatchObject({ status: 500 });
    });
  });

  // ==================== getPayment ====================

  describe('getPayment', () => {
    it('should fetch payment details', async () => {
      const mockPayment = {
        id: 'pay_test456',
        entity: 'payment',
        amount: 100000,
        currency: 'INR',
        status: 'captured',
      };

      mockRazorpayPayments.fetch.mockResolvedValue(mockPayment);

      const result = await service.getPayment('pay_test456');

      expect(result).toHaveProperty('id', 'pay_test456');
    });

    it('should throw HttpException when payment fetch fails', async () => {
      mockRazorpayPayments.fetch.mockRejectedValue(new Error('Payment not found'));

      await expect(service.getPayment('invalid_payment_id')).rejects.toMatchObject({ status: 500 });
    });
  });
});
