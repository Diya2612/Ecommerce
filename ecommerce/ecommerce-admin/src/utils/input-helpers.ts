/**
 * Input Helper Utilities
 * 
 * Utilities for handling form inputs, formatting, and validation
 */

/**
 * Prevents invalid characters in number inputs
 * Use as onKeyDown handler for number inputs
 * 
 * @param event - The keyboard event
 */
export const preventInvalidNumberInput = (
    event: React.KeyboardEvent<HTMLInputElement>
): void => {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
        event.preventDefault();
    }
};

/**
 * Formats a number as currency
 * 
 * @param value - The numeric value
 * @param currency - Currency code (default: INR)
 * @param locale - Locale for formatting (default: en-IN)
 * @returns Formatted currency string
 */
export const formatCurrency = (
    value: number,
    currency: string = 'INR',
    locale: string = 'en-IN'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(value);
};

/**
 * Parses currency input to number
 * Removes currency symbols and non-numeric characters
 * 
 * @param value - The input value
 * @returns Parsed number
 */
export const parseCurrencyInput = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
};

/**
 * Formats a number with specified decimal places
 * 
 * @param value - The numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
};

/**
 * Clamps a value between min and max
 * 
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Sanitizes string input by trimming whitespace
 * 
 * @param value - The input value
 * @returns Sanitized string
 */
export const sanitizeInput = (value: string): string => {
    return value.trim();
};

/**
 * Formats file size in human-readable format
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
