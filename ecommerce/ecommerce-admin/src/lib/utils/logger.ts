/**
 * Logger Utility
 * 
 * Centralized logging with environment-aware output.
 * - Logs to console in development
 * - Can be configured for external logging services in production
 * - Supports different log levels with filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
    isDevelopment: boolean;
    minLevel: LogLevel;
}

const config: LoggerConfig = {
    isDevelopment: import.meta.env.DEV,
    minLevel: import.meta.env.DEV ? 'debug' : 'warn'
};

const LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

function shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[config.minLevel];
}

/**
 * Central logger instance
 * 
 * @example
 * logger.debug('User data fetched', { userId: '123' });
 * logger.error('Failed to save', error);
 */
export const logger = {
    /**
     * Debug-level logging (development only)
     * Use for detailed debugging information
     */
    debug: (message: string, context?: any) => {
        if (shouldLog('debug') && config.isDevelopment) {
            console.log(`[DEBUG] ${message}`, context ?? '');
        }
    },

    /**
     * Info-level logging (development only)
     * Use for general informational messages
     */
    info: (message: string, context?: any) => {
        if (shouldLog('info') && config.isDevelopment) {
            console.info(`[INFO] ${message}`, context ?? '');
        }
    },

    /**
     * Warning-level logging
     * Use for potential issues that don't break functionality
     */
    warn: (message: string, context?: any) => {
        if (shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, context ?? '');
        }
    },

    /**
     * Error-level logging
     * Use for errors and exceptions
     * In production, this could be extended to send to error tracking services (e.g., Sentry)
     */
    error: (message: string, error?: Error | any) => {
        if (shouldLog('error')) {
            console.error(`[ERROR] ${message}`, error ?? '');
            // TODO: In production, integrate with error tracking service
            // if (!config.isDevelopment) {
            //   errorTrackingService.captureException(error, { message });
            // }
        }
    }
};
