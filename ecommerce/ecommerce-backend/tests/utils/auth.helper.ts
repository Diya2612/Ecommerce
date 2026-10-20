import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { dbHelper } from './database.helper';
import { TestUser } from './factories';
import { users } from '../../src/features/user';
import { roles, userRoles, permissions, rolePermissions } from '../../src/features/rbac';
import { eq } from 'drizzle-orm';

export const AuthTestHelper = {
  generateJwtToken(userId: string, email: string, role: string = 'user'): string {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret';
    return jwt.sign({ id: userId, email, role }, secret, { expiresIn: '24h' });
  },

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  },

  async seedRBACData(): Promise<void> {
    const db = dbHelper.getDb();

    await db
      .insert(roles)
      .values([
        { name: 'user', description: 'Standard user', is_system_role: true },
        { name: 'admin', description: 'Administrator', is_system_role: true },
        { name: 'superadmin', description: 'Super administrator', is_system_role: true },
      ])
      .onConflictDoNothing();

    await db
      .insert(permissions)
      .values([
        { name: 'users:read', resource: 'users', action: 'read' },
        { name: 'users:read:own', resource: 'users', action: 'read:own' },
        { name: 'users:create', resource: 'users', action: 'create' },
        { name: 'users:update', resource: 'users', action: 'update' },
        { name: 'users:update:own', resource: 'users', action: 'update:own' },
        { name: 'users:delete', resource: 'users', action: 'delete' },
        { name: 'roles:read', resource: 'roles', action: 'read' },
        { name: 'roles:manage', resource: 'roles', action: 'manage' },
        { name: 'permissions:read', resource: 'permissions', action: 'read' },
        { name: 'permissions:assign', resource: 'permissions', action: 'assign' },
        { name: 'uploads:read', resource: 'uploads', action: 'read' },
        { name: 'uploads:read:own', resource: 'uploads', action: 'read:own' },
        { name: 'uploads:create', resource: 'uploads', action: 'create' },
        { name: 'uploads:delete', resource: 'uploads', action: 'delete' },
        { name: 'uploads:delete:own', resource: 'uploads', action: 'delete:own' },
        { name: 'admin:invitations', resource: 'admin', action: 'invitations' },
        { name: 'admin:system', resource: 'admin', action: 'system' },
        { name: 'audit:read', resource: 'audit', action: 'read' },
        { name: 'chatbot:use', resource: 'chatbot', action: 'use' },
        { name: 'chatbot:documents', resource: 'chatbot', action: 'documents' },
        { name: '*', resource: '*', action: '*' },
      ])
      .onConflictDoNothing();

    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);

    const roleIdMap = new Map(allRoles.map((r) => [r.name, r.id]));
    const permIdMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    const rolePermissionMappings: Record<string, string[]> = {
      user: [
        'users:read:own',
        'users:update:own',
        'uploads:read:own',
        'uploads:create',
        'uploads:delete:own',
        'chatbot:use',
      ],
      admin: [
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'users:read:own',
        'users:update:own',
        'roles:read',
        'permissions:read',
        'uploads:read',
        'uploads:create',
        'uploads:delete',
        'admin:invitations',
        'audit:read',
        'chatbot:use',
        'chatbot:documents',
      ],
      superadmin: ['*'],
    };

    const mappings: { role_id: string; permission_id: string }[] = [];
    for (const [roleName, perms] of Object.entries(rolePermissionMappings)) {
      const roleId = roleIdMap.get(roleName);
      if (!roleId) continue;
      for (const permName of perms) {
        const permId = permIdMap.get(permName);
        if (permId) mappings.push({ role_id: roleId, permission_id: permId });
      }
    }

    if (mappings.length > 0) {
      await db.insert(rolePermissions).values(mappings).onConflictDoNothing();
    }
  },

  async getRoleId(roleName: string): Promise<string | null> {
    const db = dbHelper.getDb();
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    return role?.id ?? null;
  },

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const db = dbHelper.getDb();
    const roleId = await AuthTestHelper.getRoleId(roleName);
    if (!roleId) throw new Error(`Role '${roleName}' not found. Did you call seedRBACData()?`);
    await db.insert(userRoles).values({ user_id: userId, role_id: roleId }).onConflictDoNothing();
  },

  async createTestUser(userData: TestUser): Promise<{
    user: { id: string; email: string; name: string; role: string };
    token: string;
    userId: string;
  }> {
    const db = dbHelper.getDb();
    const hashedPassword = await AuthTestHelper.hashPassword(userData.password);
    const roleName = userData.role || 'user';

    await AuthTestHelper.seedRBACData();

    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        first_name: userData.name || 'Test',
        last_name: 'User',
        password: hashedPassword,
      })
      .returning();

    await AuthTestHelper.assignRoleToUser(user.id, roleName);

    const token = AuthTestHelper.generateJwtToken(user.id, user.email, roleName);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: roleName,
      },
      token,
      userId: user.id,
    };
  },

  async createTestUserWithToken(): Promise<{
    user: { id: string; email: string; name: string; role: string };
    token: string;
    rawPassword: string;
  }> {
    const rawPassword = 'TestPassword123!';
    const userData = {
      email: `testuser.${Date.now()}@example.com`,
      password: rawPassword,
      name: 'Test User',
    };
    const { user, token } = await AuthTestHelper.createTestUser(userData);
    return { user, token, rawPassword };
  },

  async createTestAdminUser(overrides?: Partial<TestUser>): Promise<{
    user: { id: string; email: string; name: string; role: string };
    token: string;
    userId: string;
  }> {
    const userData = {
      email: `admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
      password: 'AdminPass123!',
      name: 'Admin User',
      role: 'admin',
      ...overrides,
    };
    return AuthTestHelper.createTestUser(userData);
  },

  async createTestSuperadminUser(overrides?: Partial<TestUser>): Promise<{
    user: { id: string; email: string; name: string; role: string };
    token: string;
    userId: string;
  }> {
    const userData = {
      email: `superadmin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
      password: 'SuperPass123!',
      name: 'Superadmin User',
      role: 'superadmin',
      ...overrides,
    };
    return AuthTestHelper.createTestUser(userData);
  },

  getAuthHeaders(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
  },

  verifyToken(token: string): {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  } {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret';
    return jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
  },
};
