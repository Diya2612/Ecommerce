/**
 * Validation utilities for data-table components
 * Type guards and validation functions
 */

import type { ColumnType } from './formatters';
import type { ColumnAlign } from './styling';

/**
 * Type guard to check if a value is a valid column type
 */
export function isValidColumnType(value: unknown): value is ColumnType {
  return (
    typeof value === 'string' &&
    ['text', 'number', 'currency', 'date', 'badge', 'image'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid alignment
 */
export function isValidAlignment(value: unknown): value is ColumnAlign {
  return typeof value === 'string' && ['left', 'center', 'right'].includes(value);
}

/**
 * Type guard to check if a value is a valid sort direction
 */
export function isValidSortDirection(value: unknown): value is 'asc' | 'desc' {
  return value === 'asc' || value === 'desc';
}

/**
 * Validate page number is within bounds
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return Number.isInteger(page) && page >= 1 && page <= totalPages;
}

/**
 * Validate rows per page value
 */
export function isValidRowsPerPage(value: number, options: number[]): boolean {
  return Number.isInteger(value) && value > 0 && options.includes(value);
}

/**
 * Type guard to check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if value is a valid array
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Validate selection mode
 */
export function isValidSelectionMode(value: unknown): value is 'none' | 'single' | 'multiple' {
  return value === 'none' || value === 'single' || value === 'multiple';
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: unknown): string {
  if (typeof query !== 'string') return '';
  return sanitizeInput(query).substring(0, 500); // Limit length
}

/**
 * Check if an object is empty
 */
export function isEmptyObject(obj: unknown): boolean {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
}

/**
 * Validate color hex code
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate email format (basic)
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for checking if value is a Record
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Validate that all required fields are present in an object
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
  obj: unknown,
  requiredFields: (keyof T)[]
): obj is T {
  if (!isRecord(obj)) return false;
  return requiredFields.every((field) => field in obj);
}
