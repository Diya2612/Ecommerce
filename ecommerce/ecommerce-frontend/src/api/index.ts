/**
 * API Module
 *
 * Single entry point for the API layer.
 * Import from '@/api' instead of individual files.
 *
 * @example
 * ```ts
 * import { api, ApiError, isApiError } from '@/api';
 *
 * try {
 *   const data = await api<Product>('/products/123');
 * } catch (error) {
 *   if (isApiError(error) && error.status === 404) {
 *     // Handle not found
 *   }
 * }
 * ```
 */

// Core client (can be used in client components)
export { api, API_BASE_URL } from './client';

// NOTE: For Server Components, use:
// import { serverApi } from '@/api/server';

// Error classes and utilities
export {
    ApiError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    NetworkError,
    isApiError,
    isNetworkError,
    createApiError,
} from './errors';

// Types
export type {
    HttpMethod,
    ApiRequestOptions,
    ApiResponse,
    PaginatedResponse,
    PaginationMeta,
    ApiErrorResponse,
    ExtractData,
    QueryParams,
} from './types';

// Utilities
export { buildQueryString } from './types';
