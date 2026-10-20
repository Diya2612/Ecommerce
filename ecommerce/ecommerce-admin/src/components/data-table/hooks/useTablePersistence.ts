/**
 * useTablePersistence Hook
 * Manages localStorage persistence for table preferences
 */

import { useEffect, useCallback } from 'react';

export interface TablePreferences {
  rowsPerPage?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  visibleColumns?: Record<string, boolean>;
  search?: string;
  filters?: Record<string, any>;
}

export interface UseTablePersistenceOptions {
  key: string;
  preferences: TablePreferences;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook to persist table preferences to localStorage
 */
export function useTablePersistence({
  key,
  preferences,
  enabled = true,
  debounceMs = 500,
}: UseTablePersistenceOptions) {
  const storageKey = `table_prefs_${key}`;

  // Save preferences to localStorage (with debounce)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save table preferences:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [storageKey, preferences, enabled, debounceMs]);

  // Load preferences from localStorage
  const loadPreferences = useCallback((): TablePreferences | null => {
    if (!enabled || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load table preferences:', error);
      return null;
    }
  }, [storageKey, enabled]);

  // Clear preferences from localStorage
  const clearPreferences = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear table preferences:', error);
    }
  }, [storageKey, enabled]);

  return {
    loadPreferences,
    clearPreferences,
  };
}

/**
 * Hook to load initial preferences from localStorage
 */
export function useLoadTablePreferences(key: string): TablePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`table_prefs_${key}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load table preferences:', error);
    return null;
  }
}
