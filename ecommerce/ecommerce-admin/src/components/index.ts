/**
 * Global Components Index
 * 
 * Organized exports for all reusable components
 */

// UI Components
export * from './ui';

// Media Components
export * from './media';

// Layout Components - organized by purpose
export * from './layouts/headers';
export * from './layouts/sidebar';
export * from './layouts'; // ErrorBoundary, etc.

// Forms
export * from './forms';

// Feature Components
// Shared Feature Components
export * from './activity';
export { GenericTable, FiltersBar, ActionButtons } from './data-table';
export type { ColumnConfig, RowAction, SortOption } from './data-table';
export * from './metrics';
export * from './rules';
export * from './search';

// Dialogs
export * from './dialogs';
