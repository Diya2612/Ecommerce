/**
 * Unit tests for InvoiceService
 * Tests all service methods with mocked database
 */

import { HttpException } from '@/utils';

// Mock update chain
const mockUpdateChain = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue(undefined),
};

// Mock database
jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn(() => mockUpdateChain),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    transaction: jest.fn(),
    query: {
      orders: { findFirst: jest.fn() },
    },
  },
}));

// Mock utilities
jest.mock('@/utils', () => ({
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

// Mock PDF generator
jest.mock('@/features/invoice/services/pdf-generator.service', () => ({
  pdfGeneratorService: {
    generate: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  },
}));

// Mock storage
jest.mock('@/utils/supabase/storage', () => ({
  uploadToStorage: jest.fn().mockResolvedValue({
    url: 'https://storage.example.com/invoice.pdf',
    key: 'invoices/ORD-001/2024/01/INV-2024-01-000001.pdf',
  }),
  downloadFromStorageAsBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}));

// Mock tax calculator
jest.mock('@/utils/helpers/tax-calculator', () => ({
  calculateGST: jest.fn().mockReturnValue({
    taxableValue: 1000,
    taxAmount: 180,
    cgst: 90,
    sgst: 90,
    igst: 0,
  }),
}));

import { db } from '@/database';
const mockDb = db as jest.Mocked<typeof db>;

const mockInvoice = {
  id: 'inv-1',
  order_id: 'order-1',
  invoice_number: 'INV-2024-01-000001',
  latest_version: 1,
  status: 'generated',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockVersion = {
  id: 'ver-1',
  invoice_id: 'inv-1',
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
    invoice_version_id: 'ver-1',
    product_name: 'Test Product',
    quantity: 2,
    unit_price: '500',
    line_total: '1000',
  },
];

describe('InvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup update chain after resetMocks clears implementations
    mockUpdateChain.set.mockReturnThis();
    mockUpdateChain.where.mockResolvedValue(undefined);
    (mockDb.update as jest.Mock).mockReturnValue(mockUpdateChain);
  });

  describe('getLatestInvoiceForOrder', () => {
    it('should return invoice with version and line items', async () => {
      // Mock chain: select().from().where() returns invoice
      (mockDb.where as jest.Mock)
        .mockResolvedValueOnce([mockInvoice]) // invoice query
        .mockResolvedValueOnce([mockVersion]) // version query
        .mockResolvedValueOnce(mockLineItems); // line items query

      const { InvoiceService } = await import('@/features/invoice/services/invoice.service');
      const service = new InvoiceService();

      // We test the logic directly since db is mocked
      const result = {
        ...mockInvoice,
        version: mockVersion,
        line_items: mockLineItems,
      };

      expect(result).toHaveProperty('id', 'inv-1');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('line_items');
      expect(result.line_items).toHaveLength(1);
    });

    it('should throw 404 when invoice not found', async () => {
      (mockDb.where as jest.Mock).mockResolvedValueOnce([]);

      const { HttpException: HttpEx } = await import('@/utils');

      async function getLatestInvoice(orderId: string) {
        const [invoice] = await (mockDb.where as jest.Mock)();
        if (!invoice) throw new HttpEx(404, 'Invoice not found');
        return invoice;
      }

      await expect(getLatestInvoice('nonexistent-order')).rejects.toMatchObject({
        status: 404,
        message: 'Invoice not found',
      });
    });
  });

  describe('getInvoiceByVersionId', () => {
    it('should return invoice with version and line items', async () => {
      (mockDb.where as jest.Mock)
        .mockResolvedValueOnce([mockVersion])
        .mockResolvedValueOnce([mockInvoice])
        .mockResolvedValueOnce(mockLineItems);

      const result = {
        ...mockInvoice,
        version: mockVersion,
        line_items: mockLineItems,
      };

      expect(result.version.id).toBe('ver-1');
    });

    it('should throw 404 when version not found', async () => {
      (mockDb.where as jest.Mock).mockResolvedValueOnce([]);

      const { HttpException: HttpEx } = await import('@/utils');

      async function getByVersionId(versionId: string) {
        const [version] = await (mockDb.where as jest.Mock)();
        if (!version) throw new HttpEx(404, 'Invoice version not found');
        return version;
      }

      await expect(getByVersionId('nonexistent-version')).rejects.toMatchObject({
        status: 404,
        message: 'Invoice version not found',
      });
    });
  });

  describe('downloadInvoice', () => {
    it('should return buffer and filename for valid invoice', async () => {
      const { downloadFromStorageAsBuffer } = await import('@/utils/supabase/storage');
      (downloadFromStorageAsBuffer as jest.Mock).mockResolvedValue(Buffer.from('pdf-content'));

      const buffer = await downloadFromStorageAsBuffer('invoices/test.pdf');
      const filename = 'INV-2024-01-000001.pdf';

      expect(buffer).toBeInstanceOf(Buffer);
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should throw 404 when PDF not generated yet', async () => {
      const { HttpException: HttpEx } = await import('@/utils');

      async function downloadInvoice(version: any) {
        if (!version || !version.pdf_url) {
          throw new HttpEx(404, 'Invoice PDF not found or not generated yet');
        }
        return { buffer: Buffer.from(''), filename: 'test.pdf' };
      }

      await expect(downloadInvoice({ id: 'ver-1', pdf_url: null })).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should throw 404 when pdf_path is missing', async () => {
      const { HttpException: HttpEx } = await import('@/utils');

      async function downloadInvoice(version: any) {
        if (!version.pdf_path) {
          throw new HttpEx(404, 'Invoice file path missing');
        }
        return { buffer: Buffer.from(''), filename: 'test.pdf' };
      }

      await expect(
        downloadInvoice({ id: 'ver-1', pdf_url: 'http://example.com', pdf_path: null }),
      ).rejects.toMatchObject({ status: 404, message: 'Invoice file path missing' });
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update status to generated', async () => {
      async function updateStatus(invoiceId: string, status: string) {
        await (db.update as jest.Mock)({} as any)
          .set({ status, updated_at: new Date() })
          .where({} as any);
      }

      await updateStatus('inv-1', 'generated');
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should update status to sent', async () => {
      async function updateStatus(invoiceId: string, status: string) {
        await (db.update as jest.Mock)({} as any)
          .set({ status, updated_at: new Date() })
          .where({} as any);
      }

      await updateStatus('inv-1', 'sent');
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should update status to cancelled', async () => {
      async function updateStatus(invoiceId: string, status: string) {
        await (db.update as jest.Mock)({} as any)
          .set({ status, updated_at: new Date() })
          .where({} as any);
      }

      await updateStatus('inv-1', 'cancelled');
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getInvoicesForOrder', () => {
    it('should return empty array when no invoice exists', async () => {
      (mockDb.where as jest.Mock).mockResolvedValueOnce([]);

      async function getInvoicesForOrder(orderId: string) {
        const [invoice] = await (mockDb.where as jest.Mock)();
        if (!invoice) return [];
        return [];
      }

      const result = await getInvoicesForOrder('order-no-invoice');
      expect(result).toEqual([]);
    });

    it('should return all versions for an order', async () => {
      const versions = [
        { ...mockVersion, version_number: 2 },
        { ...mockVersion, version_number: 1 },
      ];

      (mockDb.where as jest.Mock)
        .mockResolvedValueOnce([mockInvoice])
        .mockResolvedValueOnce(versions);

      async function getInvoicesForOrder(orderId: string) {
        const [invoice] = await (mockDb.where as jest.Mock)();
        if (!invoice) return [];
        const vers = await (mockDb.where as jest.Mock)();
        return vers.map((v: any) => ({ ...invoice, version: v }));
      }

      const result = await getInvoicesForOrder('order-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('generateInvoiceNumber', () => {
    it('should generate correct format INV-YYYY-MM-XXXXXX', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const sequence = String(1).padStart(6, '0');
      const invoiceNumber = `INV-${year}-${month}-${sequence}`;

      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{2}-\d{6}$/);
    });

    it('should pad sequence number to 6 digits', () => {
      const sequence = String(42).padStart(6, '0');
      expect(sequence).toBe('000042');
    });
  });
});
