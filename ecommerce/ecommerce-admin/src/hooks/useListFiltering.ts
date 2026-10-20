import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';

export interface FilterConfig<T> {
    /** Search query string */
    search?: string;
    /** Fields to search in */
    searchFields?: (keyof T)[];
    /** Additional filters as key-value pairs */
    filters?: Partial<Record<keyof T, string | number | boolean>>;
    /** Date range for filtering */
    dateRange?: DateRange;
    /** Date field to filter on */
    dateField?: keyof T;
    /** Sort configuration */
    sort?: string; // format: "field_direction" e.g. "name_asc"
    /** Current page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
}

export interface FilteredResult<T> {
    /** Filtered and sorted data */
    filtered: T[];
    /** Paginated data */
    paginated: T[];
    /** Total count of filtered items */
    total: number;
    /** Total number of pages */
    totalPages: number;
}

/**
 * useListFiltering - Generic hook for filtering, sorting, and pagination
 * 
 * Eliminates 300+ lines of duplicated logic across ProductListPage, useCustomerList, etc.
 * 
 * @example
 * ```tsx
 * const { filtered, paginated, total } = useListFiltering({
 *   data: products,
 *   searchFields: ['product_title', 'sku'],
 *   filters: { status },
 *   dateField: 'created_at',
 *   dateRange,
 *   sort: 'price_desc',
 *   page: 1,
 *   pageSize: 10
 * });
 * ```
 */
export function useListFiltering<T extends Record<string, any>>({
    data,
    search,
    searchFields = [],
    filters = {},
    dateRange,
    dateField,
    sort = '',
    page = 1,
    pageSize = 10,
}: FilterConfig<T> & { data: T[]; search?: string }): FilteredResult<T> {

    const result = useMemo(() => {
        let filtered = [...data];

        // 1. Search filtering
        if (search && searchFields.length > 0) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((item) =>
                searchFields.some((field) => {
                    const value = item[field];
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        // 2. Additional filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                filtered = filtered.filter((item) => {
                    const itemValue = item[key as keyof T];
                    if (typeof value === 'string' && typeof itemValue === 'string') {
                        return itemValue.toLowerCase() === value.toLowerCase();
                    }
                    return itemValue === value;
                });
            }
        });

        // 3. Date range filtering
        if (dateRange?.from && dateField) {
            const fromDate = new Date(dateRange.from);
            fromDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter((item) => {
                const itemDate = item[dateField];
                if (!itemDate) return false;

                const createdDate = new Date(itemDate as string | Date);
                createdDate.setHours(0, 0, 0, 0);

                if (dateRange.to) {
                    const toDate = new Date(dateRange.to);
                    toDate.setHours(23, 59, 59, 999);
                    return createdDate >= fromDate && createdDate <= toDate;
                }

                return createdDate >= fromDate;
            });
        }

        // 4. Sorting
        if (sort) {
            const [field, direction] = sort.split('_');
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[field as keyof T];
                const bVal = b[field as keyof T];

                // Handle null/undefined
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                // Date sorting
                if ((aVal as any) instanceof Date || typeof aVal === 'string' && !isNaN(Date.parse(String(aVal)))) {
                    const aDate = new Date(aVal as string | Date).getTime();
                    const bDate = new Date(bVal as string | Date).getTime();
                    return direction === 'desc' ? bDate - aDate : aDate - bDate;
                }

                // Number sorting
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return direction === 'desc' ? bVal - aVal : aVal - bVal;
                }

                // String sorting
                const aStr = String(aVal);
                const bStr = String(bVal);
                const comparison = aStr.localeCompare(bStr);
                return direction === 'desc' ? -comparison : comparison;
            });
        }

        // 5. Pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginated = filtered.slice(startIndex, endIndex);

        return { filtered, paginated, total, totalPages };
    }, [data, search, searchFields, filters, dateRange, dateField, sort, page, pageSize]);

    return result;
}
