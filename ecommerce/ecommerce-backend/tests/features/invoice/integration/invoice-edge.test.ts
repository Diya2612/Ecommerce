import request from 'supertest';
import express from 'express';

const TEST_ORDER_ID = 'test-order-id';
const TEST_INVOICE_ID = 'test-invoice-id';
const TEST_VERSION_ID = 'test-version-id';
const TEST_USER_ID = 'admin-user-id';

// Mock dependencies
jest.mock('../../../utils/supabase-auth.helper', () => ({
  SupabaseAuthHelper: {
    seedRBACData: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/middlewares', () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).userId = TEST_USER_ID;
    next();
  },
  requirePermission:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
}));

jest.mock('@/features/invoice/services/invoice.service', () => ({
  invoiceService: {
    getInvoicesForOrder: jest.fn(),
    getInvoiceByVersionId: jest.fn(),
    generateInvoice: jest.fn(),
    getValidatedVersion: jest.fn(),
  },
}));

jest.mock('@/features/queue/services/event-publisher.service', () => ({
  eventPublisher: {
    publishGenerateInvoice: jest.fn(),
    publishEmailNotification: jest.fn(),
  },
}));

describe('Invoice Edge Case Integration Tests', () => {
  let app: express.Application;
  let invoiceServiceMock: any;
  let eventPublisherMock: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    // Import mocks
    const { invoiceService } = await import('@/features/invoice/services/invoice.service');
    invoiceServiceMock = invoiceService;

    const { eventPublisher } = await import('@/features/queue/services/event-publisher.service');
    eventPublisherMock = eventPublisher;

    // Setup routes
    const adminInvoiceRouter = (await import('@/features/invoice/apis/admin-invoice')).default;
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

  describe('POST /api/admin/orders/:id/invoices', () => {
    it('should trigger invoice generation successfully', async () => {
      eventPublisherMock.publishGenerateInvoice.mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/admin/orders/${TEST_ORDER_ID}/invoices`)
        .send({ reason: 'CORRECTION' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.success).toBe(true);
      expect(invoiceServiceMock.generateInvoice).toHaveBeenCalledWith(TEST_ORDER_ID, {
        forceNewVersion: false,
      });
    });

    it('should use default reason if not provided', async () => {
      eventPublisherMock.publishGenerateInvoice.mockResolvedValue(undefined);

      await request(app).post(`/api/admin/orders/${TEST_ORDER_ID}/invoices`).send({}).expect(200);

      expect(invoiceServiceMock.generateInvoice).toHaveBeenCalledWith(
        TEST_ORDER_ID,
        expect.objectContaining({ forceNewVersion: false }),
      );
    });
  });

  describe('POST /api/admin/invoices/:versionId/email', () => {
    it('should return 404 if invoice version not found', async () => {
      // Mock to throw error as service would
      const error: any = new Error('Invoice version not found');
      error.status = 404;
      invoiceServiceMock.getValidatedVersion.mockRejectedValue(error);

      const response = await request(app)
        .post(`/api/admin/invoices/${TEST_VERSION_ID}/email`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice version not found');
    });

    it('should return 400 if PDF url is missing', async () => {
      invoiceServiceMock.getValidatedVersion.mockResolvedValue({
        id: TEST_INVOICE_ID,
        version: {
          id: TEST_VERSION_ID,
          invoice_number: 'INV-001',
          pdf_url: null, // Missing PDF
        },
      });

      const response = await request(app)
        .post(`/api/admin/invoices/${TEST_VERSION_ID}/email`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice PDF not generated yet');
    });

    it('should successfully queue email if all data is present', async () => {
      invoiceServiceMock.getValidatedVersion.mockResolvedValue({
        id: TEST_INVOICE_ID,
        order_id: TEST_ORDER_ID,
        version: {
          id: TEST_VERSION_ID,
          invoice_number: 'INV-001',
          pdf_url: 'https://example.com/invoice.pdf',
          customer_email: 'test@example.com',
          customer_name: 'Test User',
          created_at: new Date(),
        },
      });
      eventPublisherMock.publishEmailNotification.mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/admin/invoices/${TEST_VERSION_ID}/email`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(eventPublisherMock.publishEmailNotification).toHaveBeenCalledTimes(1);
    });
  });
});
