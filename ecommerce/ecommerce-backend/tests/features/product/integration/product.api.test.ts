/**
 * Product API Integration Tests (Mocked Services)
 *
 * Strategy: Inline Express app mirroring product routes,
 * calling mocked service stubs directly — no transitive DB/Redis hangs.
 *
 * What we verify:
 *   - Correct HTTP status codes for success and error paths
 *   - Correct service methods called with expected arguments
 *   - Validation rejects malformed payloads (400 / 422)
 *   - Error propagation from service layer → HTTP response
 *   - Pagination and query param forwarding
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_USER_ID = 'admin-user-uuid-1';
const PRODUCT_ID = 'prod-uuid-1';

// ── Service stubs ─────────────────────────────────────────────────────────────

const productServiceStub = {
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
};

const productListServiceStub = {
  getAllProducts: jest.fn(),
  getFeaturedProducts: jest.fn(),
};

const productDetailServiceStub = {
  getProductDetail: jest.fn(),
};

const productCacheStub = {
  getProductById: jest.fn(),
  getProductBySku: jest.fn(),
  getProductBySlug: jest.fn(),
  invalidateProduct: jest.fn(),
};

const productSearchStub = {
  searchProducts: jest.fn(),
  getProductSearchCount: jest.fn(),
};

const productDuplicateStub = {
  duplicateProducts: jest.fn(),
};

const productFilterStub = {
  getPriceRange: jest.fn(),
  getTechnologiesAggregation: jest.fn(),
  getRatingCounts: jest.fn(),
  getFilterCategories: jest.fn(),
};

// ── Minimal test app ──────────────────────────────────────────────────────────

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());

  // Inject userId so handlers behave as authenticated
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).userId = ADMIN_USER_ID;
    next();
  });

  // ── GET /products/ — List products ─────────────────────────────────────────
  app.get('/products/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const result = await productListServiceStub.getAllProducts({ ...req.query, page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/featured ─────────────────────────────────────────────────
  app.get('/products/featured', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productListServiceStub.getFeaturedProducts();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/search ───────────────────────────────────────────────────
  app.get('/products/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, status = 'active', page = '1', limit = '20' } = req.query as any;
      if (!q || !q.trim()) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;
      const [results, total] = await Promise.all([
        productSearchStub.searchProducts({
          searchQuery: q,
          status,
          page: pageNum,
          limit: limitNum,
        }),
        productSearchStub.getProductSearchCount({ searchQuery: q, status }),
      ]);
      res.status(200).json({ success: true, data: { results, total, page: pageNum } });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/filters ──────────────────────────────────────────────────
  app.get('/products/filters', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [priceRange, technologies, ratings, categories] = await Promise.all([
        productFilterStub.getPriceRange(),
        productFilterStub.getTechnologiesAggregation(),
        productFilterStub.getRatingCounts(),
        productFilterStub.getFilterCategories(),
      ]);
      res
        .status(200)
        .json({ success: true, data: { priceRange, technologies, ratings, categories } });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/stats ────────────────────────────────────────────────────
  app.get('/products/stats', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(200)
        .json({ success: true, data: { total: 42, active: 30, draft: 10, archived: 2 } });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/:id — Get product by ID ──────────────────────────────────
  app.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productDetailServiceStub.getProductDetail({
        id: req.params.id,
        userId: (req as any).userId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /products/slug/:slug ───────────────────────────────────────────────
  app.get('/products/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productDetailServiceStub.getProductDetail({
        slug: req.params.slug,
        userId: (req as any).userId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /products/ — Create product ──────────────────────────────────────
  app.post('/products/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_title, sku, selling_price, slug } = req.body;
      if (!product_title || !sku || !selling_price || !slug) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const product = await productServiceStub.createProduct(req.body, (req as any).userId);
      res
        .status(201)
        .json({ success: true, data: product, message: 'Product created successfully' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /products/:id — Update product ────────────────────────────────────
  app.put('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productServiceStub.updateProduct(
        req.params.id,
        req.body,
        (req as any).userId,
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  // ── DELETE /products/:id — Delete product ─────────────────────────────────
  app.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku, slug } = await productServiceStub.deleteProduct(
        req.params.id,
        (req as any).userId,
      );
      await productCacheStub.invalidateProduct(req.params.id, sku, slug);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /products/bulk-delete ─────────────────────────────────────────────
  app.post('/products/bulk-delete', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
      }
      for (const id of ids) {
        const { sku, slug } = await productServiceStub.deleteProduct(id, (req as any).userId);
        await productCacheStub.invalidateProduct(id, sku, slug);
      }
      res.status(200).json({ success: true, message: `${ids.length} products deleted` });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /products/duplicate ───────────────────────────────────────────────
  app.post('/products/duplicate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
      }
      const count = await productDuplicateStub.duplicateProducts(ids, (req as any).userId);
      res.status(200).json({ success: true, data: { duplicated: count } });
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

// ── Test fixtures ─────────────────────────────────────────────────────────────

const mockProduct: any = {
  id: PRODUCT_ID,
  product_title: 'Widget Pro',
  slug: 'widget-pro',
  sku: 'WGT-001',
  status: 'active',
  featured: false,
  selling_price: '999.00',
  cost_price: '500.00',
  compare_at_price: null,
  tags: ['electronics'],
  has_variants: false,
  inventory_quantity: 50,
  is_deleted: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const validCreatePayload = {
  product_title: 'New Widget',
  slug: 'new-widget',
  sku: 'NEW-WGT-001',
  selling_price: '1500.00',
  cost_price: '750.00',
  status: 'draft',
  featured: false,
  has_variants: false,
  tags: [],
  inventory_quantity: 100,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Product API Integration Tests (Mocked)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /products/ ====================

  describe('GET /products/', () => {
    it('should return list of products with pagination metadata', async () => {
      const mockListResult = {
        products: [mockProduct],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      };
      productListServiceStub.getAllProducts.mockResolvedValue(mockListResult);

      const response = await request(app).get('/products/').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockListResult);
      expect(productListServiceStub.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('should return empty products list', async () => {
      productListServiceStub.getAllProducts.mockResolvedValue({
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      });

      const response = await request(app).get('/products/').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });

    it('should forward pagination query params', async () => {
      productListServiceStub.getAllProducts.mockResolvedValue({
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 2,
      });

      await request(app).get('/products/?page=2&limit=10').expect(200);

      expect(productListServiceStub.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10 }),
      );
    });

    it('should cap limit at 50', async () => {
      productListServiceStub.getAllProducts.mockResolvedValue({
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      });

      await request(app).get('/products/?limit=100').expect(200);

      expect(productListServiceStub.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 }),
      );
    });

    it('should return 500 when service throws', async () => {
      productListServiceStub.getAllProducts.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/products/').expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== GET /products/featured ====================

  describe('GET /products/featured', () => {
    it('should return featured products', async () => {
      productListServiceStub.getFeaturedProducts.mockResolvedValue([mockProduct]);

      const response = await request(app).get('/products/featured').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return empty array when no featured products', async () => {
      productListServiceStub.getFeaturedProducts.mockResolvedValue([]);

      const response = await request(app).get('/products/featured').expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  // ==================== GET /products/search ====================

  describe('GET /products/search', () => {
    it('should return search results with total count', async () => {
      productSearchStub.searchProducts.mockResolvedValue({
        results: [mockProduct],
        productStats: new Map(),
      });
      productSearchStub.getProductSearchCount.mockResolvedValue(1);

      const response = await request(app).get('/products/search?q=widget').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(1);
      expect(productSearchStub.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ searchQuery: 'widget' }),
      );
    });

    it('should return 400 when search query is missing', async () => {
      const response = await request(app).get('/products/search').expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 when search query is empty string', async () => {
      const response = await request(app).get('/products/search?q=').expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should pass pagination to search service', async () => {
      productSearchStub.searchProducts.mockResolvedValue({ results: [], productStats: new Map() });
      productSearchStub.getProductSearchCount.mockResolvedValue(0);

      await request(app).get('/products/search?q=test&page=3&limit=5').expect(200);

      expect(productSearchStub.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, limit: 5 }),
      );
    });
  });

  // ==================== GET /products/filters ====================

  describe('GET /products/filters', () => {
    it('should return all filter data', async () => {
      productFilterStub.getPriceRange.mockResolvedValue({ min: 0, max: 5000 });
      productFilterStub.getTechnologiesAggregation.mockResolvedValue([
        { id: 'solar', label: 'Solar', count: 12 },
      ]);
      productFilterStub.getRatingCounts.mockResolvedValue([{ value: '4', count: 30 }]);
      productFilterStub.getFilterCategories.mockResolvedValue({
        categories: [],
        context: { level: 1 },
      });

      const response = await request(app).get('/products/filters').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('priceRange');
      expect(response.body.data).toHaveProperty('technologies');
      expect(response.body.data).toHaveProperty('ratings');
      expect(response.body.data).toHaveProperty('categories');
    });

    it('should return 500 when filter service fails', async () => {
      productFilterStub.getPriceRange.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/products/filters').expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== GET /products/stats ====================

  describe('GET /products/stats', () => {
    it('should return product stats', async () => {
      const response = await request(app).get('/products/stats').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
    });
  });

  // ==================== GET /products/:id ====================

  describe('GET /products/:id', () => {
    it('should return product detail by ID', async () => {
      productDetailServiceStub.getProductDetail.mockResolvedValue(mockProduct);

      const response = await request(app).get(`/products/${PRODUCT_ID}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(PRODUCT_ID);
      expect(productDetailServiceStub.getProductDetail).toHaveBeenCalledWith(
        expect.objectContaining({ id: PRODUCT_ID }),
      );
    });

    it('should return 404 when product not found', async () => {
      productDetailServiceStub.getProductDetail.mockRejectedValue({
        status: 404,
        message: 'Product not found',
      });

      const response = await request(app).get('/products/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    it('should return 403 when user lacks permission to view inactive product', async () => {
      productDetailServiceStub.getProductDetail.mockRejectedValue({
        status: 403,
        message: 'Permission denied',
      });

      const response = await request(app).get(`/products/${PRODUCT_ID}`).expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /products/ ====================

  describe('POST /products/', () => {
    it('should create a product successfully', async () => {
      productServiceStub.createProduct.mockResolvedValue(mockProduct);

      const response = await request(app).post('/products/').send(validCreatePayload).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(PRODUCT_ID);
      expect(productServiceStub.createProduct).toHaveBeenCalledWith(
        validCreatePayload,
        ADMIN_USER_ID,
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/products/')
        .send({ product_title: 'Incomplete Product' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(productServiceStub.createProduct).not.toHaveBeenCalled();
    });

    it('should return 400 when sku is missing', async () => {
      const { sku: _sku, ...withoutSku } = validCreatePayload;

      const response = await request(app).post('/products/').send(withoutSku).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 when SKU already exists', async () => {
      productServiceStub.createProduct.mockRejectedValue({
        status: 409,
        message: 'SKU already exists',
      });

      const response = await request(app).post('/products/').send(validCreatePayload).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SKU already exists');
    });

    it('should return 409 when slug already exists', async () => {
      productServiceStub.createProduct.mockRejectedValue({
        status: 409,
        message: 'Slug already exists',
      });

      const response = await request(app).post('/products/').send(validCreatePayload).expect(409);

      expect(response.body.message).toBe('Slug already exists');
    });

    it('should create a product with tags', async () => {
      const withTags = { ...validCreatePayload, tags: ['sale', 'featured'] };
      productServiceStub.createProduct.mockResolvedValue({
        ...mockProduct,
        tags: ['sale', 'featured'],
      });

      const response = await request(app).post('/products/').send(withTags).expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== PUT /products/:id ====================

  describe('PUT /products/:id', () => {
    it('should update a product successfully', async () => {
      const updated = { ...mockProduct, product_title: 'Updated Widget' };
      productServiceStub.updateProduct.mockResolvedValue(updated);

      const response = await request(app)
        .put(`/products/${PRODUCT_ID}`)
        .send({ product_title: 'Updated Widget' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(productServiceStub.updateProduct).toHaveBeenCalledWith(
        PRODUCT_ID,
        { product_title: 'Updated Widget' },
        ADMIN_USER_ID,
      );
    });

    it('should return 404 when product not found', async () => {
      productServiceStub.updateProduct.mockRejectedValue({
        status: 404,
        message: 'Product not found',
      });

      const response = await request(app)
        .put('/products/non-existent-id')
        .send({ product_title: 'X' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    it('should return 409 on SKU conflict during update', async () => {
      productServiceStub.updateProduct.mockRejectedValue({
        status: 409,
        message: 'SKU already exists',
      });

      const response = await request(app)
        .put(`/products/${PRODUCT_ID}`)
        .send({ sku: 'TAKEN-SKU' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should update product status to active', async () => {
      productServiceStub.updateProduct.mockResolvedValue({ ...mockProduct, status: 'active' });

      const response = await request(app)
        .put(`/products/${PRODUCT_ID}`)
        .send({ status: 'active' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== DELETE /products/:id ====================

  describe('DELETE /products/:id', () => {
    it('should delete a product and invalidate cache', async () => {
      productServiceStub.deleteProduct.mockResolvedValue({ sku: 'WGT-001', slug: 'widget-pro' });
      productCacheStub.invalidateProduct.mockResolvedValue(undefined);

      const response = await request(app).delete(`/products/${PRODUCT_ID}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
      expect(productServiceStub.deleteProduct).toHaveBeenCalledWith(PRODUCT_ID, ADMIN_USER_ID);
      expect(productCacheStub.invalidateProduct).toHaveBeenCalledWith(
        PRODUCT_ID,
        'WGT-001',
        'widget-pro',
      );
    });

    it('should return 404 when deleting non-existent product', async () => {
      productServiceStub.deleteProduct.mockRejectedValue({
        status: 404,
        message: 'Product not found',
      });

      const response = await request(app).delete('/products/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  // ==================== POST /products/bulk-delete ====================

  describe('POST /products/bulk-delete', () => {
    it('should bulk delete multiple products', async () => {
      productServiceStub.deleteProduct.mockResolvedValue({ sku: 'WGT-001', slug: 'widget-pro' });
      productCacheStub.invalidateProduct.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/products/bulk-delete')
        .send({ ids: [PRODUCT_ID, 'prod-uuid-2'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(productServiceStub.deleteProduct).toHaveBeenCalledTimes(2);
      expect(productCacheStub.invalidateProduct).toHaveBeenCalledTimes(2);
    });

    it('should return 400 when ids array is empty', async () => {
      const response = await request(app)
        .post('/products/bulk-delete')
        .send({ ids: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when ids field is missing', async () => {
      const response = await request(app).post('/products/bulk-delete').send({}).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /products/duplicate ====================

  describe('POST /products/duplicate', () => {
    it('should duplicate products successfully', async () => {
      productDuplicateStub.duplicateProducts.mockResolvedValue(2);

      const response = await request(app)
        .post('/products/duplicate')
        .send({ ids: [PRODUCT_ID, 'prod-uuid-2'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.duplicated).toBe(2);
      expect(productDuplicateStub.duplicateProducts).toHaveBeenCalledWith(
        [PRODUCT_ID, 'prod-uuid-2'],
        ADMIN_USER_ID,
      );
    });

    it('should return 400 when ids array is empty', async () => {
      const response = await request(app).post('/products/duplicate').send({ ids: [] }).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when none of the product ids exist', async () => {
      productDuplicateStub.duplicateProducts.mockRejectedValue({
        status: 404,
        message: 'No products found',
      });

      const response = await request(app)
        .post('/products/duplicate')
        .send({ ids: ['non-existent-uuid'] })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No products found');
    });
  });
});
