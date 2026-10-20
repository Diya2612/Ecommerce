/**
 * TableContext
 * React Context for table state management
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { tableReducer, createInitialTableState } from './tableReducer';
import type { TableState, TableAction } from './tableReducer';

export interface TableContextValue<T = any> {
  state: TableState<T>;
  dispatch: React.Dispatch<TableAction<T>>;
  
  // Convenience action creators
  actions: {
    setPage: (page: number) => void;
    setRowsPerPage: (rows: number) => void;
    toggleSelection: (id: string) => void;
    toggleSelectAll: (allIds: string[], currentPageIds: string[]) => void;
    clearSelection: () => void;
    setSort: (key: string, direction: 'asc' | 'desc') => void;
    toggleExpand: (id: string) => void;
    setSearch: (search: string) => void;
    setFilter: (key: string, value: any) => void;
    clearFilters: () => void;
    setColumnVisibility: (key: string, visible: boolean) => void;
    setAllColumnsVisibility: (visible: boolean) => void;
    setLoading: (loading: boolean) => void;
    setData: (data: T[]) => void;
  };
}

const TableContext = createContext<TableContextValue | null>(null);

export interface TableProviderProps<T = any> {
  children: ReactNode;
  initialState?: Partial<TableState<T>>;
  persistKey?: string; // Key for localStorage persistence
  onStateChange?: (state: TableState<T>) => void;
}

export function TableProvider<T = any>({
  children,
  initialState,
  persistKey,
  onStateChange,
}: TableProviderProps<T>) {
  // Load persisted state if key is provided
  const getInitialState = useCallback(() => {
    let state = createInitialTableState<T>(initialState);

    if (persistKey && typeof window !== 'undefined') {
      try {
        const persisted = localStorage.getItem(`table_state_${persistKey}`);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          // Only persist certain fields, not data or loading states
          state = {
            ...state,
            rowsPerPage: parsed.rowsPerPage ?? state.rowsPerPage,
            sortKey: parsed.sortKey ?? state.sortKey,
            sortDirection: parsed.sortDirection ?? state.sortDirection,
            visibleColumns: parsed.visibleColumns ?? state.visibleColumns,
          };
        }
      } catch (error) {
        console.warn('Failed to load persisted table state:', error);
      }
    }

    return state;
  }, [initialState, persistKey]);

  const [state, dispatch] = useReducer(tableReducer<T>, undefined, getInitialState);

  // Persist state changes
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        const toPersist = {
          rowsPerPage: state.rowsPerPage,
          sortKey: state.sortKey,
          sortDirection: state.sortDirection,
          visibleColumns: state.visibleColumns,
        };
        localStorage.setItem(`table_state_${persistKey}`, JSON.stringify(toPersist));
      } catch (error) {
        console.warn('Failed to persist table state:', error);
      }
    }
  }, [
    persistKey,
    state.rowsPerPage,
    state.sortKey,
    state.sortDirection,
    state.visibleColumns,
  ]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Action creators for convenience
  const actions = {
    setPage: useCallback((page: number) => {
      dispatch({ type: 'SET_PAGE', payload: page });
    }, []),

    setRowsPerPage: useCallback((rows: number) => {
      dispatch({ type: 'SET_ROWS_PER_PAGE', payload: rows });
    }, []),

    toggleSelection: useCallback((id: string) => {
      dispatch({ type: 'TOGGLE_SELECTION', payload: id });
    }, []),

    toggleSelectAll: useCallback((allIds: string[], currentPageIds: string[]) => {
      dispatch({
        type: 'TOGGLE_SELECT_ALL',
        payload: { allIds, currentPageIds },
      });
    }, []),

    clearSelection: useCallback(() => {
      dispatch({ type: 'CLEAR_SELECTION' });
    }, []),

    setSort: useCallback((key: string, direction: 'asc' | 'desc') => {
      dispatch({ type: 'SET_SORT', payload: { key, direction } });
    }, []),

    toggleExpand: useCallback((id: string) => {
      dispatch({ type: 'TOGGLE_EXPAND', payload: id });
    }, []),

    setSearch: useCallback((search: string) => {
      dispatch({ type: 'SET_SEARCH', payload: search });
    }, []),

    setFilter: useCallback((key: string, value: any) => {
      dispatch({ type: 'SET_FILTER', payload: { key, value } });
    }, []),

    clearFilters: useCallback(() => {
      dispatch({ type: 'CLEAR_FILTERS' });
    }, []),

    setColumnVisibility: useCallback((key: string, visible: boolean) => {
      dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: { key, visible } });
    }, []),

    setAllColumnsVisibility: useCallback((visible: boolean) => {
      dispatch({ type: 'SET_ALL_COLUMNS_VISIBILITY', payload: visible });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setData: useCallback((data: T[]) => {
      dispatch({ type: 'SET_DATA', payload: data });
    }, []),
  };

  const value: TableContextValue<T> = {
    state,
    dispatch,
    actions,
  };

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

/**
 * Hook to access table context
 * Must be used within a TableProvider
 */
export function useTableContext<T = any>(): TableContextValue<T> {
  const context = useContext(TableContext);
  
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  
  return context as TableContextValue<T>;
}
