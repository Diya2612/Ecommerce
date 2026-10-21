/**
 * Core API Client
 *
 * Environment-aware fetch wrapper for Next.js App Router.
 * Works in both Server Components (RSC) and Client Components.
 *
 * Features:
 * - Automatic auth token injection
 * - Next.js ISR cache integration (server-only)
 * - Centralized error handling
 * - Response unwrapping
 * - Type-safe requests
 *
 * @example
 * ```ts
 * // Server Component
 * const product = await api<Product>('/products/123', {
 *   revalidate: 3600,
 *   tags: ['product:123'],
 * });
 *
 * // Client Component (no cache options)
 * const user = await api<User>('/users/me', { auth: true });
 * ```
 */

import type { ApiRequestOptions, ApiResponse, ApiErrorResponse } from "./types";
import { createApiError, NetworkError } from "./errors";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Server-side: prefer internal URL
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000/api"
    );
  }

  // Client-side: use public URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
}

const API_BASE_URL = getApiBaseUrl();

// ============================================================================
// Auth Token Retrieval
// ============================================================================

/**
 * Get access token from Supabase session (client-side only)
 * Uses cached session from onAuthStateChange listener
 */
async function getAccessToken(): Promise<string | null> {
  // Only works in browser
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const { waitForSession } = await import("@/lib/supabase/client");
    const session = await waitForSession(3000); // 3 second timeout

    if (session?.access_token) {
      return session.access_token;
    }

    return null;
  } catch (error) {
    console.error("[API] getAccessToken error:", error);
    return null;
  }
}

// ============================================================================
// Response Parsing
// ============================================================================

/**
 * Parse error response from API
 */
async function parseErrorResponse(
  response: Response,
): Promise<ApiErrorResponse> {
  try {
    const data = await response.json();

    // Handle different error response formats
    if (typeof data === "string") {
      return { success: false, message: data };
    }

    let message = "Request failed";
    
    // Prefer data.message, then data.error, then statusText
    const rawMessage = data.message || data.error;

    if (rawMessage) {
        if (typeof rawMessage === 'string') {
            message = rawMessage;
        } else if (typeof rawMessage === 'object') {
            // If message/error is an object (e.g. Zod error or nested error info),
            // try to extract a meaningful string or stringify it as a last resort
            if (rawMessage.message && typeof rawMessage.message === 'string') {
                message = rawMessage.message;
            } else if (Array.isArray(rawMessage)) {
                // Handle array of errors
                message = rawMessage.map((e: any) => typeof e === 'string' ? e : e.message).join(', ');
            } else {
                // If it's a validation object like { field: ["error"] }, keep specific errors in data.errors
                // and set a generic message
                if (!data.errors) {
                    data.errors = rawMessage;
                }
                message = "Validation failed";
            }
        }
    } else if (response.statusText) {
        message = response.statusText;
    }

    return {
      success: false,
      message,
      code: data.code,
      errors: data.errors,
    };
  } catch {
    return {
      success: false,
      message: response.statusText || "Request failed",
    };
  }
}

/**
 * Unwrap API response data
 * Handles both wrapped ({ data: ... }) and unwrapped responses
 */
function unwrapResponse<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiResponse<T>).data;
  }
  return json as T;
}

// ============================================================================
// Main API Function
// ============================================================================

/**
 * Core API client function
 *
 * @param endpoint - API endpoint (e.g., '/products' or '/users/123')
 * @param options - Request options
 * @returns Promise resolving to typed response data
 * @throws ApiError on HTTP errors, NetworkError on connection issues
 */
export async function api<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    headers: customHeaders = {},
    sessionId,
    revalidate,
    tags,
    signal,
  } = options;

  const isServer = typeof window === "undefined";

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add auth token if required
  if (auth) {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Add session ID for guest operations (cart, etc.)
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }

  // Build URL
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Build fetch options
  const fetchOptions: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  } = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  };

  // Add Next.js cache options (server-only)
  if (isServer && (revalidate !== undefined || tags?.length)) {
    fetchOptions.next = {};
    if (revalidate !== undefined) {
      fetchOptions.next.revalidate = revalidate;
    }
    if (tags?.length) {
      fetchOptions.next.tags = tags;
    }
  }

  // Execute request
  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Network error (no response received)
    if (error instanceof Error) {
      throw new NetworkError(error.message);
    }
    throw new NetworkError("Network request failed");
  }

  // Handle HTTP errors
  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw createApiError(
      response.status,
      errorData.message,
      errorData.code,
      errorData.errors,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse response based on type
  if (options.responseType === "blob") {
    const blob = await response.blob();
    return blob as T;
  }

  if (options.responseType === "text") {
    const text = await response.text();
    return text as T;
  }

  if (options.responseType === "arrayBuffer") {
    const buffer = await response.arrayBuffer();
    return buffer as T;
  }

  // Default: Parse and unwrap JSON
  const json = await response.json();
  return unwrapResponse<T>(json);
}

// ============================================================================
// Convenience Methods
// ============================================================================

/**
 * GET request
 */
api.get = <T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => api<T>(endpoint, { ...options, method: "GET" });

/**
 * POST request
 */
api.post = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => api<T>(endpoint, { ...options, method: "POST", body });

/**
 * PUT request
 */
api.put = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => api<T>(endpoint, { ...options, method: "PUT", body });

/**
 * PATCH request
 */
api.patch = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => api<T>(endpoint, { ...options, method: "PATCH", body });

/**
 * DELETE request
 */
api.delete = <T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method">,
) => api<T>(endpoint, { ...options, method: "DELETE" });

// ============================================================================
// Re-exports
// ============================================================================

export { API_BASE_URL };
export * from "./errors";
export * from "./types";
