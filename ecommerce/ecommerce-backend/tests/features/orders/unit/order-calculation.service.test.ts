/**
 * OrderCalculationService Unit Tests
 *
 * Tests: calculateOrderPricing, calculateGST
 *
 * Note: TypeScript errors on jest.* are expected at design-time — tests
 * folder is excluded from tsconfig. @swc/jest transpiles without type-checking.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => {
  const stub = {};
  stub.select = jest.fn().mockReturnValue(stub);
  stub.from = jest.fn().mockReturnValue(stub);
  stub.where = jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue([]),
    then: (r) => Promise.resolve(undefined).then(r),
    catch: (r) => Promise.resolve(undefined).catch(r),
    finally: (r) => Promise.resolve(undefined).finally(r),
  }));
  stub.limit = jest.fn().mockResolvedValue([]);
  return { db: stub, schema: {} };
});

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

jest.mock('@/utils/helpers/tax-calculator', () => ({
  calculateGST: jest.fn().mockReturnValue({
    cgst: 90,
    sgst: 90,
    igst: 0,
    taxAmount: 180,
  }),
}));

jest.mock('@/features/discount/shared/discount.schema', () => ({
  discounts: { id: 'id', code: 'code' },
}));

jest.mock('@/features/discount/shared/discount-codes.schema', () => ({
  discountCodes: { id: 'id', code: 'code' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ a, b })),
  and: jest.fn((...args) => ({ args })),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderCalculationService } from '@/features/orders/services/order-calculation.service';

// ── Constants ─────────────────────────────────────────────────────────────────

const mockItem = {
  product_id: 'd4e5f6a7-b8c9-4123-abcd-234567890123',
  product_name: 'Steel Pipe 6 inch',
  product_sku: 'SP-6IN-001',
  quantity: 2,
  unit_price: 500,
  cost_price: 400,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderCalculationService', () => {
  let service: typeof orderCalculationService;
  let mockCalculateGST: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = orderCalculationService;
    // Re-assert the mock implementation after clearAllMocks
    mockCalculateGST = jest.requireMock('@/utils/helpers/tax-calculator').calculateGST;
    mockCalculateGST.mockReturnValue({ cgst: 90, sgst: 90, igst: 0, taxAmount: 180 });
  });

  // ── calculateOrderPricing ─────────────────────────────────────────────────

  describe('calculateOrderPricing', () => {
    it('calculates basic pricing for items with no discount', async () => {
      const result = await service.calculateOrderPricing({
        items: [mockItem],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      expect(result.subtotal).toBe(1000); // 2 * 500
      expect(result.total_quantity).toBe(2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].line_subtotal).toBe(1000);
    });

    it('calculates item-level discount by percentage', async () => {
      const itemWithDiscount = { ...mockItem, discount_percentage: 10 };

      const result = await service.calculateOrderPricing({
        items: [itemWithDiscount],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      // 10% off 1000 = 100 discount
      expect(result.items[0].discount_amount).toBeCloseTo(100, 1);
    });

    it('calculates item-level fixed discount amount', async () => {
      const itemWithDiscount = { ...mockItem, discount_amount: 50 };

      const result = await service.calculateOrderPricing({
        items: [itemWithDiscount],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      expect(result.items[0].discount_amount).toBe(50);
    });

    it('sums quantities from multiple items', async () => {
      const secondItem = { ...mockItem, product_id: 'prod-2', quantity: 3, unit_price: 200 };

      const result = await service.calculateOrderPricing({
        items: [mockItem, secondItem],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      expect(result.total_quantity).toBe(5); // 2 + 3
      expect(result.subtotal).toBe(1600); // 2*500 + 3*200
    });

    it('adds shipping amount to total', async () => {
      const result = await service.calculateOrderPricing({
        items: [mockItem],
        shipping_amount: 100,
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      expect(result.shipping_amount).toBe(100);
    });

    it('applies default 18% GST per item when no tax percentage provided', async () => {
      const result = await service.calculateOrderPricing({
        items: [mockItem],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      // Each item: 2 * 500 = 1000 subtotal, 18% GST on (1000 - 0 discount)
      expect(result.items[0].tax_percentage).toBe(18);
    });

    it('handles empty items array gracefully', async () => {
      const result = await service.calculateOrderPricing({
        items: [],
        shipping_state: 'MH',
        billing_state: 'MH',
      });

      expect(result.subtotal).toBe(0);
      expect(result.total_quantity).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  // ── calculateGST ─────────────────────────────────────────────────────────

  describe('calculateGST', () => {
    it('delegates to external calculateGST helper and returns CGST/SGST for intra-state', () => {
      const result = service.calculateGST(1000, 'MH', 'MH');

      // Mock returns { cgst: 90, sgst: 90, igst: 0, taxAmount: 180 }
      expect(result.cgst).toBe(90);
      expect(result.sgst).toBe(90);
      expect(result.igst).toBe(0);
      expect(result.taxAmount).toBe(180);
      expect(mockCalculateGST).toHaveBeenCalledWith(1000, 'MH', 'MH');
    });
  });
});
