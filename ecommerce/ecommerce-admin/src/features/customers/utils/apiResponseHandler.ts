export interface NormalizedPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NormalizedResponse<T> {
  data: T[];
  pagination: NormalizedPagination;
}

/**
 * Normalizes messy API responses with multiple possible structures.
 * 
 * Handles responses like:
 * - { data: { users: [...] } }
 * - { users: [...] }
 * - { data: [...] }
 * - [...]
 * 
 * @deprecated This is a temporary solution. Once backend API is standardized,
 * this utility should be removed and services should use strict types.
 */
export function normalizeCustomersResponse(response: any): NormalizedResponse<any> {
  const body = response?.data ?? response ?? {};
  
  const data = body?.data?.users 
    ?? body?.users 
    ?? body?.data 
    ?? body 
    ?? [];
    
  const pagination: NormalizedPagination = body?.pagination 
    ?? body?.data?.pagination 
    ?? body?.data?.data?.pagination 
    ?? body?.meta?.pagination
    ?? { total: Array.isArray(data) ? data.length : 0, page: 1, limit: 20, totalPages: 1 };

  return { data, pagination };
}

/**
 * Normalizes single item response
 */
export function normalizeSingleResponse<T>(response: any): T {
  if (!response) return null as T;
  return response.data ?? response ?? null;
}

/**
 * Extracts error message from various axios error formats
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}
