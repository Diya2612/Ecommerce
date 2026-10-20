/**
 * OrderManagementService Unit Tests
 *
 * Tests: confirmDraftOrder, duplicateOrder, deleteOrders
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest
      .fn()
      .mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
      }),
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

// Mock all dynamic imports used inside service methods
jest.mock('@/features/orders/shared/queries', () => ({
  findOrderById: jest.fn(),
  getOrderItems: jest.fn(),
  updateOrder: jest.fn(),
  softDeleteOrders: jest.fn(),
}));

jest.mock('@/features/inventory/services', () => ({
  reserveStockForOrder: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/features/queue/services/event-publisher.service', () => ({
  eventPublisher: { publishNotification: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('@/features/notifications/shared/constants', () => ({
  TEMPLATE_CODES: { ORDER_CONFIRMED: 'order_confirmed' },
}));

jest.mock('@/features/orders/services/order-creation.service', () => ({
  orderCreationService: {
    generateOrderNumber: jest.fn().mockResolvedValue('ORD-25-000099'),
  },
}));

jest.mock('@/features/orders/shared/orders.schema', () => ({
  orders: { id: 'id', order_number: 'order_number' },
}));

jest.mock('@/features/orders/shared/order-items.schema', () => ({
  orderItems: { id: 'id', order_id: 'order_id' },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderManagementService } from '@/features/orders/services/order-management.service';
import {
  findOrderById,
  getOrderItems,
  updateOrder,
  softDeleteOrders,
} from '@/features/orders/shared/queries';
import { reserveStockForOrder } from '@/features/inventory/services';

function getDb() {
  return jest.requireMock('@/database').db;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ADMIN_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

const draftOrder = {
  id: ORDER_ID,
  order_number: 'ORD-25-000010',
  is_draft: true,
  order_status: 'pending',
  payment_status: 'pending',
  fulfillment_status: 'unfulfilled',
  user_id: ADMIN_ID,
  admin_comment: null,
  currency: 'INR',
  total_amount: '1090',
};

const mockItems = [
  { id: 'item-1', order_id: ORDER_ID, product_id: 'prod-1', quantity: 2, sku: 'SKU1' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── confirmDraftOrder ─────────────────────────────────────────────────────

  describe('confirmDraftOrder', () => {
    it('throws 404 when draft order not found', async () => {
      getDb().transaction.mockImplementation(async (cb: Function) => {
        (findOrderById as jest.Mock).mockResolvedValueOnce(null);
        return cb({});
      });

      await expect(
        orderManagementService.confirmDraftOrder(ORDER_ID, {}, ADMIN_ID),
      ).rejects.toMatchObject({ status: 404, message: 'Draft order not found' });
    });

    it('throws 400 when order is not a draft', async () => {
      getDb().transaction.mockImplementation(async (cb: Function) => {
        (findOrderById as jest.Mock).mockResolvedValueOnce({ ...draftOrder, is_draft: false });
        return cb({});
      });

      await expect(
        orderManagementService.confirmDraftOrder(ORDER_ID, {}, ADMIN_ID),
      ).rejects.toMatchObject({ status: 400, message: 'Order is not a draft' });
    });

    it('throws 400 when order has no items', async () => {
      getDb().transaction.mockImplementation(async (cb: Function) => {
        (findOrderById as jest.Mock).mockResolvedValueOnce(draftOrder);
        (getOrderItems as jest.Mock).mockResolvedValueOnce([]);
        return cb({});
      });

      await expect(
        orderManagementService.confirmDraftOrder(ORDER_ID, {}, ADMIN_ID),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('confirms draft order successfully', async () => {
      const confirmedOrder = { ...draftOrder, is_draft: false, order_status: 'confirmed' };

      getDb().transaction.mockImplementation(async (cb: Function) => {
        (findOrderById as jest.Mock).mockResolvedValueOnce(draftOrder);
        (getOrderItems as jest.Mock).mockResolvedValueOnce(mockItems);
        (reserveStockForOrder as jest.Mock).mockResolvedValueOnce(undefined);
        (updateOrder as jest.Mock).mockResolvedValueOnce(confirmedOrder);
        return cb({});
      });

      const result = await orderManagementService.confirmDraftOrder(
        ORDER_ID,
        { send_confirmation_email: false },
        ADMIN_ID,
      );

      expect(result.is_draft).toBe(false);
      expect(result.order_status).toBe('confirmed');
      expect(result.inventory_reserved).toBe(true);
    });
  });

  // ── duplicateOrder ────────────────────────────────────────────────────────

  describe('duplicateOrder', () => {
    it('throws 404 when source order not found', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(null);

      await expect(orderManagementService.duplicateOrder(ORDER_ID, ADMIN_ID)).rejects.toMatchObject(
        { status: 404, message: 'Order not found' },
      );
    });

    it('duplicates order successfully', async () => {
      const originalOrder = {
        ...draftOrder,
        discount_id: null,
        discount_code_id: null,
        discount_type: 'none',
        discount_value: '0',
        discount_amount: '0',
        discount_code: null,
        shipping_amount: '0',
        shipping_method: null,
        shipping_option: null,
        delivery_price: '0',
        tax_rule_id: null,
        tax_amount: '90',
        cgst: '45',
        sgst: '45',
        igst: '0',
        subtotal: '1000',
        shipping_address_id: ADMIN_ID,
        billing_address_id: ADMIN_ID,
        payment_method: 'cod',
        customer_note: null,
        admin_comment: null,
        tags: null,
        order_tracking: null,
      };
      const newOrder = { id: 'new-order-id', order_number: 'ORD-25-000099' };

      (findOrderById as jest.Mock).mockResolvedValueOnce(originalOrder);
      (getOrderItems as jest.Mock).mockResolvedValueOnce(mockItems);

      getDb().transaction.mockImplementation(async (cb: Function) => {
        const txMock = {
          insert: jest.fn().mockReturnValue({
            values: jest
              .fn()
              .mockReturnValue({ returning: jest.fn().mockResolvedValue([newOrder]) }),
          }),
        };
        return cb(txMock);
      });

      const result = await orderManagementService.duplicateOrder(ORDER_ID, ADMIN_ID);

      expect(result.id).toBe('new-order-id');
      expect(result.order_number).toBe('ORD-25-000099');
    });
  });

  // ── deleteOrders ──────────────────────────────────────────────────────────

  describe('deleteOrders', () => {
    it('throws 404 when an order to delete is not found', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(null);

      await expect(orderManagementService.deleteOrders([ORDER_ID], ADMIN_ID)).rejects.toMatchObject(
        { status: 404 },
      );
    });

    it('throws 400 when trying to delete a paid order', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce({
        ...draftOrder,
        order_number: 'ORD-25-000010',
        payment_status: 'paid',
      });

      await expect(orderManagementService.deleteOrders([ORDER_ID], ADMIN_ID)).rejects.toMatchObject(
        { status: 400 },
      );
    });

    it('throws 400 when trying to delete a delivered order', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce({
        ...draftOrder,
        order_number: 'ORD-25-000010',
        order_status: 'delivered',
        fulfillment_status: 'unfulfilled',
      });

      await expect(orderManagementService.deleteOrders([ORDER_ID], ADMIN_ID)).rejects.toMatchObject(
        { status: 400 },
      );
    });

    it('soft deletes valid orders', async () => {
      (findOrderById as jest.Mock).mockResolvedValue({
        ...draftOrder,
        order_number: 'ORD-25-000010',
        payment_status: 'pending',
        order_status: 'pending',
        fulfillment_status: 'unfulfilled',
      });
      (softDeleteOrders as jest.Mock).mockResolvedValueOnce([draftOrder]);

      const result = await orderManagementService.deleteOrders([ORDER_ID], ADMIN_ID);

      expect(softDeleteOrders).toHaveBeenCalledWith([ORDER_ID], ADMIN_ID);
      expect(result).toHaveLength(1);
    });
  });
});
