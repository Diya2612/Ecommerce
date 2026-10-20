/**
 * Product Import Service Unit Tests
 * Tests: generateProductSlug, resolveCategoryByName, importSingleProduct
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/features/product/shared/queries', () => ({
  findProductBySku: jest.fn(),
}));

jest.mock('@/features/tags/services/tag-sync.service', () => ({
  updateTagUsage: jest.fn(),
}));

jest.mock('@/features/inventory/services', () => ({
  createInventoryForProduct: jest.fn(),
}));

jest.mock('@/utils/logging/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('@/utils/import-export', () => ({
  ImportMode: { CREATE: 'create', UPDATE: 'update', UPSERT: 'upsert' },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  generateProductSlug,
  resolveCategoryByName,
  importSingleProduct,
} from '@/features/product/services/product-import.service';
import { db } from '@/database';
import { findProductBySku } from '@/features/product/shared/queries';
import { updateTagUsage } from '@/features/tags/services/tag-sync.service';
import { createInventoryForProduct } from '@/features/inventory/services';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 'admin-uuid-1';

const mockExistingProduct: any = {
  id: 'prod-uuid-existing',
  sku: 'EXIST-001',
  slug: 'existing-product',
  product_title: 'Existing Product',
  status: 'active',
  selling_price: '500.00',
  cost_price: '250.00',
  tags: ['old-tag'],
  is_deleted: false,
};

const validRawData: any = {
  sku: 'NEW-SKU-001',
  product_title: 'New Product',
  selling_price: 999,
  cost_price: 500,
  compare_at_price: null,
  tags: ['new-tag'],
  inventory_quantity: 20,
};

/** Build a chainable db.select().from().where().limit() mock */
function mockSelectChain(rows: any[]) {
  const execute = jest.fn().mockResolvedValue(rows);
  const limit = jest.fn().mockReturnValue({ execute, ...rows });
  const where = jest.fn().mockReturnValue({ limit, execute });
  const from = jest.fn().mockReturnValue({ where });
  (db.select as jest.Mock).mockReturnValue({ from });
}

/** Build a chainable db.insert mock */
function mockInsertChain() {
  const execute = jest.fn().mockResolvedValue(undefined);
  const values = jest.fn().mockReturnValue({ execute });
  (db.insert as jest.Mock).mockReturnValue({ values });
}

/** Build a chainable db.update mock */
function mockUpdateChain() {
  const execute = jest.fn().mockResolvedValue(undefined);
  const where = jest.fn().mockReturnValue({ execute });
  const set = jest.fn().mockReturnValue({ where });
  (db.update as jest.Mock).mockReturnValue({ set });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductImportService - generateProductSlug', () => {
  it('should create a URL-friendly slug from a title', () => {
    const slug = generateProductSlug('Hello World Product!');
    expect(slug).toMatch(/^hello-world-product-[a-z0-9]+$/);
  });

  it('should replace multiple spaces with single dash', () => {
    const slug = generateProductSlug('A    B     C');
    expect(slug).toMatch(/^a-b-c-[a-z0-9]+$/);
  });

  it('should strip special characters', () => {
    const slug = generateProductSlug('Product #1 (Special Edition)');
    expect(slug).toMatch(/^product-1-special-edition-[a-z0-9]+$/);
  });

  it('should always append a random suffix', () => {
    const slug1 = generateProductSlug('Same Title');
    const slug2 = generateProductSlug('Same Title');
    // They should share the base but differ in suffix
    expect(slug1.startsWith('same-title-')).toBe(true);
    expect(slug2.startsWith('same-title-')).toBe(true);
  });
});

// ── resolveCategoryByName ─────────────────────────────────────────────────────

describe('ProductImportService - resolveCategoryByName', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return category id when found', async () => {
    const limit = jest.fn().mockResolvedValue([{ id: 'tier-uuid-1' }]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const result = await resolveCategoryByName('Electronics');
    expect(result).toBe('tier-uuid-1');
  });

  it('should return null when category not found', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const result = await resolveCategoryByName('NonExistent');
    expect(result).toBeNull();
  });
});

// ── importSingleProduct ───────────────────────────────────────────────────────

describe('ProductImportService - importSingleProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createInventoryForProduct as jest.Mock).mockResolvedValue(undefined);
    (updateTagUsage as jest.Mock).mockResolvedValue(undefined);
  });

  describe('create mode', () => {
    it('should create new product when SKU does not exist', async () => {
      // db.select → products: no existing record
      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      mockInsertChain();
      (findProductBySku as jest.Mock).mockResolvedValue({ id: 'new-prod-id' });

      const result = await importSingleProduct(validRawData, 'create', USER_ID);

      expect(result.success).toBe(true);
      expect(result.recordId).toBe('new-prod-id');
      expect(db.insert).toHaveBeenCalled();
    });

    it('should skip with error when SKU already exists in create mode', async () => {
      const limit = jest.fn().mockResolvedValue([mockExistingProduct]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      const result = await importSingleProduct(
        { ...validRawData, sku: 'EXIST-001' },
        'create',
        USER_ID,
      );

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.error).toContain('SKU conflict');
    });

    it('should call updateTagUsage when new product has tags', async () => {
      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      mockInsertChain();
      (findProductBySku as jest.Mock).mockResolvedValue({ id: 'new-prod-id' });

      await importSingleProduct({ ...validRawData, tags: ['tech', 'sale'] }, 'create', USER_ID);

      expect(updateTagUsage).toHaveBeenCalledWith([], ['tech', 'sale'], 'product');
    });

    it('should call createInventoryForProduct when inventory_quantity is set', async () => {
      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      mockInsertChain();
      (findProductBySku as jest.Mock).mockResolvedValue({ id: 'new-prod-id' });
      // Second select call for inventory check → empty
      (db.select as jest.Mock).mockReturnValueOnce({ from }).mockReturnValueOnce({ from });

      await importSingleProduct({ ...validRawData, inventory_quantity: 30 }, 'create', USER_ID);

      expect(createInventoryForProduct).toHaveBeenCalled();
    });
  });

  describe('update mode', () => {
    it('should update existing product when SKU exists', async () => {
      const limit = jest.fn().mockResolvedValue([mockExistingProduct]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      mockUpdateChain();

      const result = await importSingleProduct(
        { ...validRawData, sku: 'EXIST-001' },
        'update',
        USER_ID,
      );

      expect(result.success).toBe(true);
      expect(result.recordId).toBe(mockExistingProduct.id);
      expect(db.update).toHaveBeenCalled();
    });

    it('should fail when SKU not found in update mode', async () => {
      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (db.select as jest.Mock).mockReturnValue({ from });

      const result = await importSingleProduct(
        { ...validRawData, sku: 'NONEXISTENT' },
        'update',
        USER_ID,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('SKU not found');
    });
  });

  describe('error handling', () => {
    it('should return success:false on unexpected errors', async () => {
      (db.select as jest.Mock).mockImplementation(() => {
        throw new Error('DB connection failed');
      });

      const result = await importSingleProduct(validRawData, 'create', USER_ID);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB connection failed');
    });

    it('should return error message from Error instance', async () => {
      (db.select as jest.Mock).mockImplementation(() => {
        throw new Error('Unique violation');
      });

      const result = await importSingleProduct(validRawData, 'create', USER_ID);

      expect(result.error).toBe('Unique violation');
    });
  });
});
