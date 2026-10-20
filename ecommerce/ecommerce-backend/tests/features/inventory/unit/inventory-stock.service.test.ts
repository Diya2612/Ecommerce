/**
 * Inventory Stock Service Unit Tests
 *
 * Tests: getAvailableStock, backfillInventoryForProducts
 *
 * Note: TypeScript design-time errors on jest globals are expected.
 * Tests execute correctly at runtime via @swc/jest transpilation.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
  },
}));

jest.mock('@/features/inventory/shared/queries', () => ({
  getAvailableStockByProduct: jest.fn(),
  findProductsWithoutInventory: jest.fn(),
  bulkCreateInventory: jest.fn(),
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
  getAvailableStock,
  backfillInventoryForProducts,
} from '@/features/inventory/services/inventory-stock.service';

import {
  getAvailableStockByProduct,
  findProductsWithoutInventory,
  bulkCreateInventory,
} from '@/features/inventory/shared/queries';

import { db } from '@/database';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockGetAvailableStockByProduct = getAvailableStockByProduct as jest.MockedFunction<
  typeof getAvailableStockByProduct
>;
const mockFindProductsWithoutInventory = findProductsWithoutInventory as jest.MockedFunction<
  typeof findProductsWithoutInventory
>;
const mockBulkCreateInventory = bulkCreateInventory as jest.MockedFunction<
  typeof bulkCreateInventory
>;
const mockDb = db as any;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PRODUCT_ID = 'c3d4e5f6-a7b8-4012-abcd-123456789012';

const mockStockData = {
  productId: PRODUCT_ID,
  totalStock: 55,
  committedStock: 5,
  availableStock: 50,
  inStock: true,
};

const mockProducts = [
  { id: 'prod-1-uuid-4abc-abcd-123456789001', product_title: 'Product A', sku: 'SKU-A' },
  { id: 'prod-2-uuid-4abc-abcd-123456789002', product_title: 'Product B', sku: 'SKU-B' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockTransaction() {
  mockDb.transaction.mockImplementation(async (cb: any) => {
    const fakeTx = {} as any;
    return cb(fakeTx);
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryStockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // getAvailableStock
  // ===========================================================================

  describe('getAvailableStock', () => {
    it('should return stock data when found', async () => {
      mockGetAvailableStockByProduct.mockResolvedValue(mockStockData as any);

      const result = await getAvailableStock(PRODUCT_ID);

      expect(result).toEqual(mockStockData);
      expect(mockGetAvailableStockByProduct).toHaveBeenCalledWith(PRODUCT_ID);
    });

    it('should return zero-stock fallback when product has no inventory record', async () => {
      mockGetAvailableStockByProduct.mockResolvedValue(null as any);

      const result = await getAvailableStock(PRODUCT_ID);

      expect(result).toEqual({
        productId: PRODUCT_ID,
        totalStock: 0,
        committedStock: 0,
        availableStock: 0,
        inStock: false,
      });
    });

    it('should pass the correct productId to the query', async () => {
      mockGetAvailableStockByProduct.mockResolvedValue(mockStockData as any);

      await getAvailableStock(PRODUCT_ID);

      expect(mockGetAvailableStockByProduct).toHaveBeenCalledWith(PRODUCT_ID);
      expect(mockGetAvailableStockByProduct).toHaveBeenCalledTimes(1);
    });

    it('should return inStock: true when availableStock > 0', async () => {
      mockGetAvailableStockByProduct.mockResolvedValue({ ...mockStockData, inStock: true } as any);

      const result = await getAvailableStock(PRODUCT_ID);

      expect(result.inStock).toBe(true);
    });

    it('should return inStock: false when availableStock = 0 (fallback path)', async () => {
      mockGetAvailableStockByProduct.mockResolvedValue(null as any);

      const result = await getAvailableStock(PRODUCT_ID);

      expect(result.inStock).toBe(false);
    });
  });

  // ===========================================================================
  // backfillInventoryForProducts
  // ===========================================================================

  describe('backfillInventoryForProducts', () => {
    beforeEach(() => {
      mockTransaction();
    });

    it('should create inventory records for products that are missing one', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue(mockProducts as any);
      mockBulkCreateInventory.mockResolvedValue([]);

      const result = await backfillInventoryForProducts({ dryRun: false });

      expect(result.created).toBe(2);
      expect(result.message).toBe('Created inventory for 2 products');
      expect(result.products).toHaveLength(2);
      expect(mockBulkCreateInventory).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            product_id: mockProducts[0].id,
            condition: 'sellable',
            status: 'out_of_stock',
            available_quantity: 0,
            location: 'Nashik',
          }),
        ]),
        expect.anything(),
      );
    });

    it('should NOT call bulkCreateInventory when dryRun=true', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue(mockProducts as any);

      const result = await backfillInventoryForProducts({ dryRun: true });

      expect(mockBulkCreateInventory).not.toHaveBeenCalled();
      expect(result.created).toBe(0);
      expect(result.message).toMatch(/dry run/i);
    });

    it('should include product details in dry run result', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue(mockProducts as any);

      const result = await backfillInventoryForProducts({ dryRun: true });

      expect(result.products).toEqual([
        { id: mockProducts[0].id, name: 'Product A', sku: 'SKU-A' },
        { id: mockProducts[1].id, name: 'Product B', sku: 'SKU-B' },
      ]);
    });

    it('should return zero created when all products already have inventory', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue([]);

      const result = await backfillInventoryForProducts({ dryRun: false });

      expect(result.created).toBe(0);
      expect(result.message).toBe('All products already have inventory records');
      expect(result.products).toHaveLength(0);
      expect(mockBulkCreateInventory).not.toHaveBeenCalled();
    });

    it('should use default dryRun=false when options are empty', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue(mockProducts as any);
      mockBulkCreateInventory.mockResolvedValue([]);

      const result = await backfillInventoryForProducts({});

      expect(result.created).toBe(2);
      expect(mockBulkCreateInventory).toHaveBeenCalledTimes(1);
    });

    it('should include correct default inventory values in bulk create payload', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue([mockProducts[0]] as any);
      mockBulkCreateInventory.mockResolvedValue([]);

      await backfillInventoryForProducts({ dryRun: false });

      expect(mockBulkCreateInventory).toHaveBeenCalledWith(
        [
          {
            product_id: mockProducts[0].id,
            location: 'Nashik',
            available_quantity: 0,
            committed_quantity: 0,
            condition: 'sellable',
            status: 'out_of_stock',
          },
        ],
        expect.anything(),
      );
    });

    it('should handle a single product correctly', async () => {
      mockFindProductsWithoutInventory.mockResolvedValue([mockProducts[0]] as any);
      mockBulkCreateInventory.mockResolvedValue([]);

      const result = await backfillInventoryForProducts({ dryRun: false });

      expect(result.created).toBe(1);
      expect(result.products).toHaveLength(1);
    });
  });
});
