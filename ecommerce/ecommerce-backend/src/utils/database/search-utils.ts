/**
 * Global Search Utilities
 * Provides generic fuzzy and exact search capabilities using the pg_trgm extension.
 */

import { ilike, or, SQL, AnyColumn } from 'drizzle-orm';

export interface SearchConfig {
  /** Columns for fuzzy matching (using ILIKE fallback instead of similarity) */
  fuzzyColumns?: AnyColumn[];
  /** Columns for exact substring matching (using ILIKE) */
  exactColumns?: AnyColumn[];
  /** Expected threshold params exist for compatibility but ignored */
  threshold?: number;
}

/**
 * Builds generic search conditions for Drizzle queries.
 * Combines fuzzy matching and exact/substring matching.
 *
 * @param searchQuery The search term from the user
 * @param config Configuration for search columns and threshold
 * @returns SQL conditions combined with OR, or undefined if query is empty
 */
export function buildSearchConditions(searchQuery: string, config: SearchConfig): SQL | undefined {
  const trimmedQuery = searchQuery.trim();
  if (!trimmedQuery) return undefined;

  const searchPattern = `%${trimmedQuery}%`;
  const conditions: SQL[] = [];

  // Fuzzy matching fallback on specified columns (using ILIKE instead of similarity)
  if (config.fuzzyColumns && config.fuzzyColumns.length > 0) {
    config.fuzzyColumns.forEach((col) => {
      conditions.push(ilike(col, searchPattern));
    });
  }

  // Exact/substring matching on specified columns
  if (config.exactColumns && config.exactColumns.length > 0) {
    config.exactColumns.forEach((col) => {
      conditions.push(ilike(col, searchPattern));
    });
  }

  // Combine all conditions with OR
  return conditions.length > 0 ? or(...conditions) : undefined;
}
