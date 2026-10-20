import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import { logger } from './src/utils';

const nodeEnv = process.env.NODE_ENV;
if (!nodeEnv) {
  logger.error(
    'ERROR: NODE_ENV is not set. Please set it to "development", "production", or "test".',
  );
  process.exit(1);
}
if (nodeEnv === 'development') {
  dotenv.config({ path: '.env.dev' });
} else if (nodeEnv === 'production') {
  dotenv.config({ path: '.env.prod' });
}
dotenv.config();

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
        'Ensure .env.dev or .env.prod is configured before running Drizzle commands.',
    );
  }
  return url;
}

export default defineConfig({
  // Glob pattern picks up all schema files automatically.
  // No manual additions needed when a new feature schema is created.
  schema: ['./src/features/**/shared/*.schema.ts'],
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  migrations: {
    // Explicit table name avoids collisions with Supabase's own migration tracking
    table: 'drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
