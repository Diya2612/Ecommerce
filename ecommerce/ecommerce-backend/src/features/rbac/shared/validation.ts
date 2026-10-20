import { z } from 'zod';
import { uuidSchema, dateStringSchema, uuidArraySchema, mediumTextSchema } from '../../../utils';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be at most 50 characters')
    .regex(/^[a-z_]+$/, 'Role name must be lowercase with underscores only'),
  description: mediumTextSchema.optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be at most 50 characters')
    .regex(/^[a-z_]+$/, 'Role name must be lowercase with underscores only')
    .optional(),
  description: mediumTextSchema.optional(),
  is_active: z.boolean().optional(),
});

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Permission name must be at least 3 characters')
    .max(100, 'Permission name must be at most 100 characters')
    .regex(
      /^[a-z_]+:[a-z_:]+$/,
      'Permission name must be in format: resource:action (e.g., users:read)',
    ),
  resource: z
    .string()
    .min(1, 'Resource is required')
    .max(50)
    .regex(/^[a-z_]+$/, 'Resource must be lowercase with underscores only'),
  action: z
    .string()
    .min(1, 'Action is required')
    .max(50)
    .regex(/^[a-z_:]+$/, 'Action must be lowercase with underscores/colons only'),
  description: mediumTextSchema.optional(),
});

export const assignPermissionSchema = z.object({
  permission_id: uuidSchema,
});

export const bulkAssignPermissionsSchema = z.object({
  permission_ids: uuidArraySchema(50),
});

export const assignRoleSchema = z.object({
  role_id: uuidSchema,
  expires_at: dateStringSchema.optional(),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
export type AssignPermissionDto = z.infer<typeof assignPermissionSchema>;
export type BulkAssignPermissionsDto = z.infer<typeof bulkAssignPermissionsSchema>;
export type AssignRoleDto = z.infer<typeof assignRoleSchema>;
