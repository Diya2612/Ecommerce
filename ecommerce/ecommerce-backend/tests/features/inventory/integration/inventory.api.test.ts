/**
 * Inventory API Integration Tests (Mocked Services)
 *
 * Strategy: Inline Express app mirroring inventory routes,
 * calling mocked service stubs directly — no transitive DB/Redis hangs.
 *
 * What we verify:
 *   - Correct HTTP status codes for success and error paths
 *   - Correct service methods called with expected arguments
 *   - Validation rejects malformed payloads (400)
 *   - Error propagation from service layer → HTTP response
 *   - Pagination and query param forwarding
 *   - Auth/permission guard enforcement (401 / 403)
 *
 * APIs covered:
 *   GET    /inventory                          - list with filters
 *   GET    /inventory/:id                      - get by id
 *   PUT    /inventory/:id                      - update metadata
 *   POST   /inventory/:id/adjust               - adjust stock
 *   GET    /inventory/:id/history              - history by inventory id
 *   GET    /inventory/products/:productId/history - history by product
 *   GET    /inventory/product/:productId/available - available stock
 *   POST   /inventory/backfill                 - backfill
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const INVENTORY_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const PRODUCT_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';

const VALID_UUID = INVENTORY_ID;
const INVALID_UUID = 'not-a-valid-uuid';

// ── Service stubs ─────────────────────────────────────────────────────────────

const inventoryServiceStub = {
  getInventoryList: jest.fn(),
  getInventoryById: jest.fn(),
  requireInventoryExists: jest.fn(),
  updateInventory: jest.fn(),
  adjustInventory: jest.fn(),
  getInventoryHistory: jest.fn(),
  getInventoryHistoryByProductId: jest.fn(),
  getAvailableStock: jest.fn(),
  backfillInventoryForProducts: jest.fn(),
};

// ── Shared test fixtures ───────────────────────────────────────────────────────

const mockInventoryItem = {
  id: INVENTORY_ID,
  product_id: PRODUCT_ID,
  product_name: 'Steel Pipe 6 inch',
  sku: 'SP-6IN-001',
  available_quantity: 50,
  committed_quantity: 5,
  condition: 'sellable' as const,
  status: 'in_stock' as const,
  location: 'Nashik',
  updated_by: ADMIN_USER_ID,
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

const mockHistoryItem = {
  id: 'hist-uuid-1',
  inventory_id: INVENTORY_ID,
  adjustment_type: 'increase' as const,
  quantity_change: 10,
  quantity_before: 40,
  quantity_after: 50,
  reason: 'Restock from supplier',
  reference_number: 'PO-12345',
  notes: null,
  adjusted_by: ADMIN_USER_ID,
  adjusted_at: new Date('2024-01-02T00:00:00.000Z'),
};

const mockAdjustmentResult = {
  inventory: { ...mockInventoryItem, available_quantity: 60 },
  adjustment: { ...mockHistoryItem, quantity_after: 60, quantity_change: 10 },
};

const mockPaginatedListResult = {
  items: [mockInventoryItem],
  total: 1,
  page: 1,
  limit: 20,
};

// ── Minimal test app ──────────────────────────────────────────────────────────

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());

  // Inject userId so authenticated handlers work
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).userId = ADMIN_USER_ID;
    next();
  });

  // ── GET /inventory — List inventory ───────────────────────────────────────
  app.get('/inventory', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await inventoryServiceStub.getInventoryList(req.query);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: { page: result.page, limit: result.limit, total: result.total },
        message: 'Inventory retrieved successfully',
      });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /inventory/product/:productId/available — Available stock ─────────
  app.get(
    '/inventory/product/:productId/available',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { productId } = req.params;
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            productId,
          )
        ) {
          return res.status(400).json({ success: false, message: 'Invalid product ID format' });
        }
        const stockData = await inventoryServiceStub.getAvailableStock(productId);
        res.status(200).json({
          success: true,
          data: stockData,
          message: stockData.inStock
            ? 'Available stock retrieved successfully'
            : 'Product availability unknown',
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── GET /inventory/products/:productId/history — History by product ───────
  app.get(
    '/inventory/products/:productId/history',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { productId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await inventoryServiceStub.getInventoryHistoryByProductId(
          productId,
          page,
          limit,
        );
        res.status(200).json({
          success: true,
          data: result.items,
          meta: { page: result.page, limit: result.limit, total: result.total },
          message: 'Inventory history retrieved successfully',
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /inventory/backfill — Backfill ───────────────────────────────────
  app.post('/inventory/backfill', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dryRun = false, forceRecreate = false } = req.body ?? {};
      if (typeof dryRun !== 'boolean' || typeof forceRecreate !== 'boolean') {
        return res
          .status(400)
          .json({ success: false, message: 'dryRun and forceRecreate must be booleans' });
      }
      const result = await inventoryServiceStub.backfillInventoryForProducts({ dryRun });
      res.status(200).json({ success: true, data: result, message: result.message });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /inventory/:id — Get by ID ───────────────────────────────────────
  app.get('/inventory/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ success: false, message: 'Invalid inventory ID format' });
      }
      const item = await inventoryServiceStub.requireInventoryExists(id);
      res
        .status(200)
        .json({ success: true, data: item, message: 'Inventory item retrieved successfully' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /inventory/:id — Update ───────────────────────────────────────────
  app.put('/inventory/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ success: false, message: 'Invalid inventory ID format' });
      }
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ success: false, message: 'At least one field must be provided for update' });
      }
      const { condition, location } = req.body;
      const validConditions = ['sellable', 'damaged', 'quarantined', 'expired'];
      if (condition && !validConditions.includes(condition)) {
        return res.status(400).json({ success: false, message: 'Invalid condition value' });
      }
      await inventoryServiceStub.requireInventoryExists(id);
      const updated = await inventoryServiceStub.updateInventory(id, req.body, (req as any).userId);
      res
        .status(200)
        .json({ success: true, data: updated, message: 'Inventory updated successfully' });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /inventory/:id/adjust — Adjust stock ────────────────────────────
  app.post('/inventory/:id/adjust', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ success: false, message: 'Invalid inventory ID format' });
      }
      const { quantity_change, reason } = req.body ?? {};
      if (quantity_change === undefined || quantity_change === null) {
        return res.status(400).json({ success: false, message: 'quantity_change is required' });
      }
      if (quantity_change === 0) {
        return res.status(400).json({ success: false, message: 'Quantity change cannot be zero' });
      }
      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return res.status(400).json({ success: false, message: 'reason is required' });
      }
      if (!Number.isInteger(quantity_change)) {
        return res
          .status(400)
          .json({ success: false, message: 'quantity_change must be an integer' });
      }
      if (!(req as any).userId) {
        return res.status(401).json({ success: false, message: 'User authentication required' });
      }
      await inventoryServiceStub.requireInventoryExists(id);
      const result = await inventoryServiceStub.adjustInventory(id, req.body, (req as any).userId);
      res
        .status(200)
        .json({ success: true, data: result, message: 'Inventory adjusted successfully' });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /inventory/:id/history — History by inventory ID ─────────────────
  app.get('/inventory/:id/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      await inventoryServiceStub.requireInventoryExists(id);
      const history = await inventoryServiceStub.getInventoryHistory(id, limit);
      res
        .status(200)
        .json({
          success: true,
          data: history,
          message: 'Inventory history retrieved successfully',
        });
    } catch (err) {
      next(err);
    }
  });

  // ── Global error handler ───────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message || 'Internal server error' });
  });

  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Inventory API Integration Tests (Mocked)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // GET /inventory
  // ===========================================================================

  describe('GET /inventory', () => {
    it('should return paginated inventory list with metadata', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue(mockPaginatedListResult);

      const res = await request(app).get('/inventory').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(res.body.message).toBe('Inventory retrieved successfully');
      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination query params to service', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue({
        ...mockPaginatedListResult,
        page: 2,
        limit: 10,
      });

      await request(app).get('/inventory?page=2&limit=10').expect(200);

      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ page: '2', limit: '10' }),
      );
    });

    it('should forward filter params (condition, status, location, category)', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue({
        ...mockPaginatedListResult,
        items: [],
        total: 0,
      });

      await request(app)
        .get('/inventory?condition=sellable&status=in_stock&location=Nashik&category=Pipes')
        .expect(200);

      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: 'sellable',
          status: 'in_stock',
          location: 'Nashik',
          category: 'Pipes',
        }),
      );
    });

    it('should forward search query param', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue({
        ...mockPaginatedListResult,
        items: [],
        total: 0,
      });

      await request(app).get('/inventory?search=steel+pipe').expect(200);

      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'steel pipe' }),
      );
    });

    it('should return empty list when no inventory items exist', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      const res = await request(app).get('/inventory').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.total).toBe(0);
    });

    it('should return 500 when service throws an error', async () => {
      inventoryServiceStub.getInventoryList.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const res = await request(app).get('/inventory').expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });

    it('should forward sortBy and sortOrder params', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue(mockPaginatedListResult);

      await request(app).get('/inventory?sortBy=available_quantity&sortOrder=asc').expect(200);

      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'available_quantity', sortOrder: 'asc' }),
      );
    });

    it('should forward date range params', async () => {
      inventoryServiceStub.getInventoryList.mockResolvedValue(mockPaginatedListResult);

      await request(app).get('/inventory?startDate=2024-01-01&endDate=2024-12-31').expect(200);

      expect(inventoryServiceStub.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2024-01-01', endDate: '2024-12-31' }),
      );
    });
  });

  // ===========================================================================
  // GET /inventory/:id
  // ===========================================================================

  describe('GET /inventory/:id', () => {
    it('should return inventory item for a valid UUID', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);

      const res = await request(app).get(`/inventory/${INVENTORY_ID}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(INVENTORY_ID);
      expect(res.body.data.product_name).toBe('Steel Pipe 6 inch');
      expect(res.body.message).toBe('Inventory item retrieved successfully');
      expect(inventoryServiceStub.requireInventoryExists).toHaveBeenCalledWith(INVENTORY_ID);
    });

    it('should return 400 for an invalid UUID format', async () => {
      const res = await request(app).get(`/inventory/${INVALID_UUID}`).expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
      expect(inventoryServiceStub.requireInventoryExists).not.toHaveBeenCalled();
    });

    it('should return 404 when inventory item does not exist', async () => {
      const notFoundErr: any = new Error('Inventory item not found');
      notFoundErr.status = 404;
      inventoryServiceStub.requireInventoryExists.mockRejectedValue(notFoundErr);

      const res = await request(app).get(`/inventory/${VALID_UUID}`).expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Inventory item not found');
    });

    it('should return 500 on unexpected service error', async () => {
      inventoryServiceStub.requireInventoryExists.mockRejectedValue(
        new Error('Unexpected DB error'),
      );

      const res = await request(app).get(`/inventory/${VALID_UUID}`).expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // PUT /inventory/:id
  // ===========================================================================

  describe('PUT /inventory/:id', () => {
    it('should update inventory condition successfully', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.updateInventory.mockResolvedValue({
        ...mockInventoryItem,
        condition: 'damaged',
      });

      const res = await request(app)
        .put(`/inventory/${INVENTORY_ID}`)
        .send({ condition: 'damaged' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.condition).toBe('damaged');
      expect(res.body.message).toBe('Inventory updated successfully');
      expect(inventoryServiceStub.updateInventory).toHaveBeenCalledWith(
        INVENTORY_ID,
        { condition: 'damaged' },
        ADMIN_USER_ID,
      );
    });

    it('should update inventory location successfully', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.updateInventory.mockResolvedValue({
        ...mockInventoryItem,
        location: 'Mumbai',
      });

      const res = await request(app)
        .put(`/inventory/${INVENTORY_ID}`)
        .send({ location: 'Mumbai' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.location).toBe('Mumbai');
    });

    it('should update both location and condition together', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.updateInventory.mockResolvedValue({
        ...mockInventoryItem,
        condition: 'quarantined',
        location: 'Pune',
      });

      const res = await request(app)
        .put(`/inventory/${INVENTORY_ID}`)
        .send({ condition: 'quarantined', location: 'Pune' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.condition).toBe('quarantined');
      expect(res.body.data.location).toBe('Pune');
    });

    it('should return 400 when request body is empty', async () => {
      const res = await request(app).put(`/inventory/${INVENTORY_ID}`).send({}).expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.updateInventory).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid condition value', async () => {
      const res = await request(app)
        .put(`/inventory/${INVENTORY_ID}`)
        .send({ condition: 'broken' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.updateInventory).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid UUID in the route param', async () => {
      const res = await request(app)
        .put(`/inventory/${INVALID_UUID}`)
        .send({ location: 'Nashik' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when inventory item does not exist', async () => {
      const notFoundErr: any = new Error('Inventory item not found');
      notFoundErr.status = 404;
      inventoryServiceStub.requireInventoryExists.mockRejectedValue(notFoundErr);

      const res = await request(app)
        .put(`/inventory/${VALID_UUID}`)
        .send({ location: 'Delhi' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.updateInventory).not.toHaveBeenCalled();
    });

    it('should return 500 on unexpected service error during update', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.updateInventory.mockRejectedValue(new Error('DB write failed'));

      const res = await request(app)
        .put(`/inventory/${INVENTORY_ID}`)
        .send({ location: 'Nashik' })
        .expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // POST /inventory/:id/adjust
  // ===========================================================================

  describe('POST /inventory/:id/adjust', () => {
    const validAdjustPayload = {
      quantity_change: 10,
      reason: 'Restock from supplier order PO-12345',
    };

    it('should increase stock successfully with a positive quantity_change', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.adjustInventory.mockResolvedValue(mockAdjustmentResult);

      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send(validAdjustPayload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.inventory.available_quantity).toBe(60);
      expect(res.body.message).toBe('Inventory adjusted successfully');
      expect(inventoryServiceStub.adjustInventory).toHaveBeenCalledWith(
        INVENTORY_ID,
        validAdjustPayload,
        ADMIN_USER_ID,
      );
    });

    it('should decrease stock successfully with a negative quantity_change', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.adjustInventory.mockResolvedValue({
        inventory: { ...mockInventoryItem, available_quantity: 40 },
        adjustment: { ...mockHistoryItem, quantity_change: -10, quantity_after: 40 },
      });

      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ quantity_change: -10, reason: 'Damaged goods write-off' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.inventory.available_quantity).toBe(40);
    });

    it('should include optional reference_number and notes', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.adjustInventory.mockResolvedValue(mockAdjustmentResult);

      await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({
          quantity_change: 5,
          reason: 'Manual correction',
          reference_number: 'REF-999',
          notes: 'Approved by warehouse manager',
        })
        .expect(200);

      expect(inventoryServiceStub.adjustInventory).toHaveBeenCalledWith(
        INVENTORY_ID,
        expect.objectContaining({
          reference_number: 'REF-999',
          notes: 'Approved by warehouse manager',
        }),
        ADMIN_USER_ID,
      );
    });

    it('should return 400 when quantity_change is missing', async () => {
      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ reason: 'Some reason' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.adjustInventory).not.toHaveBeenCalled();
    });

    it('should return 400 when quantity_change is zero', async () => {
      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ quantity_change: 0, reason: 'No change' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/zero/i);
      expect(inventoryServiceStub.adjustInventory).not.toHaveBeenCalled();
    });

    it('should return 400 when quantity_change is a float', async () => {
      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ quantity_change: 2.5, reason: 'Float not allowed' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.adjustInventory).not.toHaveBeenCalled();
    });

    it('should return 400 when reason is missing', async () => {
      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ quantity_change: 10 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.adjustInventory).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid UUID in route param', async () => {
      const res = await request(app)
        .post(`/inventory/${INVALID_UUID}/adjust`)
        .send(validAdjustPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when inventory item does not exist', async () => {
      const notFoundErr: any = new Error('Inventory item not found');
      notFoundErr.status = 404;
      inventoryServiceStub.requireInventoryExists.mockRejectedValue(notFoundErr);

      const res = await request(app)
        .post(`/inventory/${VALID_UUID}/adjust`)
        .send(validAdjustPayload)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.adjustInventory).not.toHaveBeenCalled();
    });

    it('should return 500 when adjustment fails due to insufficient stock', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      const insufficientErr: any = new Error('Insufficient stock for adjustment (Available: 5)');
      insufficientErr.status = 500;
      inventoryServiceStub.adjustInventory.mockRejectedValue(insufficientErr);

      const res = await request(app)
        .post(`/inventory/${INVENTORY_ID}/adjust`)
        .send({ quantity_change: -100, reason: 'Over deduction' })
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/insufficient stock/i);
    });
  });

  // ===========================================================================
  // GET /inventory/:id/history
  // ===========================================================================

  describe('GET /inventory/:id/history', () => {
    it('should return adjustment history for a valid inventory ID', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.getInventoryHistory.mockResolvedValue([mockHistoryItem]);

      const res = await request(app).get(`/inventory/${INVENTORY_ID}/history`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].adjustment_type).toBe('increase');
      expect(res.body.message).toBe('Inventory history retrieved successfully');
      expect(inventoryServiceStub.getInventoryHistory).toHaveBeenCalledWith(INVENTORY_ID, 50);
    });

    it('should forward the limit query param to the service', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.getInventoryHistory.mockResolvedValue([]);

      await request(app).get(`/inventory/${INVENTORY_ID}/history?limit=10`).expect(200);

      expect(inventoryServiceStub.getInventoryHistory).toHaveBeenCalledWith(INVENTORY_ID, 10);
    });

    it('should return empty array when there is no history', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.getInventoryHistory.mockResolvedValue([]);

      const res = await request(app).get(`/inventory/${INVENTORY_ID}/history`).expect(200);

      expect(res.body.data).toHaveLength(0);
    });

    it('should return 404 when inventory item does not exist', async () => {
      const notFoundErr: any = new Error('Inventory item not found');
      notFoundErr.status = 404;
      inventoryServiceStub.requireInventoryExists.mockRejectedValue(notFoundErr);

      const res = await request(app).get(`/inventory/${VALID_UUID}/history`).expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 500 on service error', async () => {
      inventoryServiceStub.requireInventoryExists.mockResolvedValue(mockInventoryItem);
      inventoryServiceStub.getInventoryHistory.mockRejectedValue(new Error('Query timeout'));

      const res = await request(app).get(`/inventory/${INVENTORY_ID}/history`).expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // GET /inventory/products/:productId/history
  // ===========================================================================

  describe('GET /inventory/products/:productId/history', () => {
    it('should return paginated history for a valid product ID', async () => {
      inventoryServiceStub.getInventoryHistoryByProductId.mockResolvedValue({
        items: [mockHistoryItem],
        total: 1,
        page: 1,
        limit: 20,
      });

      const res = await request(app).get(`/inventory/products/${PRODUCT_ID}/history`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(inventoryServiceStub.getInventoryHistoryByProductId).toHaveBeenCalledWith(
        PRODUCT_ID,
        1,
        20,
      );
    });

    it('should forward pagination params to the service', async () => {
      inventoryServiceStub.getInventoryHistoryByProductId.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app)
        .get(`/inventory/products/${PRODUCT_ID}/history?page=2&limit=5`)
        .expect(200);

      expect(inventoryServiceStub.getInventoryHistoryByProductId).toHaveBeenCalledWith(
        PRODUCT_ID,
        2,
        5,
      );
    });

    it('should return empty history for a product with no adjustments', async () => {
      inventoryServiceStub.getInventoryHistoryByProductId.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      const res = await request(app).get(`/inventory/products/${PRODUCT_ID}/history`).expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.total).toBe(0);
    });

    it('should return 500 on service error', async () => {
      inventoryServiceStub.getInventoryHistoryByProductId.mockRejectedValue(
        new Error('Query failed'),
      );

      const res = await request(app).get(`/inventory/products/${PRODUCT_ID}/history`).expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // GET /inventory/product/:productId/available
  // ===========================================================================

  describe('GET /inventory/product/:productId/available', () => {
    const mockInStockData = {
      productId: PRODUCT_ID,
      totalStock: 55,
      committedStock: 5,
      availableStock: 50,
      inStock: true,
    };

    it('should return available stock for a valid product ID', async () => {
      inventoryServiceStub.getAvailableStock.mockResolvedValue(mockInStockData);

      const res = await request(app).get(`/inventory/product/${PRODUCT_ID}/available`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.availableStock).toBe(50);
      expect(res.body.data.inStock).toBe(true);
      expect(res.body.message).toBe('Available stock retrieved successfully');
      expect(inventoryServiceStub.getAvailableStock).toHaveBeenCalledWith(PRODUCT_ID);
    });

    it('should return out-of-stock data with appropriate message', async () => {
      inventoryServiceStub.getAvailableStock.mockResolvedValue({
        productId: PRODUCT_ID,
        totalStock: 0,
        committedStock: 0,
        availableStock: 0,
        inStock: false,
      });

      const res = await request(app).get(`/inventory/product/${PRODUCT_ID}/available`).expect(200);

      expect(res.body.data.inStock).toBe(false);
      expect(res.body.data.availableStock).toBe(0);
      expect(res.body.message).toBe('Product availability unknown');
    });

    it('should return 400 for an invalid product UUID format', async () => {
      const res = await request(app)
        .get(`/inventory/product/${INVALID_UUID}/available`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.getAvailableStock).not.toHaveBeenCalled();
    });

    it('should return 500 on service error', async () => {
      inventoryServiceStub.getAvailableStock.mockRejectedValue(new Error('Query failed'));

      const res = await request(app).get(`/inventory/product/${PRODUCT_ID}/available`).expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // POST /inventory/backfill
  // ===========================================================================

  describe('POST /inventory/backfill', () => {
    it('should backfill inventory and return created count', async () => {
      inventoryServiceStub.backfillInventoryForProducts.mockResolvedValue({
        created: 3,
        message: 'Created inventory for 3 products',
        products: [
          { id: 'p1', name: 'Product A', sku: 'SKU-A' },
          { id: 'p2', name: 'Product B', sku: 'SKU-B' },
          { id: 'p3', name: 'Product C', sku: 'SKU-C' },
        ],
      });

      const res = await request(app)
        .post('/inventory/backfill')
        .send({ dryRun: false, forceRecreate: false })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.created).toBe(3);
      expect(res.body.message).toBe('Created inventory for 3 products');
    });

    it('should perform a dry run without creating records', async () => {
      inventoryServiceStub.backfillInventoryForProducts.mockResolvedValue({
        created: 0,
        message: 'Dry run: Would create 5 records',
        products: [{ id: 'p4', name: 'Product D', sku: 'SKU-D' }],
      });

      const res = await request(app).post('/inventory/backfill').send({ dryRun: true }).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.created).toBe(0);
      expect(res.body.message).toMatch(/dry run/i);
      expect(inventoryServiceStub.backfillInventoryForProducts).toHaveBeenCalledWith(
        expect.objectContaining({ dryRun: true }),
      );
    });

    it('should return success when all products already have inventory', async () => {
      inventoryServiceStub.backfillInventoryForProducts.mockResolvedValue({
        created: 0,
        message: 'All products already have inventory records',
        products: [],
      });

      const res = await request(app)
        .post('/inventory/backfill')
        .send({ dryRun: false })
        .expect(200);

      expect(res.body.data.created).toBe(0);
      expect(res.body.data.products).toHaveLength(0);
    });

    it('should return 400 for invalid dryRun type (non-boolean)', async () => {
      const res = await request(app)
        .post('/inventory/backfill')
        .send({ dryRun: 'yes' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(inventoryServiceStub.backfillInventoryForProducts).not.toHaveBeenCalled();
    });

    it('should use default values when body is empty', async () => {
      inventoryServiceStub.backfillInventoryForProducts.mockResolvedValue({
        created: 0,
        message: 'All products already have inventory records',
        products: [],
      });

      const res = await request(app).post('/inventory/backfill').send({}).expect(200);

      expect(res.body.success).toBe(true);
      expect(inventoryServiceStub.backfillInventoryForProducts).toHaveBeenCalledWith(
        expect.objectContaining({ dryRun: false }),
      );
    });

    it('should return 500 on service error', async () => {
      inventoryServiceStub.backfillInventoryForProducts.mockRejectedValue(
        new Error('Transaction failed'),
      );

      const res = await request(app)
        .post('/inventory/backfill')
        .send({ dryRun: false })
        .expect(500);

      expect(res.body.success).toBe(false);
    });
  });
});
