
/**
 * Generic export scope
 */
export type ExportScope = 'all' | 'selected';

/**
 * Generic export format
 */
export type ExportFormat = 'csv' | 'xlsx';

/**
 * Generic export options with support for custom filters
 */
export interface ExportOptions<TFilters = Record<string, any>> {
    scope: ExportScope;
    format: ExportFormat;
    selectedColumns: string[];
    dateRange?: {
        from: Date;
        to: Date;
    };
    selectedIds?: string[];
    filters?: TFilters;
    search?: string;
}

/**
 * Generic import options
 */
export interface ImportOptions {
    mode: 'create' | 'update' | 'upsert';
    data: any[];
}
