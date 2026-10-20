# Notifications API Development Guide

## Overview
Complete backend implementation guide for Notifications API to support admin dashboard notification management, user notifications, and real-time messaging system.

## Database Schema

### Notifications Table
```sql
-- notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'system')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_status BOOLEAN DEFAULT FALSE,
    action_url TEXT, -- Optional URL for clickable notifications
    action_text VARCHAR(100), -- Optional action button text
    metadata JSONB DEFAULT '{}', -- Additional data for rich notifications
    is_global BOOLEAN DEFAULT FALSE, -- True for admin broadcasts
    expires_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- notification_templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    is_active BOOLEAN DEFAULT TRUE,
    variables JSONB DEFAULT '[]', -- List of template variables
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- notification_preferences table (user notification settings)
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_types JSONB DEFAULT '{}', -- Per-type preferences
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
```

## Drizzle Schema Implementation

```typescript
// src/features/notifications/shared/notifications.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';

// Enums
export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'warning', 
  'error',
  'success',
  'system'
]);

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'normal',
  'high',
  'urgent'
]);

// Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    type: notificationTypeEnum('type').notNull(),
    priority: notificationPriorityEnum('priority').default('normal'),
    read_status: boolean('read_status').default(false),
    action_url: text('action_url'),
    action_text: varchar('action_text', { length: 100 }),
    metadata: jsonb('metadata').default({}),
    is_global: boolean('is_global').default(false),
    expires_at: timestamp('expires_at'),
    created_by: uuid('created_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('notifications_user_id_idx').on(table.user_id),
    readStatusIdx: index('notifications_read_status_idx').on(table.read_status),
    createdAtIdx: index('notifications_created_at_idx').on(table.created_at),
    typeIdx: index('notifications_type_idx').on(table.type),
    expiresAtIdx: index('notifications_expires_at_idx').on(table.expires_at),
  })
);

// Notification Templates Table
export const notificationTemplates = pgTable(
  'notification_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    title_template: varchar('title_template', { length: 255 }).notNull(),
    message_template: text('message_template').notNull(),
    type: notificationTypeEnum('type').notNull(),
    priority: notificationPriorityEnum('priority').default('normal'),
    is_active: boolean('is_active').default(true),
    variables: jsonb('variables').default([]),
    created_by: uuid('created_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }
);

// User Notification Preferences
export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    email_notifications: boolean('email_notifications').default(true),
    push_notifications: boolean('push_notifications').default(true),
    sms_notifications: boolean('sms_notifications').default(false),
    notification_types: jsonb('notification_types').default({}),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userUniqueIdx: unique('notification_preferences_user_id_unique').on(table.user_id),
  })
);

// TypeScript types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert;
```

## Interface Types

```typescript
// src/features/notifications/shared/interface.ts
export interface INotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read_status: boolean;
  action_url?: string;
  action_text?: string;
  metadata: Record<string, any>;
  is_global: boolean;
  expires_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface INotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  variables: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface INotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: Record<string, boolean>;
  created_at: Date;
  updated_at: Date;
}

// Request/Response interfaces
export interface CreateNotificationRequest {
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  is_global?: boolean;
  expires_at?: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  user_segment?: 'all' | 'admins' | 'customers';
  expires_at?: string;
}

export interface NotificationFilters {
  user_id?: string;
  type?: string;
  read_status?: boolean;
  priority?: string;
  from_date?: string;
  to_date?: string;
  is_global?: boolean;
}
```

## Service Implementation

```typescript
// src/features/notifications/services/notifications.service.ts
import { eq, and, desc, count, gte, lte, isNull, or } from 'drizzle-orm';
import { db } from '../../../database';
import { notifications, notificationTemplates, notificationPreferences } from '../shared/notifications.schema';
import { users } from '../../user/shared/user.schema';
import { 
  CreateNotificationRequest,
  UpdateNotificationRequest,
  BroadcastNotificationRequest,
  NotificationFilters,
  INotification
} from '../shared/interface';

export class NotificationsService {
  // Create single notification
  async createNotification(data: CreateNotificationRequest, createdBy?: string): Promise<INotification> {
    const [notification] = await db.insert(notifications).values({
      ...data,
      created_by: createdBy,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
    }).returning();

    return notification as INotification;
  }

  // Create broadcast notification to all users or specific segment
  async broadcastNotification(data: BroadcastNotificationRequest, createdBy: string): Promise<void> {
    if (data.user_segment === 'all') {
      // Create global notification
      await this.createNotification({
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        action_url: data.action_url,
        action_text: data.action_text,
        is_global: true,
        expires_at: data.expires_at,
      }, createdBy);
    } else {
      // Get users based on segment
      const targetUsers = await this.getUsersBySegment(data.user_segment);
      
      // Create individual notifications
      const notificationData = targetUsers.map(user => ({
        user_id: user.id,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'normal',
        action_url: data.action_url,
        action_text: data.action_text,
        is_global: false,
        created_by: createdBy,
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      }));

      await db.insert(notifications).values(notificationData);
    }
  }

  // Get notifications for a user (including global ones)
  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: INotification[], total: number }> {
    const offset = (page - 1) * limit;
    
    const conditions = [
      or(
        eq(notifications.user_id, userId),
        eq(notifications.is_global, true)
      ),
      // Exclude expired notifications
      or(
        isNull(notifications.expires_at),
        gte(notifications.expires_at, new Date())
      )
    ];

    // Apply filters
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type as any));
    }
    if (filters.read_status !== undefined) {
      conditions.push(eq(notifications.read_status, filters.read_status));
    }
    if (filters.priority) {
      conditions.push(eq(notifications.priority, filters.priority as any));
    }
    if (filters.from_date) {
      conditions.push(gte(notifications.created_at, new Date(filters.from_date)));
    }
    if (filters.to_date) {
      conditions.push(lte(notifications.created_at, new Date(filters.to_date)));
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(notifications)
      .where(and(...conditions));

    // Get notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    return {
      notifications: userNotifications as INotification[],
      total: total || 0
    };
  }

  // Get all notifications (admin)
  async getAllNotifications(
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: INotification[], total: number }> {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    // Apply filters
    if (filters.user_id) {
      conditions.push(eq(notifications.user_id, filters.user_id));
    }
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type as any));
    }
    if (filters.read_status !== undefined) {
      conditions.push(eq(notifications.read_status, filters.read_status));
    }
    if (filters.priority) {
      conditions.push(eq(notifications.priority, filters.priority as any));
    }
    if (filters.is_global !== undefined) {
      conditions.push(eq(notifications.is_global, filters.is_global));
    }
    if (filters.from_date) {
      conditions.push(gte(notifications.created_at, new Date(filters.from_date)));
    }
    if (filters.to_date) {
      conditions.push(lte(notifications.created_at, new Date(filters.to_date)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(notifications)
      .where(whereClause);

    // Get notifications with user info
    const allNotifications = await db
      .select({
        notification: notifications,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.user_id, users.id))
      .where(whereClause)
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    return {
      notifications: allNotifications.map(item => ({
        ...item.notification,
        user: item.user
      })) as any[],
      total: total || 0
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        read_status: true,
        updated_at: new Date()
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          or(
            eq(notifications.user_id, userId),
            eq(notifications.is_global, true)
          )
        )
      );
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        read_status: false,
        updated_at: new Date()
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          or(
            eq(notifications.user_id, userId),
            eq(notifications.is_global, true)
          )
        )
      );
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        read_status: true,
        updated_at: new Date()
      })
      .where(
        and(
          eq(notifications.read_status, false),
          or(
            eq(notifications.user_id, userId),
            eq(notifications.is_global, true)
          )
        )
      );
  }

  // Update notification
  async updateNotification(id: string, data: UpdateNotificationRequest): Promise<INotification> {
    const [updated] = await db
      .update(notifications)
      .set({
        ...data,
        updated_at: new Date(),
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
      })
      .where(eq(notifications.id, id))
      .returning();

    return updated as INotification;
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
  }

  // Get notification statistics
  async getNotificationStats(userId?: string): Promise<any> {
    if (userId) {
      // User-specific stats
      const [stats] = await db
        .select({
          total: count(),
          unread: count(),
        })
        .from(notifications)
        .where(
          and(
            or(
              eq(notifications.user_id, userId),
              eq(notifications.is_global, true)
            ),
            or(
              isNull(notifications.expires_at),
              gte(notifications.expires_at, new Date())
            )
          )
        );

      return stats;
    } else {
      // Admin stats
      const [stats] = await db
        .select({
          total: count(),
        })
        .from(notifications);

      return stats;
    }
  }

  // Helper: Get users by segment
  private async getUsersBySegment(segment: string) {
    // Implementation depends on your user roles/segmentation logic
    switch (segment) {
      case 'admins':
        // Get admin users - implement based on your RBAC system
        return await db.select().from(users).limit(1000); // placeholder
      case 'customers':
        // Get customer users
        return await db.select().from(users).limit(1000); // placeholder  
      default:
        return [];
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    await db
      .delete(notifications)
      .where(
        and(
          lte(notifications.expires_at, new Date()),
          eq(notifications.read_status, true)
        )
      );
  }
}

export const notificationsService = new NotificationsService();
```

## API Controllers

```typescript
// src/features/notifications/controllers/notifications.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { notificationsService } from '../services/notifications.service';
import { ResponseFormatter } from '../../../utils';

// Validation schemas
const createNotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success', 'system']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  action_url: z.string().url().optional(),
  action_text: z.string().max(100).optional(),
  is_global: z.boolean().default(false),
  expires_at: z.string().datetime().optional(),
});

const broadcastNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success', 'system']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  action_url: z.string().url().optional(),
  action_text: z.string().max(100).optional(),
  user_segment: z.enum(['all', 'admins', 'customers']).default('all'),
  expires_at: z.string().datetime().optional(),
});

export class NotificationsController {
  // Create notification (Admin only)
  async createNotification(req: RequestWithUser, res: Response): Promise<void> {
    const data = createNotificationSchema.parse(req.body);
    const createdBy = req.userId;

    const notification = await notificationsService.createNotification(data, createdBy);

    ResponseFormatter.success(res, notification, 'Notification created successfully', 201);
  }

  // Broadcast notification (Admin only)
  async broadcastNotification(req: RequestWithUser, res: Response): Promise<void> {
    const data = broadcastNotificationSchema.parse(req.body);
    const createdBy = req.userId!;

    await notificationsService.broadcastNotification(data, createdBy);

    ResponseFormatter.success(res, null, 'Notification broadcasted successfully');
  }

  // Get user notifications
  async getUserNotifications(req: RequestWithUser, res: Response): Promise<void> {
    const userId = req.params.userId || req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
      type: req.query.type as string,
      read_status: req.query.read_status ? req.query.read_status === 'true' : undefined,
      priority: req.query.priority as string,
      from_date: req.query.from_date as string,
      to_date: req.query.to_date as string,
    };

    const result = await notificationsService.getUserNotifications(userId, filters, page, limit);

    ResponseFormatter.paginated(res, result.notifications, {
      page,
      limit,
      total: result.total
    }, 'Notifications retrieved successfully');
  }

  // Get all notifications (Admin only)
  async getAllNotifications(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
      user_id: req.query.user_id as string,
      type: req.query.type as string,
      read_status: req.query.read_status ? req.query.read_status === 'true' : undefined,
      priority: req.query.priority as string,
      is_global: req.query.is_global ? req.query.is_global === 'true' : undefined,
      from_date: req.query.from_date as string,
      to_date: req.query.to_date as string,
    };

    const result = await notificationsService.getAllNotifications(filters, page, limit);

    ResponseFormatter.paginated(res, result.notifications, {
      page,
      limit,
      total: result.total
    }, 'All notifications retrieved successfully');
  }

  // Mark as read
  async markAsRead(req: RequestWithUser, res: Response): Promise<void> {
    const notificationId = req.params.id;
    const userId = req.userId!;

    await notificationsService.markAsRead(notificationId, userId);

    ResponseFormatter.success(res, null, 'Notification marked as read');
  }

  // Mark as unread
  async markAsUnread(req: RequestWithUser, res: Response): Promise<void> {
    const notificationId = req.params.id;
    const userId = req.userId!;

    await notificationsService.markAsUnread(notificationId, userId);

    ResponseFormatter.success(res, null, 'Notification marked as unread');
  }

  // Mark all as read
  async markAllAsRead(req: RequestWithUser, res: Response): Promise<void> {
    const userId = req.userId!;

    await notificationsService.markAllAsRead(userId);

    ResponseFormatter.success(res, null, 'All notifications marked as read');
  }

  // Update notification (Admin only)
  async updateNotification(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const data = req.body; // Add validation schema

    const notification = await notificationsService.updateNotification(id, data);

    ResponseFormatter.success(res, notification, 'Notification updated successfully');
  }

  // Delete notification (Admin only)
  async deleteNotification(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    await notificationsService.deleteNotification(id);

    ResponseFormatter.success(res, null, 'Notification deleted successfully');
  }

  // Get notification statistics
  async getStats(req: RequestWithUser, res: Response): Promise<void> {
    const userId = req.query.user_id as string || req.userId;

    const stats = await notificationsService.getNotificationStats(userId);

    ResponseFormatter.success(res, stats, 'Notification statistics retrieved successfully');
  }
}
```

## API Routes

```typescript
// src/features/notifications/routes/notifications.routes.ts
import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { requireAuth, requirePermission } from '../../../middlewares';
import { validationMiddleware } from '../../../middlewares';

const router = Router();
const controller = new NotificationsController();

// User notification routes
router.get('/user/:userId', requireAuth, controller.getUserNotifications);
router.get('/me', requireAuth, controller.getUserNotifications);
router.put('/:id/read', requireAuth, controller.markAsRead);
router.put('/:id/unread', requireAuth, controller.markAsUnread);
router.put('/mark-all-read', requireAuth, controller.markAllAsRead);
router.get('/stats', requireAuth, controller.getStats);

// Admin notification routes
router.post('/', requireAuth, requirePermission('notifications:create'), controller.createNotification);
router.post('/broadcast', requireAuth, requirePermission('notifications:broadcast'), controller.broadcastNotification);
router.get('/', requireAuth, requirePermission('notifications:read'), controller.getAllNotifications);
router.put('/:id', requireAuth, requirePermission('notifications:update'), controller.updateNotification);
router.delete('/:id', requireAuth, requirePermission('notifications:delete'), controller.deleteNotification);

export default router;
```

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add to your migration file
-- Run: npm run db:migrate

-- Create notifications tables (use the SQL schema above)
```

### Step 2: File Structure
```bash
# Create the feature structure
mkdir -p src/features/notifications/{controllers,services,routes,shared}

# Create files:
# - src/features/notifications/shared/notifications.schema.ts
# - src/features/notifications/shared/interface.ts
# - src/features/notifications/services/notifications.service.ts
# - src/features/notifications/controllers/notifications.controller.ts
# - src/features/notifications/routes/notifications.routes.ts
# - src/features/notifications/index.ts
```

### Step 3: Register Routes
```typescript
// src/features/notifications/index.ts
import { Router } from 'express';
import notificationsRoutes from './routes/notifications.routes';

const router = Router();

router.use('/notifications', notificationsRoutes);

export default router;
```

### Step 4: Add to Main App
```typescript
// src/app.ts - add notifications routes
import notificationsRoutes from './features/notifications';

app.use('/api', notificationsRoutes);
```

## Testing

```typescript
// Test endpoints with these examples:

// Create notification (Admin)
POST /api/notifications
{
  "user_id": "user-uuid",
  "title": "Welcome!",
  "message": "Welcome to our platform",
  "type": "info",
  "priority": "normal"
}

// Broadcast notification (Admin)
POST /api/notifications/broadcast
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "type": "warning",
  "user_segment": "all",
  "expires_at": "2024-12-31T23:59:59Z"
}

// Get user notifications
GET /api/notifications/me?page=1&limit=10&read_status=false

// Mark as read
PUT /api/notifications/{id}/read
```

This comprehensive Notifications API will provide all the functionality needed for admin dashboard notification management and user notification systems.