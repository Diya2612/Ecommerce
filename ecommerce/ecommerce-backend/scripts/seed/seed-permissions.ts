import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { logger } from '../../src/utils';

async function seedPermissions() {
  const { db } = await import('../../src/database');
  const { permissions } = await import('../../src/features/rbac/shared/permissions.schema');

  const rows = [
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'View all user profiles',
    },
    {
      name: 'users:read:own',
      resource: 'users',
      action: 'read:own',
      description: 'View own profile',
    },
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update any user' },
    {
      name: 'users:update:own',
      resource: 'users',
      action: 'update:own',
      description: 'Update own profile',
    },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'roles:read', resource: 'roles', action: 'read', description: 'View all roles' },
    {
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      description: 'Create, update, delete roles',
    },
    {
      name: 'permissions:read',
      resource: 'permissions',
      action: 'read',
      description: 'View all permissions',
    },
    {
      name: 'permissions:assign',
      resource: 'permissions',
      action: 'assign',
      description: 'Assign permissions to roles',
    },
    { name: 'uploads:read', resource: 'uploads', action: 'read', description: 'View all uploads' },
    {
      name: 'uploads:read:own',
      resource: 'uploads',
      action: 'read:own',
      description: 'View own uploads',
    },
    { name: 'uploads:create', resource: 'uploads', action: 'create', description: 'Upload files' },
    {
      name: 'uploads:delete',
      resource: 'uploads',
      action: 'delete',
      description: 'Delete any upload',
    },
    {
      name: 'uploads:delete:own',
      resource: 'uploads',
      action: 'delete:own',
      description: 'Delete own uploads',
    },
    {
      name: 'admin:invitations',
      resource: 'admin',
      action: 'invitations',
      description: 'Send user invitations',
    },
    {
      name: 'admin:system',
      resource: 'admin',
      action: 'system',
      description: 'System administration',
    },
    {
      name: 'chatbot:use',
      resource: 'chatbot',
      action: 'use',
      description: 'Use chatbot features',
    },
    {
      name: 'chatbot:documents',
      resource: 'chatbot',
      action: 'documents',
      description: 'Manage chatbot documents',
    },
    {
      name: 'products:create',
      resource: 'products',
      action: 'create',
      description: 'Create new products',
    },
    {
      name: 'products:read',
      resource: 'products',
      action: 'read',
      description: 'View all products (including drafts)',
    },
    {
      name: 'products:update',
      resource: 'products',
      action: 'update',
      description: 'Update existing products',
    },
    {
      name: 'products:delete',
      resource: 'products',
      action: 'delete',
      description: 'Delete products',
    },
    { name: 'tags:create', resource: 'tags', action: 'create', description: 'Create new tags' },
    { name: 'tags:read', resource: 'tags', action: 'read', description: 'View all tags' },
    {
      name: 'tags:update',
      resource: 'tags',
      action: 'update',
      description: 'Update existing tags',
    },
    { name: 'tags:delete', resource: 'tags', action: 'delete', description: 'Delete tags' },
    { name: 'tiers:create', resource: 'tiers', action: 'create', description: 'Create new tiers' },
    { name: 'tiers:read', resource: 'tiers', action: 'read', description: 'View all tiers' },
    {
      name: 'tiers:update',
      resource: 'tiers',
      action: 'update',
      description: 'Update existing tiers',
    },
    { name: 'tiers:delete', resource: 'tiers', action: 'delete', description: 'Delete tiers' },
    { name: 'blogs:create', resource: 'blogs', action: 'create', description: 'Create new blogs' },
    { name: 'blogs:read', resource: 'blogs', action: 'read', description: 'View all blogs' },
    {
      name: 'blogs:update',
      resource: 'blogs',
      action: 'update',
      description: 'Update existing blogs',
    },
    { name: 'blogs:delete', resource: 'blogs', action: 'delete', description: 'Delete blogs' },
    { name: '*', resource: '*', action: '*', description: 'Full system access (wildcard)' },
  ];

  logger.info(`Seeding ${rows.length} permissions...`);

  const result = await db.insert(permissions).values(rows).onConflictDoNothing().returning();

  logger.info(
    `✅ Inserted ${result.length} new permissions (${rows.length - result.length} already existed)`,
  );
}

seedPermissions()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
