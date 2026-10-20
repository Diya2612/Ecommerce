import { eq, and, desc, asc, count } from 'drizzle-orm';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { adminProfiles } from './admin-profiles.schema';
import { IAdminUser, IAdminFilters } from './interface';
import { emailOtps } from '../../user/shared/email-otp.schema';
import { buildSearchConditions } from '../../../utils/database/search-utils';

// CRUD operations

/**
 * Find admin by ID with profile.
 */
export const baseFindAdminById = async (id: string): Promise<IAdminUser | undefined> => {
  const result = await db
    .select({
      user: users,
      profile: adminProfiles,
    })
    .from(users)
    .leftJoin(adminProfiles, eq(users.id, adminProfiles.user_id))
    .where(eq(users.id, id))
    .limit(1);

  if (!result.length) return undefined;

  const { user, profile } = result[0];
  return {
    ...user,
    profile: profile || undefined,
  };
};

/**
 * Create Admin Profile.
 */
export const baseCreateAdminProfile = async (values: any) => {
  return db.insert(adminProfiles).values(values).returning();
};

/**
 * Update Admin Profile.
 */
export const baseUpdateAdminProfile = async (userId: string, values: any) => {
  return db.update(adminProfiles).set(values).where(eq(adminProfiles.user_id, userId)).returning();
};

/**
 * Soft delete an admin profile.
 */
export const baseSoftDeleteAdminProfile = async (id: string, operatorId: string) => {
  return db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ is_deleted: true, deleted_by: operatorId, deleted_at: new Date() })
      .where(eq(users.id, id));

    await tx
      .update(adminProfiles)
      .set({ is_deleted: true, is_active: false, updated_at: new Date() })
      .where(eq(adminProfiles.user_id, id));
  });
};

/**
 * Find user by email.
 */
export const baseFindUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0];
};

/**
 * Find admin profile by employee ID
 */
export const baseFindAdminByEmployeeNumber = async (employeeNumber: string) => {
  const result = await db
    .select()
    .from(adminProfiles)
    .where(eq(adminProfiles.employee_number, employeeNumber))
    .limit(1);
  return result[0];
};

/**
 * Get all admins with filtering and pagination.
 */
export const baseGetAllAdmins = async (filters: IAdminFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: any[] = [eq(users.is_deleted, false)];

  if (filters.search) {
    const searchCondition = buildSearchConditions(filters.search, {
      fuzzyColumns: [users.first_name, users.last_name, adminProfiles.job_title],
      exactColumns: [users.email, adminProfiles.employee_number],
    });
    if (searchCondition) conditions.push(searchCondition);
  }

  if (filters.is_active && filters.is_active !== 'all') {
    conditions.push(eq(adminProfiles.is_active, filters.is_active === 'true'));
  }

  const baseQuery = db
    .select({
      user: users,
      profile: adminProfiles,
    })
    .from(users)
    .innerJoin(adminProfiles, eq(users.id, adminProfiles.user_id));

  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .innerJoin(adminProfiles, eq(users.id, adminProfiles.user_id))
    .where(and(...conditions));

  let sortColumn;
  if (filters.sort_by === 'name') {
    sortColumn = users.first_name;
  } else if (filters.sort_by === 'department') {
    sortColumn = adminProfiles.department;
  } else {
    sortColumn = users.created_at;
  }

  const data = await baseQuery
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(filters.sort_order === 'asc' ? asc(sortColumn) : desc(sortColumn));

  return {
    admins: data.map(({ user, profile }) => ({ ...user, profile })),
    total: totalResult.count,
  };
};

/**
 * Find email verification OTP.
 */
export const baseFindEmailVerificationOtp = async (email: string) => {
  const result = await db
    .select()
    .from(emailOtps)
    .where(
      and(eq(emailOtps.email, email.toLowerCase()), eq(emailOtps.purpose, 'email_verification')),
    )
    .limit(1);
  return result[0];
};

/**
 * Creation transaction for a new admin.
 */
export const baseCreateAdminTransaction = async (
  userData: typeof users.$inferInsert,
  profileData: Omit<typeof adminProfiles.$inferInsert, 'user_id'>,
): Promise<IAdminUser> => {
  return await db.transaction(async (tx): Promise<IAdminUser> => {
    const [newUser] = await tx.insert(users).values(userData).returning();

    if (!newUser) throw new Error('Failed to create user');

    const [newProfile] = await tx
      .insert(adminProfiles)
      .values({
        ...profileData,
        user_id: newUser.id,
      })
      .returning();

    if (!newProfile) throw new Error('Failed to create admin profile');

    return { ...newUser, profile: newProfile } as IAdminUser;
  });
};

/**
 * Update transaction for an admin.
 */
export const baseUpdateAdminTransaction = async (
  id: string,
  userUpdates: Record<string, any>,
  profileUpdates: Record<string, any>,
) => {
  await db.transaction(async (tx) => {
    if (Object.keys(userUpdates).length > 1) {
      // 1 accounts for updated_at
      await tx.update(users).set(userUpdates).where(eq(users.id, id));
    }

    if (Object.keys(profileUpdates).length > 1) {
      // 1 accounts for updated_at
      await tx.update(adminProfiles).set(profileUpdates).where(eq(adminProfiles.user_id, id));
    }
  });
};

/**
 * Checks for super admin deletion constraints.
 */
export const baseCheckSuperAdminDeletionConstraints = async (userId: string) => {
  const { userRoles } = await import('../../rbac/shared/user-roles.schema');
  const { roles } = await import('../../rbac/shared/roles.schema');

  const userRolesList = await db
    .select({ role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(eq(userRoles.user_id, userId));

  const isSuperAdmin = userRolesList.some((ur) => ur.role.name === 'superadmin');

  if (!isSuperAdmin) return true; // Safe to delete if not superadmin

  const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'superadmin')).limit(1);

  if (superAdminRole.length === 0) return true; // Shouldn't happen, but safe fallback

  const otherSuperAdmins = await db
    .select({ count: count() })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.user_id, users.id))
    .innerJoin(adminProfiles, eq(users.id, adminProfiles.user_id))
    .where(
      and(
        eq(userRoles.role_id, superAdminRole[0].id),
        eq(users.is_deleted, false),
        eq(adminProfiles.is_deleted, false),
        eq(adminProfiles.is_active, true),
      ),
    );

  const totalSuperAdmins = otherSuperAdmins[0].count;
  return totalSuperAdmins > 1; // True = Safe to delete, False = Cannot delete
};
