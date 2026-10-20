/**
 * Cart Calculation Service Unit Tests
 *
 * Tests: recalculateCartTotals, applyDiscountCode, removeDiscountCode
 *
 * Note: TypeScript errors on jest.* calls are expected at design-time (tests
 * folder is excluded from tsconfig). Tests execute correctly via @swc/jest.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

// Mock @/database with a fully chainable db object.
// addDiscountCodeToCart / removeDiscountCodeFromCart / clearDiscountCodes are
// private inline functions inside cart-calculation.service.ts that use `db`
// directly via Drizzle ORM chains.
jest.mock('@/database', () => {
  const stub = {};
  // All intermediate chain methods return stub for further chaining.
  // Terminal methods (limit, where-after-set) return Promises.
  stub.select = jest.fn().mockReturnValue(stub);
  stub.from = jest.fn().mockReturnValue(stub);
  // where() returns stub so .limit() can be called after it (SELECT chain),
  // AND it also needs to be awaitable for UPDATE chain (set().where()).
  // We use a Proxy / thenable approach: return an object that is both
  // chainable AND thenable.
  const makeThenable = (returnStub) => {
    const obj = Object.assign(Object.create(stub), {
      then: (resolve) => Promise.resolve(undefined).then(resolve),
      catch: (reject) => Promise.resolve(undefined).catch(reject),
      limit: jest.fn().mockResolvedValue([]),
    });
    return obj;
  };
  stub.where = jest.fn().mockImplementation(() => makeThenable(stub));
  stub.limit = jest.fn().mockResolvedValue([]);
  stub.update = jest.fn().mockReturnValue(stub);
  stub.set = jest.fn().mockReturnValue(stub);
  return { db: stub, schema: {} };
});

jest.mock('@/features/cart/shared/queries', () => ({
  findCartById: jest.fn(),
  getCartItems: jest.fn(),
  updateCartTotals: jest.fn(),
}));

jest.mock('@/features/discount/services', () => ({
  discountValidationService: {
    validateDiscountCode: jest.fn(),
  },
  discountCalculationService: {
    calculateDiscount: jest.fn(),
  },
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

import { CartCalculationService } from '@/features/cart/services/cart-calculation.service';
import { findCartById, getCartItems, updateCartTotals } from '@/features/cart/shared/queries';
import { db } from '@/database';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockFindCartById = findCartById;
const mockGetCartItems = getCartItems;
const mockUpdateCartTotals = updateCartTotals;
const mockDb = db;

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ITEM_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';

const mockCart = {
  id: CART_ID,
  user_id: USER_ID,
  session_id: null,
  cart_status: 'active',
  subtotal: '100.00',
  discount_total: '0.00',
  shipping_total: '0.00',
  tax_total: '0.00',
  grand_total: '100.00',
  applied_discount_codes: [],
  applied_giftcard_codes: [],
  is_deleted: false,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

const mockCartItem = {
  id: ITEM_ID,
  cart_id: CART_ID,
  product_id: PRODUCT_ID,
  variant_id: null,
  quantity: 2,
  final_price: '50.00',
  cost_price: '60.00',
  discount_amount: '0.00',
  line_subtotal: '100.00',
  line_total: '100.00',
  product_name: 'Steel Pipe 6 inch',
  product_sku: 'SP-6IN-001',
  product_image_url: null,
  is_deleted: false,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartCalculationService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-wire chainable stubs after clearAllMocks.
    // where() must return an object that is both chainable (has .limit())
    // AND awaitable (acts as a Promise) to support both SELECT and UPDATE chains.
    const makeWhere = () => {
      const w = {
        limit: jest.fn().mockResolvedValue([]),
        then: (resolve) => Promise.resolve(undefined).then(resolve),
        catch: (rej) => Promise.resolve(undefined).catch(rej),
        finally: (fn) => Promise.resolve(undefined).finally(fn),
      };
      return w;
    };
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.update.mockReturnValue(mockDb);
    mockDb.set.mockReturnValue(mockDb);
    mockDb.where.mockImplementation(makeWhere);
    mockDb.limit.mockResolvedValue([]);
    service = new CartCalculationService();
  });

  // ── recalculateCartTotals ─────────────────────────────────────────────────

  describe('recalculateCartTotals', () => {
    it('calculates totals correctly for cart with no discounts', async () => {
      const cartWithNoDiscounts = { ...mockCart, applied_discount_codes: [] };
      mockFindCartById.mockResolvedValue(cartWithNoDiscounts);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      await service.recalculateCartTotals(CART_ID);

      expect(mockUpdateCartTotals).toHaveBeenCalledWith(
        CART_ID,
        expect.objectContaining({
          subtotal: '100.00',
          discount_total: '0.00',
          grand_total: '100.00',
        }),
      );
    });

    it('sums subtotals from multiple items', async () => {
      const secondItem = {
        ...mockCartItem,
        id: 'c3d4e5f6-a7b8-4012-abcd-999956789012',
        line_subtotal: '50.00',
        line_total: '50.00',
        final_price: '25.00',
      };
      mockFindCartById.mockResolvedValue({ ...mockCart, applied_discount_codes: [] });
      mockGetCartItems.mockResolvedValueOnce([mockCartItem, secondItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      await service.recalculateCartTotals(CART_ID);

      expect(mockUpdateCartTotals).toHaveBeenCalledWith(
        CART_ID,
        expect.objectContaining({ subtotal: '150.00' }),
      );
    });

    it('does NOT throw when cart not found — returns silently', async () => {
      mockFindCartById.mockResolvedValue(undefined);

      await expect(service.recalculateCartTotals(CART_ID)).resolves.toBeUndefined();
      expect(mockUpdateCartTotals).not.toHaveBeenCalled();
    });

    it('sets totals to zero when cart has no items', async () => {
      mockFindCartById.mockResolvedValue(mockCart);
      mockGetCartItems.mockResolvedValueOnce([]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      await service.recalculateCartTotals(CART_ID);

      expect(mockUpdateCartTotals).toHaveBeenCalledWith(
        CART_ID,
        expect.objectContaining({ subtotal: '0.00', grand_total: '0.00' }),
      );
    });
  });

  // ── applyDiscountCode ─────────────────────────────────────────────────────

  describe('applyDiscountCode', () => {
    it('throws 404 when cart not found', async () => {
      mockFindCartById.mockResolvedValueOnce(undefined);

      await expect(service.applyDiscountCode(CART_ID, 'SAVE10', USER_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Cart not found',
      });
    });

    it('throws 400 when code already applied', async () => {
      mockFindCartById.mockResolvedValueOnce({
        ...mockCart,
        applied_discount_codes: ['SAVE10'],
      });

      await expect(service.applyDiscountCode(CART_ID, 'save10', USER_ID)).rejects.toMatchObject({
        status: 400,
        message: 'Discount code already applied',
      });
    });

    it('throws 400 when cart is empty', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart);
      mockGetCartItems.mockResolvedValueOnce([]);

      await expect(service.applyDiscountCode(CART_ID, 'SAVE10', USER_ID)).rejects.toMatchObject({
        status: 400,
        message: 'Cannot apply discount to empty cart',
      });
    });

    it('throws 400 when discount code is invalid', async () => {
      const { discountValidationService } = require('@/features/discount/services');
      mockFindCartById.mockResolvedValueOnce(mockCart);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      discountValidationService.validateDiscountCode.mockResolvedValueOnce({
        valid: false,
        message: 'Code not found',
      });

      await expect(service.applyDiscountCode(CART_ID, 'INVALID', USER_ID)).rejects.toMatchObject({
        status: 400,
        message: 'Code not found',
      });
    });

    it('applies valid discount code and returns updated cart', async () => {
      const { discountValidationService } = require('@/features/discount/services');
      const updatedCart = { ...mockCart, applied_discount_codes: ['SAVE10'] };
      mockFindCartById
        .mockResolvedValueOnce(mockCart) // initial check in applyDiscountCode
        .mockResolvedValueOnce(mockCart) // inside recalculateCartTotals
        .mockResolvedValueOnce(updatedCart); // final findCartById after recalculate
      mockGetCartItems.mockResolvedValue([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValue(undefined);
      discountValidationService.validateDiscountCode.mockResolvedValueOnce({
        valid: true,
        discount: { id: 'disc-1' },
        applicable_items: [],
      });
      // addDiscountCodeToCart: db.select().from().where().limit() → no existing codes
      mockDb.limit.mockResolvedValueOnce([{ applied_discount_codes: [] }]);

      const result = await service.applyDiscountCode(CART_ID, 'SAVE10', USER_ID);

      expect(result).toEqual(updatedCart);
    });
  });

  // ── removeDiscountCode ────────────────────────────────────────────────────

  describe('removeDiscountCode', () => {
    beforeEach(() => {
      // removeDiscountCodeFromCart / clearDiscountCodes use db chain.
      // where() needs its inner .limit() to resolve to the cart's current codes.
      const makeWhere = () => ({
        limit: jest.fn().mockResolvedValue([{ applied_discount_codes: ['SAVE10'] }]),
        then: (resolve) => Promise.resolve(undefined).then(resolve),
        catch: (rej) => Promise.resolve(undefined).catch(rej),
        finally: (fn) => Promise.resolve(undefined).finally(fn),
      });
      mockDb.where.mockImplementation(makeWhere);
    });

    it('removes specific discount code and recalculates', async () => {
      const cartAfterRemoval = { ...mockCart, applied_discount_codes: [] };
      mockFindCartById
        .mockResolvedValueOnce(cartAfterRemoval) // recalculate
        .mockResolvedValueOnce(cartAfterRemoval); // final lookup
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      const result = await service.removeDiscountCode(CART_ID, 'SAVE10');

      expect(result).toEqual(cartAfterRemoval);
    });

    it('clears all discount codes when no code provided', async () => {
      const cartAfterClear = { ...mockCart, applied_discount_codes: [] };
      mockFindCartById.mockResolvedValueOnce(cartAfterClear).mockResolvedValueOnce(cartAfterClear);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      const result = await service.removeDiscountCode(CART_ID);

      expect(result).toEqual(cartAfterClear);
    });

    it('normalizes code to uppercase before removing', async () => {
      const cartAfterRemoval = { ...mockCart, applied_discount_codes: [] };
      mockFindCartById
        .mockResolvedValueOnce(cartAfterRemoval)
        .mockResolvedValueOnce(cartAfterRemoval);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      const result = await service.removeDiscountCode(CART_ID, 'save10');

      expect(result).toEqual(cartAfterRemoval);
    });

    it('throws 404 when cart not found after removal', async () => {
      mockFindCartById
        .mockResolvedValueOnce(mockCart) // inside recalculate
        .mockResolvedValueOnce(undefined); // final lookup → 404
      mockGetCartItems.mockResolvedValueOnce([mockCartItem]);
      mockUpdateCartTotals.mockResolvedValueOnce(undefined);

      await expect(service.removeDiscountCode(CART_ID, 'SAVE10')).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
