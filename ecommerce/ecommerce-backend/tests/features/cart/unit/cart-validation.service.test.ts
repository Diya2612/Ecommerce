/**
 * Cart Validation Service Unit Tests
 *
 * Tests: validateCart — stock, price, product availability checks
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/features/cart/shared/queries', () => ({
  findCartById: jest.fn(),
  getCartItems: jest.fn(),
  getProductDetailsForCart: jest.fn(),
  getAvailableStock: jest.fn(),
  updateCartItemPricing: jest.fn(),
}));

jest.mock('@/features/cart/services/cart-calculation.service', () => ({
  cartCalculationService: {
    recalculateCartTotals: jest.fn(),
  },
}));

jest.mock('@/features/cart/utils/pricing.util', () => ({
  calculateItemPricing: jest.fn(),
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
      this.name = 'HttpException';
    }
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { CartValidationService } from '@/features/cart/services/cart-validation.service';
import {
  findCartById,
  getCartItems,
  getProductDetailsForCart,
  getAvailableStock,
  updateCartItemPricing,
} from '@/features/cart/shared/queries';
import { cartCalculationService } from '@/features/cart/services/cart-calculation.service';
import { calculateItemPricing } from '@/features/cart/utils/pricing.util';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockFindCartById = findCartById as jest.MockedFunction<typeof findCartById>;
const mockGetCartItems = getCartItems as jest.MockedFunction<typeof getCartItems>;
const mockGetProductDetailsForCart = getProductDetailsForCart as jest.MockedFunction<
  typeof getProductDetailsForCart
>;
const mockGetAvailableStock = getAvailableStock as jest.MockedFunction<typeof getAvailableStock>;
const mockUpdateCartItemPricing = updateCartItemPricing as jest.MockedFunction<
  typeof updateCartItemPricing
>;
const mockCalcService = cartCalculationService as jest.Mocked<typeof cartCalculationService>;
const mockCalculateItemPricing = calculateItemPricing as jest.MockedFunction<
  typeof calculateItemPricing
>;

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ITEM_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';

const mockCart = {
  id: CART_ID,
  user_id: USER_ID,
  session_id: null,
  cart_status: 'active' as const,
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

const mockProduct = {
  id: PRODUCT_ID,
  product_title: 'Steel Pipe 6 inch',
  primary_image_url: null,
  sku: 'SP-6IN-001',
  selling_price: '50.00',
  compare_at_price: '60.00',
  status: 'active' as const,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartValidationService', () => {
  let service: CartValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartValidationService();
  });

  // ── validateCart ──────────────────────────────────────────────────────────

  describe('validateCart', () => {
    it('throws 404 when cart not found', async () => {
      mockFindCartById.mockResolvedValueOnce(undefined);

      await expect(service.validateCart(CART_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Cart not found',
      });
    });

    it('throws 400 when cart is empty', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([]);

      await expect(service.validateCart(CART_ID)).rejects.toMatchObject({
        status: 400,
        message: 'Cart is empty',
      });
    });

    it('returns valid=true with no issues for healthy cart', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce(mockProduct as any);
      mockGetAvailableStock.mockResolvedValueOnce(10); // plenty of stock

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.cartId).toBe(CART_ID);
    });

    it('reports product_unavailable when product not found', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce(undefined);

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('product_unavailable');
      expect(result.issues[0].itemId).toBe(ITEM_ID);
    });

    it('reports product_unavailable when product status is not active', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce({
        ...mockProduct,
        status: 'inactive',
      } as any);

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('product_unavailable');
    });

    it('reports out_of_stock when available stock is 0', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce(mockProduct as any);
      mockGetAvailableStock.mockResolvedValueOnce(0);

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('out_of_stock');
      expect(result.issues[0].details).toMatchObject({
        requestedQuantity: 2,
        availableQuantity: 0,
      });
    });

    it('reports insufficient_stock when stock is less than requested quantity', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem] as any); // quantity=2
      mockGetProductDetailsForCart.mockResolvedValueOnce(mockProduct as any);
      mockGetAvailableStock.mockResolvedValueOnce(1); // only 1 available

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('insufficient_stock');
      expect(result.issues[0].details).toMatchObject({
        requestedQuantity: 2,
        availableQuantity: 1,
      });
    });

    it('reports price_changed when selling price differs from stored price', async () => {
      const itemWithOldPrice = { ...mockCartItem, final_price: '45.00' }; // old price
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([itemWithOldPrice] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce({
        ...mockProduct,
        selling_price: '50.00', // new price
      } as any);
      mockGetAvailableStock.mockResolvedValueOnce(10);

      const result = await service.validateCart(CART_ID);

      expect(result.issues.some((i: any) => i.type === 'price_changed')).toBe(true);
      const priceIssue = result.issues.find((i: any) => i.type === 'price_changed');
      expect(priceIssue?.details).toMatchObject({ oldPrice: '45.00', newPrice: '50.00' });
    });

    it('auto-repairs price changes when autoRepair=true', async () => {
      const itemWithOldPrice = { ...mockCartItem, final_price: '45.00' };
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([itemWithOldPrice] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce({
        ...mockProduct,
        selling_price: '50.00',
      } as any);
      mockGetAvailableStock.mockResolvedValueOnce(10);
      mockCalculateItemPricing.mockReturnValueOnce({
        lineSubtotal: '100.00',
        lineTotal: '100.00',
        discountAmount: '0.00',
      } as any);
      mockUpdateCartItemPricing.mockResolvedValueOnce(undefined as any);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);

      const result = await service.validateCart(CART_ID, true);

      expect(mockUpdateCartItemPricing).toHaveBeenCalledWith(
        ITEM_ID,
        expect.objectContaining({ final_price: '50.00' }),
      );
      expect(mockCalcService.recalculateCartTotals).toHaveBeenCalledWith(CART_ID);
    });

    it('returns valid=true even when price_changed issue exists (non-critical)', async () => {
      const itemWithOldPrice = { ...mockCartItem, final_price: '45.00' };
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([itemWithOldPrice] as any);
      mockGetProductDetailsForCart.mockResolvedValueOnce({
        ...mockProduct,
        selling_price: '50.00',
      } as any);
      mockGetAvailableStock.mockResolvedValueOnce(10);

      const result = await service.validateCart(CART_ID);

      // price_changed alone does not make valid=false
      expect(result.valid).toBe(true);
      expect(result.issues[0].type).toBe('price_changed');
    });

    it('handles multiple items with mixed issues', async () => {
      const secondItem = {
        ...mockCartItem,
        id: 'item-2',
        product_id: 'f6a7b8c9-d0e1-4345-abcd-456789012345',
        quantity: 1,
        final_price: '30.00',
      };
      const secondProduct = {
        ...mockProduct,
        id: 'f6a7b8c9-d0e1-4345-abcd-456789012345',
        product_title: 'Iron Rod',
        status: 'inactive',
      };

      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockCartItem, secondItem] as any);
      // First product: OK
      mockGetProductDetailsForCart.mockResolvedValueOnce(mockProduct as any);
      mockGetAvailableStock.mockResolvedValueOnce(5); // enough stock
      // Second product: inactive
      mockGetProductDetailsForCart.mockResolvedValueOnce({
        ...secondProduct,
        status: 'inactive',
      } as any);

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1); // only inactive product issue
      expect(result.issues[0].type).toBe('product_unavailable');
      expect(result.issues[0].productName).toBe('Iron Rod');
    });

    it('skips items with null product_id', async () => {
      const itemWithNoProduct = { ...mockCartItem, product_id: null };
      mockFindCartById.mockResolvedValueOnce(mockCart as any);
      mockGetCartItems.mockResolvedValueOnce([itemWithNoProduct] as any);

      const result = await service.validateCart(CART_ID);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(mockGetProductDetailsForCart).not.toHaveBeenCalled();
    });
  });
});
