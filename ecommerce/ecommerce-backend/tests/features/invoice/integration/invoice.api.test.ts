/**
 * Invoice API Integration Tests (Mocked)
 * Tests for all invoice endpoints with mocked service layer
 */

import request from 'supertest';
import express from 'express';

const TEST_USER_ID = 'admin-user-id';
const TEST_ORDER_ID = 'order-uuid-1';
const TEST_INVOICE_ID = 'invoice-uuid-1';
const TEST_VERSION_ID = 'version-uuid-1';

jest.mock('../../../utils/supabase-auth.helper', () => ({
  SupabaseAuthHelper: {
    seedRBACData: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/middlewares', () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).userId = 'admin-user-id';
    next();
  },
  requirePermission:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
      next();
    },
}));

jest.mock('@/features/invoice/services/invoice.service', () => ({
  invoiceService: {
    generateInvoice: jest.fn(),
    getLatestInvoiceForOrder: jest.fn(),
    getInvoicesForOrder: jest.fn(),
    getInvoiceByVersionId: jest.fn(),
    downloadInvoice: jest.fn(),
    updateInvoiceStatus: jest.fn(),
    getValidatedVersion: jest.fn(),
  },
}));

jest.mock('@/features/queue/services/event-publisher.service', () => ({
  eventPublisher: {
    publishGenerateInvoice: jest.fn(),
    publishEmailNotification: jest.fn(),
  },
}));

const mockInvoice = {
  id: TEST_INVOICE_ID,
  order_id: TEST_ORDER_ID,
  invoice_number: 'INV-2024-01-000001',
  latest_version: 1,
  status: 'generated',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockVersion = {
  id: TEST_VERSION_ID,
  invoice_id: TEST_INVOICE_ID,
  version_number: 1,
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  pdf_url: 'https://storage.example.com/invoice.pdf',
  pdf_path: 'invoices/ORD-001/2024/01/INV-2024-01-000001.pdf',
  grand_total: '1180',
  created_at: new Date(),
};

const mockLineItems = [
  {
    id: 'li-1',
    invoice_version_id: TEST_VERSION_ID,
    product_name: 'Test Product',
    quantity: 2,
    unit_price: '500',
    line_total: '1000',
  },
];

describe('Invoice API Integration Tests (Mocked)', () => {
  let app: express.Application;
  let invoiceServiceMock: any;
  let eventPublisherMock: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    const { invoiceService } = await import('@/features/invoice/services/invoice.service');
    invoiceServiceMock = invoiceService;

    const { eventPublisher } = await import('@/features/queue/services/event-publisher.service');
    eventPublisherMock = eventPublisher;

    const { default: adminInvoiceRouter } = await import('@/features/invoice/apis/admin-invoice');
    app.use('/api/admin', adminInvoiceRouter);
    // Add error handler for tests
    app.use(
      (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const status = err.status || 500;
        const message = err.message || 'Internal Server Error';
        res.status(status).json({ success: false, message });
      },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== POST /api/admin/orders/:id/invoices ====================

  describe('POST /api/admin/orders/:id/invoices', () => {
    it('should trigger invoice generation successfully', async () => {
      invoiceServiceMock.generateInvoice.mockResolvedValue(mockInvoice);

      const response = await request(app)
        .post(`/api/admin/orders/${TEST_ORDER_ID}/invoices`)
        .send({ force: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(invoiceServiceMock.generateInvoice).toHaveBeenCalledWith(TEST_ORDER_ID, {
        forceNewVersion: true,
      });
    });

    it('should use default force=false if not provided', async () => {
      invoiceServiceMock.generateInvoice.mockResolvedValue(mockInvoice);

      await request(app).post(`/api/admin/orders/${TEST_ORDER_ID}/invoices`).send({}).expect(200);

      expect(invoiceServiceMock.generateInvoice).toHaveBeenCalledWith(TEST_ORDER_ID, {
        forceNewVersion: false,
      });
    });

    it('should handle service errors gracefully', async () => {
      invoiceServiceMock.generateInvoice.mockRejectedValue(new Error('Generation failed'));

      const response = await request(app)
        .post(`/api/admin/orders/${TEST_ORDER_ID}/invoices`)
        .send({})
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== GET /api/admin/orders/:id/invoices ====================

  describe('GET /api/admin/orders/:id/invoices', () => {
    it('should return all invoice versions for an order', async () => {
      invoiceServiceMock.getInvoicesForOrder.mockResolvedValue([
        { ...mockInvoice, version: mockVersion },
      ]);

      const response = await request(app)
        .get(`/api/admin/orders/${TEST_ORDER_ID}/invoices`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array when no invoices exist for order', async () => {
      invoiceServiceMock.getInvoicesForOrder.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/admin/orders/${TEST_ORDER_ID}/invoices`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  // ==================== POST /api/admin/invoices/:versionId/email ====================

  describe('POST /api/admin/invoices/:versionId/email', () => {
    it('should queue email notification successfully', async () => {
      invoiceServiceMock.getValidatedVersion.mockResolvedValue({
        ...mockInvoice,
        version: mockVersion,
      });
      eventPublisherMock.publishEmailNotification.mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/admin/invoices/${TEST_VERSION_ID}/email`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(eventPublisherMock.publishEmailNotification).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when invoice version not found', async () => {
      const error: any = new Error('Invoice version not found');
      error.status = 404;
      invoiceServiceMock.getValidatedVersion.mockRejectedValue(error);

      const response = await request(app)
        .post(`/api/admin/invoices/non-existent-version/email`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when PDF not generated yet', async () => {
      invoiceServiceMock.getValidatedVersion.mockResolvedValue({
        ...mockInvoice,
        version: { ...mockVersion, pdf_url: null },
      });

      const response = await request(app)
        .post(`/api/admin/invoices/${TEST_VERSION_ID}/email`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
