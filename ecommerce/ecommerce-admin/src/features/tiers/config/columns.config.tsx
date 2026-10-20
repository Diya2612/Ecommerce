import React from 'react';
import type { ColumnConfig } from '@/components/data-table';
import type { Tier } from '../types';
import { TIER_COLUMN_KEYS, TIER_NON_SORTABLE_COLUMNS } from '../constants';

/**
 * Tier Column Definition interface
 */
export interface TierColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge';
  className?: string;
  render?: (value: any, row: Tier) => React.ReactNode;
}

/**
 * Create column definition for a single tier column
 */
export function createTierColumnDefinition(
  column: ColumnConfig<Tier>
): TierColumnDefinition {
  const config: TierColumnDefinition = {
    key: column.key as string,
    label: column.label,
    sortable: !TIER_NON_SORTABLE_COLUMNS.includes(column.key as any),
  };

  // Name column
  if (column.key === TIER_COLUMN_KEYS.NAME) {
    config.className = 'min-w-[200px]';
    config.render = (_value: string, tier: Tier) => (
      <div>
        <div className="font-medium text-slate-900 truncate" title={tier.name}>
          {tier.name}
        </div>
        {tier.description && (
          <div className="text-sm text-slate-500 truncate max-w-[250px]" title={tier.description}>
            {tier.description}
          </div>
        )}
      </div>
    );
  }

  // Usage column
  else if (column.key === TIER_COLUMN_KEYS.USAGE) {
    config.className = 'w-auto whitespace-nowrap';
    config.render = (value: number) => (
      <span className="text-slate-700 font-medium">
        {value || 0} products
      </span>
    );
  }

  // Status column
  else if (column.key === TIER_COLUMN_KEYS.STATUS) {
    config.type = 'badge';
    config.className = 'w-auto whitespace-nowrap';
    config.render = (value: string) => {
      const statusStyles: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        inactive: 'bg-slate-50 text-slate-700 border-slate-200'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[value] || statusStyles.inactive}`}>
          {value || '—'}
        </span>
      );
    };
  }

  // Date columns
  else if ([TIER_COLUMN_KEYS.CREATED, TIER_COLUMN_KEYS.UPDATED].includes(column.key as any)) {
    config.type = 'date';
    config.className = 'w-auto whitespace-nowrap';
    config.render = (value: string) => (
      <span className="text-slate-600">
        {value ? new Date(value).toLocaleDateString() : '-'}
      </span>
    );
  }

  return config;
}

/**
 * Hook or function to get tier column configurations
 */
export function getTierColumnConfig(
  visibleColumns: { key: string; label: string; visible: boolean }[]
): TierColumnDefinition[] {
  return visibleColumns
    .filter(c => c.visible)
    .map(c => createTierColumnDefinition(c as any));
}
