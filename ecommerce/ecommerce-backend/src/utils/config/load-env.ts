/**
 * Environment Loading Utility
 * Loads the appropriate .env file based on NODE_ENV.
 * Must be executed before other imports in standalone scripts.
 */

import dotenv from 'dotenv';

/**
 * Loads the environment-specific .env file or falls back to default .env.
 * @returns The current NODE_ENV
 */
export function loadEnv(): string {
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    throw new Error(
      'NODE_ENV is not set. Please set it to "development", "production", or "test".',
    );
  }

  const envFiles: Record<string, string> = {
    development: '.env.dev',
    production: '.env.prod',
  };

  const envFile = envFiles[nodeEnv];
  if (envFile) {
    dotenv.config({ path: envFile });
  }

  // Fallback to .env for any missing values
  dotenv.config();

  return nodeEnv;
}
