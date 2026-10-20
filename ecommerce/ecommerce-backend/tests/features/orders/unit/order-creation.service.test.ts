/**
 * OrderCreationService Unit Tests
 *
 * Tests: generateOrderNumber, createOrderFromCart (error paths), createDirectOrder (error paths)
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    insert: jest.fn(),
    update: jest
      .fn()
      .mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
      }),
    transaction: jest.fn(),
  },
  schema: {},
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = 'HttpException';
    }
  },
}));

// Mock dynamic imports used inside service methods
jest.mock('@/features/orders/shared/queries', () => ({
  findActiveCartByUserId: jest.fn(),
  getCartItems: jest.fn(),
  findAddressById: jest.fn(),
  findUserById: jest.fn(),
  createOrder: jest.fn(),
  createOrderItems: jest.fn(),
  markCartAsConverted: jest.fn(),
  markWishlistItemsAsPurchased: jest.fn(),
  updateOrder: jest.fn(),
  findOrderById: jest.fn(),
  reserveStockForOrder: jest.fn(),
}));

jest.mock('@/features/inventory/services', () => ({
  extendCartReservation: jest.fn(),
  reserveStockForOrder: jest.fn(),
  validateStockAvailability: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/features/orders/shared/orders.schema', () => ({
  orders: { id: 'id', order_number: 'order_number', user_id: 'user_id' },
}));

jest.mock('@/features/cart/shared/carts.schema', () => ({
  carts: { id: 'id', user_id: 'user_id' },
}));

jest.mock('@/features/wishlist/shared/wishlist.schema', () => ({
  wishlists: { id: 'id', user_id: 'user_id' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => ({ col, val })),
  sql: Object.assign(
    jest.fn((parts, ...vals) => ({ parts, vals })),
    {
      raw: jest.fn(),
    },
  ),
}));

// Mock services used inside creation service
jest.mock('@/features/orders/services/order-calculation.service', () => ({
  orderCalculationService: {
    calculateOrderPricing: jest.fn().mockResolvedValue({
      subtotal: 1000,
      discount_total: 0,
      shipping_amount: 0,
      delivery_price: 0,
      cgst: 45,
      sgst: 45,
      igst: 0,
      tax_amount: 90,
      total_amount: 1090,
      total_quantity: 2,
      items: [{ line_total: 1000 }],
    }),
  },
}));

jest.mock('@/features/orders/services/order-validation.service', () => ({
  orderValidationService: {
    validateAndWarnStock: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/features/orders/services/order-notification.service', () => ({
  orderNotificationService: {
    queueCustomerOrderNotification: jest.fn().mockResolvedValue(undefined),
    queueAdminOrderNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/features/orders/services/order-conversion.service', () => ({
  orderConversionService: {
    extractCartData: jest.fn().mockResolvedValue({
      items: [{ product_id: 'p1', quantity: 2, unit_price: 500 }],
      discount_code: null,
    }),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderCreationService } from '@/features/orders/services/order-creation.service';
import {
  findActiveCartByUserId,
  getCartItems,
  findAddressById,
  createOrder,
  createOrderItems,
} from '@/features/orders/shared/queries';

function getDb() {
  return jest.requireMock('@/database').db;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
const CART_ID = 'c1d2e3f4-a5b6-4789-cdef-012345678901';
const ADDR_ID = 'aabbccdd-1122-4334-5566-778899aabbcc';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderCreationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Wire select chain for generateOrderNumber
    const db = getDb();
    const mockWhere = jest.fn().mockResolvedValue([{ count: 5 }]);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    db.select.mockReturnValue({ from: mockFrom });
  });

  // ── generateOrderNumber ───────────────────────────────────────────────────

  describe('generateOrderNumber', () => {
    it('generates ORD-YY-NNNNNN format string', async () => {
      const orderNumber = await orderCreationService.generateOrderNumber();

      const year = new Date().getFullYear().toString().slice(-2);
      expect(orderNumber).toMatch(new RegExp(`^ORD-${year}-\\d{6}$`));
    });

    it('pads sequential number to 6 digits', async () => {
      const db = getDb();
      const mockWhere = jest.fn().mockResolvedValue([{ count: 0 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const orderNumber = await orderCreationService.generateOrderNumber();
      expect(orderNumber).toMatch(/000001$/);
    });

    it('increments from existing count', async () => {
      const db = getDb();
      const mockWhere = jest.fn().mockResolvedValue([{ count: 99 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const orderNumber = await orderCreationService.generateOrderNumber();
      expect(orderNumber).toMatch(/000100$/);
    });
  });

  // ── createOrderFromCart ───────────────────────────────────────────────────

  describe('createOrderFromCart', () => {
    it('throws 400 when no active cart is found', async () => {
      (findActiveCartByUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        orderCreationService.createOrderFromCart(
          { payment_method: 'cod', shipping_address_id: ADDR_ID },
          USER_ID,
          null,
        ),
      ).rejects.toMatchObject({ status: 400, message: 'No active cart found' });
    });

    it('throws 400 when cart is empty', async () => {
      (findActiveCartByUserId as jest.Mock).mockResolvedValue({ id: CART_ID });
      (getCartItems as jest.Mock).mockResolvedValue([]);

      await expect(
        orderCreationService.createOrderFromCart(
          { payment_method: 'cod', shipping_address_id: ADDR_ID },
          USER_ID,
          null,
        ),
      ).rejects.toMatchObject({ status: 400, message: 'Cart is empty' });
    });

    it('throws 400 when addresses are missing', async () => {
      (findActiveCartByUserId as jest.Mock).mockResolvedValue({ id: CART_ID, currency: 'INR' });
      (getCartItems as jest.Mock).mockResolvedValue([
        {
          product_id: 'p1',
          quantity: 2,
          line_total: '1000',
          product_sku: 'SKU',
          product_name: 'Product',
        },
      ]);
      (findAddressById as jest.Mock).mockResolvedValue(null);

      await expect(
        orderCreationService.createOrderFromCart(
          { payment_method: 'cod', shipping_address_id: ADDR_ID },
          USER_ID,
          null,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('creates order successfully for valid cart', async () => {
      const mockOrder = {
        id: 'order-new',
        order_number: 'ORD-25-000006',
        total_amount: '1090',
        currency: 'INR',
        user_id: USER_ID,
      };

      (findActiveCartByUserId as jest.Mock).mockResolvedValue({ id: CART_ID, currency: 'INR' });
      (getCartItems as jest.Mock).mockResolvedValue([
        {
          product_id: 'p1',
          quantity: 2,
          line_total: '1000',
          product_sku: 'SKU',
          product_name: 'Product',
          final_price: '500',
        },
      ]);
      (findAddressById as jest.Mock).mockResolvedValue({ id: ADDR_ID, state_province: 'MH' });
      (createOrder as jest.Mock).mockResolvedValue(mockOrder);
      (createOrderItems as jest.Mock).mockResolvedValue([]);

      // Re-assert extractCartData mock in case clearAllMocks removed it
      const { orderConversionService: mockConversionSvc } = jest.requireMock(
        '@/features/orders/services/order-conversion.service',
      );
      mockConversionSvc.extractCartData.mockResolvedValue({
        items: [{ product_id: 'p1', quantity: 2, unit_price: 500 }],
        discount_code: null,
      });

      // Re-assert calculateOrderPricing mock
      const { orderCalculationService: mockCalcSvc } = jest.requireMock(
        '@/features/orders/services/order-calculation.service',
      );
      mockCalcSvc.calculateOrderPricing.mockResolvedValue({
        subtotal: 1000,
        discount_total: 0,
        shipping_amount: 0,
        delivery_price: 0,
        cgst: 45,
        sgst: 45,
        igst: 0,
        tax_amount: 90,
        total_amount: 1090,
        total_quantity: 2,
        items: [{ line_total: 1000 }],
      });

      // Re-assert validateAndWarnStock mock
      const { orderValidationService: mockValidationSvc } = jest.requireMock(
        '@/features/orders/services/order-validation.service',
      );
      mockValidationSvc.validateAndWarnStock.mockResolvedValue(undefined);

      // Re-assert notification mocks
      const { orderNotificationService: mockNotifSvc } = jest.requireMock(
        '@/features/orders/services/order-notification.service',
      );
      mockNotifSvc.queueCustomerOrderNotification.mockResolvedValue(undefined);
      mockNotifSvc.queueAdminOrderNotification.mockResolvedValue(undefined);

      getDb().transaction.mockImplementation(async (cb: Function) => {
        return cb({
          update: jest
            .fn()
            .mockReturnValue({
              set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
            }),
          select: jest
            .fn()
            .mockReturnValue({
              from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
            }),
        });
      });

      // Re-wire db.select for generateOrderNumber (called AFTER extractCartData inside createOrderFromCart)
      // generateOrderNumber does: db.select().from().where() → [{ count }]
      const db = getDb();
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 5 }]),
        }),
      });

      const result = await orderCreationService.createOrderFromCart(
        { payment_method: 'cod', shipping_address_id: ADDR_ID },
        USER_ID,
        null,
      );

      expect(result).toBeDefined();
      expect(createOrder).toHaveBeenCalled();
    });
  });
});
