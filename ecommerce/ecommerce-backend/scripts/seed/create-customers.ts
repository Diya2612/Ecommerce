/**
 * Customer Seeding Script
 *
 * Creates 20 test customers with full profiles, addresses, and assigned roles.
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { logger } from '../../src/utils';

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
} else {
  dotenv.config();
}

/**
 * Get database URL with Docker hostname converted to localhost
 */
function getDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.includes('@postgres:5432')) {
    const hostPort = nodeEnv === 'development' ? 5434 : nodeEnv === 'test' ? 5433 : 5432;
    dbUrl = dbUrl.replace('@postgres:5432', `@localhost:${hostPort}`);
  }

  return dbUrl;
}

// Import schemas
import { users } from '../../src/features/user/shared/user.schema';
import { customerProfiles } from '../../src/features/customer/shared/customer-profiles.schema';
import { userAddresses } from '../../src/features/address/shared/addresses.schema';
import { roles, userRoles } from '../../src/features/rbac';

const CUSTOMERS_COUNT = 20;

const SURNAMES = [
  'Sharma',
  'Patil',
  'Deshmukh',
  'Joshi',
  'Kulkarni',
  'Pawar',
  'More',
  'Gayakwad',
  ' जाधव ',
  'Marathe',
  'Dubey',
  'Singh',
  'Verma',
  'Khan',
  'Kapoor',
  'Mehta',
  'Shah',
  'Nair',
  'Reddy',
  'Gupta',
];
const FIRST_NAMES_MALE = [
  'Rahul',
  'Amit',
  'Sanjay',
  'Pritam',
  'Aniket',
  'Sagar',
  'Akash',
  'Vivek',
  'Rohan',
  'Prasad',
];
const FIRST_NAMES_FEMALE = [
  'Priya',
  'Sneha',
  'Anjali',
  'Pooja',
  'Neha',
  'Kavita',
  'Shital',
  'Deepa',
  'Ritu',
  'Swati',
];
const CITIES = [
  'Mumbai',
  'Pune',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Solapur',
  'Amravati',
  'Nanded',
  'Kolhapur',
  'Akola',
];

async function seedCustomers() {
  const dbUrl = getDatabaseUrl();

  logger.info('🚀 Starting customer seeding script...');
  logger.info(`📍 Environment: ${nodeEnv}`);

  const pool = new Pool({ connectionString: dbUrl, max: 1 });
  const db = drizzle(pool);

  try {
    logger.info('🔄 Connecting to database...');
    const client = await pool.connect();
    client.release();
    logger.info('✅ Database connected');

    // Get an admin user for created_by reference
    const [adminUserRole] = await db
      .select({ user_id: userRoles.user_id })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(and(eq(roles.name, 'admin'), eq(roles.is_deleted, false)))
      .limit(1);

    const adminId = adminUserRole?.user_id || null;
    if (!adminId) {
      logger.warn('⚠️ No admin user found. created_by fields will be null.');
    } else {
      logger.info(`👤 Using admin ID ${adminId} as creator reference`);
    }

    // Get the 'user' role ID
    const [userRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, 'user'))
      .limit(1);

    if (!userRole) {
      throw new Error("Role 'user' not found. Please run RBAC seed first: npm run db:seed");
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);

    for (let i = 1; i <= CUSTOMERS_COUNT; i++) {
      const isMale = Math.random() > 0.5;
      const firstName = isMale
        ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
        : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
      const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

      const city = CITIES[Math.floor(Math.random() * CITIES.length)];

      logger.info(`📝 Seeding customer ${i}: ${firstName} ${lastName} (${email})`);

      // 1. Create User
      const [newUser] = await db
        .insert(users)
        .values({
          first_name: firstName,
          last_name: lastName,
          display_id: `CUST${1000 + i}`,
          email: email,
          password: hashedPassword,
          email_verified: true,
          email_verified_at: new Date(),
          phone_number: `+919${Math.floor(Math.random() * 900000000 + 100000000)}`,
          gender: isMale ? 'male' : 'female',
          profile_image_url: `https://picsum.photos/seed/${email}/200`,
          date_of_birth: new Date(
            1980 + Math.floor(Math.random() * 30),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28),
          )
            .toISOString()
            .split('T')[0],
          created_by: adminId,
          tags: ['customer', ['new', 'regular', 'vip'][Math.floor(Math.random() * 3)]],
        })
        .returning();

      // 2. Create Customer Profile
      await db.insert(customerProfiles).values({
        user_id: newUser.id,
        segments: [['new'], ['regular'], ['vip']][Math.floor(Math.random() * 3)],
        account_status: 'active',
        marketing_opt_in: Math.random() > 0.5,
        email_opt_in: true,
        push_notifications_opt_in: true,
        risk_profile: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        notes: `Seeded test customer ${i}`,
      });

      // 3. Create Address
      await db.insert(userAddresses).values({
        user_id: newUser.id,
        address_type: 'home',
        recipient_name: `${firstName} ${lastName}`,
        phone_number: newUser.phone_number,
        address_line1: `${100 + i}, ${firstName} Society`,
        city: city,
        state_province: 'Maharashtra',
        postal_code: `41${Math.floor(Math.random() * 9000 + 1000)}`,
        country: 'India',
        country_code: 'IN',
        is_default_billing: true,
        is_default_shipping: true,
      });

      // 4. Assign Role
      await db.insert(userRoles).values({
        user_id: newUser.id,
        role_id: userRole.id,
        assigned_by: adminId || newUser.id,
      });

      logger.info(`✅ Seeded customer ${i} successfully`);
    }

    logger.info('\n🎉 All customers seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding customers:', error);
    throw error;
  } finally {
    await pool.end();
    logger.info('🔌 Database connection closed');
  }
}

seedCustomers()
  .then(() => {
    logger.info('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script failed:', error.message);
    process.exit(1);
  });
