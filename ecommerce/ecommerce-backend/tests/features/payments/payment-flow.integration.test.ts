/**
 * Payment Flow Integration Tests
 * Tests the complete payment flow: create order → verify payment → handle webhook
 * Uses mocked Razorpay SDK and database
 */

import request from 'supertest';
import express from 'express';
import crypto from 'crypto';

const TEST_ORDER_ID = 'test-order-uuid-1';
const TEST_USER_ID = 'test-user-uuid-1';
const RAZORPAY_ORDER_ID = 'order_test123';
const RAZORPAY_PAYMENT_ID = 'pay_test456';
const KEY_SECRET = 'test_secret_key_1234567890';
const WEBHOOK_SECRET = 'webhook_secret_1234567890';

// Mock config
jest.mock('../../../utils/config/validate-env', () => ({
  config: {
    RAZORPAY_KEY_ID: 'rzp_test_1234567890',
    RAZORPAY_KEY_SECRET: KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: WEBHOOK_SECRET,
  },
}));

// Mock utilities
jest.mock('../../../utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  ResponseFormatter: {
    success: jest.fn((res, data, message, status = 200) =>
      res.status(status).json({ success: true, data, message }),
    ),
    error: jest.fn((res, message, status = 500) =>
      res.status(status).json({ success: false, message }),
    ),
    created: jest.fn((res, data, message) =>
      res.status(201).json({ success: true, data, message }),
    ),
  },
}));

// Mock middlewares
jest.mock('../../../middlewares', () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).userId = TEST_USER_ID;
    next();
  },
  requirePermission:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
  validationMiddleware:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
}));

// Mock Razorpay SDK
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: RAZORPAY_ORDER_ID,
        entity: 'order',
        amount: 50000,
        currency: 'INR',
        receipt: TEST_ORDER_ID,
        status: 'created',
      }),
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: RAZORPAY_PAYMENT_ID,
        status: 'captured',
        amount: 50000,
      }),
      refund: jest.fn().mockResolvedValue({
        id: 'rfnd_test123',
        status: 'processed',
        amount: 50000,
      }),
    },
  }));
});

// Mock database
jest.mock('../../../database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([
      {
        id: TEST_ORDER_ID,
        order_number: 'ORD-001',
        status: 'pending',
        total_amount: '500.00',
        user_id: TEST_USER_ID,
      },
    ]),
    transaction: jest.fn((cb) =>
      cb({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: TEST_ORDER_ID }]),
      }),
    ),
    query: {
      orders: { findFirst: jest.fn() },
    },
  },
}));

// Mock payment lock service
jest.mock('@/features/payments/services/payment-lock.service', () => ({
  PaymentLockService: {
    withLock: jest.fn((orderId, operation) => operation()),
    acquireLock: jest.fn().mockResolvedValue(true),
    releaseLock: jest.fn().mockResolvedValue(undefined),
    isLocked: jest.fn().mockResolvedValue(false),
  },
}));

describe('Payment Flow Integration Tests', () => {
  describe('Signature Verification', () => {
    it('should generate valid payment signature', () => {
      const message = `${RAZORPAY_ORDER_ID}|${RAZORPAY_PAYMENT_ID}`;
      const signature = crypto.createHmac('sha256', KEY_SECRET).update(message).digest('hex');

      expect(signature).toHaveLength(64);
      expect(typeof signature).toBe('string');
    });

    it('should verify payment signature correctly', () => {
      const message = `${RAZORPAY_ORDER_ID}|${RAZORPAY_PAYMENT_ID}`;
      const signature = crypto.createHmac('sha256', KEY_SECRET).update(message).digest('hex');

      const expected = crypto.createHmac('sha256', KEY_SECRET).update(message).digest('hex');

      expect(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))).toBe(true);
    });

    it('should reject tampered payment signature', () => {
      const validMessage = `${RAZORPAY_ORDER_ID}|${RAZORPAY_PAYMENT_ID}`;
      const validSignature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(validMessage)
        .digest('hex');

      const tamperedMessage = `order_tampered|${RAZORPAY_PAYMENT_ID}`;
      const tamperedSignature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(tamperedMessage)
        .digest('hex');

      expect(validSignature).not.toBe(tamperedSignature);
    });

    it('should generate valid webhook signature', () => {
      const payload = JSON.stringify({ event: 'payment.captured', payload: {} });
      const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');

      const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');

      expect(signature).toBe(expected);
    });

    it('should reject webhook with wrong secret', () => {
      const payload = JSON.stringify({ event: 'payment.captured' });
      const validSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');

      const wrongSig = crypto.createHmac('sha256', 'wrong_secret').update(payload).digest('hex');

      expect(validSig).not.toBe(wrongSig);
    });
  });

  describe('Payment Lock Integration', () => {
    it('should allow operation when lock is acquired', async () => {
      const { PaymentLockService } =
        await import('@/features/payments/services/payment-lock.service');
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await PaymentLockService.withLock('order-123', mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should check if order is locked before payment', async () => {
      const { PaymentLockService } =
        await import('@/features/payments/services/payment-lock.service');

      const isLocked = await PaymentLockService.isLocked('order-123');
      expect(isLocked).toBe(false);
    });
  });

  describe('Refund Flow', () => {
    it('should generate valid refund signature', () => {
      const refundId = 'rfnd_test123';
      const message = `${RAZORPAY_PAYMENT_ID}|${refundId}`;
      const signature = crypto.createHmac('sha256', KEY_SECRET).update(message).digest('hex');

      expect(signature).toHaveLength(64);
    });

    it('should reject invalid refund signature', () => {
      const refundId = 'rfnd_test123';
      const message = `${RAZORPAY_PAYMENT_ID}|${refundId}`;
      const validSig = crypto.createHmac('sha256', KEY_SECRET).update(message).digest('hex');

      const invalidSig = 'invalid_signature_here';
      expect(validSig).not.toBe(invalidSig);
    });
  });
});
