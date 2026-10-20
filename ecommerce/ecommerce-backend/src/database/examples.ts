/**
 * Database Usage Examples
 * Demonstrates best practices for using the database module
 */

import { db, pool } from './drizzle';
import { checkDatabaseHealth } from './health';
import { users } from '../features/user';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { logger } from '../utils';

// ============================================
// 1. BASIC QUERIES
// ============================================

/**
 * NOTE: Basic CRUD operations are implemented in feature-specific query files:
 * - createUser, findUserByEmail, updateUser, deleteUser → src/features/user/user.queries.ts
 * - Similar patterns apply to other features
 */

/**
 * Search users with pagination (advanced query example)
 */
async function searchUsers(search: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(users)
    .where(
      and(
        or(like(users.first_name, `%${search}%`), like(users.email, `%${search}%`)),
        eq(users.is_deleted, false),
      ),
    )
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset(offset);

  return results;
}

// ============================================
// 2. MONITORING & HEALTH
// ============================================

/**
 * Check database health
 */
async function monitorDatabase() {
  // Get pool statistics
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
  logger.info(`Pool Stats: ${JSON.stringify(stats)}`);

  // Run health check
  const health = await checkDatabaseHealth();
  logger.info(`Health Check: ${JSON.stringify(health)}`);

  return { stats, health };
}

/**
 * Monitor pool usage over time
 */
function setupPoolMonitoring() {
  setInterval(() => {
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
    if (stats.waiting > 0) {
      logger.warn(`Database pool has waiting connections: ${JSON.stringify(stats)}`);
    }
  }, 30000); // Check every 30 seconds
}

// ============================================
// 5. RAW SQL (when needed)
// ============================================

import { sql } from 'drizzle-orm';

/**
 * Execute raw SQL for complex queries
 */
async function complexQuery() {
  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.first_name,
      COUNT(a.id) as address_count
    FROM users u
    LEFT JOIN user_addresses a ON u.id = a.user_id AND a.is_deleted = false
    WHERE u.is_deleted = false
    GROUP BY u.id, u.first_name
    LIMIT 10
  `);

  return result.rows;
}

// ============================================
// EXPORT EXAMPLES
// ============================================

export {
  searchUsers,
  monitorDatabase,
  setupPoolMonitoring,
  complexQuery,
};
