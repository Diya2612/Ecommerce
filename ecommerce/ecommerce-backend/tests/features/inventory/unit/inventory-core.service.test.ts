/**
 * Inventory Core Service Unit Tests
 *
 * Tests: getInventoryList, getInventoryById, updateInventory,
 *        createInventoryForProduct, requireInventoryExists
 *
 * Note: TypeScript errors on mocked DB methods are expected at design-time.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks (must precede all imports) ─────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
  },
}));

jest.mock('@/features/inventory/shared/queries', () => ({
  findInventoryList: jest.fn(),
  countInventory: jest.fn(),
  findInventoryByIdWithDetails: jest.fn(),
  findInventoryById: jest.fn(),
  findInventoryByProduct: jest.fn(),
  findInventoryByVariant: jest.fn(),
  createInventory: jest.fn(),
  updateInventoryById: jest.fn(),
  createAdjustment: jest.fn(),
}));

jest.mock('@/features/inventory/services/inventory-helpers.service', () => ({
  resolveValidUserId: jest.fn(),
  getStatusFromQuantity: jest.fn(),
  isValidUUID: jest.fn(),
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
      this.name = 'HttpException';
    }
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  getInventoryList,
  getInventoryById,
  updateInventory,
  requireInventoryExists,
  createInventoryForProduct,
} from '@/features/inventory/services/inventory-core.service';

import {
  findInventoryList,
  countInventory,
  findInventoryByIdWithDetails,
  findInventoryByProduct,
  findInventoryByVariant,
  createInventory,
  updateInventoryById,
  createAdjustment,
} from '@/features/inventory/shared/queries';

import {
  resolveValidUserId,
  getStatusFromQuantity,
} from '@/features/inventory/services/inventory-helpers.service';

import { db } from '@/database';
import { HttpException } from '@/utils';

// ── Typed mock helpers ────────────────────────────────────────────────────────

const mockFindInventoryList = findInventoryList as jest.MockedFunction<typeof findInventoryList>;
const mockCountInventory = countInventory as jest.MockedFunction<typeof countInventory>;
const mockFindInventoryByIdWithDetails = findInventoryByIdWithDetails as jest.MockedFunction<
  typeof findInventoryByIdWithDetails
>;
const mockFindInventoryByProduct = findInventoryByProduct as jest.MockedFunction<
  typeof findInventoryByProduct
>;
const mockFindInventoryByVariant = findInventoryByVariant as jest.MockedFunction<
  typeof findInventoryByVariant
>;
const mockCreateInventory = createInventory as jest.MockedFunction<typeof createInventory>;
const mockUpdateInventoryById = updateInventoryById as jest.MockedFunction<
  typeof updateInventoryById
>;
const mockCreateAdjustment = createAdjustment as jest.MockedFunction<typeof createAdjustment>;
const mockResolveValidUserId = resolveValidUserId as jest.MockedFunction<typeof resolveValidUserId>;
const mockGetStatusFromQuantity = getStatusFromQuantity as jest.MockedFunction<
  typeof getStatusFromQuantity
>;
const mockDb = db as any;

// ── Shared fixtures ───────────────────────────────────────────────────────────

const INVENTORY_ID = 'b2c3d4e5-f6a7-4901-bcde-f12345678901';
const PRODUCT_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';
const USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

const mockRawInventory = {
  id: INVENTORY_ID,
  product_id: PRODUCT_ID,
  variant_id: null,
  location: 'Nashik',
  available_quantity: 50,
  committed_quantity: 5,
  condition: 'sellable' as const,
  status: 'in_stock' as const,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  created_by: USER_ID,
  updated_by: USER_ID,
  product_title: 'Steel Pipe 6 inch',
  product_sku: 'SP-6IN-001',
  variant_sku: null,
  variant_option_name: null,
  variant_option_value: null,
};

const mockInventoryWithProduct = {
  id: INVENTORY_ID,
  product_id: PRODUCT_ID,
  product_name: 'Steel Pipe 6 inch',
  sku: 'SP-6IN-001',
  available_quantity: 50,
  committed_quantity: 5,
  condition: 'sellable' as const,
  status: 'in_stock' as const,
  location: 'Nashik',
  updated_by: USER_ID,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryCoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // getInventoryList
  // ===========================================================================

  describe('getInventoryList', () => {
    it('should return paginated inventory list with defaults', async () => {
      mockFindInventoryList.mockResolvedValue([mockInventoryWithProduct] as any);
      mockCountInventory.mockResolvedValue([{ count: 1 }] as any);

      const result = await getInventoryList({});

      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockFindInventoryList).toHaveBeenCalledWith({});
      expect(mockCountInventory).toHaveBeenCalledWith({});
    });

    it('should respect provided page and limit', async () => {
      mockFindInventoryList.mockResolvedValue([]);
      mockCountInventory.mockResolvedValue([{ count: 0 }] as any);

      const result = await getInventoryList({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
    });

    it('should run findInventoryList and countInventory concurrently', async () => {
      mockFindInventoryList.mockResolvedValue([mockInventoryWithProduct] as any);
      mockCountInventory.mockResolvedValue([{ count: 100 }] as any);

      const result = await getInventoryList({ page: 1, limit: 5 });

      expect(result.total).toBeDefined();
      expect(mockFindInventoryList).toHaveBeenCalledTimes(1);
      expect(mockCountInventory).toHaveBeenCalledTimes(1);
    });

    it('should return total from countInventory', async () => {
      mockFindInventoryList.mockResolvedValue([]);
      mockCountInventory.mockResolvedValue(42 as any);

      const result = await getInventoryList({});

      expect(result.total).toBe(42);
    });

    it('should forward all filter params to both queries', async () => {
      const params = {
        search: 'pipe',
        condition: 'sellable' as const,
        status: 'in_stock' as const,
        location: 'Nashik',
      };
      mockFindInventoryList.mockResolvedValue([]);
      mockCountInventory.mockResolvedValue(0 as any);

      await getInventoryList(params);

      expect(mockFindInventoryList).toHaveBeenCalledWith(params);
      expect(mockCountInventory).toHaveBeenCalledWith(params);
    });

    it('should default page to 1 when not provided', async () => {
      mockFindInventoryList.mockResolvedValue([]);
      mockCountInventory.mockResolvedValue(0 as any);

      const result = await getInventoryList({ limit: 5 });

      expect(result.page).toBe(1);
    });
  });

  // ===========================================================================
  // getInventoryById
  // ===========================================================================

  describe('getInventoryById', () => {
    it('should return inventory with product name for a base product', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(mockRawInventory as any);

      const result = await getInventoryById(INVENTORY_ID);

      expect(result).toBeDefined();
      expect(result!.id).toBe(INVENTORY_ID);
      expect(result!.product_name).toBe('Steel Pipe 6 inch');
      expect(result!.sku).toBe('SP-6IN-001');
    });

    it('should construct variant name when variant_id is present', async () => {
      const variantRaw = {
        ...mockRawInventory,
        variant_id: 'variant-uuid-4abc-abcd-123456789abc',
        variant_sku: 'SP-6IN-VAR-001',
        variant_option_name: 'Size',
        variant_option_value: '6 inch',
      };
      mockFindInventoryByIdWithDetails.mockResolvedValue(variantRaw as any);

      const result = await getInventoryById(INVENTORY_ID);

      expect(result!.product_name).toBe('Steel Pipe 6 inch - Size: 6 inch');
      expect(result!.sku).toBe('SP-6IN-VAR-001');
    });

    it('should return undefined when inventory not found', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(undefined as any);

      const result = await getInventoryById(INVENTORY_ID);

      expect(result).toBeUndefined();
    });

    it('should include all required fields in response', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(mockRawInventory as any);

      const result = await getInventoryById(INVENTORY_ID);

      expect(result).toMatchObject({
        id: INVENTORY_ID,
        available_quantity: 50,
        committed_quantity: 5,
        condition: 'sellable',
        status: 'in_stock',
        location: 'Nashik',
      });
    });
  });

  // ===========================================================================
  // updateInventory
  // ===========================================================================

  describe('updateInventory', () => {
    it('should update inventory with resolved valid user ID', async () => {
      mockResolveValidUserId.mockResolvedValue(USER_ID);
      mockUpdateInventoryById.mockResolvedValue(mockInventoryWithProduct as any);

      const result = await updateInventory(INVENTORY_ID, { location: 'Mumbai' }, USER_ID);

      expect(mockUpdateInventoryById).toHaveBeenCalledWith(
        INVENTORY_ID,
        expect.objectContaining({ location: 'Mumbai', updated_by: USER_ID }),
      );
      expect(result).toEqual(mockInventoryWithProduct);
    });

    it('should update condition successfully', async () => {
      mockResolveValidUserId.mockResolvedValue(USER_ID);
      mockUpdateInventoryById.mockResolvedValue({
        ...mockInventoryWithProduct,
        condition: 'damaged',
      } as any);

      const result = await updateInventory(INVENTORY_ID, { condition: 'damaged' }, USER_ID);

      expect(mockUpdateInventoryById).toHaveBeenCalledWith(
        INVENTORY_ID,
        expect.objectContaining({ condition: 'damaged' }),
      );
    });

    it('should set updated_by to undefined when userId is invalid', async () => {
      mockResolveValidUserId.mockResolvedValue(null);
      mockUpdateInventoryById.mockResolvedValue(mockInventoryWithProduct as any);

      await updateInventory(INVENTORY_ID, { location: 'Pune' }, 'invalid-id');

      expect(mockUpdateInventoryById).toHaveBeenCalledWith(
        INVENTORY_ID,
        expect.objectContaining({ updated_by: undefined }),
      );
    });

    it('should call resolveValidUserId with the provided userId', async () => {
      mockResolveValidUserId.mockResolvedValue(USER_ID);
      mockUpdateInventoryById.mockResolvedValue(mockInventoryWithProduct as any);

      await updateInventory(INVENTORY_ID, { location: 'Delhi' }, USER_ID);

      expect(mockResolveValidUserId).toHaveBeenCalledWith(USER_ID);
    });
  });

  // ===========================================================================
  // requireInventoryExists
  // ===========================================================================

  describe('requireInventoryExists', () => {
    it('should return inventory when it exists', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(mockRawInventory as any);

      const result = await requireInventoryExists(INVENTORY_ID);

      expect(result).toBeDefined();
      expect(result.id).toBe(INVENTORY_ID);
    });

    it('should throw 404 HttpException when inventory not found', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(undefined as any);

      await expect(requireInventoryExists(INVENTORY_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Inventory item not found',
      });
    });

    it('should call getInventoryById internally with the provided id', async () => {
      mockFindInventoryByIdWithDetails.mockResolvedValue(mockRawInventory as any);

      await requireInventoryExists(INVENTORY_ID);

      expect(mockFindInventoryByIdWithDetails).toHaveBeenCalledWith(INVENTORY_ID);
    });
  });

  // ===========================================================================
  // createInventoryForProduct
  // ===========================================================================

  describe('createInventoryForProduct', () => {
    const mockCreatedRecord = {
      id: 'new-inv-uuid-4abc-abcd-ef1234567890',
      product_id: PRODUCT_ID,
      variant_id: null,
      location: 'Nashik',
      available_quantity: 0,
      status: 'out_of_stock',
      condition: 'sellable',
      committed_quantity: 0,
    };

    beforeEach(() => {
      // Mock transaction to execute callback immediately with a fake tx
      mockDb.transaction.mockImplementation(async (cb: any) => {
        const fakeTx = {} as any;
        return cb(fakeTx);
      });
      mockGetStatusFromQuantity.mockReturnValue('out_of_stock');
      mockResolveValidUserId.mockResolvedValue(USER_ID);
      mockFindInventoryByProduct.mockResolvedValue([]);
      mockCreateInventory.mockResolvedValue(mockCreatedRecord as any);
      mockCreateAdjustment.mockResolvedValue({} as any);
    });

    it('should create a new inventory record for a base product', async () => {
      const result = await createInventoryForProduct(PRODUCT_ID, 0, USER_ID);

      expect(mockCreateInventory).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: PRODUCT_ID,
          available_quantity: 0,
          condition: 'sellable',
          location: 'Nashik',
        }),
        expect.anything(),
      );
      expect(result).toEqual(mockCreatedRecord);
    });

    it('should create an adjustment record after inventory creation', async () => {
      await createInventoryForProduct(PRODUCT_ID, 100, USER_ID);

      expect(mockCreateAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory_id: mockCreatedRecord.id,
          adjustment_type: 'correction',
          quantity_change: 100,
          quantity_before: 0,
          reason: 'Initial inventory creation',
        }),
        expect.anything(),
      );
    });

    it('should return existing record if inventory already exists (no duplicate)', async () => {
      mockFindInventoryByProduct.mockResolvedValue([mockCreatedRecord] as any);

      const result = await createInventoryForProduct(PRODUCT_ID, 50, USER_ID);

      expect(mockCreateInventory).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreatedRecord);
    });

    it('should use variant query when variantId is provided', async () => {
      const variantId = 'var-uuid-1234-4abc-abcd-123456789abc';
      mockFindInventoryByVariant.mockResolvedValue([]);
      mockCreateInventory.mockResolvedValue({
        ...mockCreatedRecord,
        variant_id: variantId,
        product_id: null,
      } as any);

      await createInventoryForProduct(PRODUCT_ID, 0, USER_ID, 'Nashik', variantId);

      expect(mockFindInventoryByVariant).toHaveBeenCalledWith(variantId, expect.anything());
      expect(mockCreateInventory).toHaveBeenCalledWith(
        expect.objectContaining({ variant_id: variantId }),
        expect.anything(),
      );
    });

    it('should use custom location when provided', async () => {
      await createInventoryForProduct(PRODUCT_ID, 0, USER_ID, 'Mumbai');

      expect(mockCreateInventory).toHaveBeenCalledWith(
        expect.objectContaining({ location: 'Mumbai' }),
        expect.anything(),
      );
    });

    it('should not create adjustment if resolved userId is null', async () => {
      mockResolveValidUserId.mockResolvedValue(null);

      await createInventoryForProduct(PRODUCT_ID, 0, undefined);

      expect(mockCreateAdjustment).not.toHaveBeenCalled();
    });
  });
});
