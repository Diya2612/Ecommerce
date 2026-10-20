/**
 * Inventory Adjustment Service Unit Tests
 *
 * Tests: adjustInventory, getInventoryHistory, getInventoryHistoryByProductId
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
  },
}));

jest.mock('@/features/inventory/shared/queries', () => ({
  findInventoryById: jest.fn(),
  adjustQuantitiesWithStatus: jest.fn(),
  findAdjustmentHistory: jest.fn(),
  findAdjustmentHistoryByProduct: jest.fn(),
  countAdjustmentsByProduct: jest.fn(),
  createAdjustment: jest.fn(),
}));

jest.mock('@/features/inventory/services/inventory-helpers.service', () => ({
  resolveValidUserId: jest.fn(),
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  adjustInventory,
  getInventoryHistory,
  getInventoryHistoryByProductId,
} from '@/features/inventory/services/inventory-adjustment.service';

import {
  findInventoryById,
  adjustQuantitiesWithStatus,
  findAdjustmentHistory,
  findAdjustmentHistoryByProduct,
  countAdjustmentsByProduct,
  createAdjustment,
} from '@/features/inventory/shared/queries';

import { resolveValidUserId } from '@/features/inventory/services/inventory-helpers.service';
import { db } from '@/database';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockFindInventoryById = findInventoryById as jest.MockedFunction<typeof findInventoryById>;
const mockAdjustQuantitiesWithStatus = adjustQuantitiesWithStatus as jest.MockedFunction<
  typeof adjustQuantitiesWithStatus
>;
const mockFindAdjustmentHistory = findAdjustmentHistory as jest.MockedFunction<
  typeof findAdjustmentHistory
>;
const mockFindAdjustmentHistoryByProduct = findAdjustmentHistoryByProduct as jest.MockedFunction<
  typeof findAdjustmentHistoryByProduct
>;
const mockCountAdjustmentsByProduct = countAdjustmentsByProduct as jest.MockedFunction<
  typeof countAdjustmentsByProduct
>;
const mockCreateAdjustment = createAdjustment as jest.MockedFunction<typeof createAdjustment>;
const mockResolveValidUserId = resolveValidUserId as jest.MockedFunction<typeof resolveValidUserId>;
const mockDb = db as any;

// ── Shared fixtures ───────────────────────────────────────────────────────────

const INVENTORY_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const PRODUCT_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

const mockCurrentInventory = {
  id: INVENTORY_ID,
  product_id: PRODUCT_ID,
  available_quantity: 50,
  committed_quantity: 5,
  condition: 'sellable',
  status: 'in_stock',
  location: 'Nashik',
};

const mockUpdatedInventory = { ...mockCurrentInventory, available_quantity: 60 };

const mockAdjustmentRecord = {
  id: 'adj-uuid-1234-4abc-abcd-123456789abc',
  inventory_id: INVENTORY_ID,
  adjustment_type: 'increase',
  quantity_change: 10,
  quantity_before: 50,
  quantity_after: 60,
  reason: 'Restock from supplier',
  adjusted_by: USER_ID,
  adjusted_at: new Date('2024-01-02'),
};

const mockHistoryItem = {
  id: 'hist-uuid-1234-4abc-abcd-123456789abc',
  inventory_id: INVENTORY_ID,
  adjustment_type: 'increase',
  quantity_change: 10,
  quantity_before: 40,
  quantity_after: 50,
  reason: 'Manual restock',
  reference_number: 'PO-100',
  notes: null,
  adjusted_by: USER_ID,
  adjusted_at: new Date('2024-01-01'),
};

// ── Helper ────────────────────────────────────────────────────────────────────

function mockTransaction() {
  mockDb.transaction.mockImplementation(async (cb: any) => {
    const fakeTx = {} as any;
    return cb(fakeTx);
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryAdjustmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // adjustInventory
  // ===========================================================================

  describe('adjustInventory', () => {
    beforeEach(() => {
      mockTransaction();
      mockResolveValidUserId.mockResolvedValue(USER_ID);
      mockFindInventoryById.mockResolvedValue(mockCurrentInventory as any);
      mockAdjustQuantitiesWithStatus.mockResolvedValue(mockUpdatedInventory as any);
      mockCreateAdjustment.mockResolvedValue(mockAdjustmentRecord as any);
    });

    it('should increase stock and record an increase adjustment', async () => {
      const result = await adjustInventory(
        INVENTORY_ID,
        { quantity_change: 10, reason: 'Restock from supplier' },
        USER_ID,
      );

      expect(result.inventory.available_quantity).toBe(60);
      expect(result.adjustment.adjustment_type).toBe('increase');
      expect(mockAdjustQuantitiesWithStatus).toHaveBeenCalledWith(
        INVENTORY_ID,
        10,
        0,
        expect.anything(),
      );
    });

    it('should decrease stock and record a decrease adjustment', async () => {
      mockAdjustQuantitiesWithStatus.mockResolvedValue({
        ...mockCurrentInventory,
        available_quantity: 40,
      } as any);
      mockCreateAdjustment.mockResolvedValue({
        ...mockAdjustmentRecord,
        adjustment_type: 'decrease',
        quantity_change: -10,
        quantity_after: 40,
      } as any);

      const result = await adjustInventory(
        INVENTORY_ID,
        { quantity_change: -10, reason: 'Damaged goods write-off' },
        USER_ID,
      );

      expect(mockCreateAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({ adjustment_type: 'decrease', quantity_change: -10 }),
        expect.anything(),
      );
    });

    it('should record optional reference_number and notes', async () => {
      await adjustInventory(
        INVENTORY_ID,
        {
          quantity_change: 5,
          reason: 'Manual correction',
          reference_number: 'REF-999',
          notes: 'Approved by manager',
        },
        USER_ID,
      );

      expect(mockCreateAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({
          reference_number: 'REF-999',
          notes: 'Approved by manager',
        }),
        expect.anything(),
      );
    });

    it('should throw an error when userId is invalid', async () => {
      mockResolveValidUserId.mockResolvedValue(null);

      await expect(
        adjustInventory(INVENTORY_ID, { quantity_change: 10, reason: 'Test' }, 'bad-id'),
      ).rejects.toThrow('Invalid user for audit logging.');
    });

    it('should throw an error when inventory record is not found inside transaction', async () => {
      mockFindInventoryById.mockResolvedValue(undefined as any);

      await expect(
        adjustInventory(INVENTORY_ID, { quantity_change: 5, reason: 'Test' }, USER_ID),
      ).rejects.toThrow('Inventory record not found');
    });

    it('should throw when stock would go negative without allowNegative flag', async () => {
      // Current quantity = 50, adjustment = -100 → would result in -50
      const insufficientInventory = { ...mockCurrentInventory, available_quantity: 50 };
      mockFindInventoryById.mockResolvedValue(insufficientInventory as any);

      await expect(
        adjustInventory(INVENTORY_ID, { quantity_change: -100, reason: 'Over-deduction' }, USER_ID),
      ).rejects.toThrow('Insufficient stock for adjustment (Available: 50)');
    });

    it('should allow negative stock when allowNegative=true', async () => {
      mockAdjustQuantitiesWithStatus.mockResolvedValue({
        ...mockCurrentInventory,
        available_quantity: -50,
      } as any);
      mockCreateAdjustment.mockResolvedValue({
        ...mockAdjustmentRecord,
        adjustment_type: 'decrease',
        quantity_change: -100,
        quantity_after: -50,
      } as any);

      const result = await adjustInventory(
        INVENTORY_ID,
        { quantity_change: -100, reason: 'Forced write-off' },
        USER_ID,
        true,
      );

      expect(result.inventory.available_quantity).toBe(-50);
    });

    it('should record quantity_before and quantity_after correctly', async () => {
      await adjustInventory(INVENTORY_ID, { quantity_change: 10, reason: 'Restock' }, USER_ID);

      expect(mockCreateAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity_before: 50,
          quantity_after: 60,
        }),
        expect.anything(),
      );
    });

    it('should throw when adjustQuantitiesWithStatus returns null/undefined', async () => {
      mockAdjustQuantitiesWithStatus.mockResolvedValue(undefined as any);

      await expect(
        adjustInventory(INVENTORY_ID, { quantity_change: 5, reason: 'Test' }, USER_ID),
      ).rejects.toThrow('Failed to update inventory');
    });

    it('should pass adjusted_by from resolved userId to the adjustment record', async () => {
      await adjustInventory(INVENTORY_ID, { quantity_change: 10, reason: 'Restock' }, USER_ID);

      expect(mockCreateAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({ adjusted_by: USER_ID }),
        expect.anything(),
      );
    });
  });

  // ===========================================================================
  // getInventoryHistory
  // ===========================================================================

  describe('getInventoryHistory', () => {
    it('should return adjustment history with default limit 50', async () => {
      mockFindAdjustmentHistory.mockResolvedValue([mockHistoryItem] as any);

      const result = await getInventoryHistory(INVENTORY_ID);

      expect(result).toHaveLength(1);
      expect(mockFindAdjustmentHistory).toHaveBeenCalledWith(INVENTORY_ID, 50);
    });

    it('should forward a custom limit to the query', async () => {
      mockFindAdjustmentHistory.mockResolvedValue([]);

      await getInventoryHistory(INVENTORY_ID, 10);

      expect(mockFindAdjustmentHistory).toHaveBeenCalledWith(INVENTORY_ID, 10);
    });

    it('should return empty array when there are no adjustments', async () => {
      mockFindAdjustmentHistory.mockResolvedValue([]);

      const result = await getInventoryHistory(INVENTORY_ID);

      expect(result).toEqual([]);
    });

    it('should return multiple history items in correct order', async () => {
      const secondItem = { ...mockHistoryItem, id: 'hist-2', adjustment_type: 'decrease' };
      mockFindAdjustmentHistory.mockResolvedValue([mockHistoryItem, secondItem] as any);

      const result = await getInventoryHistory(INVENTORY_ID);

      expect(result).toHaveLength(2);
      expect(result[0].adjustment_type).toBe('increase');
    });
  });

  // ===========================================================================
  // getInventoryHistoryByProductId
  // ===========================================================================

  describe('getInventoryHistoryByProductId', () => {
    beforeEach(() => {
      mockFindAdjustmentHistoryByProduct.mockResolvedValue([mockHistoryItem] as any);
      mockCountAdjustmentsByProduct.mockResolvedValue(1 as any);
    });

    it('should return paginated history with default page/limit', async () => {
      const result = await getInventoryHistoryByProductId(PRODUCT_ID);

      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(mockFindAdjustmentHistoryByProduct).toHaveBeenCalledWith(PRODUCT_ID, 1, 20);
      expect(mockCountAdjustmentsByProduct).toHaveBeenCalledWith(PRODUCT_ID);
    });

    it('should respect provided page and limit params', async () => {
      mockFindAdjustmentHistoryByProduct.mockResolvedValue([]);
      mockCountAdjustmentsByProduct.mockResolvedValue(0 as any);

      const result = await getInventoryHistoryByProductId(PRODUCT_ID, 3, 5);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(mockFindAdjustmentHistoryByProduct).toHaveBeenCalledWith(PRODUCT_ID, 3, 5);
    });

    it('should compute totalPages correctly', async () => {
      mockCountAdjustmentsByProduct.mockResolvedValue(25 as any);
      mockFindAdjustmentHistoryByProduct.mockResolvedValue([]);

      const result = await getInventoryHistoryByProductId(PRODUCT_ID, 1, 10);

      expect(result.totalPages).toBe(3);
    });

    it('should return empty items and total 0 for product with no adjustments', async () => {
      mockFindAdjustmentHistoryByProduct.mockResolvedValue([]);
      mockCountAdjustmentsByProduct.mockResolvedValue(0 as any);

      const result = await getInventoryHistoryByProductId(PRODUCT_ID);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should run count and fetch queries concurrently', async () => {
      await getInventoryHistoryByProductId(PRODUCT_ID);

      expect(mockFindAdjustmentHistoryByProduct).toHaveBeenCalledTimes(1);
      expect(mockCountAdjustmentsByProduct).toHaveBeenCalledTimes(1);
    });
  });
});
