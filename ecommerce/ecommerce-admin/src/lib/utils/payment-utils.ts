/**
 * Payment Utilities
 * 
 * Shared utilities for payment operations including retry logic,
 * correlation ID generation, and SDK loading.
 */

// ============================================================================
// Correlation IDs
// ============================================================================

declare global {
    interface Window {
        Razorpay: any;
    }
}

/**
 * Generate a unique correlation ID for tracing payment operations
 * Format: pay_{timestamp}_{random}
 */
export function generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `pay_${timestamp}_${random}`;
}

/**
 * Get or create a session-scoped correlation ID
 * Persists across a single payment flow
 */
let currentSessionId: string | null = null;

export function getPaymentSessionId(): string {
    if (!currentSessionId) {
        currentSessionId = generateCorrelationId();
    }
    return currentSessionId;
}

export function resetPaymentSessionId(): void {
    currentSessionId = null;
}

// ============================================================================
// Retry with Exponential Backoff
// ============================================================================

export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxAttempts?: number;
    /** Base delay in ms (default: 1000) */
    baseDelayMs?: number;
    /** Maximum delay in ms (default: 10000) */
    maxDelayMs?: number;
    /** Multiplier for exponential backoff (default: 2) */
    backoffMultiplier?: number;
    /** Add random jitter to delays (default: true) */
    jitter?: boolean;
    /** Callback for each retry attempt */
    onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void;
    /** Predicate to determine if error is retryable */
    shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTimeMs: number;
}

/**
 * Execute a function with retry and exponential backoff
 * 
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => verifyPayment(data),
 *   { maxAttempts: 3, onRetry: (attempt, err) => console.log(`Retry ${attempt}`) }
 * );
 * if (result.success) {
 *   // Handle success
 * }
 * ```
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const {
        maxAttempts = 3,
        baseDelayMs = 1000,
        maxDelayMs = 10000,
        backoffMultiplier = 2,
        jitter = true,
        onRetry,
        shouldRetry = defaultShouldRetry,
    } = options;

    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const data = await fn();
            return {
                success: true,
                data,
                attempts: attempt,
                totalTimeMs: Date.now() - startTime,
            };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Check if we should retry
            if (attempt < maxAttempts && shouldRetry(lastError)) {
                // Calculate delay with exponential backoff
                let delay = Math.min(
                    baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
                    maxDelayMs
                );

                // Add jitter (±25%)
                if (jitter) {
                    const jitterRange = delay * 0.25;
                    delay += (Math.random() - 0.5) * 2 * jitterRange;
                }

                delay = Math.round(delay);

                onRetry?.(attempt, lastError, delay);

                await sleep(delay);
            } else {
                // Not retryable or max attempts reached
                break;
            }
        }
    }

    return {
        success: false,
        error: lastError,
        attempts: maxAttempts,
        totalTimeMs: Date.now() - startTime,
    };
}

/**
 * Default predicate for retryable errors
 * Retries on network errors, timeouts, and 5xx server errors
 */
function defaultShouldRetry(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('enotfound')) {
        return true;
    }

    // Check for HTTP status codes in error
    if ('status' in error) {
        const status = (error as any).status;
        // Retry on server errors (5xx) and rate limits (429)
        if (status >= 500 || status === 429 || status === 408) {
            return true;
        }
    }

    return false;
}

// ============================================================================
// SDK Loading
// ============================================================================

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export interface SDKLoadResult {
    loaded: boolean;
    error?: string;
    timeMs: number;
}

let sdkLoadPromise: Promise<SDKLoadResult> | null = null;

/**
 * Load Razorpay SDK with Promise-based approach
 * 
 * Features:
 * - Deduplicates concurrent load requests
 * - Caches successful load
 * - Returns same promise for concurrent calls
 * 
 * @example
 * ```ts
 * const { loaded, error } = await loadRazorpaySDK();
 * if (!loaded) {
 *   console.error('SDK failed to load:', error);
 * }
 * ```
 */
export function loadRazorpaySDK(): Promise<SDKLoadResult> {
    // Return existing promise if already loading/loaded
    if (sdkLoadPromise) {
        return sdkLoadPromise;
    }

    // Check if already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
        return Promise.resolve({ loaded: true, timeMs: 0 });
    }

    // Start loading
    sdkLoadPromise = new Promise((resolve) => {
        const startTime = Date.now();

        // Check if we're on client
        if (typeof window === 'undefined') {
            resolve({ loaded: false, error: 'Not in browser environment', timeMs: 0 });
            return;
        }

        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${RAZORPAY_SDK_URL}"]`);
        if (existingScript) {
            // Wait for existing script to load
            if (window.Razorpay) {
                resolve({ loaded: true, timeMs: Date.now() - startTime });
            } else {
                existingScript.addEventListener('load', () => {
                    resolve({ loaded: true, timeMs: Date.now() - startTime });
                });
                existingScript.addEventListener('error', () => {
                    resolve({ loaded: false, error: 'SDK script failed to load', timeMs: Date.now() - startTime });
                });
            }
            return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = RAZORPAY_SDK_URL;
        script.async = true;

        script.onload = () => {
            const timeMs = Date.now() - startTime;
            console.log(`[Payment] Razorpay SDK loaded in ${timeMs}ms`);
            resolve({ loaded: true, timeMs });
        };

        script.onerror = () => {
            const timeMs = Date.now() - startTime;
            console.error('[Payment] Failed to load Razorpay SDK');
            sdkLoadPromise = null; // Allow retry
            resolve({ loaded: false, error: 'Failed to load Razorpay SDK script', timeMs });
        };

        document.head.appendChild(script);
    });

    return sdkLoadPromise;
}

/**
 * Wait for Razorpay SDK to be ready
 * Combines loading with readiness check
 */
export async function waitForRazorpaySDK(timeoutMs: number = 10000): Promise<SDKLoadResult> {
    const loadResult = await loadRazorpaySDK();

    if (!loadResult.loaded) {
        return loadResult;
    }

    // SDK is loaded, but double-check it's initialized
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        if (typeof window !== 'undefined' && window.Razorpay) {
            return { loaded: true, timeMs: loadResult.timeMs };
        }
        await sleep(100);
    }

    return { loaded: false, error: 'SDK loaded but Razorpay not initialized', timeMs: Date.now() - startTime };
}

// ============================================================================
// Logging Helpers
// ============================================================================

export interface PaymentLogContext {
    correlationId?: string;
    sessionId?: string;
    orderId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amount?: number;
    status?: string;
    [key: string]: unknown;
}

/**
 * Create a payment logger with consistent formatting
 */
export function createPaymentLogger(prefix: string = 'Payment') {
    return {
        info: (message: string, context: PaymentLogContext = {}) => {
            console.log(`[${prefix}] ${message}`, formatLogContext(context));
        },
        warn: (message: string, context: PaymentLogContext = {}) => {
            console.warn(`[${prefix}] ${message}`, formatLogContext(context));
        },
        error: (message: string, context: PaymentLogContext = {}) => {
            console.error(`[${prefix}] ${message}`, formatLogContext(context));
        },
        debug: (message: string, context: PaymentLogContext = {}) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${prefix}:DEBUG] ${message}`, formatLogContext(context));
            }
        },
    };
}

function formatLogContext(context: PaymentLogContext): Record<string, unknown> {
    // Add session ID if not present
    if (!context.sessionId) {
        context.sessionId = getPaymentSessionId();
    }

    // Filter out undefined values
    return Object.fromEntries(
        Object.entries(context).filter(([, v]) => v !== undefined)
    );
}

// ============================================================================
// Utilities
// ============================================================================

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format amount from paise to rupees with proper formatting
 */
export function formatAmount(amountInPaise: number): string {
    const rupees = amountInPaise / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(rupees);
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}
