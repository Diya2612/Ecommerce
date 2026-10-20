/**
 * Table State Reducer
 * Centralized state management for table operations
 */

export interface TableState<T = any> {
  // Pagination
  page: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;

  // Selection
  selectedIds: string[];
  selectionMode: 'none' | 'single' | 'multiple';

  // Sorting
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';

  // Expansion
  expandedIds: string[];

  // Search & Filters
  search: string;
  filters: Record<string, any>;

  // Column visibility
  visibleColumns: Record<string, boolean>;

  // Loading state
  loading: boolean;

  // Data
  data: T[];
}

export type TableAction<T = any> =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ROWS_PER_PAGE'; payload: number }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'SET_TOTAL_ITEMS'; payload: number }
  | { type: 'SET_SELECTED_IDS'; payload: string[] }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'TOGGLE_SELECT_ALL'; payload: { allIds: string[]; currentPageIds: string[] } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SORT'; payload: { key: string; direction: 'asc' | 'desc' } }
  | { type: 'CLEAR_SORT' }
  | { type: 'TOGGLE_EXPAND'; payload: string }
  | { type: 'SET_EXPANDED_IDS'; payload: string[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER'; payload: { key: string; value: any } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_COLUMN_VISIBILITY'; payload: { key: string; visible: boolean } }
  | { type: 'SET_ALL_COLUMNS_VISIBILITY'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: T[] }
  | { type: 'RESET_STATE'; payload?: Partial<TableState<T>> };

export function tableReducer<T = any>(
  state: TableState<T>,
  action: TableAction<T>
): TableState<T> {
  switch (action.type) {
    // Pagination actions
    case 'SET_PAGE':
      return { ...state, page: action.payload };

    case 'SET_ROWS_PER_PAGE':
      return { ...state, rowsPerPage: action.payload, page: 1 };

    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload };

    case 'SET_TOTAL_ITEMS':
      return { ...state, totalItems: action.payload };

    // Selection actions
    case 'SET_SELECTED_IDS':
      return { ...state, selectedIds: action.payload };

    case 'TOGGLE_SELECTION': {
      const id = action.payload;
      if (state.selectionMode === 'single') {
        return {
          ...state,
          selectedIds: state.selectedIds.includes(id) ? [] : [id],
        };
      } else {
        const exists = state.selectedIds.includes(id);
        return {
          ...state,
          selectedIds: exists
            ? state.selectedIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedIds, id],
        };
      }
    }

    case 'TOGGLE_SELECT_ALL': {
      const { currentPageIds } = action.payload;
      const allPageIdsSelected = currentPageIds.every((id) =>
        state.selectedIds.includes(id)
      );

      if (allPageIdsSelected) {
        // Deselect all current page items
        return {
          ...state,
          selectedIds: state.selectedIds.filter(
            (id) => !currentPageIds.includes(id)
          ),
        };
      } else {
        // Select all current page items (avoiding duplicates)
        const newSelectedIds = Array.from(
          new Set([...state.selectedIds, ...currentPageIds])
        );
        return { ...state, selectedIds: newSelectedIds };
      }
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: [] };

    // Sorting actions
    case 'SET_SORT':
      return {
        ...state,
        sortKey: action.payload.key,
        sortDirection: action.payload.direction,
      };

    case 'CLEAR_SORT':
      return { ...state, sortKey: undefined, sortDirection: undefined };

    // Expansion actions
    case 'TOGGLE_EXPAND': {
      const id = action.payload;
      const isExpanded = state.expandedIds.includes(id);
      return {
        ...state,
        expandedIds: isExpanded
          ? state.expandedIds.filter((expandedId) => expandedId !== id)
          : [...state.expandedIds, id],
      };
    }

    case 'SET_EXPANDED_IDS':
      return { ...state, expandedIds: action.payload };

    // Search & Filter actions
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
        page: 1,
      };

    case 'CLEAR_FILTERS':
      return { ...state, filters: {}, search: '', page: 1 };

    // Column visibility actions
    case 'SET_COLUMN_VISIBILITY':
      return {
        ...state,
        visibleColumns: {
          ...state.visibleColumns,
          [action.payload.key]: action.payload.visible,
        },
      };

    case 'SET_ALL_COLUMNS_VISIBILITY': {
      const allVisible: Record<string, boolean> = {};
      Object.keys(state.visibleColumns).forEach((key) => {
        allVisible[key] = action.payload;
      });
      return { ...state, visibleColumns: allVisible };
    }

    // Data & Loading actions
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_DATA':
      return { ...state, data: action.payload };

    // Reset action
    case 'RESET_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function createInitialTableState<T = any>(
  overrides?: Partial<TableState<T>>
): TableState<T> {
  return {
    page: 1,
    rowsPerPage: 10,
    totalPages: 0,
    totalItems: 0,
    selectedIds: [],
    selectionMode: 'multiple',
    sortKey: undefined,
    sortDirection: undefined,
    expandedIds: [],
    search: '',
    filters: {},
    visibleColumns: {},
    loading: false,
    data: [],
    ...overrides,
  };
}
