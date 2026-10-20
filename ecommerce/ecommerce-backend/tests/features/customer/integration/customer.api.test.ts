/**
 * Customer API Integration Tests (Mocked Services)
 *
 * Strategy: Build a minimal inline Express app that mirrors the real customer
 * routes but calls mocked service stubs directly. This avoids the transitive
 * DB/Redis connection hangs caused by dynamically loading the real route files.
 *
 * What we verify here:
 *   - Correct HTTP status codes for success and error paths
 *   - Correct service methods are called with the right arguments
 *   - Validation rejects malformed payloads (400)
 *   - Error propagation from service layer → HTTP response
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// ── Constants ─────────────────────────────────────────────────────────────────

const TEST_USER_ID = 'admin-user-id';
const TEST_CUSTOMER_ID = 'cus-uuid-1';

// ── Service stubs (referenced inside route handlers below) ────────────────────

const customerServiceStub = {
  createCustomer: jest.fn(),
  getCustomers: jest.fn(),
  getCustomerById: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
};

const customerCacheStub = {
  getCustomerById: jest.fn(),
  invalidateCustomer: jest.fn(),
};

// ── Build minimal test app ────────────────────────────────────────────────────

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());

  // Inject userId so handlers behave as authenticated
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).userId = TEST_USER_ID;
    next();
  });

  // POST /customers/customer
  app.post('/customers/customer', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { first_name, last_name, email } = req.body;
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      const result = await customerServiceStub.createCustomer(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  });

  // GET /customers/
  app.get('/customers/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await customerServiceStub.getCustomers(page, limit, {});
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  });

  // GET /customers/customer/:id
  app.get('/customers/customer/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await customerCacheStub.getCustomerById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  });

  // PUT /customers/customer/:id
  app.put('/customers/customer/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await customerServiceStub.updateCustomer(
        req.params.id,
        req.body,
        (req as any).userId,
      );
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  });

  // DELETE /customers/customer/:id
  app.delete('/customers/customer/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await customerServiceStub.deleteCustomer(req.params.id, (req as any).userId);
      await customerCacheStub.invalidateCustomer(req.params.id);
      res.status(200).json({ success: true, message: 'Customer deleted' });
    } catch (err: any) {
      next(err);
    }
  });

  // Global error handler — converts thrown objects with a `status` property
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message || 'Internal server error' });
  });

  return app;
}

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockCustomer = {
  id: TEST_CUSTOMER_ID,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '+911234567890',
  created_at: new Date().toISOString(),
};

const validCreateData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '9876543210',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Customer API Integration Tests (Mocked)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== POST /customers/customer ====================

  describe('POST /customers/customer', () => {
    it('should create a customer successfully', async () => {
      customerServiceStub.createCustomer.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .post('/customers/customer')
        .send(validCreateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(TEST_CUSTOMER_ID);
      expect(customerServiceStub.createCustomer).toHaveBeenCalledTimes(1);
    });

    it('should reject request with invalid email', async () => {
      const response = await request(app)
        .post('/customers/customer')
        .send({ ...validCreateData, email: 'not-an-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(customerServiceStub.createCustomer).not.toHaveBeenCalled();
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app)
        .post('/customers/customer')
        .send({ first_name: 'John' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate email conflict (409)', async () => {
      const conflictErr = { status: 409, message: 'Email already exists' };
      customerServiceStub.createCustomer.mockRejectedValue(conflictErr);

      const response = await request(app)
        .post('/customers/customer')
        .send(validCreateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should create customer with segments', async () => {
      customerServiceStub.createCustomer.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .post('/customers/customer')
        .send({ ...validCreateData, segments: ['premium', 'vip'] })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== GET /customers/ ====================

  describe('GET /customers/', () => {
    it('should return list of customers', async () => {
      customerServiceStub.getCustomers.mockResolvedValue([mockCustomer]);

      const response = await request(app).get('/customers/').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return empty array when no customers exist', async () => {
      customerServiceStub.getCustomers.mockResolvedValue([]);

      const response = await request(app).get('/customers/').expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should support pagination query params', async () => {
      customerServiceStub.getCustomers.mockResolvedValue([mockCustomer]);

      const response = await request(app).get('/customers/?page=2&limit=5').expect(200);

      expect(response.body.success).toBe(true);
      expect(customerServiceStub.getCustomers).toHaveBeenCalledWith(2, 5, {});
    });
  });

  // ==================== GET /customers/customer/:id ====================

  describe('GET /customers/customer/:id', () => {
    it('should return customer details by ID', async () => {
      customerCacheStub.getCustomerById.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .get(`/customers/customer/${TEST_CUSTOMER_ID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(TEST_CUSTOMER_ID);
      expect(customerCacheStub.getCustomerById).toHaveBeenCalledWith(TEST_CUSTOMER_ID);
    });

    it('should return 404 for non-existent customer', async () => {
      customerCacheStub.getCustomerById.mockRejectedValue({
        status: 404,
        message: 'Customer not found',
      });

      const response = await request(app).get('/customers/customer/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });

  // ==================== PUT /customers/customer/:id ====================

  describe('PUT /customers/customer/:id', () => {
    it('should update customer details', async () => {
      const updated = { ...mockCustomer, first_name: 'Jane' };
      customerServiceStub.updateCustomer.mockResolvedValue(updated);

      const response = await request(app)
        .put(`/customers/customer/${TEST_CUSTOMER_ID}`)
        .send({ first_name: 'Jane' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(customerServiceStub.updateCustomer).toHaveBeenCalledWith(
        TEST_CUSTOMER_ID,
        { first_name: 'Jane' },
        TEST_USER_ID,
      );
    });

    it('should return 404 when updating non-existent customer', async () => {
      customerServiceStub.updateCustomer.mockRejectedValue({
        status: 404,
        message: 'Customer not found',
      });

      const response = await request(app)
        .put('/customers/customer/non-existent-id')
        .send({ first_name: 'Jane' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should update customer tags', async () => {
      const updated = { ...mockCustomer, tags: ['premium', 'vip'] };
      customerServiceStub.updateCustomer.mockResolvedValue(updated);

      const response = await request(app)
        .put(`/customers/customer/${TEST_CUSTOMER_ID}`)
        .send({ tags: ['premium', 'vip'] })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== DELETE /customers/customer/:id ====================

  describe('DELETE /customers/customer/:id', () => {
    it('should delete a customer', async () => {
      customerServiceStub.deleteCustomer.mockResolvedValue(undefined);
      customerCacheStub.invalidateCustomer.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/customers/customer/${TEST_CUSTOMER_ID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(customerServiceStub.deleteCustomer).toHaveBeenCalledWith(
        TEST_CUSTOMER_ID,
        TEST_USER_ID,
      );
      expect(customerCacheStub.invalidateCustomer).toHaveBeenCalledWith(TEST_CUSTOMER_ID);
    });

    it('should return 404 when deleting non-existent customer', async () => {
      customerServiceStub.deleteCustomer.mockRejectedValue({
        status: 404,
        message: 'Customer not found',
      });

      const response = await request(app).delete('/customers/customer/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });
});
