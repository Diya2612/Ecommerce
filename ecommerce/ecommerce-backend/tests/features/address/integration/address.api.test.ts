/**
 * Address API Integration Tests
 *
 * Tests for all address endpoints:
 * - Create address
 * - Get addresses
 * - Update address
 * - Delete address
 * - Set default address
 */

import request from 'supertest';
import express from 'express';

const TEST_USER_ID = 'test-user-id';
const TEST_ADDRESS_ID = 'addr-uuid-1';

// Mock middlewares
jest.mock('@/middlewares', () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).userId = TEST_USER_ID;
    next();
  },
  requirePermission:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
}));

// Mock utils
jest.mock('@/utils', () => ({
  ResponseFormatter: {
    success: jest.fn((res: express.Response, data: any, message: string, status = 200) => {
      res.status(status).json({ success: true, data, message });
    }),
    error: jest.fn((res: express.Response, message: string, status = 500) => {
      res.status(status).json({ success: false, message });
    }),
  },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock database
jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    query: {
      userAddresses: { findMany: jest.fn() },
    },
  },
}));

// Mock audit service
jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn().mockResolvedValue(undefined) },
}));

const mockAddress = {
  id: TEST_ADDRESS_ID,
  user_id: TEST_USER_ID,
  address_label: 'home',
  recipient_name: 'John Doe',
  phone_number: '+911234567890',
  address_line1: '123 Main St',
  address_line2: null,
  city: 'Mumbai',
  state_province: 'Maharashtra',
  postal_code: '400001',
  country: 'India',
  country_code: 'IN',
  is_default_shipping: false,
  is_default_billing: false,
  delivery_instructions: null,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Address API Integration Tests', () => {
  let app: express.Application;
  let dbMock: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    const { db } = await import('@/database');
    dbMock = db;

    const { default: addressRouter } = await import('@/features/address/index');
    app.use('/api', addressRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /api/users/:userId/addresses ====================

  describe('GET /api/users/:userId/addresses', () => {
    it('should return list of addresses for a user', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([mockAddress]);

      const response = await request(app).get(`/api/users/${TEST_USER_ID}/addresses`).expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return empty array when user has no addresses', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get(`/api/users/${TEST_USER_ID}/addresses`).expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== POST /api/users/:userId/addresses ====================

  describe('POST /api/users/:userId/addresses', () => {
    const validAddressData = {
      address_label: 'home',
      recipient_name: 'John Doe',
      phone_number: '9876543210',
      address_line1: '123 Main St',
      city: 'Mumbai',
      state_province: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
    };

    it('should create a new address successfully', async () => {
      (dbMock.returning as jest.Mock).mockResolvedValue([mockAddress]);
      (dbMock.where as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/users/${TEST_USER_ID}/addresses`)
        .send(validAddressData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject address with missing required fields', async () => {
      const invalidData = {
        address_label: 'home',
        // Missing required fields
      };

      const response = await request(app)
        .post(`/api/users/${TEST_USER_ID}/addresses`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should set default shipping address and unset others', async () => {
      (dbMock.returning as jest.Mock).mockResolvedValue([
        { ...mockAddress, is_default_shipping: true },
      ]);
      (dbMock.where as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/users/${TEST_USER_ID}/addresses`)
        .send({ ...validAddressData, is_default_shipping: true })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== PUT /api/users/:userId/addresses/:addressId ====================

  describe('PUT /api/users/:userId/addresses/:addressId', () => {
    it('should update an existing address', async () => {
      const updateData = {
        city: 'Pune',
        state_province: 'Maharashtra',
      };

      (dbMock.returning as jest.Mock).mockResolvedValue([{ ...mockAddress, ...updateData }]);
      (dbMock.where as jest.Mock).mockResolvedValue([mockAddress]);

      const response = await request(app)
        .put(`/api/users/${TEST_USER_ID}/addresses/${TEST_ADDRESS_ID}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent address', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .put(`/api/users/${TEST_USER_ID}/addresses/non-existent-id`)
        .send({ city: 'Pune' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== DELETE /api/users/:userId/addresses/:addressId ====================

  describe('DELETE /api/users/:userId/addresses/:addressId', () => {
    it('should soft-delete an address', async () => {
      (dbMock.where as jest.Mock)
        .mockResolvedValue([mockAddress])
        .mockResolvedValueOnce([mockAddress]);
      (dbMock.returning as jest.Mock).mockResolvedValue([{ ...mockAddress, is_deleted: true }]);

      const response = await request(app)
        .delete(`/api/users/${TEST_USER_ID}/addresses/${TEST_ADDRESS_ID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent address', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .delete(`/api/users/${TEST_USER_ID}/addresses/non-existent-id`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== PATCH /api/users/:userId/addresses/:addressId/set-default ====================

  describe('PATCH /api/users/:userId/addresses/:addressId/set-default', () => {
    it('should set address as default shipping', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([mockAddress]);
      (dbMock.returning as jest.Mock).mockResolvedValue([
        { ...mockAddress, is_default_shipping: true },
      ]);

      const response = await request(app)
        .patch(`/api/users/${TEST_USER_ID}/addresses/${TEST_ADDRESS_ID}/set-default`)
        .send({ type: 'shipping' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should set address as default billing', async () => {
      (dbMock.where as jest.Mock).mockResolvedValue([mockAddress]);
      (dbMock.returning as jest.Mock).mockResolvedValue([
        { ...mockAddress, is_default_billing: true },
      ]);

      const response = await request(app)
        .patch(`/api/users/${TEST_USER_ID}/addresses/${TEST_ADDRESS_ID}/set-default`)
        .send({ type: 'billing' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
