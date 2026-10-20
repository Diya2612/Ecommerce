/**
 * Admin User Creation Script
 *
 * This script creates an admin user with the following credentials:
 * - Email: admin@gmail.com
 * - Password: 12345678
 * - Name: Admin User
 * - Role: admin
 *
 * Usage:
 * - npm run create-admin
 * - or: npx tsx scripts/create-admin.ts
 *
 * The script will:
 * 1. Create the admin user in Supabase Auth (auth.users)
 * 2. Sync the user to the custom users table
 * 3. Assign admin role via RBAC system
 * 4. If user already exists, ensure they have admin role assigned
 *
 * Prerequisites:
 * - Supabase must be running (local or cloud)
 * - DATABASE_URL environment variable must be set
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 * - RBAC roles must be seeded first (run: npm run db:seed)
 */

import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

// Load env BEFORE any Supabase/DB imports so env vars are available at module init time
const nodeEnv = process.env.NODE_ENV;
if (!nodeEnv) {
  console.error(
    'ERROR: NODE_ENV is not set. Please set it to "development", "production", or "test".',
  );
  process.exit(1);
}

const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.dev';
const envPath = path.resolve(process.cwd(), envFile);
dotenv.config({ path: envPath });
dotenv.config(); // fallback to .env

import { logger } from '../../src/utils';

/**
 * Get database URL with Docker hostname converted to localhost
 * Port mapping: dev=5434, test=5433
 */
function getDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.includes('@postgres:5432')) {
    const hostPort = nodeEnv === 'development' ? 5434 : nodeEnv === 'test' ? 5433 : 5432;
    dbUrl = dbUrl.replace('@postgres:5432', `@localhost:${hostPort}`);
  }

  return dbUrl;
}

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_NAME = 'Admin User';

async function createAdminUser() {
  // Dynamic imports ensure env vars are loaded before Supabase/schema modules initialize
  const { supabase } = await import('../../src/utils/supabase/client');
  const { users } = await import('../../src/features/user/shared/user.schema');
  const { roles, userRoles } = await import('../../src/features/rbac');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const dbUrl = getDatabaseUrl();

  logger.info('🚀 Starting admin user creation script...');
  logger.info(`📍 Environment: ${nodeEnv}`);
  logger.info(`📍 Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);

  // Create database connection
  const pool = new Pool({ connectionString: dbUrl, max: 1 });
  const db = drizzle(pool);

  try {
    // Test connection
    logger.info('🔄 Connecting to database...');
    const client = await pool.connect();
    client.release();
    logger.info('✅ Database connected');

    // Check if admin user already exists in custom users table
    const [existingUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, ADMIN_EMAIL), eq(users.is_deleted, false)))
      .limit(1);

    if (existingUser) {
      logger.info(`ℹ️  Admin user with email ${ADMIN_EMAIL} already exists in users table`);
      logger.info(`   ID: ${existingUser.id}`);
      logger.info(`   Name: ${existingUser.first_name} ${existingUser.last_name}`);

      // Check their roles via RBAC
      const userRole = await db
        .select({ roleName: roles.name, roleId: roles.id })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.role_id, roles.id))
        .where(eq(userRoles.user_id, existingUser.id))
        .limit(1);

      if (userRole.length > 0) {
        logger.info(`   Role: ${userRole[0].roleName}`);

        // Always update passwords to ensure they match the seed value
        logger.info('🔐 Updating passwords...');
        const { error: pwdError } = await supabase.auth.admin.updateUserById(
          existingUser.auth_id!,
          { password: ADMIN_PASSWORD },
        );
        if (pwdError) {
          logger.error('Failed to update Supabase Auth password:', pwdError.message);
        } else {
          logger.info(`✅ Supabase Auth password updated`);
        }

        // Update bcrypt hash in users table
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, existingUser.id));
        logger.info(`✅ users.password (bcrypt hash) updated`);

        logger.info('✅ Admin user is already properly configured!');
        return;
      } else {
        logger.warn('⚠️  No role assigned to this user. Assigning admin role...');

        // Get admin role ID
        const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);

        if (!adminRole) {
          throw new Error(
            'Admin role not found in RBAC system.\n' +
              'Please run: npm run db:seed (to seed RBAC roles and permissions)',
          );
        }

        // Assign admin role
        await db
          .insert(userRoles)
          .values({
            user_id: existingUser.id,
            role_id: adminRole.id,
            assigned_by: existingUser.id, // Self-assigned
          })
          .onConflictDoNothing();

        logger.info('✅ Admin role assigned successfully!');
        logger.info(`   Role: admin`);
        return;
      }
    }

    // Create user in Supabase Auth
    logger.info('📝 Creating admin user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: ADMIN_NAME,
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    let authUserId: string;

    if (authError) {
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('already been registered') ||
        authError.message.includes('unique constraint')
      ) {
        logger.info('ℹ️  User already exists in Supabase Auth. Fetching...');
        const {
          data: { users: existingAuthUsers },
        } = await supabase.auth.admin.listUsers();
        const authUser = (existingAuthUsers as any[]).find((u: any) => u.email === ADMIN_EMAIL);
        if (!authUser) throw new Error('User reported as existing in Auth but could not be found.');
        authUserId = authUser.id;
        // Update password
        await supabase.auth.admin.updateUserById(authUserId, { password: ADMIN_PASSWORD });
        logger.info(`✅ Found existing auth user. Password updated.`);
      } else {
        throw new Error(`Failed to create user in Supabase Auth: ${authError.message}`);
      }
    } else if (authData.user) {
      authUserId = authData.user.id;
      logger.info('✅ Admin user created in Supabase Auth');
      logger.info(`   Auth ID: ${authUserId}`);
    } else {
      throw new Error('No user returned from Supabase Auth');
    }

    // Create user in custom users table
    logger.info('📝 Syncing admin user to users table...');
    const [newUser] = await db
      .insert(users)
      .values({
        auth_id: authUserId,
        email: ADMIN_EMAIL,
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword,
        email_verified: true,
        email_verified_at: new Date(),
        created_by: authUserId,
      })
      .onConflictDoUpdate({
        target: users.auth_id,
        set: {
          is_deleted: false,
          first_name: 'Admin',
          last_name: 'User',
          email_verified: true,
          password: hashedPassword,
        },
      })
      .returning();

    logger.info('✅ Admin user synced to users table');
    logger.info(`   ID: ${newUser.id}`);

    // Get admin role ID from RBAC
    const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);

    if (!adminRole) {
      throw new Error(
        'Admin role not found in RBAC system.\n' +
          'Please run the following commands first:\n' +
          '  1. npm run db:migrate (to create tables)\n' +
          '  2. npm run db:seed (to seed RBAC roles and permissions)',
      );
    }

    // Assign admin role via RBAC
    logger.info('📝 Assigning admin role...');
    await db
      .insert(userRoles)
      .values({
        user_id: newUser.id,
        role_id: adminRole.id,
        assigned_by: newUser.id,
      })
      .onConflictDoNothing();

    logger.info('✅ Admin user created successfully!');
    logger.info(`   ID: ${newUser.id}`);
    logger.info(`   Name: ${newUser.first_name} ${newUser.last_name}`);
    logger.info(`   Email: ${newUser.email}`);
    logger.info(`   Role: admin (assigned via RBAC)`);
    logger.info(`\n📧 You can now login with:`);
    logger.info(`   Email: ${ADMIN_EMAIL}`);
    logger.info(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    logger.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await pool.end();
    logger.info('🔌 Database connection closed');
  }
}

// Run the script
createAdminUser()
  .then(() => {
    logger.info('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script failed:', error.message);
    process.exit(1);
  });
