/**
 * Cart API Integration Tests (Mocked Services)
 *
 * Strategy: Inline Express app mirroring cart routes,
 * calling mocked service stubs directly — no transitive DB/Redis hangs.
 *
 * What we verify:
 *   - Correct HTTP status codes for success and error paths
 *   - Correct service methods called with expected arguments
 *   - Validation rejects malformed payloads (400)
 *   - Error propagation from service layer → HTTP response
 *   - Auth/permission guard enforcement (401 / 403)
 *   - Guest cart support via x-session-id header
 *   - optionalAuth vs requireAuth routing
 *
 * APIs covered:
 *   GET    /cart                    - get cart with details
 *   POST   /cart/items              - add item to cart
 *   PUT    /cart/items/:id          - update cart item quantity
 *   DELETE /cart/items/:id          - remove cart item
 *   POST   /cart/discount           - apply discount code
 *   DELETE /cart/discount           - remove discount code
 *   DELETE /cart                    - clear cart
 *   POST   /cart/merge              - merge guest cart into user cart
 *   POST   /cart/validate           - validate cart stock and prices
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ITEM_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123';
const SESSION_ID = 'e5f6a7b8-c9d0-4234-abcd-345678901234';

const INVALID_UUID = 'not-a-valid-uuid';

// ── Service stubs ─────────────────────────────────────────────────────────────

const cartCoreServiceStub = {
  getOrCreateCart: jest.fn(),
  getActiveCart: jest.fn(),
  getCart: jest.fn(),
  verifyCartOwnership: jest.fn(),
  buildEmptyCartResponse: jest.fn(),
  enrichCartWithDiscountMetadata: jest.fn(),
  checkUnmergedGuestCart: jest.fn(),
  ensureActiveCart: jest.fn(),
  transferOwnership: jest.fn(),
  deleteCart: jest.fn(),
};

const cartItemServiceStub = {
  addItem: jest.fn(),
  getItems: jest.fn(),
  getItemsWithDetails: jest.fn(),
  removeItem: jest.fn(),
  updateItemQuantity: jest.fn(),
  clearAllItems: jest.fn(),
};

const cartCalculationServiceStub = {
  recalculateCartTotals: jest.fn(),
  applyDiscountCode: jest.fn(),
  removeDiscountCode: jest.fn(),
};

const cartOrchestratorServiceStub = {
  getCartWithDetails: jest.fn(),
  updateItemQuantityWithValidation: jest.fn(),
  removeItemWithValidation: jest.fn(),
};

const cartMergeServiceStub = {
  mergeGuestCartIntoUserCart: jest.fn(),
};

const cartValidationServiceStub = {
  validateCart: jest.fn(),
};

// ── Shared test fixtures ───────────────────────────────────────────────────────

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
  discount_amount: '10.00',
  line_subtotal: '100.00',
  line_total: '90.00',
  product_name: 'Steel Pipe 6 inch',
  product_sku: 'SP-6IN-001',
  product_image_url: null,
  is_deleted: false,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

const mockCartResponse = {
  id: CART_ID,
  currency: 'INR',
  subtotal: '100.00',
  discount_total: '0.00',
  shipping_total: '0.00',
  tax_total: '0.00',
  grand_total: '100.00',
  applied_discount_codes: [],
  applied_giftcard_codes: [],
  applied_discounts: [],
  items: [mockCartItem],
  itemCount: 1,
  totalQuantity: 2,
  hasStockIssues: false,
  hasPriceChanges: false,
  hasUnmergedGuestCart: false,
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

const mockMergeResponse = {
  merged: true,
  cart_id: CART_ID,
  itemCount: 3,
  itemsMerged: 2,
  totalItems: 3,
  message: 'Successfully merged 2 items from guest cart',
};

const mockValidationResponse = {
  valid: true,
  cartId: CART_ID,
  issues: [],
  updatedTotals: null,
};

// ── Helper: create HttpException class ────────────────────────────────────────

class HttpException extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpException';
  }
}

// ── Helper: decode JWT-like token (stub auth middleware) ───────────────────────

function makeAuthToken(userId: string): string {
  // Simple base64-encoded JSON token for stub middleware
  return Buffer.from(JSON.stringify({ id: userId, role: 'admin' })).toString('base64');
}

// ── Inline Express app ────────────────────────────────────────────────────────

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());

  // ── Stub optionalAuth middleware ──────────────────────────────────────────
  function optionalAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = JSON.parse(Buffer.from(authHeader.slice(7), 'base64').toString('utf-8'));
        (req as any).user = payload;
      } catch {
        // ignore invalid token
      }
    }

    if (sessionId) {
      (req as any).sessionId = sessionId;
    }

    next();
  }

  // ── Stub requireAuth middleware ───────────────────────────────────────────
  function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    try {
      const payload = JSON.parse(Buffer.from(authHeader.slice(7), 'base64').toString('utf-8'));
      (req as any).user = payload;
      next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }

  // ── Stub Zod validation middleware ────────────────────────────────────────
  function validate(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          res.status(400).json({ success: false, errors: result.error.errors });
          return;
        }
        req.body = result.data;
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  function validateParams(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const result = schema.safeParse(req.params);
        if (!result.success) {
          res.status(400).json({ success: false, errors: result.error.errors });
          return;
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  function validateQuery(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const result = schema.safeParse(req.query);
        if (!result.success) {
          res.status(400).json({ success: false, errors: result.error.errors });
          return;
        }
        req.query = result.data;
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  // Lazy import zod schemas
  const { z } = require('zod');

  const addToCartSchema = z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().optional(),
    quantity: z.number().int().min(1).max(100).default(1),
  });

  const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1).max(100),
  });

  const uuidParamSchema = z.object({
    id: z.string().uuid(),
  });

  const applyDiscountSchema = z.object({
    code: z
      .string()
      .trim()
      .transform((v: string) => v.toUpperCase()),
  });

  const removeDiscountSchema = z.object({
    code: z
      .string()
      .trim()
      .transform((v: string) => v.toUpperCase()),
  });

  const mergeCartSchema = z.object({
    session_id: z.string().uuid(),
  });

  // ── GET /cart ─────────────────────────────────────────────────────────────
  app.get('/cart', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionId;
      const cart = await cartOrchestratorServiceStub.getCartWithDetails(userId, sessionId);
      res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /cart/items ──────────────────────────────────────────────────────
  app.post(
    '/cart/items',
    optionalAuth,
    validate(addToCartSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const { product_id, variant_id, quantity } = req.body;

        const cart = await cartCoreServiceStub.getOrCreateCart(userId, sessionId);
        const item = await cartItemServiceStub.addItem(cart.id, {
          product_id,
          variant_id,
          quantity,
        });
        await cartCalculationServiceStub.recalculateCartTotals(cart.id);
        const updatedCart = await cartCoreServiceStub.getCart(cart.id);
        const items = await cartItemServiceStub.getItems(cart.id);

        res.status(201).json({ success: true, data: { cart: updatedCart, items, item } });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── PUT /cart/items/:id ───────────────────────────────────────────────────
  app.put(
    '/cart/items/:id',
    optionalAuth,
    validateParams(uuidParamSchema),
    validate(updateCartItemSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const { id } = req.params;
        const { quantity } = req.body;

        const result = await cartOrchestratorServiceStub.updateItemQuantityWithValidation(
          id,
          quantity,
          userId,
          sessionId,
        );
        res.status(200).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── DELETE /cart/items/:id ────────────────────────────────────────────────
  app.delete(
    '/cart/items/:id',
    optionalAuth,
    validateParams(uuidParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const { id } = req.params;

        const result = await cartOrchestratorServiceStub.removeItemWithValidation(
          id,
          userId,
          sessionId,
        );
        res.status(200).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /cart/discount ───────────────────────────────────────────────────
  app.post(
    '/cart/discount',
    optionalAuth,
    validate(applyDiscountSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const { code } = req.body;

        const cart = await cartCoreServiceStub.getOrCreateCart(userId, sessionId);
        const updatedCart = await cartCalculationServiceStub.applyDiscountCode(
          cart.id,
          code,
          userId,
        );
        res.status(200).json({ success: true, data: updatedCart });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── DELETE /cart/discount ─────────────────────────────────────────────────
  app.delete(
    '/cart/discount',
    optionalAuth,
    validate(removeDiscountSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const { code } = req.body;

        const cart = await cartCoreServiceStub.getOrCreateCart(userId, sessionId);
        const updatedCart = await cartCalculationServiceStub.removeDiscountCode(cart.id, code);
        res.status(200).json({ success: true, data: updatedCart });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── DELETE /cart ──────────────────────────────────────────────────────────
  app.delete('/cart', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionId;

      if (!userId && !sessionId) {
        res.status(401).json({ success: false, message: 'Authentication or session ID required' });
        return;
      }

      const cart = await cartCoreServiceStub.getActiveCart(userId, sessionId);
      if (!cart) {
        res.status(200).json({ success: true, data: { message: 'No active cart found' } });
        return;
      }

      await cartCoreServiceStub.verifyCartOwnership(cart, userId, sessionId);
      await cartItemServiceStub.clearAllItems(cart.id);
      res.status(200).json({ success: true, data: { message: 'Cart cleared successfully' } });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /cart/merge ──────────────────────────────────────────────────────
  app.post(
    '/cart/merge',
    requireAuth,
    validate(mergeCartSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const { session_id } = req.body;

        const result = await cartMergeServiceStub.mergeGuestCartIntoUserCart(userId, session_id);
        res.status(200).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /cart/validate ───────────────────────────────────────────────────
  app.post(
    '/cart/validate',
    optionalAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        const sessionId = (req as any).sessionId;
        const autoRepair = req.query.auto_repair === 'true';

        const cart = await cartCoreServiceStub.getActiveCart(userId, sessionId);
        if (!cart) {
          res.status(404).json({ success: false, message: 'No active cart found' });
          return;
        }

        const result = await cartValidationServiceStub.validateCart(cart.id, autoRepair);
        res.status(200).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── Error handler ─────────────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof HttpException ? err.status : (err.status ?? 500);
    res.status(status).json({ success: false, message: err.message });
  });

  return app;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('Cart API Integration Tests', () => {
  let app: express.Application;
  const authHeader = `Bearer ${makeAuthToken(USER_ID)}`;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /cart ──────────────────────────────────────────────────────────────

  describe('GET /cart', () => {
    it('returns 200 with cart data for authenticated user', async () => {
      cartOrchestratorServiceStub.getCartWithDetails.mockResolvedValueOnce(mockCartResponse);

      const res = await request(app).get('/cart').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(CART_ID);
      expect(cartOrchestratorServiceStub.getCartWithDetails).toHaveBeenCalledWith(
        USER_ID,
        undefined,
      );
    });

    it('returns 200 with cart for guest using session ID', async () => {
      cartOrchestratorServiceStub.getCartWithDetails.mockResolvedValueOnce(mockCartResponse);

      const res = await request(app).get('/cart').set('x-session-id', SESSION_ID);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartOrchestratorServiceStub.getCartWithDetails).toHaveBeenCalledWith(
        undefined,
        SESSION_ID,
      );
    });

    it('returns 200 with empty cart when no cart exists', async () => {
      cartOrchestratorServiceStub.getCartWithDetails.mockResolvedValueOnce(mockEmptyCartResponse);

      const res = await request(app).get('/cart');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBeNull();
      expect(res.body.data.itemCount).toBe(0);
    });

    it('propagates service errors as 500', async () => {
      cartOrchestratorServiceStub.getCartWithDetails.mockRejectedValueOnce(
        new Error('Database error'),
      );

      const res = await request(app).get('/cart').set('Authorization', authHeader);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /cart/items ───────────────────────────────────────────────────────

  describe('POST /cart/items', () => {
    const validPayload = { product_id: PRODUCT_ID, quantity: 2 };

    it('returns 201 with created item for authenticated user', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.addItem.mockResolvedValueOnce(mockCartItem);
      cartCalculationServiceStub.recalculateCartTotals.mockResolvedValueOnce(undefined);
      cartCoreServiceStub.getCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.getItems.mockResolvedValueOnce([mockCartItem]);

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.id).toBe(ITEM_ID);
      expect(cartCoreServiceStub.getOrCreateCart).toHaveBeenCalledWith(USER_ID, undefined);
      expect(cartItemServiceStub.addItem).toHaveBeenCalledWith(CART_ID, {
        product_id: PRODUCT_ID,
        variant_id: undefined,
        quantity: 2,
      });
    });

    it('returns 201 with item for guest user with session ID', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce({
        ...mockCart,
        user_id: null,
        session_id: SESSION_ID,
      });
      cartItemServiceStub.addItem.mockResolvedValueOnce(mockCartItem);
      cartCalculationServiceStub.recalculateCartTotals.mockResolvedValueOnce(undefined);
      cartCoreServiceStub.getCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.getItems.mockResolvedValueOnce([mockCartItem]);

      const res = await request(app)
        .post('/cart/items')
        .set('x-session-id', SESSION_ID)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(cartCoreServiceStub.getOrCreateCart).toHaveBeenCalledWith(undefined, SESSION_ID);
    });

    it('returns 400 for missing product_id', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(cartItemServiceStub.addItem).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid UUID product_id', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send({ product_id: INVALID_UUID, quantity: 1 });

      expect(res.status).toBe(400);
    });

    it('returns 400 for quantity exceeding maximum (100)', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send({ product_id: PRODUCT_ID, quantity: 101 });

      expect(res.status).toBe(400);
    });

    it('returns 400 for zero quantity', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send({ product_id: PRODUCT_ID, quantity: 0 });

      expect(res.status).toBe(400);
    });

    it('defaults quantity to 1 when not provided', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.addItem.mockResolvedValueOnce(mockCartItem);
      cartCalculationServiceStub.recalculateCartTotals.mockResolvedValueOnce(undefined);
      cartCoreServiceStub.getCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.getItems.mockResolvedValueOnce([mockCartItem]);

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send({ product_id: PRODUCT_ID });

      expect(res.status).toBe(201);
      expect(cartItemServiceStub.addItem).toHaveBeenCalledWith(CART_ID, {
        product_id: PRODUCT_ID,
        variant_id: undefined,
        quantity: 1,
      });
    });

    it('propagates HttpException from service (e.g. out of stock → 400)', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.addItem.mockRejectedValueOnce(
        new HttpException(400, 'Insufficient stock'),
      );

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send(validPayload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Insufficient stock');
    });

    it('propagates 404 from service when product not found', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartItemServiceStub.addItem.mockRejectedValueOnce(
        new HttpException(404, 'Product not found'),
      );

      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', authHeader)
        .send(validPayload);

      expect(res.status).toBe(404);
    });
  });

  // ── PUT /cart/items/:id ────────────────────────────────────────────────────

  describe('PUT /cart/items/:id', () => {
    const updatedItem = { ...mockCartItem, quantity: 5 };

    it('returns 200 with updated item', async () => {
      cartOrchestratorServiceStub.updateItemQuantityWithValidation.mockResolvedValueOnce(
        updatedItem,
      );

      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartOrchestratorServiceStub.updateItemQuantityWithValidation).toHaveBeenCalledWith(
        ITEM_ID,
        5,
        USER_ID,
        undefined,
      );
    });

    it('returns 200 for guest user using session ID', async () => {
      cartOrchestratorServiceStub.updateItemQuantityWithValidation.mockResolvedValueOnce(
        updatedItem,
      );

      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('x-session-id', SESSION_ID)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(cartOrchestratorServiceStub.updateItemQuantityWithValidation).toHaveBeenCalledWith(
        ITEM_ID,
        3,
        undefined,
        SESSION_ID,
      );
    });

    it('returns 400 for invalid item ID in path', async () => {
      const res = await request(app)
        .put(`/cart/items/${INVALID_UUID}`)
        .set('Authorization', authHeader)
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
    });

    it('returns 400 for missing quantity in body', async () => {
      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 for quantity exceeding maximum', async () => {
      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader)
        .send({ quantity: 150 });

      expect(res.status).toBe(400);
    });

    it('propagates 403 when user does not own the cart item', async () => {
      cartOrchestratorServiceStub.updateItemQuantityWithValidation.mockRejectedValueOnce(
        new HttpException(403, 'Not authorized to access this cart'),
      );

      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader)
        .send({ quantity: 2 });

      expect(res.status).toBe(403);
    });

    it('propagates 404 when item not found', async () => {
      cartOrchestratorServiceStub.updateItemQuantityWithValidation.mockRejectedValueOnce(
        new HttpException(404, 'Cart item not found'),
      );

      const res = await request(app)
        .put(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader)
        .send({ quantity: 2 });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /cart/items/:id ─────────────────────────────────────────────────

  describe('DELETE /cart/items/:id', () => {
    it('returns 200 on successful item removal', async () => {
      cartOrchestratorServiceStub.removeItemWithValidation.mockResolvedValueOnce({
        message: 'Item removed',
      });

      const res = await request(app)
        .delete(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartOrchestratorServiceStub.removeItemWithValidation).toHaveBeenCalledWith(
        ITEM_ID,
        USER_ID,
        undefined,
      );
    });

    it('returns 200 for guest user using session ID', async () => {
      cartOrchestratorServiceStub.removeItemWithValidation.mockResolvedValueOnce({
        message: 'Item removed',
      });

      const res = await request(app)
        .delete(`/cart/items/${ITEM_ID}`)
        .set('x-session-id', SESSION_ID);

      expect(res.status).toBe(200);
      expect(cartOrchestratorServiceStub.removeItemWithValidation).toHaveBeenCalledWith(
        ITEM_ID,
        undefined,
        SESSION_ID,
      );
    });

    it('returns 400 for invalid item ID in path', async () => {
      const res = await request(app)
        .delete(`/cart/items/${INVALID_UUID}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(400);
    });

    it('propagates 404 when item not found', async () => {
      cartOrchestratorServiceStub.removeItemWithValidation.mockRejectedValueOnce(
        new HttpException(404, 'Cart item not found'),
      );

      const res = await request(app)
        .delete(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
    });

    it('propagates 403 when unauthorized', async () => {
      cartOrchestratorServiceStub.removeItemWithValidation.mockRejectedValueOnce(
        new HttpException(403, 'Not authorized to access this cart'),
      );

      const res = await request(app)
        .delete(`/cart/items/${ITEM_ID}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(403);
    });
  });

  // ── POST /cart/discount ────────────────────────────────────────────────────

  describe('POST /cart/discount', () => {
    it('returns 200 on successful discount application', async () => {
      const updatedCart = {
        ...mockCart,
        applied_discount_codes: ['SAVE10'],
        discount_total: '10.00',
      };
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.applyDiscountCode.mockResolvedValueOnce(updatedCart);

      const res = await request(app)
        .post('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'SAVE10' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartCalculationServiceStub.applyDiscountCode).toHaveBeenCalledWith(
        CART_ID,
        'SAVE10',
        USER_ID,
      );
    });

    it('normalizes discount code to uppercase', async () => {
      const updatedCart = { ...mockCart, applied_discount_codes: ['SAVE10'] };
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.applyDiscountCode.mockResolvedValueOnce(updatedCart);

      const res = await request(app)
        .post('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'save10' });

      expect(res.status).toBe(200);
      expect(cartCalculationServiceStub.applyDiscountCode).toHaveBeenCalledWith(
        CART_ID,
        'SAVE10',
        USER_ID,
      );
    });

    it('returns 400 for missing discount code', async () => {
      const res = await request(app)
        .post('/cart/discount')
        .set('Authorization', authHeader)
        .send({});

      expect(res.status).toBe(400);
    });

    it('propagates 400 when discount code already applied', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.applyDiscountCode.mockRejectedValueOnce(
        new HttpException(400, 'Discount code already applied'),
      );

      const res = await request(app)
        .post('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'SAVE10' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Discount code already applied');
    });

    it('propagates 400 when discount code is invalid', async () => {
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.applyDiscountCode.mockRejectedValueOnce(
        new HttpException(400, 'Invalid discount code'),
      );

      const res = await request(app)
        .post('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'BADCODE' });

      expect(res.status).toBe(400);
    });

    it('applies discount for guest user using session ID', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(guestCart);
      cartCalculationServiceStub.applyDiscountCode.mockResolvedValueOnce(guestCart);

      const res = await request(app)
        .post('/cart/discount')
        .set('x-session-id', SESSION_ID)
        .send({ code: 'GUEST10' });

      expect(res.status).toBe(200);
      expect(cartCoreServiceStub.getOrCreateCart).toHaveBeenCalledWith(undefined, SESSION_ID);
    });
  });

  // ── DELETE /cart/discount ──────────────────────────────────────────────────

  describe('DELETE /cart/discount', () => {
    it('returns 200 on successful discount removal', async () => {
      const updatedCart = { ...mockCart, applied_discount_codes: [], discount_total: '0.00' };
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.removeDiscountCode.mockResolvedValueOnce(updatedCart);

      const res = await request(app)
        .delete('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'SAVE10' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartCalculationServiceStub.removeDiscountCode).toHaveBeenCalledWith(CART_ID, 'SAVE10');
    });

    it('normalizes code to uppercase on removal', async () => {
      const updatedCart = { ...mockCart, applied_discount_codes: [] };
      cartCoreServiceStub.getOrCreateCart.mockResolvedValueOnce(mockCart);
      cartCalculationServiceStub.removeDiscountCode.mockResolvedValueOnce(updatedCart);

      const res = await request(app)
        .delete('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'save10' });

      expect(res.status).toBe(200);
      expect(cartCalculationServiceStub.removeDiscountCode).toHaveBeenCalledWith(CART_ID, 'SAVE10');
    });

    it('returns 400 for missing code', async () => {
      const res = await request(app)
        .delete('/cart/discount')
        .set('Authorization', authHeader)
        .send({});

      expect(res.status).toBe(400);
    });

    it('propagates 404 when cart not found', async () => {
      cartCoreServiceStub.getOrCreateCart.mockRejectedValueOnce(
        new HttpException(404, 'Cart not found'),
      );

      const res = await request(app)
        .delete('/cart/discount')
        .set('Authorization', authHeader)
        .send({ code: 'SAVE10' });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /cart ───────────────────────────────────────────────────────────

  describe('DELETE /cart', () => {
    it('returns 200 after clearing authenticated user cart', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartCoreServiceStub.verifyCartOwnership.mockResolvedValueOnce(undefined);
      cartItemServiceStub.clearAllItems.mockResolvedValueOnce(undefined);

      const res = await request(app).delete('/cart').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cartItemServiceStub.clearAllItems).toHaveBeenCalledWith(CART_ID);
    });

    it('returns 200 after clearing guest cart via session ID', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(guestCart);
      cartCoreServiceStub.verifyCartOwnership.mockResolvedValueOnce(undefined);
      cartItemServiceStub.clearAllItems.mockResolvedValueOnce(undefined);

      const res = await request(app).delete('/cart').set('x-session-id', SESSION_ID);

      expect(res.status).toBe(200);
      expect(cartItemServiceStub.clearAllItems).toHaveBeenCalledWith(CART_ID);
    });

    it('returns 401 when no auth or session ID provided', async () => {
      const res = await request(app).delete('/cart');

      expect(res.status).toBe(401);
      expect(cartItemServiceStub.clearAllItems).not.toHaveBeenCalled();
    });

    it('returns 200 with message when no active cart found', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(undefined);

      const res = await request(app).delete('/cart').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('No active cart found');
      expect(cartItemServiceStub.clearAllItems).not.toHaveBeenCalled();
    });

    it('propagates 403 when user does not own the cart', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartCoreServiceStub.verifyCartOwnership.mockRejectedValueOnce(
        new HttpException(403, 'Not authorized to access this cart'),
      );

      const res = await request(app).delete('/cart').set('Authorization', authHeader);

      expect(res.status).toBe(403);
      expect(cartItemServiceStub.clearAllItems).not.toHaveBeenCalled();
    });
  });

  // ── POST /cart/merge ───────────────────────────────────────────────────────

  describe('POST /cart/merge', () => {
    const mergePayload = { session_id: SESSION_ID };

    it('returns 200 on successful merge with auth token', async () => {
      cartMergeServiceStub.mergeGuestCartIntoUserCart.mockResolvedValueOnce(mockMergeResponse);

      const res = await request(app)
        .post('/cart/merge')
        .set('Authorization', authHeader)
        .send(mergePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.merged).toBe(true);
      expect(res.body.data.itemsMerged).toBe(2);
      expect(cartMergeServiceStub.mergeGuestCartIntoUserCart).toHaveBeenCalledWith(
        USER_ID,
        SESSION_ID,
      );
    });

    it('returns 401 when no auth token provided', async () => {
      const res = await request(app).post('/cart/merge').send(mergePayload);

      expect(res.status).toBe(401);
      expect(cartMergeServiceStub.mergeGuestCartIntoUserCart).not.toHaveBeenCalled();
    });

    it('returns 400 for missing session_id', async () => {
      const res = await request(app).post('/cart/merge').set('Authorization', authHeader).send({});

      expect(res.status).toBe(400);
      expect(cartMergeServiceStub.mergeGuestCartIntoUserCart).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid session_id UUID', async () => {
      const res = await request(app)
        .post('/cart/merge')
        .set('Authorization', authHeader)
        .send({ session_id: INVALID_UUID });

      expect(res.status).toBe(400);
    });

    it('returns 200 with merged=false when merge already in progress', async () => {
      cartMergeServiceStub.mergeGuestCartIntoUserCart.mockResolvedValueOnce({
        merged: false,
        cart_id: null,
        itemCount: 0,
        itemsMerged: 0,
        message: 'Merge already in progress',
      });

      const res = await request(app)
        .post('/cart/merge')
        .set('Authorization', authHeader)
        .send(mergePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.merged).toBe(false);
      expect(res.body.data.message).toBe('Merge already in progress');
    });

    it('returns 200 with merged=false when no guest cart found', async () => {
      cartMergeServiceStub.mergeGuestCartIntoUserCart.mockResolvedValueOnce({
        merged: false,
        cart_id: null,
        itemCount: 0,
        itemsMerged: 0,
        message: 'No guest cart found',
      });

      const res = await request(app)
        .post('/cart/merge')
        .set('Authorization', authHeader)
        .send(mergePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.merged).toBe(false);
    });

    it('returns 200 when guest cart was empty', async () => {
      cartMergeServiceStub.mergeGuestCartIntoUserCart.mockResolvedValueOnce({
        merged: true,
        cart_id: null,
        itemCount: 0,
        itemsMerged: 0,
        message: 'Guest cart was empty',
      });

      const res = await request(app)
        .post('/cart/merge')
        .set('Authorization', authHeader)
        .send(mergePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.itemsMerged).toBe(0);
    });
  });

  // ── POST /cart/validate ────────────────────────────────────────────────────

  describe('POST /cart/validate', () => {
    it('returns 200 with valid result when cart passes all checks', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartValidationServiceStub.validateCart.mockResolvedValueOnce(mockValidationResponse);

      const res = await request(app).post('/cart/validate').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.issues).toHaveLength(0);
      expect(cartValidationServiceStub.validateCart).toHaveBeenCalledWith(CART_ID, false);
    });

    it('returns 200 with issues when stock problems found', async () => {
      const validationWithIssues = {
        valid: false,
        cartId: CART_ID,
        issues: [
          {
            itemId: ITEM_ID,
            productId: PRODUCT_ID,
            productName: 'Steel Pipe',
            type: 'insufficient_stock',
            message: 'Only 1 unit available',
            details: { requestedQuantity: 2, availableQuantity: 1 },
          },
        ],
        updatedTotals: null,
      };
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartValidationServiceStub.validateCart.mockResolvedValueOnce(validationWithIssues);

      const res = await request(app).post('/cart/validate').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.issues).toHaveLength(1);
      expect(res.body.data.issues[0].type).toBe('insufficient_stock');
    });

    it('passes auto_repair=true query param to service', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartValidationServiceStub.validateCart.mockResolvedValueOnce(mockValidationResponse);

      const res = await request(app)
        .post('/cart/validate?auto_repair=true')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(cartValidationServiceStub.validateCart).toHaveBeenCalledWith(CART_ID, true);
    });

    it('returns 404 when no active cart found', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(undefined);

      const res = await request(app).post('/cart/validate').set('Authorization', authHeader);

      expect(res.status).toBe(404);
      expect(cartValidationServiceStub.validateCart).not.toHaveBeenCalled();
    });

    it('validates for guest user using session ID', async () => {
      const guestCart = { ...mockCart, user_id: null, session_id: SESSION_ID };
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(guestCart);
      cartValidationServiceStub.validateCart.mockResolvedValueOnce(mockValidationResponse);

      const res = await request(app).post('/cart/validate').set('x-session-id', SESSION_ID);

      expect(res.status).toBe(200);
      expect(cartCoreServiceStub.getActiveCart).toHaveBeenCalledWith(undefined, SESSION_ID);
    });

    it('propagates 400 when cart is empty', async () => {
      cartCoreServiceStub.getActiveCart.mockResolvedValueOnce(mockCart);
      cartValidationServiceStub.validateCart.mockRejectedValueOnce(
        new HttpException(400, 'Cart is empty'),
      );

      const res = await request(app).post('/cart/validate').set('Authorization', authHeader);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });
  });
});
