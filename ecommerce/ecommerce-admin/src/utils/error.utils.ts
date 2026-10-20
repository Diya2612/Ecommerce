/**
 * Error Utilities
 * 
 * Utility functions for handling and extracting error messages
 * consistently across the application.
 */

/**
 * Extract error message from various error types
 * 
 * Handles:
 * - Backend API errors (with nested error object)
 * - Axios errors
 * - Standard Error objects
 * - String errors
 * 
 * @param error - Error object from catch block
 * @param fallback - Fallback message if extraction fails
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const message = extractErrorMessage(error);
 *   setError(message);
 * }
 * ```
 */
export function extractErrorMessage(
  error: any,
  fallback: string = 'An unexpected error occurred. Please try again.'
): string {
  // Backend error structure: { success: false, error: { code, message, requestId, timestamp } }
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Alternative backend structure: { message: '...' }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Standard Error object
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Axios error with statusText (only if nothing else is available)
  // Avoid showing technical status texts like "Unprocessable Entity"
  if (error?.response?.statusText && 
      error.response.statusText !== 'Unprocessable Entity' &&
      error.response.statusText !== 'Internal Server Error' &&
      error.response.statusText !== 'Bad Request' &&
      error.response.statusText !== 'Unauthorized' &&
      error.response.statusText !== 'Forbidden' &&
      error.response.statusText !== 'Not Found') {
    return error.response.statusText;
  }

  // Fallback
  return fallback;
}

/**
 * Extract error code from backend response
 * 
 * @param error - Error object from catch block
 * @returns Error code or undefined
 */
export function extractErrorCode(error: any): string | undefined {
  return (
    error?.response?.data?.error?.code ||
    error?.code ||
    undefined
  );
}

/**
 * Check if error is a specific HTTP status code
 * 
 * @param error - Error object from catch block
 * @param status - HTTP status code to check
 * @returns True if error matches the status code
 * 
 * @example
 * ```typescript
 * if (isHttpError(error, 404)) {
 *   console.log('Resource not found');
 * }
 * ```
 */
export function isHttpError(error: any, status: number): boolean {
  return error?.response?.status === status;
}

/**
 * Check if error is a validation error
 * 
 * @param error - Error object from catch block
 * @returns True if error is a validation error (400)
 */
export function isValidationError(error: any): boolean {
  return isHttpError(error, 400) || extractErrorCode(error) === 'VALIDATION_ERROR';
}

/**
 * Check if error is an authentication error
 * 
 * @param error - Error object from catch block
 * @returns True if error is an authentication error (401)
 */
export function isAuthError(error: any): boolean {
  return isHttpError(error, 401);
}

/**
 * Check if error is a permission/authorization error
 * 
 * @param error - Error object from catch block
 * @returns True if error is a permission error (403)
 */
export function isPermissionError(error: any): boolean {
  return isHttpError(error, 403);
}

/**
 * Check if error indicates resource not found
 * 
 * @param error - Error object from catch block
 * @returns True if error is a not found error (404)
 */
export function isNotFoundError(error: any): boolean {
  return isHttpError(error, 404);
}

/**
 * Format error for display with request ID if available
 * 
 * @param error - Error object from catch block
 * @returns Formatted error message with optional request ID
 */
export function formatErrorWithRequestId(error: any): string {
  const message = extractErrorMessage(error);
  const requestId = error?.response?.data?.error?.requestId;

  if (requestId) {
    return `${message}\n\nRequest ID: ${requestId}`;
  }

  return message;
}
