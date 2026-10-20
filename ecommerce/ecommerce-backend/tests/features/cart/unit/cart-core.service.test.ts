/**
 * Cart Core Service Unit Tests
 *
 * Tests: getCart, ensureActiveCart, getActiveCart, getOrCreateCart,
 *        checkUnmergedGuestCart, verifyCartOwnership, buildEmptyCartResponse
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/features/cart/shared/queries', () => ({
  findActiveCartByUserId: jest.fn(),
  findActiveCartBySessionId: jest.fn(),
  findCartById: jest.fn(),
  createCart: jest.fn(),
  softDeleteCart: jest.fn(),
  transferCartOwnership: jest.fn(),
  hasUnmergedGuestCart: jest.fn(),
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

import { CartCoreService } from '@/features/cart/services/cart-core.service';
import {
  findActiveCartByUserId,
  findActiveCartBySessionId,
  findCartById,
  createCart,
  softDeleteCart,
  transferCartOwnership,
  hasUnmergedGuestCart,
} from '@/features/cart/shared/queries';
import { HttpException } from '@/utils';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockFindActiveCartByUserId = findActiveCartByUserId as jest.MockedFunction<
  typeof findActiveCartByUserId
>;
const mockFindActiveCartBySessionId = findActiveCartBySessionId as jest.MockedFunction<
  typeof findActiveCartBySessionId
>;
const mockFindCartById = findCartById as jest.MockedFunction<typeof findCartById>;
const mockCreateCart = createCart as jest.MockedFunction<typeof createCart>;
const mockSoftDeleteCart = softDeleteCart as jest.MockedFunction<typeof softDeleteCart>;
const mockTransferCartOwnership = transferCartOwnership as jest.MockedFunction<
  typeof transferCartOwnership
>;
const mockHasUnmergedGuestCart = hasUnmergedGuestCart as jest.MockedFunction<
  typeof hasUnmergedGuestCart
>;

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const SESSION_ID = 'e5f6a7b8-c9d0-4234-abcd-345678901234';
const OTHER_USER_ID = 'f6a7b8c9-d0e1-4345-abcd-456789012345';

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
  deleted_at: null,
  deleted_by: null,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
  last_activity_at: null,
  abandoned_at: null,
  created_by: USER_ID,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartCoreService', () => {
  let service: CartCoreService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartCoreService();
  });

  // ── getCart ──────────────────────────────────────────────────────────────

  describe('getCart', () => {
    it('returns cart when found', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);

      const result = await service.getCart(CART_ID);

      expect(result).toEqual(mockCart);
      expect(mockFindCartById).toHaveBeenCalledWith(CART_ID);
    });

    it('returns undefined when cart not found', async () => {
      mockFindCartById.mockResolvedValueOnce(undefined);

      const result = await service.getCart(CART_ID);

      expect(result).toBeUndefined();
    });
  });

  // ── ensureActiveCart ──────────────────────────────────────────────────────

  describe('ensureActiveCart', () => {
    it('returns active cart successfully', async () => {
      mockFindCartById.mockResolvedValueOnce(mockCart as any);

      const result = await service.ensureActiveCart(CART_ID);

      expect(result).toEqual(mockCart);
    });

    it('throws 404 when cart not found', async () => {
      mockFindCartById.mockResolvedValueOnce(undefined);

      await expect(service.ensureActiveCart(CART_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Cart not found',
      });
    });

    it('throws 400 when cart is not active (converted)', async () => {
      mockFindCartById.mockResolvedValueOnce({
        ...mockCart,
        cart_status: 'converted',
      } as any);

      await expect(service.ensureActiveCart(CART_ID)).rejects.toMatchObject({
        status: 400,
      });
    });

    it('throws 400 when cart is abandoned', async () => {
      mockFindCartById.mockResolvedValueOnce({
        ...mockCart,
        cart_status: 'abandoned',
      } as any);

      await expect(service.ensureActiveCart(CART_ID)).rejects.toMatchObject({ status: 400 });
    });

    it('throws 404 when cart is soft-deleted', async () => {
      mockFindCartById.mockResolvedValueOnce({
        ...mockCart,
        is_deleted: true,
      } as any);

      await expect(service.ensureActiveCart(CART_ID)).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── getActiveCart ─────────────────────────────────────────────────────────

  describe('getActiveCart', () => {
    it('returns cart by userId when found', async () => {
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockCart as any);

      const result = await service.getActiveCart(USER_ID);

      expect(result).toEqual(mockCart);
      expect(mockFindActiveCartByUserId).toHaveBeenCalledWith(USER_ID);
      expect(mockFindActiveCartBySessionId).not.toHaveBeenCalled();
    });

    it('falls back to sessionId when userId not provided', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      mockFindActiveCartBySessionId.mockResolvedValueOnce(guestCart as any);

      const result = await service.getActiveCart(undefined, SESSION_ID);

      expect(result).toEqual(guestCart);
      expect(mockFindActiveCartBySessionId).toHaveBeenCalledWith(SESSION_ID);
    });

    it('falls back to sessionId when userId cart not found', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      mockFindActiveCartByUserId.mockResolvedValueOnce(undefined);
      mockFindActiveCartBySessionId.mockResolvedValueOnce(guestCart as any);

      const result = await service.getActiveCart(USER_ID, SESSION_ID);

      expect(result).toEqual(guestCart);
    });

    it('returns undefined when neither userId nor sessionId provided', async () => {
      const result = await service.getActiveCart();

      expect(result).toBeUndefined();
      expect(mockFindActiveCartByUserId).not.toHaveBeenCalled();
    });

    it('returns undefined when no cart found for any identifier', async () => {
      mockFindActiveCartByUserId.mockResolvedValueOnce(undefined);
      mockFindActiveCartBySessionId.mockResolvedValueOnce(undefined);

      const result = await service.getActiveCart(USER_ID, SESSION_ID);

      expect(result).toBeUndefined();
    });
  });

  // ── getOrCreateCart ───────────────────────────────────────────────────────

  describe('getOrCreateCart', () => {
    it('returns existing cart for userId', async () => {
      mockFindActiveCartByUserId.mockResolvedValueOnce(mockCart as any);

      const result = await service.getOrCreateCart(USER_ID);

      expect(result).toEqual(mockCart);
      expect(mockCreateCart).not.toHaveBeenCalled();
    });

    it('creates new cart for userId when none exists', async () => {
      mockFindActiveCartByUserId.mockResolvedValueOnce(undefined);
      mockFindActiveCartBySessionId.mockResolvedValueOnce(undefined);
      mockCreateCart.mockResolvedValueOnce(mockCart as any);

      const result = await service.getOrCreateCart(USER_ID);

      expect(result).toEqual(mockCart);
      expect(mockCreateCart).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: USER_ID, cart_status: 'active' }),
      );
    });

    it('creates new guest cart with sessionId', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      mockFindActiveCartBySessionId.mockResolvedValueOnce(undefined);
      mockCreateCart.mockResolvedValueOnce(guestCart as any);

      const result = await service.getOrCreateCart(undefined, SESSION_ID);

      expect(result).toEqual(guestCart);
      expect(mockCreateCart).toHaveBeenCalledWith(
        expect.objectContaining({ session_id: SESSION_ID, user_id: null }),
      );
    });

    it('throws 400 when neither userId nor sessionId provided', async () => {
      await expect(service.getOrCreateCart()).rejects.toMatchObject({ status: 400 });
      expect(mockCreateCart).not.toHaveBeenCalled();
    });
  });

  // ── checkUnmergedGuestCart ────────────────────────────────────────────────

  describe('checkUnmergedGuestCart', () => {
    it('returns true when unmerged guest cart exists', async () => {
      mockHasUnmergedGuestCart.mockResolvedValueOnce(true);

      const result = await service.checkUnmergedGuestCart(SESSION_ID);

      expect(result).toBe(true);
      expect(mockHasUnmergedGuestCart).toHaveBeenCalledWith(SESSION_ID);
    });

    it('returns false when no unmerged guest cart', async () => {
      mockHasUnmergedGuestCart.mockResolvedValueOnce(false);

      const result = await service.checkUnmergedGuestCart(SESSION_ID);

      expect(result).toBe(false);
    });

    it('returns false when sessionId not provided', async () => {
      const result = await service.checkUnmergedGuestCart();

      expect(result).toBe(false);
      expect(mockHasUnmergedGuestCart).not.toHaveBeenCalled();
    });
  });

  // ── verifyCartOwnership ───────────────────────────────────────────────────

  describe('verifyCartOwnership', () => {
    it('resolves when userId matches cart owner', async () => {
      await expect(service.verifyCartOwnership(mockCart as any, USER_ID)).resolves.toBeUndefined();
    });

    it('throws 403 when userId does not match cart owner', async () => {
      await expect(
        service.verifyCartOwnership(mockCart as any, OTHER_USER_ID),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('resolves when sessionId matches guest cart', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };

      await expect(
        service.verifyCartOwnership(guestCart as any, undefined, SESSION_ID),
      ).resolves.toBeUndefined();
    });

    it('throws 403 when sessionId does not match cart session', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: 'other-session' };

      await expect(
        service.verifyCartOwnership(guestCart as any, undefined, SESSION_ID),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('throws 401 when neither userId nor sessionId provided', async () => {
      await expect(service.verifyCartOwnership(mockCart as any)).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  // ── transferOwnership ─────────────────────────────────────────────────────

  describe('transferOwnership', () => {
    it('calls transferCartOwnership with correct args', async () => {
      mockTransferCartOwnership.mockResolvedValueOnce(undefined as any);

      await service.transferOwnership(CART_ID, USER_ID);

      expect(mockTransferCartOwnership).toHaveBeenCalledWith(CART_ID, USER_ID);
    });
  });

  // ── deleteCart ────────────────────────────────────────────────────────────

  describe('deleteCart', () => {
    it('soft-deletes cart with deletedBy user', async () => {
      mockSoftDeleteCart.mockResolvedValueOnce(undefined as any);

      await service.deleteCart(CART_ID, USER_ID);

      expect(mockSoftDeleteCart).toHaveBeenCalledWith(CART_ID, USER_ID);
    });

    it('soft-deletes cart without deletedBy', async () => {
      mockSoftDeleteCart.mockResolvedValueOnce(undefined as any);

      await service.deleteCart(CART_ID);

      expect(mockSoftDeleteCart).toHaveBeenCalledWith(CART_ID, undefined);
    });
  });

  // ── buildEmptyCartResponse ────────────────────────────────────────────────

  describe('buildEmptyCartResponse', () => {
    it('returns empty cart structure with correct defaults', () => {
      const result = service.buildEmptyCartResponse();

      expect(result.id).toBeNull();
      expect(result.currency).toBe('INR');
      expect(result.subtotal).toBe('0.00');
      expect(result.grand_total).toBe('0.00');
      expect(result.items).toEqual([]);
      expect(result.itemCount).toBe(0);
      expect(result.hasUnmergedGuestCart).toBe(false);
    });

    it('returns hasUnmergedGuestCart=true when guest cart flag set', () => {
      const result = service.buildEmptyCartResponse(true);

      expect(result.hasUnmergedGuestCart).toBe(true);
    });
  });
});
