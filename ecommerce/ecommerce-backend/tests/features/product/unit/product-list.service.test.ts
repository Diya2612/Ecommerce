/**
 * Product List Service Unit Tests
 * Tests: getAllProducts, formatAdminProducts, formatStorefrontProducts, getFeaturedProducts
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock('@/utils', () => ({
  buildSearchConditions: jest.fn(() => ({})),
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('@/features/product/shared/queries', () => ({
  buildAverageRating: jest.fn(() => ({})),
  buildReviewCount: jest.fn(() => ({})),
  buildInventoryQuantityWithVariants: jest.fn(() => ({ mapWith: jest.fn(() => ({})) })),
  buildAvailableStockWithVariants: jest.fn(() => ({ mapWith: jest.fn(() => ({})) })),
  buildCategoryFilter: jest.fn(() => null),
  buildTechnologyFilter: jest.fn(() => null),
  getProductsRatingStats: jest.fn(),
  getProductsInventoryStats: jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  getAllProducts,
  formatAdminProducts,
  formatStorefrontProducts,
  getFeaturedProducts,
} from '@/features/product/services/product-list.service';
import { db } from '@/database';
import {
  buildAverageRating,
  buildReviewCount,
  buildInventoryQuantityWithVariants,
  buildAvailableStockWithVariants,
  getProductsRatingStats,
  getProductsInventoryStats,
} from '@/features/product/shared/queries';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeProductRow = (overrides: any = {}) => ({
  id: 'prod-uuid-1',
  product_title: 'Test Product',
  selling_price: '999.00',
  cost_price: '500.00',
  compare_at_price: null,
  primary_image_url: 'https://example.com/img.jpg',
  category_tier_1: 'cat-uuid-1',
  category_tier_2: null,
  tags: ['electronics'],
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-10'),
  status: 'active',
  featured: false,
  sku: 'TST-001',
  barcode: null,
  hsn_code: null,
  weight: null,
  length: null,
  breadth: null,
  height: null,
  slug: 'test-product',
  description: 'A test product',
  inventory_quantity: 20,
  rating: 4.5,
  review_count: 10,
  total_stock: 20,
  ...overrides,
});

/** Build a mock chainable DB select that resolves to the provided rows. */
function mockDbSelect(rows: any[]) {
  const groupBy = jest.fn().mockResolvedValue(rows);
  const where = jest.fn().mockReturnValue({ groupBy });
  const leftJoin = jest.fn().mockReturnValue({ where });
  const from = jest.fn().mockReturnValue({ leftJoin });
  (db.select as jest.Mock).mockReturnValue({ from });
  return { from, leftJoin, where, groupBy };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductListService - getAllProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply factory return values that clearAllMocks resets
    (buildAverageRating as jest.Mock).mockReturnValue({});
    (buildReviewCount as jest.Mock).mockReturnValue({});
    (buildInventoryQuantityWithVariants as jest.Mock).mockReturnValue({
      mapWith: jest.fn(() => ({})),
    });
    (buildAvailableStockWithVariants as jest.Mock).mockReturnValue({
      mapWith: jest.fn(() => ({})),
    });
  });

  it('should return paginated products', async () => {
    const rows = [makeProductRow()];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 10 });

    expect(result.products).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
  });

  it('should return empty list when no products exist', async () => {
    mockDbSelect([]);

    const result = await getAllProducts({ page: 1, limit: 10 });

    expect(result.products).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('should paginate correctly', async () => {
    const rows = Array.from({ length: 15 }, (_, i) => makeProductRow({ id: `prod-${i}` }));
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 2, limit: 5 });

    expect(result.products).toHaveLength(5);
    expect(result.total).toBe(15);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
  });

  it('should filter by stock status: in_stock', async () => {
    const rows = [
      makeProductRow({ id: 'in', inventory_quantity: 10 }),
      makeProductRow({ id: 'out', inventory_quantity: 0 }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 20, stockStatus: 'in_stock' });

    expect(result.products.every((p: any) => Number(p.inventory_quantity) > 0)).toBe(true);
  });

  it('should filter by stock status: out_of_stock', async () => {
    const rows = [
      makeProductRow({ id: 'in', inventory_quantity: 10 }),
      makeProductRow({ id: 'out', inventory_quantity: 0 }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 20, stockStatus: 'out_of_stock' });

    expect(result.products.every((p: any) => Number(p.inventory_quantity) === 0)).toBe(true);
  });

  it('should filter by stock status: low_stock (qty <= 5)', async () => {
    const rows = [
      makeProductRow({ id: 'low', inventory_quantity: 3 }),
      makeProductRow({ id: 'normal', inventory_quantity: 50 }),
      makeProductRow({ id: 'out', inventory_quantity: 0 }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 20, stockStatus: 'low_stock' });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('low');
  });

  it('should filter by minimum rating', async () => {
    const rows = [
      makeProductRow({ id: 'high', rating: 4.5 }),
      makeProductRow({ id: 'low', rating: 2.1 }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 20, ratings: '4' });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('high');
  });

  it('should sort by selling_price ascending', async () => {
    const rows = [
      makeProductRow({ id: 'expensive', selling_price: '2000.00' }),
      makeProductRow({ id: 'cheap', selling_price: '100.00' }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({
      page: 1,
      limit: 20,
      sortBy: 'selling_price',
      sortOrder: 'asc',
    });

    expect(result.products[0].id).toBe('cheap');
    expect(result.products[1].id).toBe('expensive');
  });

  it('should sort by created_at descending (default)', async () => {
    const rows = [
      makeProductRow({ id: 'older', created_at: new Date('2024-01-01') }),
      makeProductRow({ id: 'newer', created_at: new Date('2025-06-01') }),
    ];
    mockDbSelect(rows);

    const result = await getAllProducts({ page: 1, limit: 20 });

    expect(result.products[0].id).toBe('newer');
  });
});

// ── formatAdminProducts ───────────────────────────────────────────────────────

describe('ProductListService - formatAdminProducts', () => {
  it('should convert inventory_quantity to string', () => {
    const input = [{ id: 'p1', inventory_quantity: 42 }];
    const result = formatAdminProducts(input);
    expect(result[0].inventory_quantity).toBe('42');
  });

  it('should handle empty array', () => {
    expect(formatAdminProducts([])).toEqual([]);
  });
});

// ── formatStorefrontProducts ─────────────────────────────────────────────────

describe('ProductListService - formatStorefrontProducts', () => {
  it('should map product rows to storefront shape', () => {
    const input = [makeProductRow({ tags: ['tag1', 'tag2'] })];
    const result = formatStorefrontProducts(input);

    const p = result[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('slug');
    expect(p).toHaveProperty('name');
    expect(p).toHaveProperty('price');
    expect(p).toHaveProperty('inStock');
    expect(p).toHaveProperty('rating');
    expect(p).toHaveProperty('reviews');
    expect(p).toHaveProperty('technologies');
    expect(p.technologies).toEqual(['tag1', 'tag2']);
  });

  it('should mark product as inStock when inventory > 0', () => {
    const result = formatStorefrontProducts([makeProductRow({ inventory_quantity: 5 })]);
    expect(result[0].inStock).toBe(true);
  });

  it('should mark product as out of stock when inventory is 0', () => {
    const result = formatStorefrontProducts([makeProductRow({ inventory_quantity: 0 })]);
    expect(result[0].inStock).toBe(false);
  });

  it('should calculate originalPrice from compare_at_price', () => {
    const result = formatStorefrontProducts([makeProductRow({ compare_at_price: '1999.00' })]);
    expect(result[0].originalPrice).toBe(1999);
  });

  it('should return null originalPrice when compare_at_price is null', () => {
    const result = formatStorefrontProducts([makeProductRow({ compare_at_price: null })]);
    expect(result[0].originalPrice).toBeNull();
  });

  it('should mark product as new if created within last 30 days', () => {
    const result = formatStorefrontProducts([makeProductRow({ created_at: new Date() })]);
    expect(result[0].isNew).toBe(true);
  });

  it('should mark product as NOT new if created more than 30 days ago', () => {
    const old = new Date();
    old.setDate(old.getDate() - 60);
    const result = formatStorefrontProducts([makeProductRow({ created_at: old })]);
    expect(result[0].isNew).toBe(false);
  });

  it('should handle empty array', () => {
    expect(formatStorefrontProducts([])).toEqual([]);
  });
});

// ── getFeaturedProducts ───────────────────────────────────────────────────────

describe('ProductListService - getFeaturedProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (buildAverageRating as jest.Mock).mockReturnValue({});
    (buildReviewCount as jest.Mock).mockReturnValue({});
    (buildInventoryQuantityWithVariants as jest.Mock).mockReturnValue({
      mapWith: jest.fn(() => ({})),
    });
    (buildAvailableStockWithVariants as jest.Mock).mockReturnValue({
      mapWith: jest.fn(() => ({})),
    });
  });

  it('should return empty array when no featured products', async () => {
    const orderBy = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const result = await getFeaturedProducts();
    expect(result).toEqual([]);
  });

  it('should return featured products with stats', async () => {
    const featuredRow = {
      ...makeProductRow(),
      id: 'feat-1',
      featured: true,
      short_description: 'desc',
    };

    const orderBy = jest.fn().mockResolvedValue([featuredRow]);
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });
    (db.select as jest.Mock).mockReturnValue({ from });

    const ratingMap = new Map([['feat-1', { avg_rating: 4.5, review_count: 8 }]]);
    const inventoryMap = new Map([['feat-1', { available_quantity: 15 }]]);

    (getProductsRatingStats as jest.Mock).mockResolvedValue(ratingMap);
    (getProductsInventoryStats as jest.Mock).mockResolvedValue(inventoryMap);

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('feat-1');
    expect(result[0].rating).toBe(4.5);
    expect(result[0].reviews).toBe(8);
    expect(result[0].inStock).toBe(true);
    expect(result[0].total_stock).toBe(15);
  });
});
