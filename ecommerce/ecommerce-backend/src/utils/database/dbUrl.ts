/**
 * Database URL Configuration Utility
 * Converts Docker container hostnames to localhost for scripts running on the host.
 */

/**
 * Environment port mappings for host execution.
 */
const HOST_PORTS: Record<string, number> = {
  development: 5434,
  test: 5433,
  production: 5432, // Production uses external DB, port doesn't matter
};

/**
 * Retrieves the appropriate DATABASE_URL based on the environment and execution context.
 */
export function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    throw new Error(
      'NODE_ENV is not set. Please set it to "development", "production", or "test".',
    );
  }
  const isRunningInDocker = process.env.RUNNING_IN_DOCKER === 'true';
  let dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // If running on host (not in Docker), convert container hostname to localhost
  if (!isRunningInDocker && dbUrl.includes('@postgres:5432')) {
    const hostPort = HOST_PORTS[nodeEnv] || 5432;
    dbUrl = dbUrl.replace('@postgres:5432', `@localhost:${hostPort}`);
  }

  return dbUrl;
}

/**
 * Retrieves the database URL with the password masked.
 */
export function getMaskedDatabaseUrl(): string {
  return getDatabaseUrl().replace(/:[^:@]+@/, ':****@');
}
