/**
 * Product Service Unit Tests
 * Tests: createProduct, updateProduct, deleteProduct
 */

// ── Mocks (must be before imports) ───────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('@/features/product/shared/queries', () => ({
  findProductById: jest.fn(),
  findProductBySku: jest.fn(),
  findProductBySlug: jest.fn(),
  isSkuTaken: jest.fn(),
}));

jest.mock('@/features/product/services/product-cache.service', () => ({
  productCacheService: {
    cacheProduct: jest.fn(),
    invalidateProduct: jest.fn(),
  },
}));

jest.mock('@/features/tags/services/tag-sync.service', () => ({
  syncTags: jest.fn(),
  updateTagUsage: jest.fn(),
  decrementTagUsage: jest.fn(),
}));

jest.mock('@/features/tiers/services/tier-sync.service', () => ({
  incrementTierUsage: jest.fn(),
  decrementTierUsage: jest.fn(),
  updateTierUsage: jest.fn(),
}));

jest.mock('@/features/inventory/services', () => ({
  createInventoryForProduct: jest.fn(),
}));

jest.mock('@/features/product/services/product-variant-update.service', () => ({
  updateProductVariants: jest.fn(),
}));

jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn() },
}));

jest.mock('@/features/audit/shared/interface', () => ({
  AuditAction: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
  AuditResourceType: { PRODUCT: 'PRODUCT' },
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
  decimalSchema: { default: jest.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/features/product/services/product.service';
import { db } from '@/database';
import {
  findProductById,
  findProductBySku,
  findProductBySlug,
  isSkuTaken,
} from '@/features/product/shared/queries';
import { productCacheService } from '@/features/product/services/product-cache.service';
import {
  syncTags,
  updateTagUsage,
  decrementTagUsage,
} from '@/features/tags/services/tag-sync.service';
import {
  incrementTierUsage,
  decrementTierUsage,
  updateTierUsage,
} from '@/features/tiers/services/tier-sync.service';
import { createInventoryForProduct } from '@/features/inventory/services';
import { updateProductVariants } from '@/features/product/services/product-variant-update.service';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const ADMIN_USER_ID = 'admin-user-uuid-1';
const PRODUCT_ID = 'product-uuid-1';

const mockProduct: any = {
  id: PRODUCT_ID,
  product_title: 'Test Product',
  slug: 'test-product',
  sku: 'TEST-SKU-001',
  status: 'draft',
  selling_price: '999.00',
  cost_price: '500.00',
  compare_at_price: null,
  featured: false,
  has_variants: false,
  tags: ['electronics'],
  category_tier_1: 'tier-uuid-1',
  category_tier_2: null,
  category_tier_3: null,
  category_tier_4: null,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const validCreatePayload: any = {
  product_title: 'New Product',
  slug: 'new-product',
  sku: 'NEW-SKU-001',
  selling_price: '1500.00',
  cost_price: '800.00',
  status: 'draft',
  featured: false,
  has_variants: false,
  variants: [],
  faqs: [],
  tags: ['electronics'],
  inventory_quantity: 50,
  category_tier_1: 'tier-uuid-1',
  category_tier_2: null,
  category_tier_3: null,
  category_tier_4: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a chainable DB mock that resolves .returning() with the given rows. */
function mockDbInsert(rows: any[]) {
  const returning = jest.fn().mockResolvedValue(rows);
  const values = jest.fn().mockReturnValue({ returning });
  (db.insert as jest.Mock).mockReturnValue({ values });
  return { values, returning };
}

function mockDbUpdate(rows: any[]) {
  const returning = jest.fn().mockResolvedValue(rows);
  const where = jest.fn().mockReturnValue({ returning });
  const set = jest.fn().mockReturnValue({ where });
  (db.update as jest.Mock).mockReturnValue({ set });
  return { set, where, returning };
}

function mockDbSelect(rows: any[]) {
  const execute = jest.fn().mockResolvedValue(rows);
  const limit = jest.fn().mockReturnValue({ execute });
  const where = jest.fn().mockReturnValue({ limit, execute });
  const from = jest.fn().mockReturnValue({ where, execute });
  (db.select as jest.Mock).mockReturnValue({ from });
  return { from, where, limit, execute };
}

function mockDbDelete() {
  const where = jest.fn().mockResolvedValue(undefined);
  (db.delete as jest.Mock).mockReturnValue({ where });
  return { where };
}

// ── Test Suites ───────────────────────────────────────────────────────────────

describe('ProductService - createProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (isSkuTaken as jest.Mock).mockResolvedValue(false);
    (findProductBySlug as jest.Mock).mockResolvedValue(null);
    (productCacheService.cacheProduct as jest.Mock).mockResolvedValue(undefined);
    (syncTags as jest.Mock).mockResolvedValue(undefined);
    (incrementTierUsage as jest.Mock).mockResolvedValue(undefined);
    (createInventoryForProduct as jest.Mock).mockResolvedValue(undefined);
  });

  it('should create a product successfully', async () => {
    mockDbInsert([mockProduct]);

    const result = await createProduct(validCreatePayload, ADMIN_USER_ID);

    expect(result).toEqual(mockProduct);
    expect(db.insert).toHaveBeenCalled();
    expect(productCacheService.cacheProduct).toHaveBeenCalledWith(mockProduct);
    expect(createInventoryForProduct).toHaveBeenCalledWith(PRODUCT_ID, 50, ADMIN_USER_ID);
    expect(incrementTierUsage).toHaveBeenCalled();
  });

  it('should call syncTags when tags are provided', async () => {
    mockDbInsert([mockProduct]);

    await createProduct(validCreatePayload, ADMIN_USER_ID);

    expect(syncTags).toHaveBeenCalledWith(['electronics'], 'product');
  });

  it('should NOT call syncTags when tags are empty', async () => {
    const product = { ...mockProduct, tags: [] };
    mockDbInsert([product]);

    await createProduct({ ...validCreatePayload, tags: [] }, ADMIN_USER_ID);

    expect(syncTags).not.toHaveBeenCalled();
  });

  it('should throw 409 when SKU already exists', async () => {
    (isSkuTaken as jest.Mock).mockResolvedValue(true);

    await expect(createProduct(validCreatePayload, ADMIN_USER_ID)).rejects.toMatchObject({
      status: 409,
    });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('should throw 409 when slug already exists', async () => {
    (isSkuTaken as jest.Mock).mockResolvedValue(false);
    (findProductBySlug as jest.Mock).mockResolvedValue(mockProduct);

    await expect(createProduct(validCreatePayload, ADMIN_USER_ID)).rejects.toMatchObject({
      status: 409,
    });
  });

  it('should throw 500 if DB insert returns empty array', async () => {
    mockDbInsert([]);

    await expect(createProduct(validCreatePayload, ADMIN_USER_ID)).rejects.toMatchObject({
      status: 500,
    });
  });

  it('should create product with variants', async () => {
    const productWithVariants = { ...mockProduct, has_variants: true };
    const variant = { id: 'var-uuid-1', sku: 'VAR-SKU-001', product_id: PRODUCT_ID };

    // First call inserts the product, second inserts the variants
    const insertReturning1 = jest.fn().mockResolvedValue([productWithVariants]);
    const insertReturning2 = jest.fn().mockResolvedValue([variant]);
    let callCount = 0;
    (db.insert as jest.Mock).mockImplementation(() => ({
      values: () => ({
        returning: callCount++ === 0 ? insertReturning1 : insertReturning2,
      }),
    }));

    const payloadWithVariants = {
      ...validCreatePayload,
      has_variants: true,
      variants: [{ sku: 'VAR-SKU-001', selling_price: '999.00', inventory_quantity: 10 }],
    };

    const result = await createProduct(payloadWithVariants, ADMIN_USER_ID);
    expect(result).toEqual(productWithVariants);
  });

  it('should rollback (delete product) if a post-insert step fails', async () => {
    mockDbInsert([mockProduct]);
    (productCacheService.cacheProduct as jest.Mock).mockRejectedValue(new Error('Cache fail'));
    mockDbDelete();

    await expect(createProduct(validCreatePayload, ADMIN_USER_ID)).rejects.toThrow('Cache fail');
    expect(db.delete).toHaveBeenCalled();
  });
});

// ── updateProduct ─────────────────────────────────────────────────────────────

describe('ProductService - updateProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (findProductById as jest.Mock).mockResolvedValue(mockProduct);
    (findProductBySku as jest.Mock).mockResolvedValue(null);
    (findProductBySlug as jest.Mock).mockResolvedValue(null);
    (updateProductVariants as jest.Mock).mockResolvedValue(undefined);
    (updateTagUsage as jest.Mock).mockResolvedValue(undefined);
    (updateTierUsage as jest.Mock).mockResolvedValue(undefined);
  });

  it('should update a product successfully', async () => {
    const updated = { ...mockProduct, product_title: 'Updated Title' };
    mockDbUpdate([updated]);
    // Mock DB select (for inventory check) to return empty
    mockDbSelect([]);

    const result = await updateProduct(
      PRODUCT_ID,
      { product_title: 'Updated Title' },
      ADMIN_USER_ID,
    );
    expect(result).toEqual(updated);
    expect(updateProductVariants).toHaveBeenCalled();
  });

  it('should throw 404 when product does not exist', async () => {
    (findProductById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      updateProduct('non-existent-id', { product_title: 'X' }, ADMIN_USER_ID),
    ).rejects.toMatchObject({
      status: 404,
    });
    expect(db.update).not.toHaveBeenCalled();
  });

  it('should throw 409 if new SKU is already taken by another product', async () => {
    (findProductBySku as jest.Mock).mockResolvedValue({ ...mockProduct, id: 'other-product-id' });

    await expect(
      updateProduct(PRODUCT_ID, { sku: 'TAKEN-SKU' }, ADMIN_USER_ID),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('should throw 409 if new slug is already taken by another product', async () => {
    (findProductBySlug as jest.Mock).mockResolvedValue({ ...mockProduct, id: 'other-product-id' });

    await expect(
      updateProduct(PRODUCT_ID, { slug: 'taken-slug' }, ADMIN_USER_ID),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('should call updateTagUsage when tags are provided', async () => {
    const updated = { ...mockProduct, tags: ['new-tag'] };
    mockDbUpdate([updated]);
    mockDbSelect([]);

    await updateProduct(PRODUCT_ID, { tags: ['new-tag'] }, ADMIN_USER_ID);

    expect(updateTagUsage).toHaveBeenCalledWith(['electronics'], ['new-tag'], 'product');
  });

  it('should NOT call updateTagUsage when tags are not in payload', async () => {
    mockDbUpdate([mockProduct]);
    mockDbSelect([]);

    await updateProduct(PRODUCT_ID, { product_title: 'New Title' }, ADMIN_USER_ID);

    expect(updateTagUsage).not.toHaveBeenCalled();
  });

  it('should throw 500 if db update returns empty array', async () => {
    mockDbUpdate([]);
    mockDbSelect([]);

    await expect(
      updateProduct(PRODUCT_ID, { product_title: 'X' }, ADMIN_USER_ID),
    ).rejects.toMatchObject({
      status: 500,
    });
  });
});

// ── deleteProduct ─────────────────────────────────────────────────────────────

describe('ProductService - deleteProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (decrementTierUsage as jest.Mock).mockResolvedValue(undefined);
    (decrementTagUsage as jest.Mock).mockResolvedValue(undefined);
  });

  it('should soft-delete a product and return sku/slug', async () => {
    mockDbUpdate([mockProduct]);

    const result = await deleteProduct(PRODUCT_ID, ADMIN_USER_ID);

    expect(result).toEqual({ sku: mockProduct.sku, slug: mockProduct.slug });
    expect(db.update).toHaveBeenCalled();
    expect(decrementTierUsage).toHaveBeenCalled();
  });

  it('should call decrementTagUsage when product has tags', async () => {
    mockDbUpdate([{ ...mockProduct, tags: ['electronics', 'sale'] }]);

    await deleteProduct(PRODUCT_ID, ADMIN_USER_ID);

    expect(decrementTagUsage).toHaveBeenCalledWith(['electronics', 'sale']);
  });

  it('should NOT call decrementTagUsage when product has no tags', async () => {
    mockDbUpdate([{ ...mockProduct, tags: [] }]);

    await deleteProduct(PRODUCT_ID, ADMIN_USER_ID);

    expect(decrementTagUsage).not.toHaveBeenCalled();
  });

  it('should throw 404 if product not found during delete', async () => {
    mockDbUpdate([]);

    await expect(deleteProduct('non-existent-id', ADMIN_USER_ID)).rejects.toMatchObject({
      status: 404,
    });
  });
});
