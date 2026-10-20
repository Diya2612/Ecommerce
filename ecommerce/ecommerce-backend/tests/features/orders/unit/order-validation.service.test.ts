/**
 * OrderValidationService Unit Tests
 *
 * Tests: validateOrder, validateStockForOrder
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/features/inventory/services', () => ({
  validateStockAvailability: jest.fn(),
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
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderValidationService } from '@/features/orders/services/order-validation.service';
import { validateStockAvailability } from '@/features/inventory/services';

// ── Constants ─────────────────────────────────────────────────────────────────

const validOrderData = {
  items: [{ quantity: 2, unit_price: 500 }],
  user_id: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
  shipping_address_line1: '123 Main Street',
  billing_address_line1: '123 Main Street',
  total_amount: 1180,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderValidationService', () => {
  let service: typeof orderValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = orderValidationService;
  });

  // ── validateOrder ─────────────────────────────────────────────────────────

  describe('validateOrder', () => {
    it('returns isValid=true for a complete valid order', () => {
      const result = service.validateOrder(validOrderData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns error when items array is empty', () => {
      const result = service.validateOrder({ ...validOrderData, items: [] });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Order must have at least one item');
    });

    it('returns error when items is missing', () => {
      const result = service.validateOrder({ ...validOrderData, items: undefined });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/item/i);
    });

    it('returns error when item has invalid quantity (0)', () => {
      const result = service.validateOrder({
        ...validOrderData,
        items: [{ quantity: 0, unit_price: 500 }],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/invalid quantity/i);
    });

    it('returns error when item has negative price', () => {
      const result = service.validateOrder({
        ...validOrderData,
        items: [{ quantity: 1, unit_price: -100 }],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/invalid price/i);
    });

    it('returns error when no user_id or billing_email', () => {
      const result = service.validateOrder({
        ...validOrderData,
        user_id: undefined,
        billing_email: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Order must have a customer (user_id) or billing email');
    });

    it('passes validation when billing_email is provided instead of user_id', () => {
      const result = service.validateOrder({
        ...validOrderData,
        user_id: undefined,
        billing_email: 'guest@example.com',
      });

      // Only fails if addresses are also missing — here they are present
      const addressErrors = result.errors.filter((e) => /address|customer/i.test(e));
      const customerErrors = result.errors.filter((e) => /customer/i.test(e));
      expect(customerErrors).toHaveLength(0);
    });

    it('returns error when shipping address is missing', () => {
      const result = service.validateOrder({
        ...validOrderData,
        shipping_address_line1: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Shipping address is required');
    });

    it('returns error when billing address is missing', () => {
      const result = service.validateOrder({
        ...validOrderData,
        billing_address_line1: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Billing address is required');
    });

    it('returns error when total amount is 0 or negative', () => {
      const result = service.validateOrder({ ...validOrderData, total_amount: 0 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Order total must be greater than 0');
    });

    it('accumulates multiple errors at once', () => {
      const result = service.validateOrder({
        items: [],
        user_id: undefined,
        billing_email: undefined,
        shipping_address_line1: undefined,
        billing_address_line1: undefined,
        total_amount: 0,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  // ── validateAndWarnStock ──────────────────────────────────────────────────

  describe('validateAndWarnStock', () => {
    const stockItems = [{ product_id: 'prod-1', quantity: 2 }];

    it('resolves immediately when items array is empty', async () => {
      await expect(service.validateAndWarnStock([], false)).resolves.not.toThrow();
      expect(validateStockAvailability).not.toHaveBeenCalled();
    });

    it('resolves when all stock is available', async () => {
      (validateStockAvailability as jest.Mock).mockResolvedValueOnce([
        { product_id: 'prod-1', available: true, message: 'OK' },
      ]);

      await expect(service.validateAndWarnStock(stockItems, false)).resolves.not.toThrow();
    });

    it('throws 400 when stock is insufficient and overselling not allowed', async () => {
      (validateStockAvailability as jest.Mock).mockResolvedValueOnce([
        { product_id: 'prod-1', available: false, message: 'Only 0 units available' },
      ]);

      await expect(service.validateAndWarnStock(stockItems, false)).rejects.toMatchObject({
        status: 400,
      });
    });

    it('warns but does not throw when overselling is allowed', async () => {
      (validateStockAvailability as jest.Mock).mockResolvedValueOnce([
        { product_id: 'prod-1', available: false, message: 'Only 0 units available' },
      ]);

      // Should log warning but not throw
      await expect(service.validateAndWarnStock(stockItems, true)).resolves.not.toThrow();
    });
  });

  // ── validateItemQuantities ────────────────────────────────────────────────

  describe('validateItemQuantities', () => {
    it('returns valid for positive integer quantities', () => {
      const result = service.validateItemQuantities([{ quantity: 3 }, { quantity: 1 }]);
      expect(result.isValid).toBe(true);
    });

    it('returns error for zero quantity', () => {
      const result = service.validateItemQuantities([{ quantity: 0 }]);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/invalid quantity/i);
    });

    it('returns error for non-integer quantity', () => {
      const result = service.validateItemQuantities([{ quantity: 1.5 }]);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/non-integer/i);
    });
  });

  // ── mapOrderItems ─────────────────────────────────────────────────────────

  describe('mapOrderItems', () => {
    it('maps items to DB format with defaults', () => {
      const items = [
        {
          product_id: 'prod-1',
          sku: 'SKU-001',
          product_name: 'Widget',
          product_image: null,
          cost_price: 100,
          quantity: 2,
          line_total: 200,
        },
      ];

      const result = service.mapOrderItems('order-uuid', items);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        order_id: 'order-uuid',
        product_id: 'prod-1',
        sku: 'SKU-001',
        product_name: 'Widget',
        cost_price: '100',
        quantity: 2,
        line_total: '200',
      });
    });

    it('uses defaults for missing sku and product_name', () => {
      const items = [{ product_id: 'p1', cost_price: 50, quantity: 1, line_total: 50 }];
      const result = service.mapOrderItems('oid', items);
      expect(result[0].sku).toBe('UNKNOWN');
      expect(result[0].product_name).toBe('Unknown Product');
    });
  });
});
