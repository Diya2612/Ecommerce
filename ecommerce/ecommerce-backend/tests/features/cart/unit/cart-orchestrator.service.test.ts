/**
 * Cart Orchestrator Service Unit Tests
 *
 * Tests: getCartWithDetails, updateItemQuantityWithValidation, removeItemWithValidation
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/features/cart/services/cart-core.service', () => ({
  cartCoreService: {
    getActiveCart: jest.fn(),
    getCart: jest.fn(),
    buildEmptyCartResponse: jest.fn(),
    checkUnmergedGuestCart: jest.fn(),
    enrichCartWithDiscountMetadata: jest.fn(),
    verifyCartOwnership: jest.fn(),
  },
}));

jest.mock('@/features/cart/services/cart-item.service', () => ({
  cartItemService: {
    getItemsWithDetails: jest.fn(),
    removeItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    getItems: jest.fn(),
  },
}));

jest.mock('@/features/cart/services/cart-calculation.service', () => ({
  cartCalculationService: {
    recalculateCartTotals: jest.fn(),
  },
}));

jest.mock('@/features/cart/shared/queries', () => ({
  findCartItemById: jest.fn(),
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

import { CartOrchestratorService } from '@/features/cart/services/cart-orchestrator.service';
import { cartCoreService } from '@/features/cart/services/cart-core.service';
import { cartItemService } from '@/features/cart/services/cart-item.service';
import { cartCalculationService } from '@/features/cart/services/cart-calculation.service';
import { findCartItemById } from '@/features/cart/shared/queries';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockCoreService = cartCoreService as jest.Mocked<typeof cartCoreService>;
const mockItemService = cartItemService as jest.Mocked<typeof cartItemService>;
const mockCalcService = cartCalculationService as jest.Mocked<typeof cartCalculationService>;
const mockFindCartItemById = findCartItemById as jest.MockedFunction<typeof findCartItemById>;

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ITEM_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';
const SESSION_ID = 'e5f6a7b8-c9d0-4234-abcd-345678901234';

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
  applied_discount_codes: [] as string[],
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

const mockEnrichedItem = {
  ...mockCartItem,
  inStock: true,
  availableStock: 10,
  priceChanged: false,
  currentPrice: '50.00',
};

const mockEmptyCartResponse = {
  id: null,
  currency: 'INR',
  subtotal: '0.00',
  discount_total: '0.00',
  shipping_total: '0.00',
  tax_total: '0.00',
  grand_total: '0.00',
  applied_discount_codes: [],
  applied_giftcard_codes: [],
  applied_discounts: [],
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  hasStockIssues: false,
  hasPriceChanges: false,
  hasUnmergedGuestCart: false,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartOrchestratorService', () => {
  let service: CartOrchestratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartOrchestratorService();
  });

  // ── getCartWithDetails ────────────────────────────────────────────────────

  describe('getCartWithDetails', () => {
    it('returns empty cart response when no active cart found', async () => {
      mockCoreService.getActiveCart.mockResolvedValueOnce(undefined);
      mockCoreService.checkUnmergedGuestCart.mockResolvedValueOnce(false);
      mockCoreService.buildEmptyCartResponse.mockReturnValueOnce(mockEmptyCartResponse as any);

      const result = await service.getCartWithDetails(USER_ID, undefined);

      expect(result).toEqual(mockEmptyCartResponse);
      expect(mockCoreService.buildEmptyCartResponse).toHaveBeenCalled();
    });

    it('returns enriched cart response with items', async () => {
      mockCoreService.getActiveCart.mockResolvedValueOnce(mockCart as any);
      mockItemService.getItemsWithDetails.mockResolvedValueOnce([mockEnrichedItem] as any);
      mockCoreService.enrichCartWithDiscountMetadata.mockResolvedValueOnce([]);

      const result = await service.getCartWithDetails(USER_ID, undefined);

      expect(result).toMatchObject({
        id: CART_ID,
        itemCount: 1,
        items: expect.arrayContaining([expect.objectContaining({ id: ITEM_ID })]),
      });
      expect(mockItemService.getItemsWithDetails).toHaveBeenCalledWith(CART_ID);
    });

    it('returns hasUnmergedGuestCart=true when guest cart detected', async () => {
      mockCoreService.getActiveCart.mockResolvedValueOnce(undefined);
      mockCoreService.checkUnmergedGuestCart.mockResolvedValueOnce(true);
      mockCoreService.buildEmptyCartResponse.mockReturnValueOnce({
        ...mockEmptyCartResponse,
        hasUnmergedGuestCart: true,
      } as any);

      const result = await service.getCartWithDetails(USER_ID, SESSION_ID);

      expect(mockCoreService.checkUnmergedGuestCart).toHaveBeenCalledWith(SESSION_ID);
      expect(result.hasUnmergedGuestCart).toBe(true);
    });

    it('returns cart for guest user via sessionId', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      mockCoreService.getActiveCart.mockResolvedValueOnce(guestCart as any);
      mockItemService.getItemsWithDetails.mockResolvedValueOnce([]);
      mockCoreService.enrichCartWithDiscountMetadata.mockResolvedValueOnce([]);

      const result = await service.getCartWithDetails(undefined, SESSION_ID);

      expect(mockCoreService.getActiveCart).toHaveBeenCalledWith(undefined, SESSION_ID);
      expect(result.itemCount).toBe(0);
    });

    it('flags hasStockIssues when items have stock problems', async () => {
      const outOfStockItem = { ...mockEnrichedItem, inStock: false, availableStock: 0 };
      mockCoreService.getActiveCart.mockResolvedValueOnce(mockCart as any);
      mockItemService.getItemsWithDetails.mockResolvedValueOnce([outOfStockItem] as any);
      mockCoreService.enrichCartWithDiscountMetadata.mockResolvedValueOnce([]);

      const result = await service.getCartWithDetails(USER_ID, undefined);

      expect(result.hasStockIssues).toBe(true);
    });

    it('flags hasPriceChanges when items have price changes', async () => {
      const priceChangedItem = { ...mockEnrichedItem, priceChanged: true };
      mockCoreService.getActiveCart.mockResolvedValueOnce(mockCart as any);
      mockItemService.getItemsWithDetails.mockResolvedValueOnce([priceChangedItem] as any);
      mockCoreService.enrichCartWithDiscountMetadata.mockResolvedValueOnce([]);

      const result = await service.getCartWithDetails(USER_ID, undefined);

      expect(result.hasPriceChanges).toBe(true);
    });
  });

  // ── removeItemWithValidation ──────────────────────────────────────────────

  describe('removeItemWithValidation', () => {
    it('removes item and returns updated cart', async () => {
      mockFindCartItemById.mockResolvedValueOnce(mockCartItem as any);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any);
      mockCoreService.verifyCartOwnership.mockResolvedValueOnce(undefined);
      mockItemService.removeItem.mockResolvedValueOnce(undefined);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any); // final getCart

      await service.removeItemWithValidation(ITEM_ID, USER_ID, undefined);

      expect(mockFindCartItemById).toHaveBeenCalledWith(ITEM_ID);
      expect(mockCoreService.verifyCartOwnership).toHaveBeenCalledWith(
        mockCart,
        USER_ID,
        undefined,
      );
      expect(mockItemService.removeItem).toHaveBeenCalledWith(ITEM_ID);
      expect(mockCalcService.recalculateCartTotals).toHaveBeenCalledWith(CART_ID);
    });

    it('throws 404 when cart item not found', async () => {
      mockFindCartItemById.mockResolvedValueOnce(undefined);

      await expect(
        service.removeItemWithValidation(ITEM_ID, USER_ID, undefined),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockItemService.removeItem).not.toHaveBeenCalled();
    });

    it('throws 403 when user does not own the cart', async () => {
      mockFindCartItemById.mockResolvedValueOnce(mockCartItem as any);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any);
      mockCoreService.verifyCartOwnership.mockRejectedValueOnce(
        Object.assign(new Error('Not authorized'), { status: 403 }),
      );

      await expect(
        service.removeItemWithValidation(ITEM_ID, 'other-user', undefined),
      ).rejects.toMatchObject({ status: 403 });
      expect(mockItemService.removeItem).not.toHaveBeenCalled();
    });
  });

  // ── updateItemQuantityWithValidation ──────────────────────────────────────

  describe('updateItemQuantityWithValidation', () => {
    it('updates item quantity and returns updated item', async () => {
      const updatedItem = { ...mockCartItem, quantity: 5 };
      mockFindCartItemById.mockResolvedValueOnce(mockCartItem as any);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any);
      mockCoreService.verifyCartOwnership.mockResolvedValueOnce(undefined);
      mockItemService.updateItemQuantity.mockResolvedValueOnce(updatedItem as any);
      mockCalcService.recalculateCartTotals.mockResolvedValueOnce(undefined);
      mockFindCartItemById.mockResolvedValueOnce(updatedItem as any); // final findCartItemById

      const result = await service.updateItemQuantityWithValidation(ITEM_ID, 5, USER_ID, undefined);

      expect(mockItemService.updateItemQuantity).toHaveBeenCalledWith(ITEM_ID, 5);
      expect(mockCalcService.recalculateCartTotals).toHaveBeenCalledWith(CART_ID);
      expect(result).toEqual(updatedItem);
    });

    it('throws 404 when item not found', async () => {
      mockFindCartItemById.mockResolvedValueOnce(undefined);

      await expect(
        service.updateItemQuantityWithValidation(ITEM_ID, 5, USER_ID, undefined),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws 403 when user does not own cart', async () => {
      mockFindCartItemById.mockResolvedValueOnce(mockCartItem as any);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any);
      mockCoreService.verifyCartOwnership.mockRejectedValueOnce(
        Object.assign(new Error('Not authorized'), { status: 403 }),
      );

      await expect(
        service.updateItemQuantityWithValidation(ITEM_ID, 5, 'other-user', undefined),
      ).rejects.toMatchObject({ status: 403 });
      expect(mockItemService.updateItemQuantity).not.toHaveBeenCalled();
    });

    it('propagates insufficient stock error from updateItemQuantity', async () => {
      mockFindCartItemById.mockResolvedValueOnce(mockCartItem as any);
      mockCoreService.getCart.mockResolvedValueOnce(mockCart as any);
      mockCoreService.verifyCartOwnership.mockResolvedValueOnce(undefined);
      mockItemService.updateItemQuantity.mockRejectedValueOnce(
        Object.assign(new Error('Insufficient stock'), { status: 400 }),
      );

      await expect(
        service.updateItemQuantityWithValidation(ITEM_ID, 100, USER_ID, undefined),
      ).rejects.toMatchObject({ status: 400 });
    });
  });
});
