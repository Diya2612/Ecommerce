/**
 * Cart Merge Service Unit Tests
 *
 * Tests: mergeGuestCartIntoUserCart — all merge scenarios
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/features/cart/shared/queries', () => ({
  findCartBySessionId: jest.fn(),
  findActiveCartByUserId: jest.fn(),
  getCartItems: jest.fn(),
  createCart: jest.fn(),
  markCartAsConverted: jest.fn(),
  getAvailableStock: jest.fn(),
}));

jest.mock('@/features/cart/services/cart-item.service', () => ({
  cartItemService: {
    addItem: jest.fn(),
    updateItemQuantity: jest.fn(),
  },
}));

jest.mock('@/features/cart/services/cart-calculation.service', () => ({
  cartCalculationService: {
    recalculateCartTotals: jest.fn(),
  },
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  isRedisReady: jest.fn().mockReturnValue(false),
  redisClient: { set: jest.fn(), del: jest.fn() },
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

import { CartMergeService } from '@/features/cart/services/cart-merge.service';
import {
  findCartBySessionId,
  findActiveCartByUserId,
  getCartItems,
  createCart,
  markCartAsConverted,
  getAvailableStock,
} from '@/features/cart/shared/queries';
import { cartItemService } from '@/features/cart/services/cart-item.service';
import { cartCalculationService } from '@/features/cart/services/cart-calculation.service';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockFindCartBySessionId = findCartBySessionId as jest.MockedFunction<
  typeof findCartBySessionId
>;
const mockFindActiveCartByUserId = findActiveCartByUserId as jest.MockedFunction<
  typeof findActiveCartByUserId
>;
const mockGetCartItems = getCartItems as jest.MockedFunction<typeof getCartItems>;
const mockCreateCart = createCart as jest.MockedFunction<typeof createCart>;
const mockMarkCartAsConverted = markCartAsConverted as jest.MockedFunction<
  typeof markCartAsConverted
>;
const mockGetAvailableStock = getAvailableStock as jest.MockedFunction<typeof getAvailableStock>;
const mockItemService = cartItemService as jest.Mocked<typeof cartItemService>;
const mockCalcService = cartCalculationService as jest.Mocked<typeof cartCalculationService>;

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const GUEST_CART_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const ITEM_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';
const PRODUCT_ID = 'f6a7b8c9-d0e1-4345-abcd-456789012345';
const SESSION_ID = 'e5f6a7b8-c9d0-4234-abcd-345678901234';

const mockUserCart = {
  id: CART_ID,
  user_id: USER_ID,
  session_id: null,
  cart_status: 'active' as const,
  subtotal: '0.00',
  discount_total: '0.00',
  shipping_total: '0.00',
  tax_total: '0.00',
  grand_total: '0.00',
  applied_discount_codes: [],
  applied_giftcard_codes: [],
  is_deleted: false,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
  created_by: USER_ID,
};

const mockGuestCart = {
  id: GUEST_CART_ID,
  user_id: null,
  session_id: SESSION_ID,
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
  created_by: null,
};

const mockGuestItem = {
  id: ITEM_ID,
  cart_id: GUEST_CART_ID,
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
  created_at: new Date(),
  updated_at: new Date(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartMergeService', () => {
  let service: CartMergeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartMergeService();
  });

  // ── mergeGuestCartIntoUserCart ────────────────────────────────────────────

  describe('mergeGuestCartIntoUserCart', () => {
    it('returns merged=false with message when no guest cart found', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce(undefined);
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([]);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(result.merged).toBe(false);
      expect(result.message).toBe('No guest cart found');
      expect(result.cart_id).toBe(CART_ID);
    });

    it('returns merged=false when guest cart is already converted', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce({
        ...mockGuestCart,
        cart_status: 'converted',
      } as any);
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([]);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(result.merged).toBe(false);
      expect(result.message).toBe('Guest cart already merged');
    });

    it('returns merged=false when guest cart is not active', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce({
        ...mockGuestCart,
        cart_status: 'abandoned',
      } as any);
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([]);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(result.merged).toBe(false);
      expect(result.message).toBe('No active guest cart found');
    });

    it('returns merged=true with 0 items when guest cart is empty', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      mockGetCartItems.mockResolvedValueOnce([]); // guest items
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(result.merged).toBe(true);
      expect(result.itemsMerged).toBe(0);
      expect(result.message).toBe('Guest cart was empty');
      expect(mockMarkCartAsConverted).toHaveBeenCalledWith(GUEST_CART_ID);
    });

    it('merges guest items into existing user cart', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      // guest items
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any);
      // user cart lookup
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      // user cart items (none)
      mockGetCartItems.mockResolvedValueOnce([]);
      // stock check
      mockGetAvailableStock.mockResolvedValueOnce(10);
      // addItem stub
      mockItemService.addItem.mockResolvedValueOnce(mockGuestItem as any);
      // recalculate
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      // markCartAsConverted
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);
      // final items count
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(result.merged).toBe(true);
      expect(result.cart_id).toBe(CART_ID);
      expect(result.itemsMerged).toBe(1);
      expect(mockMarkCartAsConverted).toHaveBeenCalledWith(GUEST_CART_ID);
      expect(mockCalcService.recalculateCartTotals).toHaveBeenCalledWith(CART_ID);
    });

    it('creates new user cart when user has no existing cart', async () => {
      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any);
      mockFindActiveCartByUserId.mockResolvedValueOnce(undefined); // no user cart
      mockCreateCart.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([]); // user items (empty)
      mockGetAvailableStock.mockResolvedValueOnce(10);
      mockItemService.addItem.mockResolvedValueOnce(mockGuestItem as any);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(mockCreateCart).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: USER_ID, cart_status: 'active' }),
      );
      expect(result.merged).toBe(true);
    });

    it('combines quantities when user already has the same product', async () => {
      const existingUserItem = {
        ...mockGuestItem,
        id: 'user-item-id',
        cart_id: CART_ID,
        quantity: 3, // user already has 3
      };

      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any); // guest item qty=2
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([existingUserItem] as any); // user has same product
      mockGetAvailableStock.mockResolvedValueOnce(10); // max 10, 3+2=5 ≤ 10
      mockItemService.updateItemQuantity.mockResolvedValueOnce(undefined as any);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);
      mockGetCartItems.mockResolvedValueOnce([{ ...existingUserItem, quantity: 5 }] as any);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(mockItemService.updateItemQuantity).toHaveBeenCalledWith('user-item-id', 5);
      expect(result.itemsMerged).toBe(1);
    });

    it('caps combined quantity at available stock', async () => {
      const existingUserItem = {
        ...mockGuestItem,
        id: 'user-item-id',
        cart_id: CART_ID,
        quantity: 8, // user has 8
      };

      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any); // guest qty=2
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([existingUserItem] as any);
      mockGetAvailableStock.mockResolvedValueOnce(9); // only 9 available, 8+2=10 > 9
      mockItemService.updateItemQuantity.mockResolvedValueOnce(undefined as any);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);
      mockGetCartItems.mockResolvedValueOnce([{ ...existingUserItem, quantity: 9 }] as any);

      await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(mockItemService.updateItemQuantity).toHaveBeenCalledWith('user-item-id', 9); // capped at 9
    });

    it('skips item when stock is 0 and user already has same product', async () => {
      const existingUserItem = {
        ...mockGuestItem,
        id: 'user-item-id',
        cart_id: CART_ID,
        quantity: 1,
      };

      mockFindCartBySessionId.mockResolvedValueOnce(mockGuestCart as any);
      mockGetCartItems.mockResolvedValueOnce([mockGuestItem] as any);
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockUserCart as any);
      mockGetCartItems.mockResolvedValueOnce([existingUserItem] as any);
      mockGetAvailableStock.mockResolvedValueOnce(0); // out of stock
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockMarkCartAsConverted.mockResolvedValueOnce(undefined as any);
      mockGetCartItems.mockResolvedValueOnce([]);

      const result = await service.mergeGuestCartIntoUserCart(USER_ID, SESSION_ID);

      expect(mockItemService.updateItemQuantity).not.toHaveBeenCalled();
      expect(result.itemsMerged).toBe(0);
    });
  });
});
