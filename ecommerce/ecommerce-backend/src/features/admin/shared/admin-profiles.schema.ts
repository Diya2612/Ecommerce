/**
 * Admin Profiles Schema
 * Personnel data for staff and administrative organizational roles.
 */

import { pgTable, varchar, boolean, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';

// Admin Profiles Table
/**
 * Admin profiles for staff/administrative users.
 */
export const adminProfiles = pgTable(
  'admin_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .unique()
      .notNull(),

    // Employee info
    employee_number: varchar('employee_number', { length: 50 }).unique(), // Company employee ID
    department: varchar('department', { length: 100 }), // Sales, Support, Inventory, Finance
    job_title: varchar('job_title', { length: 100 }), // Manager, Executive, etc.

    // Status
    is_active: boolean('is_active').default(true).notNull(),

    // Audit fields
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
  },
  (table) => ({
    // Department filtering
    departmentIdx: index('admin_profiles_department_idx').on(table.department, table.is_active),
    // Active admins
    isActiveIdx: index('admin_profiles_is_active_idx').on(table.is_active, table.is_deleted),
    // Employee number lookup
    employeeNumberIdx: index('admin_profiles_employee_number_idx').on(table.employee_number),
  }),
);

// Export types for TypeScript
export type AdminProfile = typeof adminProfiles.$inferSelect;
export type NewAdminProfile = typeof adminProfiles.$inferInsert;
