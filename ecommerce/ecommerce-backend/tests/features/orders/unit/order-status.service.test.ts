/**
 * OrderStatusService Unit Tests
 *
 * Tests: getValidTransitions, isValidTransition, updateOrderStatus,
 *        canBeCancelled, canBeRefunded, markAsCancelled, updatePaymentStatus,
 *        updateFulfillmentStatus
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
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

// Schema mock so the service can import it
jest.mock('@/features/orders/shared/orders.schema', () => ({
  orders: {
    id: 'id',
    order_status: 'order_status',
    payment_status: 'payment_status',
    fulfillment_status: 'fulfillment_status',
    updated_at: 'updated_at',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => ({ col, val })),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { orderStatusService } from '@/features/orders/services/order-status.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';

function getDb() {
  return jest.requireMock('@/database').db;
}

function wireDbChain(selectResult: any[]) {
  const db = getDb();
  const mockLimit = jest.fn().mockResolvedValue(selectResult);
  const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
  db.select.mockReturnValue({ from: mockFrom });

  const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
  const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
  db.update.mockReturnValue({ set: mockSet });

  return { mockSelect: db.select, mockFrom, mockWhere, mockLimit, mockSet, mockUpdateWhere };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderStatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getValidTransitions ───────────────────────────────────────────────────

  describe('getValidTransitions', () => {
    it('returns [confirmed, cancelled] for pending status', () => {
      const transitions = orderStatusService.getValidTransitions('pending');
      expect(transitions).toEqual(['confirmed', 'cancelled']);
    });

    it('returns [processing, cancelled] for confirmed status', () => {
      const transitions = orderStatusService.getValidTransitions('confirmed');
      expect(transitions).toEqual(['processing', 'cancelled']);
    });

    it('returns [shipped, cancelled] for processing status', () => {
      const transitions = orderStatusService.getValidTransitions('processing');
      expect(transitions).toEqual(['shipped', 'cancelled']);
    });

    it('returns empty array for cancelled status (terminal)', () => {
      const transitions = orderStatusService.getValidTransitions('cancelled');
      expect(transitions).toEqual([]);
    });

    it('returns empty array for refunded status (terminal)', () => {
      const transitions = orderStatusService.getValidTransitions('refunded');
      expect(transitions).toEqual([]);
    });

    it('returns [returned, refunded] for delivered status', () => {
      const transitions = orderStatusService.getValidTransitions('delivered');
      expect(transitions).toContain('returned');
      expect(transitions).toContain('refunded');
    });
  });

  // ── isValidTransition ─────────────────────────────────────────────────────

  describe('isValidTransition', () => {
    it('returns true for valid transition pending→confirmed', () => {
      expect(orderStatusService.isValidTransition('pending', 'confirmed')).toBe(true);
    });

    it('returns false for invalid transition pending→shipped', () => {
      expect(orderStatusService.isValidTransition('pending', 'shipped')).toBe(false);
    });

    it('returns false for any transition from cancelled', () => {
      expect(orderStatusService.isValidTransition('cancelled', 'pending')).toBe(false);
    });

    it('returns true for shipped→delivered', () => {
      expect(orderStatusService.isValidTransition('shipped', 'delivered')).toBe(true);
    });
  });

  // ── updateOrderStatus ─────────────────────────────────────────────────────

  describe('updateOrderStatus', () => {
    it('returns success=false and message when order not found', async () => {
      wireDbChain([]);

      const result = await orderStatusService.updateOrderStatus(ORDER_ID, 'confirmed');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
    });

    it('returns success=false when transition is invalid', async () => {
      wireDbChain([{ id: ORDER_ID, order_status: 'shipped' }]);

      const result = await orderStatusService.updateOrderStatus(ORDER_ID, 'pending');

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Cannot transition/i);
    });

    it('returns success=true for valid transition', async () => {
      const db = getDb();
      // Select returns order
      const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      db.update.mockReturnValue({ set: mockSet });

      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: ORDER_ID, order_status: 'pending' }]),
          }),
        }),
      });

      const result = await orderStatusService.updateOrderStatus(ORDER_ID, 'confirmed');

      expect(result.success).toBe(true);
      expect(result.previousStatus).toBe('pending');
      expect(result.newStatus).toBe('confirmed');
    });
  });

  // ── canBeCancelled ────────────────────────────────────────────────────────

  describe('canBeCancelled', () => {
    it('returns false when order not found', async () => {
      wireDbChain([]);
      const result = await orderStatusService.canBeCancelled(ORDER_ID);
      expect(result).toBe(false);
    });

    it('returns false for shipped orders', async () => {
      wireDbChain([{ id: ORDER_ID, order_status: 'shipped' }]);
      const result = await orderStatusService.canBeCancelled(ORDER_ID);
      expect(result).toBe(false);
    });

    it('returns false for delivered orders', async () => {
      wireDbChain([{ id: ORDER_ID, order_status: 'delivered' }]);
      const result = await orderStatusService.canBeCancelled(ORDER_ID);
      expect(result).toBe(false);
    });

    it('returns true for pending orders', async () => {
      wireDbChain([{ id: ORDER_ID, order_status: 'pending' }]);
      const result = await orderStatusService.canBeCancelled(ORDER_ID);
      expect(result).toBe(true);
    });

    it('returns true for confirmed orders', async () => {
      wireDbChain([{ id: ORDER_ID, order_status: 'confirmed' }]);
      const result = await orderStatusService.canBeCancelled(ORDER_ID);
      expect(result).toBe(true);
    });
  });

  // ── canBeRefunded ─────────────────────────────────────────────────────────

  describe('canBeRefunded', () => {
    it('returns false when order not found', async () => {
      wireDbChain([]);
      const result = await orderStatusService.canBeRefunded(ORDER_ID);
      expect(result).toBe(false);
    });

    it('returns true for delivered + paid order', async () => {
      wireDbChain([
        {
          id: ORDER_ID,
          order_status: 'delivered',
          payment_status: 'paid',
        },
      ]);
      const result = await orderStatusService.canBeRefunded(ORDER_ID);
      expect(result).toBe(true);
    });

    it('returns false for pending + pending order', async () => {
      wireDbChain([
        {
          id: ORDER_ID,
          order_status: 'pending',
          payment_status: 'pending',
        },
      ]);
      const result = await orderStatusService.canBeRefunded(ORDER_ID);
      expect(result).toBe(false);
    });
  });

  // ── markAsCancelled ───────────────────────────────────────────────────────

  describe('markAsCancelled', () => {
    it('calls db.update with cancelled status', async () => {
      const { mockSet } = wireDbChain([]);

      await orderStatusService.markAsCancelled(ORDER_ID, 'Customer request', 'admin-id');

      expect(getDb().update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          order_status: 'cancelled',
          cancellation_reason: 'Customer request',
          cancelled_by: 'admin-id',
        }),
      );
    });
  });

  // ── updatePaymentStatus ───────────────────────────────────────────────────

  describe('updatePaymentStatus', () => {
    it('calls db.update with the new payment status', async () => {
      const { mockSet } = wireDbChain([]);

      await orderStatusService.updatePaymentStatus(ORDER_ID, 'paid');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_status: 'paid',
        }),
      );
    });
  });

  // ── updateFulfillmentStatus ───────────────────────────────────────────────

  describe('updateFulfillmentStatus', () => {
    it('calls db.update with the new fulfillment status', async () => {
      const { mockSet } = wireDbChain([]);

      await orderStatusService.updateFulfillmentStatus(ORDER_ID, 'fulfilled');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          fulfillment_status: 'fulfilled',
        }),
      );
    });
  });
});
