/**
 * API Types
 *
 * Shared types for the API layer.
 * These types are used by the API client and can be extended
 * by feature-specific query modules.
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  /** HTTP method (default: GET) */
  method?: HttpMethod;

  /** Request body (automatically stringified) */
  body?: unknown;

  /** Require authentication (default: false) */
  auth?: boolean;

  /** Custom headers to merge */
  headers?: Record<string, string>;

  /** Session ID for guest cart operations */
  sessionId?: string;

  /**
   * Next.js ISR revalidation time in seconds.
   * - `number`: Revalidate after N seconds
   * - `false`: No caching (always fresh)
   * - `undefined`: Use default (no revalidate option)
   *
   * Only applies in server environment.
   */
  revalidate?: number | false;

  /**
   * Cache tags for on-demand revalidation.
   * Used with `revalidateTag()` in Server Actions.
   *
   * Only applies in server environment.
   */
  tags?: string[];

  /**
   * AbortSignal for request cancellation
   */
  signal?: AbortSignal;

  /**
   * Expected response type (default: 'json')
   */
  responseType?: "json" | "blob" | "text" | "arrayBuffer";
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Error response from backend
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type from an API response
 */
export type ExtractData<T> = T extends ApiResponse<infer D> ? D : T;

/**
 * Query parameters type (string values only for URLSearchParams)
 */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

/**
 * Build query string from params object
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
