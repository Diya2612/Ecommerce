/**
 * Formatting utilities for data-table components
 * Handles value formatting for display in tables
 */

import { DEFAULT_CURRENCY_SYMBOL } from './constants';

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'badge' | 'image';

/**
 * Format a value based on its type
 * @param value - The value to format
 * @param type - The type of formatting to apply
 * @param currencySymbol - Currency symbol for currency type (default: ₹)
 * @returns Formatted string representation of the value
 */
export function formatValue(
  value: unknown,
  type: ColumnType | undefined,
  currencySymbol: string = DEFAULT_CURRENCY_SYMBOL
): string {
  if (value == null) return '—';

  switch (type) {
    case 'currency':
      return formatCurrency(value, currencySymbol);
    
    case 'number':
      return formatNumber(value);
    
    case 'date':
      return formatDate(value);
    
    case 'badge':
      return String(value);
    
    default:
      return String(value);
  }
}

/**
 * Format a number value with locale-specific formatting
 */
export function formatNumber(value: unknown): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString();
}

/**
 * Format a currency value with symbol and locale-specific formatting
 */
export function formatCurrency(value: unknown, symbol: string = DEFAULT_CURRENCY_SYMBOL): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${symbol}${num.toLocaleString()}`;
}

/**
 * Format a date value to locale date string
 */
export function formatDate(value: unknown): string {
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

/**
 * Format a date value to include time
 */
export function formatDateTime(value: unknown): string {
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

/**
 * Format bytes to human-readable size (B, KB, MB, GB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format a phone number (basic format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  return phone; // Return as-is if not standard length
}

/**
 * Check if a value is empty (null, undefined, empty string, etc.)
 */
export function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (typeof value === 'string' && value.trim() === '');
}
