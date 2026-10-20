/**
 * OrderUpdateService Unit Tests
 *
 * Tests: updateFullOrder, updateTracking, updateFulfillmentStatus
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDelete = jest.fn();

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest
      .fn()
      .mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
      }),
    delete: jest.fn(),
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

// Mock dynamic imports used inside methods
jest.mock('@/features/orders/shared/queries', () => ({
  findOrderById: jest.fn(),
  findOrderByNumber: jest.fn(),
  updateOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

jest.mock('@/features/inventory/services/order-reservation.service', () => ({
  validateStockAvailability: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/features/inventory/services', () => ({
  fulfillOrderInventory: jest.fn().mockResolvedValue(undefined),
  releaseReservation: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/features/orders/services/order-status.service', () => ({
  orderStatusService: {
    updateFulfillmentStatus: jest.fn().mockResolvedValue(undefined),
    isValidTransition: jest.fn().mockReturnValue(true),
    getValidTransitions: jest.fn().mockReturnValue(['confirmed']),
  },
}));

jest.mock('@/features/orders/shared/order-items.schema', () => ({
  orderItems: { id: 'id', order_id: 'order_id' },
}));

jest.mock('@/features/queue/services/event-publisher.service', () => ({
  eventPublisher: { publishNotification: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('@/features/notifications/shared/constants', () => ({
  TEMPLATE_CODES: {
    ORDER_TRACKING_UPDATED: 'order_tracking_updated',
    ORDER_FULFILLMENT_UPDATED: 'order_fulfillment_updated',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => ({ col, val })),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderUpdateService } from '@/features/orders/services/order-update.service';
import {
  findOrderById,
  findOrderByNumber,
  updateOrder,
  updateOrderStatus,
} from '@/features/orders/shared/queries';

function getDb() {
  return jest.requireMock('@/database').db;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const ORDER_NUMBER = 'ORD-25-000010';
const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

const mockOrder = {
  id: ORDER_ID,
  order_number: ORDER_NUMBER,
  order_status: 'pending',
  payment_status: 'pending',
  fulfillment_status: 'unfulfilled',
  user_id: USER_ID,
  admin_comment: null,
  order_tracking: null,
  shipping_method: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── updateFullOrder ───────────────────────────────────────────────────────

  describe('updateFullOrder', () => {
    it('throws 404 when order is not found (by UUID)', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        orderUpdateService.updateFullOrder(ORDER_ID, { admin_comment: 'test' }, USER_ID),
      ).rejects.toMatchObject({ status: 404, message: 'Order not found' });
    });

    it('throws 404 when order is not found (by order number)', async () => {
      (findOrderByNumber as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        orderUpdateService.updateFullOrder(ORDER_NUMBER, { admin_comment: 'test' }, USER_ID),
      ).rejects.toMatchObject({ status: 404, message: 'Order not found' });
    });

    it('updates order by UUID successfully', async () => {
      (findOrderById as jest.Mock)
        .mockResolvedValueOnce(mockOrder) // first lookup
        .mockResolvedValueOnce(mockOrder); // post-update fetch

      (updateOrder as jest.Mock).mockResolvedValueOnce(mockOrder);
      getDb().transaction.mockImplementation(async (cb: Function) => {
        return cb({
          delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
          insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
        });
      });

      const result = await orderUpdateService.updateFullOrder(
        ORDER_ID,
        { admin_comment: 'Updated by admin' },
        USER_ID,
      );

      expect(result).toBeDefined();
      expect(updateOrder).toHaveBeenCalledWith(
        ORDER_ID,
        expect.objectContaining({ updated_by: USER_ID }),
        expect.anything(),
      );
    });

    it('updates order by order number successfully', async () => {
      (findOrderByNumber as jest.Mock).mockResolvedValueOnce(mockOrder);
      (findOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);
      (updateOrder as jest.Mock).mockResolvedValueOnce(mockOrder);
      getDb().transaction.mockImplementation(async (cb: Function) => {
        return cb({
          delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
          insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
        });
      });

      const result = await orderUpdateService.updateFullOrder(
        ORDER_NUMBER,
        { customer_note: 'Rush order' },
        USER_ID,
      );

      expect(result).toBeDefined();
      expect(findOrderByNumber).toHaveBeenCalledWith(ORDER_NUMBER);
    });
  });

  // ── updateTracking ────────────────────────────────────────────────────────

  describe('updateTracking', () => {
    it('throws 404 when order not found', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        orderUpdateService.updateTracking(ORDER_ID, { tracking_number: 'TRACK123' }, USER_ID),
      ).rejects.toMatchObject({ status: 404, message: 'Order not found' });
    });

    it('updates tracking info successfully', async () => {
      (findOrderById as jest.Mock)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce({ ...mockOrder, order_tracking: 'TRACK123' });
      (updateOrder as jest.Mock).mockResolvedValueOnce({
        ...mockOrder,
        order_tracking: 'TRACK123',
      });

      const result = await orderUpdateService.updateTracking(
        ORDER_ID,
        { tracking_number: 'TRACK123', carrier: 'BlueDart' },
        USER_ID,
      );

      expect(result.order_tracking).toBe('TRACK123');
      expect(updateOrder).toHaveBeenCalledWith(
        ORDER_ID,
        expect.objectContaining({ order_tracking: 'TRACK123' }),
      );
    });

    it('throws 500 when update returns null', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);
      (updateOrder as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        orderUpdateService.updateTracking(ORDER_ID, { tracking_number: 'T1' }, USER_ID),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  // ── updateFulfillmentStatus ───────────────────────────────────────────────

  describe('updateFulfillmentStatus', () => {
    it('throws 404 when order not found', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        orderUpdateService.updateFulfillmentStatus(
          ORDER_ID,
          { fulfillment_status: 'fulfilled' },
          USER_ID,
        ),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('updates fulfillment status successfully', async () => {
      const updatedOrder = { ...mockOrder, fulfillment_status: 'fulfilled' };
      (findOrderById as jest.Mock)
        .mockResolvedValueOnce(mockOrder) // initial check
        .mockResolvedValueOnce(updatedOrder); // post-update fetch
      (updateOrderStatus as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await orderUpdateService.updateFulfillmentStatus(
        ORDER_ID,
        { fulfillment_status: 'fulfilled' },
        USER_ID,
      );

      expect(result.fulfillment_status).toBe('fulfilled');
    });

    it('throws 404 when order disappears after update', async () => {
      (findOrderById as jest.Mock).mockResolvedValueOnce(mockOrder).mockResolvedValueOnce(null); // post-update fetch returns null
      (updateOrderStatus as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(
        orderUpdateService.updateFulfillmentStatus(
          ORDER_ID,
          { fulfillment_status: 'fulfilled' },
          USER_ID,
        ),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
