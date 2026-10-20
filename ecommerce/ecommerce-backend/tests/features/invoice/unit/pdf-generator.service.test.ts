/**
 * PDF Generator Service Unit Tests
 * Tests for invoice PDF generation logic
 */

// ─── Mocks (hoisted by Jest before imports) ────────────────────────────────

// Build a reusable mock doc factory so we can recreate it per-test
const makeMockDoc = () => ({
  pipe: jest.fn().mockReturnThis(),
  font: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  fill: jest.fn().mockReturnThis(),
  fillColor: jest.fn().mockReturnThis(),
  strokeColor: jest.fn().mockReturnThis(),
  image: jest.fn().mockReturnThis(),
  lineWidth: jest.fn().mockReturnThis(),
  heightOfString: jest.fn().mockReturnValue(12),
  page: { width: 595, height: 842 },
  y: 100,
  end: jest.fn(),
  on: jest.fn(function (this: any, event: string, cb: (...args: any[]) => void) {
    if (event === 'end') setTimeout(cb, 0);
    if (event === 'data') {
      // emit one empty buffer so concat works
      setTimeout(() => cb(Buffer.alloc(0)), 0);
    }
    return this;
  }),
});

jest.mock('pdfkit', () => {
  // Return a constructor that creates a fresh mock doc each time
  const MockPDFDocument = jest.fn().mockImplementation(() => makeMockDoc());
  return MockPDFDocument;
});

jest.mock('@/utils', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

// Mock numberToWords utility
jest.mock('@/utils/helpers/number-to-words', () => ({
  numberToWords: jest.fn().mockReturnValue('One Thousand One Hundred Eighty'),
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

// Complete invoiceConfig mock matching the real shape
jest.mock('@/features/invoice/config/invoice.config', () => ({
  invoiceConfig: {
    company: {
      name: 'ANANT ENTERPRISES',
      address: '123 Business Street, City, State 12345',
      email: 'support@anantentries.com',
      showGSTIN: false,
      gstin: '27ABCDE1234F1Z5',
    },
    tax: {
      enabled: false,
      isInclusive: false,
      rate: 0.18,
    },
    header: {
      title: 'TAX INVOICE',
      showPlaceOfSupply: true,
      showTimeOfSupply: true,
    },
    client: {
      showGSTIN: false,
      showPhone: true,
      showEmail: true,
    },
    table: {
      showSlNo: true,
      showHSN: false,
      showUnit: true,
      showRate: false,
      showDiscount: true,
      showTaxableValue: false,
    },
    footer: {
      showAmountInWords: true,
      greeting: 'Thank You!',
      termsAndConditions: ['Goods sold are not refundable.'],
      showAuthorizedSignatory: false,
    },
    summary: {
      showSubtotal: true,
      showDiscount: true,
      showTaxableValue: false,
      showTaxBreakdown: false,
      showIGST: false,
      showCGSTSGST: false,
      showTotalTax: false,
      showShipping: true,
    },
    layout: {
      fontFamily: 'Helvetica',
      fontSize: {
        header: 16,
        subHeader: 14,
        body: 10,
        small: 9,
        tiny: 8,
      },
      colors: {
        primary: 'black',
        secondary: '#444444',
        accent: '#000000',
      },
    },
  },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const mockInvoice = {
  id: 'inv-1',
  order_id: 'order-1',
  invoice_number: 'INV-2024-01-000001',
  latest_version: 1,
  status: 'generated',
  created_at: new Date('2024-01-15T10:00:00Z'),
  updated_at: new Date('2024-01-15T10:00:00Z'),
  version: { place_of_supply: 'MH' },
};

const mockOrder = {
  id: 'order-1',
  order_number: 'ORD-2024-001',
  user_id: 'user-1',
  status: 'confirmed',
  total_amount: '1180',
  shipping_amount: '0',
  discount_amount: '0',
  billing_address_line1: '456 Customer St',
  billing_address_line2: 'Apt 2B',
  billing_city: 'Mumbai',
  billing_state: 'Maharashtra',
  billing_pin_code: '400002',
  billing_name: 'John Doe',
  billing_phone: '+911234567890',
  shipping_state: 'Maharashtra',
  created_at: new Date('2024-01-15T10:00:00Z'),
};

const mockOrderItems = [
  {
    id: 'item-1',
    product_name: 'Test Product A',
    sku: 'SKU-001',
    quantity: 2,
    cost_price: '500',
    unit_price: '500',
    hsn_code: '6109',
    tax_rate: 18,
  },
  {
    id: 'item-2',
    product_name: 'Test Product B',
    sku: 'SKU-002',
    quantity: 1,
    cost_price: '180',
    unit_price: '180',
    hsn_code: '6110',
    tax_rate: 18,
  },
];

const mockBillingAddress = {
  id: 'addr-1',
  recipient_name: 'John Doe',
  address_line1: '456 Customer St',
  address_line2: 'Apt 2B',
  city: 'Mumbai',
  state_province: 'Maharashtra',
  postal_code: '400002',
  country: 'India',
  phone_number: '+911234567890',
};

const mockShippingAddress = {
  ...mockBillingAddress,
  id: 'addr-2',
};

const mockUser = {
  id: 'user-1',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('PdfGeneratorService - Unit Tests', () => {
  let pdfGeneratorService: any;
  let MockPDFDocument: jest.Mock;

  beforeEach(async () => {
    // Only clear call history, NOT implementations
    jest.clearAllMocks();

    // Re-apply implementation after clearAllMocks (which resets mockImplementation)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    MockPDFDocument = require('pdfkit') as jest.Mock;
    MockPDFDocument.mockImplementation(() => makeMockDoc());

    // Use jest.isolateModules to get a fresh module each time
    await jest.isolateModulesAsync(async () => {
      const module = await import('@/features/invoice/services/pdf-generator.service');
      pdfGeneratorService = module.pdfGeneratorService;
    });
  });

  describe('generate', () => {
    it('should generate a PDF buffer', async () => {
      const result = await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        mockBillingAddress,
        mockShippingAddress,
        mockUser,
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should call PDF document methods during generation', async () => {
      await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        mockBillingAddress,
        mockShippingAddress,
        mockUser,
      );

      // The mock constructor was called — get the instance it created
      expect(MockPDFDocument).toHaveBeenCalled();
      const mockDoc = MockPDFDocument.mock.results[0].value;
      expect(mockDoc.text).toHaveBeenCalled();
      expect(mockDoc.fontSize).toHaveBeenCalled();
    });

    it('should handle null billing address gracefully', async () => {
      const result = await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        null,
        mockShippingAddress,
        mockUser,
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle null shipping address gracefully', async () => {
      const result = await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        mockBillingAddress,
        null,
        mockUser,
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle user with missing email gracefully', async () => {
      const userWithoutEmail = { ...mockUser, email: undefined };
      const result = await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        mockBillingAddress,
        mockShippingAddress,
        userWithoutEmail,
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle empty order items', async () => {
      const result = await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        [],
        mockBillingAddress,
        mockShippingAddress,
        mockUser,
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should include invoice number in PDF content', async () => {
      await pdfGeneratorService.generate(
        mockInvoice,
        mockOrder,
        mockOrderItems,
        mockBillingAddress,
        mockShippingAddress,
        mockUser,
      );

      const mockDoc = MockPDFDocument.mock.results[0].value;
      const textCalls = (mockDoc.text as jest.Mock).mock.calls;
      const allText = textCalls.map((call: any[]) => String(call[0])).join(' ');
      expect(allText).toContain('INV-2024-01-000001');
    });
  });
});
