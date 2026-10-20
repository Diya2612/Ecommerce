/**
 * Product Duplicate Service Unit Tests
 * Tests: duplicateProducts
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('@/features/product/services/product-cache.service', () => ({
  productCacheService: {
    cacheProduct: jest.fn(),
  },
}));

jest.mock('@/features/tags/services/tag-sync.service', () => ({
  syncTags: jest.fn(),
}));

jest.mock('@/features/tiers/services/tier-sync.service', () => ({
  incrementTierUsage: jest.fn(),
}));

jest.mock('@/utils', () => ({
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

import { duplicateProducts } from '@/features/product/services/product-duplicate.service';
import { db } from '@/database';
import { productCacheService } from '@/features/product/services/product-cache.service';
import { syncTags } from '@/features/tags/services/tag-sync.service';
import { incrementTierUsage } from '@/features/tiers/services/tier-sync.service';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 'admin-uuid-1';
const PRODUCT_ID = 'prod-uuid-original-1';

const mockOriginalProduct: any = {
  id: PRODUCT_ID,
  product_title: 'Widget Pro',
  slug: 'widget-pro',
  sku: 'WGT-001',
  status: 'active',
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
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
};

const mockCopiedProduct: any = {
  ...mockOriginalProduct,
  id: 'prod-uuid-copy-1',
  product_title: 'Widget Pro (Copy 1)',
  slug: 'widget-pro-copy-123456-999',
  sku: 'WGT-001-CPY-123456-999',
};

function buildMocks(originals: any[], insertRows: any[], selectRows: any[] = []) {
  // outer db.select (inArray to get original products)
  const outerWhere = jest.fn().mockResolvedValue(originals);
  const outerFrom = jest.fn().mockReturnValue({ where: outerWhere });
  (db.select as jest.Mock).mockReturnValue({ from: outerFrom });

  // tx.select call #1: inventory → resolves at .limit(1)
  const txLimit1 = jest.fn().mockResolvedValue([]);
  const txWhere1 = jest.fn().mockReturnValue({ limit: txLimit1 });
  const txFrom1 = jest.fn().mockReturnValue({ where: txWhere1 });

  // tx.select call #2: findNextCopyNumber → resolves at .where()
  const txWhere2 = jest.fn().mockResolvedValue(selectRows);
  const txFrom2 = jest.fn().mockReturnValue({ where: txWhere2 });

  // tx.select call #3: productFaqs → resolves at .where()
  const txWhere3 = jest.fn().mockResolvedValue([]); // no FAQs
  const txFrom3 = jest.fn().mockReturnValue({ where: txWhere3 });

  const txSelect = jest
    .fn()
    .mockReturnValueOnce({ from: txFrom1 }) // call 1 → inventory (uses .limit())
    .mockReturnValueOnce({ from: txFrom2 }) // call 2 → findNextCopyNumber
    .mockReturnValueOnce({ from: txFrom3 }); // call 3 → productFaqs

  // tx.insert chain – supports both .values().returning() and .values() (plain)
  const txReturning = jest.fn().mockResolvedValue(insertRows);
  const txValues = jest.fn().mockReturnValue({ returning: txReturning });
  const txInsert = jest.fn().mockReturnValue({ values: txValues });

  const tx = { select: txSelect, insert: txInsert };
  (db.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(tx));

  return { tx, txSelect, txInsert };
}

/** Build an independent per-call tx for multi-product scenarios */
function buildPerCallTx(copy: any) {
  // call #1 → inventory (uses .limit())
  const txLimit1 = jest.fn().mockResolvedValue([]);
  const txWhere1 = jest.fn().mockReturnValue({ limit: txLimit1 });
  const txFrom1 = jest.fn().mockReturnValue({ where: txWhere1 });
  // call #2 → findNextCopyNumber (resolves at .where())
  const txWhere2 = jest.fn().mockResolvedValue([]);
  const txFrom2 = jest.fn().mockReturnValue({ where: txWhere2 });
  // call #3 → productFaqs (resolves at .where())
  const txWhere3 = jest.fn().mockResolvedValue([]);
  const txFrom3 = jest.fn().mockReturnValue({ where: txWhere3 });

  const txSelect = jest
    .fn()
    .mockReturnValueOnce({ from: txFrom1 })
    .mockReturnValueOnce({ from: txFrom2 })
    .mockReturnValueOnce({ from: txFrom3 });

  const txReturning = jest.fn().mockResolvedValue([copy]);
  const txValues = jest.fn().mockReturnValue({ returning: txReturning });
  const txInsert = jest.fn().mockReturnValue({ values: txValues });
  return { select: txSelect, insert: txInsert };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductDuplicateService - duplicateProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (productCacheService.cacheProduct as jest.Mock).mockResolvedValue(undefined);
    (syncTags as jest.Mock).mockResolvedValue(undefined);
    (incrementTierUsage as jest.Mock).mockResolvedValue(undefined);
  });

  it('should successfully duplicate a product and return count of 1', async () => {
    buildMocks([mockOriginalProduct], [mockCopiedProduct]);

    const count = await duplicateProducts([PRODUCT_ID], USER_ID);

    expect(count).toBe(1);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 when no products are found for given IDs', async () => {
    const outerWhere = jest.fn().mockResolvedValue([]);
    const outerFrom = jest.fn().mockReturnValue({ where: outerWhere });
    (db.select as jest.Mock).mockReturnValue({ from: outerFrom });

    await expect(duplicateProducts(['non-existent-id'], USER_ID)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('should cache the duplicated product', async () => {
    buildMocks([mockOriginalProduct], [mockCopiedProduct]);

    await duplicateProducts([PRODUCT_ID], USER_ID);

    expect(productCacheService.cacheProduct).toHaveBeenCalledWith(mockCopiedProduct);
  });

  it('should call syncTags when the copied product has tags', async () => {
    buildMocks([mockOriginalProduct], [mockCopiedProduct]);

    await duplicateProducts([PRODUCT_ID], USER_ID);

    expect(syncTags).toHaveBeenCalledWith(mockCopiedProduct.tags, 'product');
  });

  it('should call incrementTierUsage with category tiers', async () => {
    buildMocks([mockOriginalProduct], [mockCopiedProduct]);

    await duplicateProducts([PRODUCT_ID], USER_ID);

    expect(incrementTierUsage).toHaveBeenCalledWith([
      mockCopiedProduct.category_tier_1,
      mockCopiedProduct.category_tier_2,
      mockCopiedProduct.category_tier_3,
      mockCopiedProduct.category_tier_4,
    ]);
  });

  it('should duplicate multiple products and return total count', async () => {
    const product2 = { ...mockOriginalProduct, id: 'prod-uuid-original-2', sku: 'WGT-002' };
    const copy2 = { ...mockCopiedProduct, id: 'prod-uuid-copy-2', sku: 'WGT-002-CPY-999' };

    // outer db.select → returns both originals
    const outerWhere = jest.fn().mockResolvedValue([mockOriginalProduct, product2]);
    const outerFrom = jest.fn().mockReturnValue({ where: outerWhere });
    (db.select as jest.Mock).mockReturnValue({ from: outerFrom });

    const copies = [mockCopiedProduct, copy2];
    let txCallIdx = 0;
    (db.transaction as jest.Mock).mockImplementation(async (cb: any) =>
      cb(buildPerCallTx(copies[txCallIdx++])),
    );

    const count = await duplicateProducts([PRODUCT_ID, 'prod-uuid-original-2'], USER_ID);
    expect(count).toBe(2);
  });

  it('should NOT call syncTags when duplicated product has no tags', async () => {
    const productNoTags = { ...mockOriginalProduct, tags: [] };
    const copyNoTags = { ...mockCopiedProduct, tags: [] };

    // outer db.select → returns product without tags
    const outerWhere = jest.fn().mockResolvedValue([productNoTags]);
    const outerFrom = jest.fn().mockReturnValue({ where: outerWhere });
    (db.select as jest.Mock).mockReturnValue({ from: outerFrom });

    (db.transaction as jest.Mock).mockImplementation(async (cb: any) =>
      cb(buildPerCallTx(copyNoTags)),
    );

    await duplicateProducts([PRODUCT_ID], USER_ID);
    expect(syncTags).not.toHaveBeenCalled();
  });
});
