// Load env FIRST, before any other imports
import { loadEnv } from '../../src/utils/config/load-env';
const nodeEnv = loadEnv();

import { Pool } from 'pg';
import { logger } from '../../src/utils';
import { getDatabaseUrl, getMaskedDatabaseUrl } from '../../src/utils';

/**
 * Clean database script - DELETE ALL DATA but keep tables
 * This will:
 * 1. Truncate all tables (delete data)
 * 2. Keep table structure intact
 * 3. Reset sequences
 *
 * Usage: ts-node scripts/db-clean.ts
 */
async function cleanDatabase() {
  const connectionString = getDatabaseUrl();

  logger.info(`🧹 Starting database clean for ${nodeEnv} environment...`);
  logger.info(`📍 Database: ${getMaskedDatabaseUrl()}`);

  const pool = new Pool({ connectionString, max: 1 });

  try {
    // Get all table names
    const { rows: tables } = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != '__drizzle_migrations'
      ORDER BY tablename;
    `);

    if (tables.length === 0) {
      logger.info('No tables found to clean.');
      return;
    }

    logger.info(`🗑️  Truncating ${tables.length} tables...`);

    // Truncate all tables in a single transaction
    const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

    await pool.query(`
      TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;
    `);

    logger.info('✅ Database cleaned successfully!');
    logger.info(`📊 Cleaned tables: ${tables.map((t) => t.tablename).join(', ')}`);
  } catch (error) {
    logger.error('❌ Database clean failed:', error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run clean
cleanDatabase();
