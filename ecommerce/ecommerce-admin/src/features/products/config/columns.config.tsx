import React from 'react';
// import type { NavigateFunction } from 'react-router-dom';
import type { ColumnConfig } from '@/components/data-table';
import { NON_SORTABLE_COLUMNS, PRODUCT_COLUMN_KEYS } from '../constants';
import { getProductStatusBadge } from '../constants/statuses';

/**
 * Tier interface for category lookup
 */
interface Tier {
  id: string;
  name: string;
}

/**
 * Column definition for GenericTable
 */
export interface ProductColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'image';
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Create column definition for a single column
 * Maps column configuration to table-ready definition with renderers
 */
export function createColumnDefinition(
  column: ColumnConfig<any>,
  tiers: Tier[]
): ProductColumnDefinition {
  const config: ProductColumnDefinition = {
    key: column.key as string,
    label: column.label,
    sortable: !NON_SORTABLE_COLUMNS.includes(column.key as any),
  };

  // Product title column
  if (column.key === PRODUCT_COLUMN_KEYS.TITLE) {
    config.className = '';
    config.render = (value: string) => (
      <div className="w-50">
        <p className="font-medium text-slate-700 truncate" title={value}>
          {value}
        </p>
      </div>
    );
  }

  // Status column
  else if (column.key === PRODUCT_COLUMN_KEYS.STATUS) {
    config.type = 'badge';
    config.className = 'w-auto whitespace-nowrap';
    config.render = (value: string) => {
      const statusStr = (value || '').toLowerCase();
      const badgeStyle = getProductStatusBadge(statusStr);
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeStyle} capitalize`}>
          {value || '—'}
        </span>
      );
    };
  }

  // Price columns
  else if ([PRODUCT_COLUMN_KEYS.SELLING_PRICE, PRODUCT_COLUMN_KEYS.COST_PRICE, PRODUCT_COLUMN_KEYS.COMPARE_PRICE].includes(column.key as any)) {
    config.type = 'currency';
    config.className = 'w-auto whitespace-nowrap';
  }

  // Stock column
  else if (column.key === PRODUCT_COLUMN_KEYS.STOCK) {
    config.className = 'w-auto whitespace-nowrap';
    config.render = (value: any) => (
      <span className="font-medium text-slate-700">
        {value ?? 0}
      </span>
    );
  }

  // Featured column
  else if (column.key === PRODUCT_COLUMN_KEYS.FEATURED) {
    config.type = 'badge';
    config.className = 'w-auto whitespace-nowrap';
  }

  // SKU, Barcode, HSN columns
  else if ([PRODUCT_COLUMN_KEYS.SKU, PRODUCT_COLUMN_KEYS.BARCODE, PRODUCT_COLUMN_KEYS.HSN].includes(column.key as any)) {
    config.className = 'min-w-[100px] max-w-[200px] truncate';
  }

  // Image column
  else if (column.key === PRODUCT_COLUMN_KEYS.IMAGE) {
    config.type = 'image';
    config.className = 'w-[60px]';
  }

  // Category column
  else if (column.key === PRODUCT_COLUMN_KEYS.CATEGORY) {
    config.className = 'min-w-[120px] max-w-[200px] truncate text-slate-600';
    config.render = (value: string) => {
      const category = tiers.find(t => t.id === value);
      return category ? category.name : '—';
    };
  }

  // Tags column
  else if (column.key === PRODUCT_COLUMN_KEYS.TAGS) {
    config.className = 'min-w-[150px]';
    config.render = (value: any) => {
      if (!Array.isArray(value) || value.length === 0) return '—';
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase border border-slate-200"
            >
              {tag}
            </span>
          ))}
          {value.length > 3 && (
            <span className="text-[10px] text-slate-400">
              +{value.length - 3}
            </span>
          )}
        </div>
      );
    };
  }

  // Date columns
  else if ([PRODUCT_COLUMN_KEYS.CREATED, PRODUCT_COLUMN_KEYS.UPDATED].includes(column.key as any)) {
    config.type = 'date';
    config.className = 'w-auto whitespace-nowrap';
  }

  return config;
}

export interface VisibleColumnConfig extends Omit<ColumnConfig<any>, 'key'> {
  key: string;
  visible: boolean;
}

/**
 * Get all product column configurations
 * Transforms visible columns into table-ready definitions
 * 
 * @param visibleColumns - Array of column configs with visibility flags
 * @param tiers - Array of tier/category data for lookups
 * @param navigate - React Router navigate function for row clicks (unused but kept for signature comp)
 * @returns Array of column definitions ready for GenericTable
 */
export function getProductColumnConfig(
  visibleColumns: VisibleColumnConfig[],
  tiers: Tier[]
): ProductColumnDefinition[] {
  return visibleColumns
    .filter(c => c.visible)
    .map(c => createColumnDefinition(c, tiers));
}

/**
 * Tier map for O(1) lookups
 * Use this instead of array.find() in render functions
 */
export function createTierMap(tiers: Tier[]): Map<string, Tier> {
  return new Map(tiers.map(t => [t.id, t]));
}
