/**
 * Cart Item Service Unit Tests
 *
 * Tests: addItem, getItems, getItemsWithDetails,
 *        updateItemQuantity, removeItem, clearAllItems
 *
 * Note: TypeScript errors on jest.* calls are expected at design-time (tests
 * folder is excluded from tsconfig). Tests execute correctly via @swc/jest.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/database', () => {
  const stub = {};
  stub.transaction = jest.fn();
  stub.select = jest.fn().mockReturnValue(stub);
  stub.from = jest.fn().mockReturnValue(stub);
  stub.where = jest.fn().mockReturnValue(stub);
  stub.for = jest.fn().mockResolvedValue([]);
  stub.leftJoin = jest.fn().mockReturnValue(stub);
  return { db: stub, schema: {} };
});

jest.mock('@/features/cart/shared/queries', () => ({
  findCartItemById: jest.fn(),
  findCartItemByProduct: jest.fn(),
  createCartItem: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  softDeleteCartItem: jest.fn(),
  softDeleteAllCartItems: jest.fn(),
  getCartItems: jest.fn(),
  getAvailableStock: jest.fn(),
  getProductDetailsForCart: jest.fn(),
  getCartItemsWithProducts: jest.fn(),
}));

jest.mock('@/features/cart/utils/pricing.util', () => ({
  calculateItemPricing: jest.fn(),
}));

// reserveCartStock / releaseCartStock (only invoked when ENABLED=true)
jest.mock('@/features/inventory/services', () => ({
  reserveCartStock: jest.fn(),
  releaseCartStock: jest.fn(),
}));

// Disable stock reservation so addItem / updateItemQuantity skip those paths
jest.mock('@/features/cart/config/cart-reservation.config', () => ({
  CART_RESERVATION_CONFIG: { ENABLED: false, RESERVATION_TIMEOUT: 900 },
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

import { CartItemService } from '@/features/cart/services/cart-item.service';
import {
  findCartItemById,
  findCartItemByProduct,
  createCartItem,
  updateCartItemQuantity,
  softDeleteCartItem,
  softDeleteAllCartItems,
  getCartItems,
  getAvailableStock,
  getProductDetailsForCart,
} from '@/features/cart/shared/queries';
import { calculateItemPricing } from '@/features/cart/utils/pricing.util';
import { db } from '@/database';

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ITEM_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';

const mockCartItem = {
  id: ITEM_ID,
  cart_id: CART_ID,
  product_id: PRODUCT_ID,
  variant_id: null,
  quantity: 2,
  final_price: '50.00',
  cost_price: '60.00',
  discount_amount: '10.00',
  line_subtotal: '100.00',
  line_total: '90.00',
  product_name: 'Steel Pipe 6 inch',
  product_sku: 'SP-6IN-001',
  product_image_url: null,
  is_deleted: false,
  deleted_at: null,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

const mockProduct = {
  id: PRODUCT_ID,
  product_title: 'Steel Pipe 6 inch',
  selling_price: '50.00',
  compare_at_price: '60.00',
  sku: 'SP-6IN-001',
  primary_image_url: null,
  status: 'active',
};

const mockPricing = {
  lineSubtotal: '100.00',
  lineTotal: '90.00',
  discountAmount: '10.00',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartItemService', () => {
  let service;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = db;
    // Re-wire db stub chains after clearAllMocks
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.for.mockResolvedValue([]);
    mockDb.leftJoin.mockReturnValue(mockDb);
    calculateItemPricing.mockReturnValue(mockPricing);
    service = new CartItemService();
  });

  // ── getItems ──────────────────────────────────────────────────────────────

  describe('getItems', () => {
    it('returns list of items for cart', async () => {
      getCartItems.mockResolvedValueOnce([mockCartItem]);

      const result = await service.getItems(CART_ID);

      expect(result).toEqual([mockCartItem]);
      expect(getCartItems).toHaveBeenCalledWith(CART_ID);
    });

    it('returns empty array for empty cart', async () => {
      getCartItems.mockResolvedValueOnce([]);

      const result = await service.getItems(CART_ID);

      expect(result).toEqual([]);
    });
  });

  // ── addItem ───────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('throws 404 when product not found', async () => {
      getProductDetailsForCart.mockResolvedValueOnce(undefined);

      await expect(
        service.addItem(CART_ID, { product_id: PRODUCT_ID, quantity: 1 }),
      ).rejects.toMatchObject({ status: 404, message: 'Product not found' });
    });

    it('throws 400 when product is not active', async () => {
      getProductDetailsForCart.mockResolvedValueOnce({
        ...mockProduct,
        status: 'draft',
      });

      await expect(
        service.addItem(CART_ID, { product_id: PRODUCT_ID, quantity: 1 }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('creates new cart item when no existing item (happy path)', async () => {
      getProductDetailsForCart.mockResolvedValueOnce(mockProduct);

      // Inside transaction: stock check → no existing item → createCartItem
      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([{ id: 'inv-1', totalStock: 10 }]),
      };
      mockDb.transaction.mockImplementation(async (cb) => cb(mockTx));

      findCartItemByProduct.mockResolvedValueOnce(undefined);
      createCartItem.mockResolvedValueOnce(mockCartItem);

      const result = await service.addItem(CART_ID, { product_id: PRODUCT_ID, quantity: 2 });

      expect(result).toEqual(mockCartItem);
      expect(createCartItem).toHaveBeenCalled();
    });

    it('throws 400 when insufficient stock', async () => {
      getProductDetailsForCart.mockResolvedValueOnce(mockProduct);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([{ id: 'inv-1', totalStock: 0 }]),
      };
      mockDb.transaction.mockImplementation(async (cb) => cb(mockTx));

      await expect(
        service.addItem(CART_ID, { product_id: PRODUCT_ID, quantity: 5 }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('merges quantity when item already exists in cart', async () => {
      getProductDetailsForCart.mockResolvedValueOnce(mockProduct);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([{ id: 'inv-1', totalStock: 10 }]),
      };
      mockDb.transaction.mockImplementation(async (cb) => cb(mockTx));

      findCartItemByProduct.mockResolvedValueOnce(mockCartItem);
      updateCartItemQuantity.mockResolvedValueOnce(undefined);
      findCartItemById.mockResolvedValueOnce({ ...mockCartItem, quantity: 4 });

      const result = await service.addItem(CART_ID, { product_id: PRODUCT_ID, quantity: 2 });

      expect(updateCartItemQuantity).toHaveBeenCalled();
      expect(result.quantity).toBe(4);
    });
  });

  // ── removeItem ────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('soft-deletes the cart item', async () => {
      findCartItemById.mockResolvedValueOnce(mockCartItem);
      softDeleteCartItem.mockResolvedValueOnce(undefined);

      await service.removeItem(ITEM_ID);

      expect(findCartItemById).toHaveBeenCalledWith(ITEM_ID);
      expect(softDeleteCartItem).toHaveBeenCalledWith(ITEM_ID);
    });

    it('throws 404 when item not found', async () => {
      findCartItemById.mockResolvedValueOnce(undefined);

      await expect(service.removeItem(ITEM_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Cart item not found',
      });
      expect(softDeleteCartItem).not.toHaveBeenCalled();
    });
  });

  // ── clearAllItems ─────────────────────────────────────────────────────────

  describe('clearAllItems', () => {
    it('clears all items in cart', async () => {
      getCartItems.mockResolvedValueOnce([mockCartItem]);
      softDeleteAllCartItems.mockResolvedValueOnce(undefined);

      await service.clearAllItems(CART_ID);

      expect(getCartItems).toHaveBeenCalledWith(CART_ID);
      expect(softDeleteAllCartItems).toHaveBeenCalledWith(CART_ID);
    });

    it('handles empty cart gracefully', async () => {
      getCartItems.mockResolvedValueOnce([]);
      softDeleteAllCartItems.mockResolvedValueOnce(undefined);

      await service.clearAllItems(CART_ID);

      expect(softDeleteAllCartItems).toHaveBeenCalledWith(CART_ID);
    });
  });

  // ── updateItemQuantity ────────────────────────────────────────────────────

  describe('updateItemQuantity', () => {
    it('throws 404 when item not found', async () => {
      findCartItemById.mockResolvedValueOnce(undefined);

      await expect(service.updateItemQuantity(ITEM_ID, 5)).rejects.toMatchObject({
        status: 404,
        message: 'Cart item not found',
      });
    });

    it('throws 400 when item has no associated product', async () => {
      findCartItemById.mockResolvedValueOnce({
        ...mockCartItem,
        product_id: null,
      });

      await expect(service.updateItemQuantity(ITEM_ID, 5)).rejects.toMatchObject({
        status: 400,
      });
    });

    it('updates quantity when item exists and stock is sufficient', async () => {
      findCartItemById
        .mockResolvedValueOnce(mockCartItem) // initial lookup
        .mockResolvedValueOnce({ ...mockCartItem, quantity: 5 }); // after update

      getProductDetailsForCart.mockResolvedValueOnce(mockProduct);
      updateCartItemQuantity.mockResolvedValueOnce(undefined);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([{ id: 'inv-1', totalStock: 10 }]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
      };
      mockDb.transaction.mockImplementation(async (cb) => cb(mockTx));

      const result = await service.updateItemQuantity(ITEM_ID, 5);

      expect(updateCartItemQuantity).toHaveBeenCalled();
      expect(result.quantity).toBe(5);
    });

    it('throws 400 when insufficient stock for update', async () => {
      findCartItemById.mockResolvedValueOnce(mockCartItem);
      getProductDetailsForCart.mockResolvedValueOnce(mockProduct);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([{ id: 'inv-1', totalStock: 2 }]),
      };
      mockDb.transaction.mockImplementation(async (cb) => cb(mockTx));

      await expect(service.updateItemQuantity(ITEM_ID, 10)).rejects.toMatchObject({ status: 400 });
    });
  });

  // ── getItemsWithDetails ───────────────────────────────────────────────────

  describe('getItemsWithDetails', () => {
    it('returns enriched items with stock status', async () => {
      // getCartItemsWithProducts is a module-level private function using db.select chain
      // Simulate by making db chain return an item with joined product fields
      const joinedItem = {
        ...mockCartItem,
        current_price: '50.00',
        current_image: null,
        product_status: 'active',
      };
      // The inline getCartItemsWithProducts uses db.select().from().leftJoin().where()
      mockDb.where.mockResolvedValueOnce([joinedItem]);
      getAvailableStock.mockResolvedValueOnce(10);

      const result = await service.getItemsWithDetails(CART_ID);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        id: ITEM_ID,
        inStock: true,
        availableStock: 10,
      });
    });

    it('returns empty array when no items', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      const result = await service.getItemsWithDetails(CART_ID);

      expect(result).toEqual([]);
    });
  });
});
