/**
 * Product Export Service Unit Tests
 * Tests: queryProductsForExport, formatProductExportData, transformArraysForExcel
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
  },
  schema: {},
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  formatProductExportData,
  transformArraysForExcel,
} from '@/features/product/services/product-export.service';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductExportService - formatProductExportData', () => {
  const sampleProduct = {
    id: 'prod-uuid-1',
    product_title: 'Widget Pro',
    sku: 'WGT-001',
    status: 'active',
    featured: true,
    selling_price: '999.00',
    created_at: new Date('2025-01-15T10:00:00Z'),
    tags: ['sale', 'electronics'],
    additional_images: { url: 'https://example.com/img2.jpg' },
  };

  it('should return only selected columns', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['id', 'sku', 'status'],
    });

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('sku');
    expect(result[0]).toHaveProperty('status');
    expect(result[0]).not.toHaveProperty('product_title');
  });

  it('should format Date objects as ISO strings', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['created_at'],
    });
    expect(result[0].created_at).toBe('2025-01-15T10:00:00.000Z');
  });

  it('should format boolean "featured: true" as "Yes"', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['featured'],
    });
    expect(result[0].featured).toBe('Yes');
  });

  it('should format boolean "featured: false" as "No"', () => {
    const result = formatProductExportData([{ ...sampleProduct, featured: false }], {
      selectedColumns: ['featured'],
    });
    expect(result[0].featured).toBe('No');
  });

  it('should keep array values as-is', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['tags'],
    });
    expect(Array.isArray(result[0].tags)).toBe(true);
    expect(result[0].tags).toEqual(['sale', 'electronics']);
  });

  it('should JSON.stringify non-array object values', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['additional_images'],
    });
    expect(typeof result[0].additional_images).toBe('string');
  });

  it('should skip columns not present in the product', () => {
    const result = formatProductExportData([sampleProduct], {
      selectedColumns: ['non_existent_column'],
    });
    expect(Object.keys(result[0])).not.toContain('non_existent_column');
  });

  it('should handle empty data array', () => {
    const result = formatProductExportData([], { selectedColumns: ['id', 'sku'] });
    expect(result).toEqual([]);
  });

  it('should handle empty selectedColumns', () => {
    const result = formatProductExportData([sampleProduct], { selectedColumns: [] });
    expect(result[0]).toEqual({});
  });

  it('should handle multiple products', () => {
    const data = [
      { ...sampleProduct, id: 'p1' },
      { ...sampleProduct, id: 'p2' },
    ];
    const result = formatProductExportData(data, { selectedColumns: ['id', 'sku'] });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('p1');
    expect(result[1].id).toBe('p2');
  });
});

// ── transformArraysForExcel ────────────────────────────────────────────────────

describe('ProductExportService - transformArraysForExcel', () => {
  it('should join array values into comma-separated strings', () => {
    const input = [{ tags: ['sale', 'electronics', 'featured'] }];
    const result = transformArraysForExcel(input);
    expect(result[0].tags).toBe('sale, electronics, featured');
  });

  it('should leave non-array values unchanged', () => {
    const input = [{ id: 'prod-1', price: 999, status: 'active' }];
    const result = transformArraysForExcel(input);
    expect(result[0]).toEqual({ id: 'prod-1', price: 999, status: 'active' });
  });

  it('should handle empty arrays as empty strings', () => {
    const input = [{ tags: [] }];
    const result = transformArraysForExcel(input);
    expect(result[0].tags).toBe('');
  });

  it('should handle multiple rows', () => {
    const input = [{ tags: ['a', 'b'] }, { tags: ['c', 'd', 'e'] }];
    const result = transformArraysForExcel(input);
    expect(result[0].tags).toBe('a, b');
    expect(result[1].tags).toBe('c, d, e');
  });

  it('should handle empty input array', () => {
    expect(transformArraysForExcel([])).toEqual([]);
  });

  it('should not mutate the original data', () => {
    const input = [{ tags: ['a', 'b'] }];
    const original = JSON.stringify(input);
    transformArraysForExcel(input);
    expect(JSON.stringify(input)).toBe(original);
  });
});
