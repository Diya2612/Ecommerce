/**
 * API Error Classes
 *
 * Centralized error handling for the API layer.
 * These errors are thrown by the API client and can be caught
 * anywhere in the application for consistent error handling.
 */

/**
 * Base API error with status code and optional error code
 */
export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly isApiError = true;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;

        // Maintains proper stack trace in V8 environments
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Check if error is a specific HTTP status
     */
    is(status: number): boolean {
        return this.status === status;
    }

    /**
     * Check if error is a client error (4xx)
     */
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Check if error is a server error (5xx)
     */
    isServerError(): boolean {
        return this.status >= 500;
    }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends ApiError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

/**
 * Validation error (422)
 */
export class ValidationError extends ApiError {
    public readonly errors: Record<string, string[]>;

    constructor(message = 'Validation failed', errors: Record<string, string[]> = {}) {
        super(message, 422, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
    public readonly retryAfter?: number;

    constructor(message = 'Too many requests', retryAfter?: number) {
        super(message, 429, 'RATE_LIMITED');
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

/**
 * Network/connection error
 */
export class NetworkError extends Error {
    public readonly isNetworkError = true;

    constructor(message = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError || (error as ApiError)?.isApiError === true;
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError || (error as NetworkError)?.isNetworkError === true;
}

/**
 * Create appropriate error instance from HTTP status
 */
export function createApiError(
    status: number,
    message: string,
    code?: string,
    errors?: Record<string, string[]>
): ApiError {
    switch (status) {
        case 401:
            return new UnauthorizedError(message);
        case 403:
            return new ForbiddenError(message);
        case 404:
            return new NotFoundError(message);
        case 422:
            return new ValidationError(message, errors);
        case 429:
            return new RateLimitError(message);
        default:
            return new ApiError(message, status, code);
    }
}
