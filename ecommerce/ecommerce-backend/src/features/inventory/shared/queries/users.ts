import { db } from '../../../../database';
import { users } from '../../../user/shared/user.schema';

export async function findFirstAdminUser() {
  const [user] = await db.select({ id: users.id }).from(users).limit(1);
  return user;
}
