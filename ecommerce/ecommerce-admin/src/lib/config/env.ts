/**
 * Environment Configuration
 * 
 * Centralized environment variables with type safety and defaults.
 * All environment variables should be accessed through this module.
 * 
 * @example
 * import { ENV } from '@/lib/config/env';
 * const apiUrl = ENV.API_BASE_URL;
 */

// Get environment variable with fallback
const getEnvVar = (key: string, defaultValue: string): string => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Helper to ensure trailing slash
const ensureTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url : `${url}/`;
};

export const ENV = {
  // API Configuration
  API_BASE_URL: ensureTrailingSlash(getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api/v1/')),
  API_TIMEOUT: Number(getEnvVar('VITE_API_TIMEOUT', '30000')),

  // App Configuration
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Anant Enterprises Admin'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),

  // Environment
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;

// Validate required environment variables
const validateEnv = () => {
  const required: Array<keyof typeof ENV> = ['API_BASE_URL'];

  const missing = required.filter(key => !ENV[key]);

  if (missing.length > 0) {
    // Missing environment variables - using defaults
    // Create a .env file for production
  }
};

// Run validation on module load (only in development)
if (ENV.IS_DEV) {
  validateEnv();
}
