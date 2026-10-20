/** Auth Shared Queries */
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { customerProfiles } from '../../customer/shared/customer-profiles.schema';
import { eq } from 'drizzle-orm';

/** Get user by email. */
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

/** Get user by auth ID. */
export async function getUserByAuthIdQuery(authId: string) {
  const result = await db.select().from(users).where(eq(users.auth_id, authId)).limit(1);
  return result[0] || null;
}

/** Update user email verification status. */
export async function updateUserEmailVerification(
  userId: string,
  emailVerified: boolean,
  emailVerifiedAt: Date | null,
) {
  await db
    .update(users)
    .set({
      email_verified: emailVerified,
      email_verified_at: emailVerifiedAt,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));
}

/** Link user to Supabase Auth. */
export async function linkUserToAuth(
  userId: string,
  authId: string,
  emailVerified: boolean,
  emailVerifiedAt: Date | null,
) {
  await db
    .update(users)
    .set({
      auth_id: authId,
      email_verified: emailVerified,
      email_verified_at: emailVerifiedAt,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));
}

/** Insert new user. */
export async function insertNewUser(userData: any) {
  const [newUser] = await db.insert(users).values(userData).returning();
  return newUser;
}

/** Insert new customer profile. */
export async function insertCustomerProfile(profileData: any) {
  await db.insert(customerProfiles).values(profileData);
}
