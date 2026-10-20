/**
 * Sorting Utilities
 * 
 * Generic sorting functions to eliminate repeated sorting logic.
 */

/**
 * Sort array by a specific field
 */
export function sortByField<T>(
    data: T[],
    field: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const aStr = String(aVal);
        const bStr = String(bVal);
        const comparison = aStr.localeCompare(bStr);

        return direction === 'desc' ? -comparison : comparison;
    });
}

/**
 * Sort array by date field
 */
export function sortByDate<T>(
    data: T[],
    field: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (!aVal) return 1;
        if (!bVal) return -1;

        const aDate = new Date(aVal as string | Date).getTime();
        const bDate = new Date(bVal as string | Date).getTime();

        return direction === 'desc' ? bDate - aDate : aDate - bDate;
    });
}

/**
 * Sort array by number field
 */
export function sortByNumber<T>(
    data: T[],
    field: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        const aNum = Number(aVal) || 0;
        const bNum = Number(bVal) || 0;

        return direction === 'desc' ? bNum - aNum : aNum - bNum;
    });
}

/**
 * Generic sort function that auto-detects type
 */
export function sortData<T>(
    data: T[],
    field: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    if (data.length === 0) return data;

    const sampleValue = data.find(item => item[field] !== null && item[field] !== undefined)?.[field];

    if (sampleValue instanceof Date || (typeof sampleValue === 'string' && !isNaN(Date.parse(String(sampleValue))))) {
        return sortByDate(data, field, direction);
    }

    if (typeof sampleValue === 'number') {
        return sortByNumber(data, field, direction);
    }

    return sortByField(data, field, direction);
}
