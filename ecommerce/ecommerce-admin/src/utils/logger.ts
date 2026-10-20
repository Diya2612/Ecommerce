import { ENV } from "@/lib/config/env";

/**
 * Application Logger
 * 
 * Centralized logging utility that:
 * - Only logs in development mode
 * - Provides consistent log formatting
 * - Can be extended with external logging services
 * 
 * @example
 * import { logger } from '@/utils';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API call failed', error);
 * logger.warn('Deprecated feature used');
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

const config: LoggerConfig = {
  enabled: ENV.IS_DEV,
  minLevel: 'debug',
};

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return logLevels[level] >= logLevels[config.minLevel];
};

const formatMessage = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return data ? `${prefix} ${message}` : `${prefix} ${message}`;
};

export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: (message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message), data || '');
    }
  },

  /**
   * Log general information
   */
  info: (message: string, data?: any) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message), data || '');
    }
  },

  /**
   * Log warnings
   */
  warn: (message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), data || '');
    }
  },

  /**
   * Log errors
   */
  error: (message: string, error?: any) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message), error || '');
      
      // In production, you could send errors to a service like Sentry
      // if (ENV.IS_PROD) {
      //   Sentry.captureException(error);
      // }
    }
  },

  /**
   * Configure logger settings
   */
  configure: (newConfig: Partial<LoggerConfig>) => {
    Object.assign(config, newConfig);
  },
};
