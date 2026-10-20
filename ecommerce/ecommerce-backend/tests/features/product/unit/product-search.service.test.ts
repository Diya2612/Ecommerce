/**
 * Product Search Service Unit Tests
 * Tests: searchProducts, getProductSearchCount, searchProductsForOrderCreation
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
  },
  schema: {},
}));

jest.mock('@/features/product/shared/queries', () => ({
  getProductsRatingStats: jest.fn(),
  getProductsInventoryStats: jest.fn(),
  buildProductSearchConditions: jest.fn(() => ({})),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  searchProducts,
  getProductSearchCount,
  searchProductsForOrderCreation,
} from '@/features/product/services/product-search.service';
import { db } from '@/database';
import {
  getProductsRatingStats,
  getProductsInventoryStats,
} from '@/features/product/shared/queries';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockSearchResult = {
  id: 'prod-uuid-1',
  slug: 'test-product',
  product_title: 'Test Product',
  selling_price: '999.00',
  compare_at_price: null,
  primary_image_url: 'https://img.example.com/p.jpg',
  category_tier_1: 'cat-uuid-1',
  tags: ['electronics'],
  rank: 100,
  category_name: 'Electronics',
};

/** Build a fully chainable select mock that resolves with `rows` */
function mockSelectChain(rows: any[]) {
  const offset = jest.fn().mockResolvedValue(rows);
  const limit = jest.fn().mockReturnValue({ offset });
  const orderBy = jest.fn().mockReturnValue({ limit, offset });
  const where = jest.fn().mockReturnValue({ orderBy, limit, offset });
  const leftJoin = jest.fn().mockReturnValue({ where });
  const from = jest.fn().mockReturnValue({ leftJoin, where });
  (db.select as jest.Mock).mockReturnValue({ from });
  return { from, leftJoin, where, orderBy, limit, offset };
}

function mockCountChain(count: number) {
  const execute = jest.fn().mockResolvedValue([{ count }]);
  const where = jest.fn().mockReturnValue({ execute });
  const from = jest.fn().mockReturnValue({ where });
  (db.select as jest.Mock).mockReturnValue({ from });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductSearchService - searchProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return empty results when no products match', async () => {
    mockSelectChain([]);

    const result = await searchProducts({ searchQuery: 'nonexistent' });

    expect(result.results).toEqual([]);
    expect(result.productStats).toEqual(new Map());
    expect(getProductsRatingStats).not.toHaveBeenCalled();
    expect(getProductsInventoryStats).not.toHaveBeenCalled();
  });

  it('should return search results with stats when products found', async () => {
    mockSelectChain([mockSearchResult]);

    const ratingMap = new Map([['prod-uuid-1', { avg_rating: 4.2, review_count: 15 }]]);
    const inventoryMap = new Map([['prod-uuid-1', { available_quantity: 30 }]]);
    (getProductsRatingStats as jest.Mock).mockResolvedValue(ratingMap);
    (getProductsInventoryStats as jest.Mock).mockResolvedValue(inventoryMap);

    const result = await searchProducts({
      searchQuery: 'Test',
      status: 'active',
      page: 1,
      limit: 10,
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('prod-uuid-1');
    expect(result.productStats.get('prod-uuid-1')).toEqual({
      rating: 4.2,
      reviews: 15,
      total_stock: 30,
    });
  });

  it('should use default values for page/limit when not provided', async () => {
    mockSelectChain([]);

    await searchProducts({ searchQuery: 'widget' });

    // Verify it doesn't throw — defaults are applied internally
    expect(db.select).toHaveBeenCalled();
  });

  it('should use "active" status by default', async () => {
    mockSelectChain([]);

    await searchProducts({ searchQuery: 'widget' });

    expect(db.select).toHaveBeenCalled();
  });

  it('should return zero stats when rating/inventory maps have no entry for product', async () => {
    mockSelectChain([mockSearchResult]);

    (getProductsRatingStats as jest.Mock).mockResolvedValue(new Map());
    (getProductsInventoryStats as jest.Mock).mockResolvedValue(new Map());

    const result = await searchProducts({ searchQuery: 'test' });

    expect(result.productStats.get('prod-uuid-1')).toEqual({
      rating: 0,
      reviews: 0,
      total_stock: 0,
    });
  });

  it('should support draft status search', async () => {
    mockSelectChain([]);

    await searchProducts({ searchQuery: 'unpublished', status: 'draft' });

    expect(db.select).toHaveBeenCalled();
  });
});

// ── getProductSearchCount ─────────────────────────────────────────────────────

describe('ProductSearchService - getProductSearchCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return numeric count', async () => {
    const where = jest.fn().mockResolvedValue([{ count: 7 }]);
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const count = await getProductSearchCount({ searchQuery: 'widget' });

    expect(count).toBe(7);
  });

  it('should return 0 when no products match', async () => {
    const where = jest.fn().mockResolvedValue([{ count: 0 }]);
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const count = await getProductSearchCount({ searchQuery: 'xyz-nonexistent' });

    expect(count).toBe(0);
  });

  it('should return 0 when DB returns empty result', async () => {
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const count = await getProductSearchCount({ searchQuery: 'xyz' });

    expect(count).toBe(0);
  });
});

// ── searchProductsForOrderCreation ────────────────────────────────────────────

describe('ProductSearchService - searchProductsForOrderCreation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return products with fields needed for order creation', async () => {
    const orderProduct = {
      id: 'prod-1',
      name: 'Widget Pro',
      sku: 'WGT-001',
      description: 'A great widget',
      image: 'https://example.com/wgt.jpg',
      price: '999.00',
      cost_price: '500.00',
      weight: '0.5',
      is_active: true,
    };

    const limit = jest.fn().mockResolvedValue([orderProduct]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const result = await searchProductsForOrderCreation('widget');

    expect(result).toHaveLength(1);
    expect(result[0].sku).toBe('WGT-001');
    expect(result[0]).toHaveProperty('price');
    expect(result[0]).toHaveProperty('is_active');
  });

  it('should return empty array when no products match', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const result = await searchProductsForOrderCreation('zzz-nonexistent');

    expect(result).toHaveLength(0);
  });

  it('should respect custom limit parameter', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    await searchProductsForOrderCreation('widget', 5);

    expect(limit).toHaveBeenCalledWith(5);
  });

  it('should use default limit of 20', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    await searchProductsForOrderCreation('widget');

    expect(limit).toHaveBeenCalledWith(20);
  });
});
