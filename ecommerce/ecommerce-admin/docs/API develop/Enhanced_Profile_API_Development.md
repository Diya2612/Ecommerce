# Enhanced Profile API Development Guide

## Overview
Complete backend implementation guide for Enhanced Profile API to provide comprehensive admin profile management, preferences, security settings, activity tracking, and advanced profile customization features.

## Database Schema

### Enhanced Profile Tables
```sql
-- admin_profiles table (extended admin profile data)
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    
    -- Basic profile info (extends base user table)
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    title VARCHAR(100),
    department VARCHAR(100),
    
    -- Contact details
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    address JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    
    -- Profile settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) DEFAULT '24h',
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Preferences
    theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    layout_preferences JSONB DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    
    -- Privacy & Security
    profile_visibility VARCHAR(20) DEFAULT 'private', -- 'public', 'private', 'team'
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    session_timeout INTEGER DEFAULT 3600, -- seconds
    login_notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- Activity tracking
    last_active TIMESTAMP DEFAULT NOW(),
    login_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- admin_profile_activity table (activity tracking)
CREATE TABLE admin_profile_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'profile_update', 'password_change', etc.
    activity_description TEXT,
    ip_address INET,
    user_agent TEXT,
    location JSONB DEFAULT '{}', -- Country, city from IP
    
    -- Session info
    session_id VARCHAR(255),
    device_info JSONB DEFAULT '{}',
    browser_info JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- admin_profile_preferences table (detailed preferences)
CREATE TABLE admin_profile_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    preference_category VARCHAR(50) NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, preference_category, preference_key)
);

-- admin_profile_sessions table (session management)
CREATE TABLE admin_profile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(500) NOT NULL UNIQUE,
    
    -- Session details
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser_name VARCHAR(50),
    os_name VARCHAR(50),
    location JSONB DEFAULT '{}',
    
    -- Session lifecycle
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    logout_reason VARCHAR(50) -- 'manual', 'timeout', 'revoked'
);

-- admin_profile_security_logs table (security events)
CREATE TABLE admin_profile_security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Security event details
    event_type VARCHAR(50) NOT NULL, -- 'failed_login', 'password_change', 'suspicious_activity', etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
    description TEXT NOT NULL,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    location JSONB DEFAULT '{}',
    additional_data JSONB DEFAULT '{}',
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profile_activity_user_id ON admin_profile_activity(user_id);
CREATE INDEX idx_admin_profile_activity_type ON admin_profile_activity(activity_type);
CREATE INDEX idx_admin_profile_activity_date ON admin_profile_activity(created_at);
CREATE INDEX idx_admin_profile_preferences_user_category ON admin_profile_preferences(user_id, preference_category);
CREATE INDEX idx_admin_profile_sessions_user_id ON admin_profile_sessions(user_id);
CREATE INDEX idx_admin_profile_sessions_active ON admin_profile_sessions(is_active);
CREATE INDEX idx_admin_profile_sessions_expires ON admin_profile_sessions(expires_at);
CREATE INDEX idx_admin_profile_security_user_id ON admin_profile_security_logs(user_id);
CREATE INDEX idx_admin_profile_security_type ON admin_profile_security_logs(event_type);
CREATE INDEX idx_admin_profile_security_severity ON admin_profile_security_logs(severity);
```

## Drizzle Schema Implementation

```typescript
// src/features/profile/shared/enhanced-profile.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
  inet,
  index,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';
import { relations } from 'drizzle-orm';

// Enums
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);
export const visibilityEnum = pgEnum('visibility', ['public', 'private', 'team']);
export const severityEnum = pgEnum('severity', ['info', 'warning', 'critical']);
export const deviceTypeEnum = pgEnum('device_type', ['desktop', 'mobile', 'tablet']);

// Admin Profiles Table
export const adminProfiles = pgTable(
  'admin_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().unique().references(() => users.id),
    
    // Basic profile
    display_name: varchar('display_name', { length: 255 }),
    bio: text('bio'),
    avatar_url: varchar('avatar_url', { length: 500 }),
    cover_image_url: varchar('cover_image_url', { length: 500 }),
    title: varchar('title', { length: 100 }),
    department: varchar('department', { length: 100 }),
    
    // Contact
    phone_primary: varchar('phone_primary', { length: 20 }),
    phone_secondary: varchar('phone_secondary', { length: 20 }),
    address: jsonb('address').default({}),
    social_links: jsonb('social_links').default({}),
    
    // Settings
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    language: varchar('language', { length: 10 }).default('en'),
    date_format: varchar('date_format', { length: 20 }).default('DD/MM/YYYY'),
    time_format: varchar('time_format', { length: 10 }).default('24h'),
    currency: varchar('currency', { length: 10 }).default('USD'),
    
    // Preferences
    theme: themeEnum('theme').default('system'),
    layout_preferences: jsonb('layout_preferences').default({}),
    dashboard_layout: jsonb('dashboard_layout').default({}),
    notification_preferences: jsonb('notification_preferences').default({}),
    
    // Security
    profile_visibility: visibilityEnum('profile_visibility').default('private'),
    two_factor_enabled: boolean('two_factor_enabled').default(false),
    session_timeout: integer('session_timeout').default(3600),
    login_notifications_enabled: boolean('login_notifications_enabled').default(true),
    
    // Activity
    last_active: timestamp('last_active').defaultNow(),
    login_count: integer('login_count').default(0),
    total_sessions: integer('total_sessions').default(0),
    average_session_duration: integer('average_session_duration').default(0),
    
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('admin_profiles_user_id_idx').on(table.user_id),
  })
);

// Admin Profile Activity Table
export const adminProfileActivity = pgTable(
  'admin_profile_activity',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id),
    
    // Activity
    activity_type: varchar('activity_type', { length: 50 }).notNull(),
    activity_description: text('activity_description'),
    ip_address: inet('ip_address'),
    user_agent: text('user_agent'),
    location: jsonb('location').default({}),
    
    // Session
    session_id: varchar('session_id', { length: 255 }),
    device_info: jsonb('device_info').default({}),
    browser_info: jsonb('browser_info').default({}),
    
    // Metadata
    metadata: jsonb('metadata').default({}),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('admin_profile_activity_user_id_idx').on(table.user_id),
    typeIdx: index('admin_profile_activity_type_idx').on(table.activity_type),
    dateIdx: index('admin_profile_activity_date_idx').on(table.created_at),
  })
);

// Admin Profile Preferences Table
export const adminProfilePreferences = pgTable(
  'admin_profile_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id),
    preference_category: varchar('preference_category', { length: 50 }).notNull(),
    preference_key: varchar('preference_key', { length: 100 }).notNull(),
    preference_value: jsonb('preference_value').notNull(),
    
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userCategoryKeyUnique: unique('admin_profile_prefs_user_cat_key_unique').on(
      table.user_id,
      table.preference_category,
      table.preference_key
    ),
    userCategoryIdx: index('admin_profile_prefs_user_category_idx').on(
      table.user_id,
      table.preference_category
    ),
  })
);

// Admin Profile Sessions Table
export const adminProfileSessions = pgTable(
  'admin_profile_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id),
    session_token: varchar('session_token', { length: 500 }).notNull().unique(),
    
    // Details
    ip_address: inet('ip_address'),
    user_agent: text('user_agent'),
    device_type: deviceTypeEnum('device_type'),
    browser_name: varchar('browser_name', { length: 50 }),
    os_name: varchar('os_name', { length: 50 }),
    location: jsonb('location').default({}),
    
    // Lifecycle
    created_at: timestamp('created_at').defaultNow().notNull(),
    last_accessed: timestamp('last_accessed').defaultNow().notNull(),
    expires_at: timestamp('expires_at').notNull(),
    is_active: boolean('is_active').default(true),
    logout_reason: varchar('logout_reason', { length: 50 }),
  },
  (table) => ({
    userIdIdx: index('admin_profile_sessions_user_id_idx').on(table.user_id),
    activeIdx: index('admin_profile_sessions_active_idx').on(table.is_active),
    expiresIdx: index('admin_profile_sessions_expires_idx').on(table.expires_at),
  })
);

// Admin Profile Security Logs Table
export const adminProfileSecurityLogs = pgTable(
  'admin_profile_security_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id),
    
    // Event
    event_type: varchar('event_type', { length: 50 }).notNull(),
    severity: severityEnum('severity').default('info'),
    description: text('description').notNull(),
    
    // Context
    ip_address: inet('ip_address'),
    user_agent: text('user_agent'),
    location: jsonb('location').default({}),
    additional_data: jsonb('additional_data').default({}),
    
    // Resolution
    resolved: boolean('resolved').default(false),
    resolved_by: uuid('resolved_by').references(() => users.id),
    resolved_at: timestamp('resolved_at'),
    resolution_notes: text('resolution_notes'),
    
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('admin_profile_security_user_id_idx').on(table.user_id),
    typeIdx: index('admin_profile_security_type_idx').on(table.event_type),
    severityIdx: index('admin_profile_security_severity_idx').on(table.severity),
  })
);

// Relations
export const adminProfilesRelations = relations(adminProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [adminProfiles.user_id],
    references: [users.id],
  }),
  activities: many(adminProfileActivity),
  preferences: many(adminProfilePreferences),
  sessions: many(adminProfileSessions),
  securityLogs: many(adminProfileSecurityLogs),
}));

export const adminProfileActivityRelations = relations(adminProfileActivity, ({ one }) => ({
  user: one(users, {
    fields: [adminProfileActivity.user_id],
    references: [users.id],
  }),
  profile: one(adminProfiles, {
    fields: [adminProfileActivity.user_id],
    references: [adminProfiles.user_id],
  }),
}));

export const adminProfilePreferencesRelations = relations(adminProfilePreferences, ({ one }) => ({
  user: one(users, {
    fields: [adminProfilePreferences.user_id],
    references: [users.id],
  }),
  profile: one(adminProfiles, {
    fields: [adminProfilePreferences.user_id],
    references: [adminProfiles.user_id],
  }),
}));

export const adminProfileSessionsRelations = relations(adminProfileSessions, ({ one }) => ({
  user: one(users, {
    fields: [adminProfileSessions.user_id],
    references: [users.id],
  }),
  profile: one(adminProfiles, {
    fields: [adminProfileSessions.user_id],
    references: [adminProfiles.user_id],
  }),
}));

export const adminProfileSecurityLogsRelations = relations(adminProfileSecurityLogs, ({ one }) => ({
  user: one(users, {
    fields: [adminProfileSecurityLogs.user_id],
    references: [users.id],
  }),
  profile: one(adminProfiles, {
    fields: [adminProfileSecurityLogs.user_id],
    references: [adminProfiles.user_id],
  }),
  resolvedBy: one(users, {
    fields: [adminProfileSecurityLogs.resolved_by],
    references: [users.id],
  }),
}));

// TypeScript types
export type AdminProfile = typeof adminProfiles.$inferSelect;
export type NewAdminProfile = typeof adminProfiles.$inferInsert;
export type AdminProfileActivity = typeof adminProfileActivity.$inferSelect;
export type NewAdminProfileActivity = typeof adminProfileActivity.$inferInsert;
export type AdminProfilePreference = typeof adminProfilePreferences.$inferSelect;
export type NewAdminProfilePreference = typeof adminProfilePreferences.$inferInsert;
export type AdminProfileSession = typeof adminProfileSessions.$inferSelect;
export type NewAdminProfileSession = typeof adminProfileSessions.$inferInsert;
export type AdminProfileSecurityLog = typeof adminProfileSecurityLogs.$inferSelect;
export type NewAdminProfileSecurityLog = typeof adminProfileSecurityLogs.$inferInsert;
```

## Interface Types

```typescript
// src/features/profile/shared/interface.ts

// Enhanced profile interfaces
export interface IEnhancedProfile {
  // User basic info
  id: string;
  user_id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  
  // Enhanced profile
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  title?: string;
  department?: string;
  
  // Contact
  phone_primary?: string;
  phone_secondary?: string;
  address: IAddress;
  social_links: ISocialLinks;
  
  // Settings
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;
  currency: string;
  
  // Preferences
  theme: 'light' | 'dark' | 'system';
  layout_preferences: ILayoutPreferences;
  dashboard_layout: IDashboardLayout;
  notification_preferences: INotificationPreferences;
  
  // Security
  profile_visibility: 'public' | 'private' | 'team';
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications_enabled: boolean;
  
  // Activity
  last_active: string;
  login_count: number;
  total_sessions: number;
  average_session_duration: number;
  
  created_at: string;
  updated_at: string;
}

// Address interface
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Social links interface
export interface ISocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
}

// Layout preferences interface
export interface ILayoutPreferences {
  sidebar_collapsed?: boolean;
  sidebar_position?: 'left' | 'right';
  header_fixed?: boolean;
  footer_visible?: boolean;
  compact_mode?: boolean;
  animations_enabled?: boolean;
}

// Dashboard layout interface
export interface IDashboardLayout {
  widgets?: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; w: number; h: number };
    settings: Record<string, any>;
    visible: boolean;
  }>;
  default_view?: string;
  refresh_interval?: number;
  auto_refresh?: boolean;
}

// Notification preferences interface
export interface INotificationPreferences {
  email_notifications?: {
    order_updates?: boolean;
    customer_messages?: boolean;
    inventory_alerts?: boolean;
    system_updates?: boolean;
    security_alerts?: boolean;
  };
  push_notifications?: {
    enabled?: boolean;
    order_updates?: boolean;
    urgent_alerts?: boolean;
    marketing_updates?: boolean;
  };
  sms_notifications?: {
    enabled?: boolean;
    security_alerts?: boolean;
    critical_issues?: boolean;
  };
  notification_schedule?: {
    enabled?: boolean;
    start_time?: string;
    end_time?: string;
    timezone?: string;
  };
}

// Activity interfaces
export interface IProfileActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description?: string;
  ip_address?: string;
  user_agent?: string;
  location: IGeolocation;
  session_id?: string;
  device_info: IDeviceInfo;
  browser_info: IBrowserInfo;
  metadata: Record<string, any>;
  created_at: string;
}

export interface IGeolocation {
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface IDeviceInfo {
  type?: 'desktop' | 'mobile' | 'tablet';
  os?: string;
  os_version?: string;
  device_model?: string;
  screen_resolution?: string;
}

export interface IBrowserInfo {
  name?: string;
  version?: string;
  engine?: string;
  language?: string;
}

// Session interfaces
export interface IProfileSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser_name?: string;
  os_name?: string;
  location: IGeolocation;
  created_at: string;
  last_accessed: string;
  expires_at: string;
  is_active: boolean;
  logout_reason?: string;
}

// Security log interfaces
export interface ISecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  ip_address?: string;
  user_agent?: string;
  location: IGeolocation;
  additional_data: Record<string, any>;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

// Request/Response interfaces
export interface IUpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  title?: string;
  department?: string;
  phone_primary?: string;
  phone_secondary?: string;
  address?: IAddress;
  social_links?: ISocialLinks;
  timezone?: string;
  language?: string;
  date_format?: string;
  time_format?: string;
  currency?: string;
}

export interface IUpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system';
  layout_preferences?: ILayoutPreferences;
  dashboard_layout?: IDashboardLayout;
  notification_preferences?: INotificationPreferences;
}

export interface IUpdateSecurityRequest {
  profile_visibility?: 'public' | 'private' | 'team';
  session_timeout?: number;
  login_notifications_enabled?: boolean;
}

export interface IChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface IActivityFilterRequest {
  activity_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ISessionFilterRequest {
  device_type?: 'desktop' | 'mobile' | 'tablet';
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ISecurityLogFilterRequest {
  event_type?: string;
  severity?: 'info' | 'warning' | 'critical';
  resolved?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// Analytics interfaces
export interface IProfileAnalytics {
  // Activity metrics
  total_activities: number;
  login_frequency: number;
  average_session_duration: number;
  last_active: string;
  most_active_day: string;
  most_active_hour: number;
  
  // Usage patterns
  preferred_device_type: string;
  preferred_browser: string;
  login_locations: Array<{
    location: string;
    count: number;
  }>;
  
  // Security metrics
  security_events: number;
  failed_login_attempts: number;
  password_changes: number;
  suspicious_activities: number;
  
  // Activity trends
  activity_trend: Array<{
    date: string;
    login_count: number;
    session_duration: number;
  }>;
  
  // Device usage
  device_usage: Array<{
    device_type: string;
    count: number;
    percentage: number;
  }>;
}

// Export data interface
export interface IProfileExportRequest {
  data_type: 'profile' | 'activity' | 'sessions' | 'security_logs' | 'all';
  format: 'json' | 'csv' | 'pdf';
  date_range?: {
    start_date: string;
    end_date: string;
  };
}
```

## Service Implementation

```typescript
// src/features/profile/services/enhanced-profile.service.ts
import { eq, and, desc, count, avg, sum, sql, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import {
  adminProfiles,
  adminProfileActivity,
  adminProfilePreferences,
  adminProfileSessions,
  adminProfileSecurityLogs,
  NewAdminProfile,
  NewAdminProfileActivity,
  NewAdminProfileSecurityLog,
} from '../shared/enhanced-profile.schema';
import {
  IEnhancedProfile,
  IProfileActivity,
  IProfileSession,
  ISecurityLog,
  IUpdateProfileRequest,
  IUpdatePreferencesRequest,
  IUpdateSecurityRequest,
  IChangePasswordRequest,
  IActivityFilterRequest,
  ISessionFilterRequest,
  ISecurityLogFilterRequest,
  IProfileAnalytics,
} from '../shared/interface';

export class EnhancedProfileService {
  // Get complete enhanced profile
  async getEnhancedProfile(userId: string): Promise<IEnhancedProfile | null> {
    const result = await db
      .select({
        // User data
        userId: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        userCreatedAt: users.created_at,
        
        // Profile data
        profileId: adminProfiles.id,
        displayName: adminProfiles.display_name,
        bio: adminProfiles.bio,
        avatarUrl: adminProfiles.avatar_url,
        coverImageUrl: adminProfiles.cover_image_url,
        title: adminProfiles.title,
        department: adminProfiles.department,
        phonePrimary: adminProfiles.phone_primary,
        phoneSecondary: adminProfiles.phone_secondary,
        address: adminProfiles.address,
        socialLinks: adminProfiles.social_links,
        timezone: adminProfiles.timezone,
        language: adminProfiles.language,
        dateFormat: adminProfiles.date_format,
        timeFormat: adminProfiles.time_format,
        currency: adminProfiles.currency,
        theme: adminProfiles.theme,
        layoutPreferences: adminProfiles.layout_preferences,
        dashboardLayout: adminProfiles.dashboard_layout,
        notificationPreferences: adminProfiles.notification_preferences,
        profileVisibility: adminProfiles.profile_visibility,
        twoFactorEnabled: adminProfiles.two_factor_enabled,
        sessionTimeout: adminProfiles.session_timeout,
        loginNotificationsEnabled: adminProfiles.login_notifications_enabled,
        lastActive: adminProfiles.last_active,
        loginCount: adminProfiles.login_count,
        totalSessions: adminProfiles.total_sessions,
        averageSessionDuration: adminProfiles.average_session_duration,
        profileCreatedAt: adminProfiles.created_at,
        profileUpdatedAt: adminProfiles.updated_at,
      })
      .from(users)
      .leftJoin(adminProfiles, eq(users.id, adminProfiles.user_id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!result.length) return null;

    const data = result[0];

    // Create profile if it doesn't exist
    if (!data.profileId) {
      await this.createDefaultProfile(userId);
      return this.getEnhancedProfile(userId);
    }

    return {
      id: data.profileId,
      user_id: data.userId,
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role,
      display_name: data.displayName || undefined,
      bio: data.bio || undefined,
      avatar_url: data.avatarUrl || undefined,
      cover_image_url: data.coverImageUrl || undefined,
      title: data.title || undefined,
      department: data.department || undefined,
      phone_primary: data.phonePrimary || undefined,
      phone_secondary: data.phoneSecondary || undefined,
      address: data.address as any || {},
      social_links: data.socialLinks as any || {},
      timezone: data.timezone,
      language: data.language,
      date_format: data.dateFormat,
      time_format: data.timeFormat,
      currency: data.currency,
      theme: data.theme,
      layout_preferences: data.layoutPreferences as any || {},
      dashboard_layout: data.dashboardLayout as any || {},
      notification_preferences: data.notificationPreferences as any || {},
      profile_visibility: data.profileVisibility,
      two_factor_enabled: data.twoFactorEnabled,
      session_timeout: data.sessionTimeout,
      login_notifications_enabled: data.loginNotificationsEnabled,
      last_active: data.lastActive.toISOString(),
      login_count: data.loginCount,
      total_sessions: data.totalSessions,
      average_session_duration: data.averageSessionDuration,
      created_at: data.userCreatedAt.toISOString(),
      updated_at: data.profileUpdatedAt.toISOString(),
    };
  }

  // Update profile information
  async updateProfile(userId: string, updates: IUpdateProfileRequest): Promise<IEnhancedProfile | null> {
    await db
      .update(adminProfiles)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(adminProfiles.user_id, userId));

    // Log activity
    await this.logActivity(userId, 'profile_update', 'Profile information updated');

    return this.getEnhancedProfile(userId);
  }

  // Update preferences
  async updatePreferences(userId: string, preferences: IUpdatePreferencesRequest): Promise<void> {
    await db
      .update(adminProfiles)
      .set({
        theme: preferences.theme,
        layout_preferences: preferences.layout_preferences,
        dashboard_layout: preferences.dashboard_layout,
        notification_preferences: preferences.notification_preferences,
        updated_at: new Date(),
      })
      .where(eq(adminProfiles.user_id, userId));

    // Log activity
    await this.logActivity(userId, 'preferences_update', 'User preferences updated');
  }

  // Update security settings
  async updateSecuritySettings(userId: string, settings: IUpdateSecurityRequest): Promise<void> {
    await db
      .update(adminProfiles)
      .set({
        ...settings,
        updated_at: new Date(),
      })
      .where(eq(adminProfiles.user_id, userId));

    // Log security event
    await this.logSecurityEvent(
      userId,
      'security_settings_update',
      'info',
      'Security settings updated'
    );

    // Log activity
    await this.logActivity(userId, 'security_settings_update', 'Security settings updated');
  }

  // Change password
  async changePassword(userId: string, data: IChangePasswordRequest): Promise<void> {
    // Verify current password
    const user = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(data.current_password, user[0].password);
    if (!isValidPassword) {
      await this.logSecurityEvent(
        userId,
        'invalid_password_change',
        'warning',
        'Failed password change attempt - invalid current password'
      );
      throw new Error('Current password is incorrect');
    }

    if (data.new_password !== data.confirm_password) {
      throw new Error('New passwords do not match');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.new_password, 12);

    // Update password
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    // Log security event
    await this.logSecurityEvent(
      userId,
      'password_change',
      'info',
      'Password successfully changed'
    );

    // Log activity
    await this.logActivity(userId, 'password_change', 'Password changed');
  }

  // Get profile activity
  async getProfileActivity(
    userId: string, 
    filters: IActivityFilterRequest = {}
  ): Promise<{
    activities: IProfileActivity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let whereConditions = [eq(adminProfileActivity.user_id, userId)];

    if (filters.activity_type) {
      whereConditions.push(eq(adminProfileActivity.activity_type, filters.activity_type));
    }

    if (filters.start_date) {
      whereConditions.push(gte(adminProfileActivity.created_at, new Date(filters.start_date)));
    }

    if (filters.end_date) {
      whereConditions.push(lte(adminProfileActivity.created_at, new Date(filters.end_date)));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(adminProfileActivity)
      .where(and(...whereConditions));

    // Get activities
    const activities = await db
      .select()
      .from(adminProfileActivity)
      .where(and(...whereConditions))
      .orderBy(desc(adminProfileActivity.created_at))
      .limit(limit)
      .offset(offset);

    return {
      activities: activities.map(this.mapActivityToInterface),
      total,
      page,
      limit,
    };
  }

  // Get active sessions
  async getActiveSessions(
    userId: string,
    filters: ISessionFilterRequest = {}
  ): Promise<{
    sessions: IProfileSession[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let whereConditions = [eq(adminProfileSessions.user_id, userId)];

    if (filters.device_type) {
      whereConditions.push(eq(adminProfileSessions.device_type, filters.device_type));
    }

    if (filters.is_active !== undefined) {
      whereConditions.push(eq(adminProfileSessions.is_active, filters.is_active));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(adminProfileSessions)
      .where(and(...whereConditions));

    // Get sessions
    const sessions = await db
      .select()
      .from(adminProfileSessions)
      .where(and(...whereConditions))
      .orderBy(desc(adminProfileSessions.last_accessed))
      .limit(limit)
      .offset(offset);

    return {
      sessions: sessions.map(this.mapSessionToInterface),
      total,
      page,
      limit,
    };
  }

  // Revoke session
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await db
      .update(adminProfileSessions)
      .set({
        is_active: false,
        logout_reason: 'revoked',
      })
      .where(and(
        eq(adminProfileSessions.id, sessionId),
        eq(adminProfileSessions.user_id, userId)
      ));

    // Log activity
    await this.logActivity(userId, 'session_revoked', `Session ${sessionId} revoked`);
  }

  // Get security logs
  async getSecurityLogs(
    userId: string,
    filters: ISecurityLogFilterRequest = {}
  ): Promise<{
    logs: ISecurityLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let whereConditions = [eq(adminProfileSecurityLogs.user_id, userId)];

    if (filters.event_type) {
      whereConditions.push(eq(adminProfileSecurityLogs.event_type, filters.event_type));
    }

    if (filters.severity) {
      whereConditions.push(eq(adminProfileSecurityLogs.severity, filters.severity));
    }

    if (filters.resolved !== undefined) {
      whereConditions.push(eq(adminProfileSecurityLogs.resolved, filters.resolved));
    }

    if (filters.start_date) {
      whereConditions.push(gte(adminProfileSecurityLogs.created_at, new Date(filters.start_date)));
    }

    if (filters.end_date) {
      whereConditions.push(lte(adminProfileSecurityLogs.created_at, new Date(filters.end_date)));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(adminProfileSecurityLogs)
      .where(and(...whereConditions));

    // Get logs
    const logs = await db
      .select()
      .from(adminProfileSecurityLogs)
      .where(and(...whereConditions))
      .orderBy(desc(adminProfileSecurityLogs.created_at))
      .limit(limit)
      .offset(offset);

    return {
      logs: logs.map(this.mapSecurityLogToInterface),
      total,
      page,
      limit,
    };
  }

  // Get profile analytics
  async getProfileAnalytics(userId: string): Promise<IProfileAnalytics> {
    // Activity metrics
    const [activityMetrics] = await db
      .select({
        total_activities: sql<number>`COUNT(*)`,
        avg_session_duration: sql<number>`AVG(EXTRACT(EPOCH FROM (last_accessed - created_at)))`,
      })
      .from(adminProfileActivity)
      .leftJoin(adminProfileSessions, eq(adminProfileActivity.session_id, adminProfileSessions.session_token))
      .where(eq(adminProfileActivity.user_id, userId));

    // Get profile stats
    const profile = await db
      .select({
        login_count: adminProfiles.login_count,
        total_sessions: adminProfiles.total_sessions,
        last_active: adminProfiles.last_active,
      })
      .from(adminProfiles)
      .where(eq(adminProfiles.user_id, userId))
      .limit(1);

    // Security events count
    const [securityMetrics] = await db
      .select({
        security_events: sql<number>`COUNT(*)`,
        failed_logins: sql<number>`COUNT(*) FILTER (WHERE event_type = 'failed_login')`,
        password_changes: sql<number>`COUNT(*) FILTER (WHERE event_type = 'password_change')`,
        suspicious_activities: sql<number>`COUNT(*) FILTER (WHERE severity = 'warning' OR severity = 'critical')`,
      })
      .from(adminProfileSecurityLogs)
      .where(eq(adminProfileSecurityLogs.user_id, userId));

    // Device usage stats
    const deviceUsage = await db
      .select({
        device_type: adminProfileSessions.device_type,
        count: sql<number>`COUNT(*)`,
      })
      .from(adminProfileSessions)
      .where(eq(adminProfileSessions.user_id, userId))
      .groupBy(adminProfileSessions.device_type);

    const totalDeviceSessions = deviceUsage.reduce((sum, device) => sum + device.count, 0);

    return {
      total_activities: activityMetrics.total_activities,
      login_frequency: profile[0]?.login_count || 0,
      average_session_duration: activityMetrics.avg_session_duration || 0,
      last_active: profile[0]?.last_active.toISOString() || '',
      most_active_day: 'Monday', // Implement actual calculation
      most_active_hour: 9, // Implement actual calculation
      preferred_device_type: deviceUsage.length ? deviceUsage[0].device_type || 'desktop' : 'desktop',
      preferred_browser: 'Chrome', // Implement actual calculation
      login_locations: [], // Implement geo analysis
      security_events: securityMetrics.security_events,
      failed_login_attempts: securityMetrics.failed_logins,
      password_changes: securityMetrics.password_changes,
      suspicious_activities: securityMetrics.suspicious_activities,
      activity_trend: [], // Implement trend analysis
      device_usage: deviceUsage.map(device => ({
        device_type: device.device_type || 'unknown',
        count: device.count,
        percentage: totalDeviceSessions ? (device.count / totalDeviceSessions) * 100 : 0,
      })),
    };
  }

  // Helper methods
  private async createDefaultProfile(userId: string): Promise<void> {
    const defaultProfile: NewAdminProfile = {
      user_id: userId,
      theme: 'system',
      timezone: 'UTC',
      language: 'en',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      currency: 'USD',
      profile_visibility: 'private',
      two_factor_enabled: false,
      session_timeout: 3600,
      login_notifications_enabled: true,
      layout_preferences: {},
      dashboard_layout: {},
      notification_preferences: {},
    };

    await db.insert(adminProfiles).values(defaultProfile);
  }

  private async logActivity(
    userId: string,
    activityType: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activity: NewAdminProfileActivity = {
      user_id: userId,
      activity_type: activityType,
      activity_description: description,
      metadata: metadata || {},
    };

    await db.insert(adminProfileActivity).values(activity);
  }

  private async logSecurityEvent(
    userId: string,
    eventType: string,
    severity: 'info' | 'warning' | 'critical',
    description: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const securityLog: NewAdminProfileSecurityLog = {
      user_id: userId,
      event_type: eventType,
      severity,
      description,
      additional_data: additionalData || {},
    };

    await db.insert(adminProfileSecurityLogs).values(securityLog);
  }

  private mapActivityToInterface(activity: AdminProfileActivity): IProfileActivity {
    return {
      id: activity.id,
      user_id: activity.user_id,
      activity_type: activity.activity_type,
      activity_description: activity.activity_description || undefined,
      ip_address: activity.ip_address || undefined,
      user_agent: activity.user_agent || undefined,
      location: activity.location as any || {},
      session_id: activity.session_id || undefined,
      device_info: activity.device_info as any || {},
      browser_info: activity.browser_info as any || {},
      metadata: activity.metadata as any || {},
      created_at: activity.created_at.toISOString(),
    };
  }

  private mapSessionToInterface(session: AdminProfileSession): IProfileSession {
    return {
      id: session.id,
      user_id: session.user_id,
      session_token: session.session_token,
      ip_address: session.ip_address || undefined,
      user_agent: session.user_agent || undefined,
      device_type: session.device_type || undefined,
      browser_name: session.browser_name || undefined,
      os_name: session.os_name || undefined,
      location: session.location as any || {},
      created_at: session.created_at.toISOString(),
      last_accessed: session.last_accessed.toISOString(),
      expires_at: session.expires_at.toISOString(),
      is_active: session.is_active,
      logout_reason: session.logout_reason || undefined,
    };
  }

  private mapSecurityLogToInterface(log: AdminProfileSecurityLog): ISecurityLog {
    return {
      id: log.id,
      user_id: log.user_id,
      event_type: log.event_type,
      severity: log.severity,
      description: log.description,
      ip_address: log.ip_address || undefined,
      user_agent: log.user_agent || undefined,
      location: log.location as any || {},
      additional_data: log.additional_data as any || {},
      resolved: log.resolved,
      resolved_by: log.resolved_by || undefined,
      resolved_at: log.resolved_at?.toISOString() || undefined,
      resolution_notes: log.resolution_notes || undefined,
      created_at: log.created_at.toISOString(),
    };
  }
}

export const enhancedProfileService = new EnhancedProfileService();
```

## API Controllers

```typescript
// src/features/profile/controllers/enhanced-profile.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { enhancedProfileService } from '../services/enhanced-profile.service';
import { ResponseFormatter } from '../../../utils';

const updateProfileSchema = z.object({
  display_name: z.string().max(255).optional(),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone_primary: z.string().max(20).optional(),
  phone_secondary: z.string().max(20).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional(),
  social_links: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),
  currency: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  layout_preferences: z.object({
    sidebar_collapsed: z.boolean().optional(),
    sidebar_position: z.enum(['left', 'right']).optional(),
    header_fixed: z.boolean().optional(),
    footer_visible: z.boolean().optional(),
    compact_mode: z.boolean().optional(),
    animations_enabled: z.boolean().optional(),
  }).optional(),
  dashboard_layout: z.object({
    widgets: z.array(z.any()).optional(),
    default_view: z.string().optional(),
    refresh_interval: z.number().optional(),
    auto_refresh: z.boolean().optional(),
  }).optional(),
  notification_preferences: z.object({
    email_notifications: z.object({
      order_updates: z.boolean().optional(),
      customer_messages: z.boolean().optional(),
      inventory_alerts: z.boolean().optional(),
      system_updates: z.boolean().optional(),
      security_alerts: z.boolean().optional(),
    }).optional(),
    push_notifications: z.object({
      enabled: z.boolean().optional(),
      order_updates: z.boolean().optional(),
      urgent_alerts: z.boolean().optional(),
      marketing_updates: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

const updateSecuritySchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'team']).optional(),
  session_timeout: z.number().min(300).max(86400).optional(),
  login_notifications_enabled: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
  confirm_password: z.string().min(8),
});

export class EnhancedProfileController {
  // Get enhanced profile
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const profile = await enhancedProfileService.getEnhancedProfile(userId);

    if (!profile) {
      return ResponseFormatter.error(res, 'Profile not found', 404);
    }

    ResponseFormatter.success(res, profile, 'Profile retrieved successfully');
  }

  // Update profile information
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const updates = updateProfileSchema.parse(req.body);

    const profile = await enhancedProfileService.updateProfile(userId, updates);

    ResponseFormatter.success(res, profile, 'Profile updated successfully');
  }

  // Update preferences
  async updatePreferences(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const preferences = updatePreferencesSchema.parse(req.body);

    await enhancedProfileService.updatePreferences(userId, preferences);

    ResponseFormatter.success(res, null, 'Preferences updated successfully');
  }

  // Update security settings
  async updateSecuritySettings(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const settings = updateSecuritySchema.parse(req.body);

    await enhancedProfileService.updateSecuritySettings(userId, settings);

    ResponseFormatter.success(res, null, 'Security settings updated successfully');
  }

  // Change password
  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const passwordData = changePasswordSchema.parse(req.body);

    await enhancedProfileService.changePassword(userId, passwordData);

    ResponseFormatter.success(res, null, 'Password changed successfully');
  }

  // Get profile activity
  async getActivity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const filters = {
      activity_type: req.query.activity_type as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const activity = await enhancedProfileService.getProfileActivity(userId, filters);

    ResponseFormatter.success(res, activity, 'Profile activity retrieved successfully');
  }

  // Get active sessions
  async getSessions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const filters = {
      device_type: req.query.device_type as any,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const sessions = await enhancedProfileService.getActiveSessions(userId, filters);

    ResponseFormatter.success(res, sessions, 'Active sessions retrieved successfully');
  }

  // Revoke session
  async revokeSession(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId;

    await enhancedProfileService.revokeSession(userId, sessionId);

    ResponseFormatter.success(res, null, 'Session revoked successfully');
  }

  // Get security logs
  async getSecurityLogs(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const filters = {
      event_type: req.query.event_type as string,
      severity: req.query.severity as any,
      resolved: req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const logs = await enhancedProfileService.getSecurityLogs(userId, filters);

    ResponseFormatter.success(res, logs, 'Security logs retrieved successfully');
  }

  // Get profile analytics
  async getAnalytics(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const analytics = await enhancedProfileService.getProfileAnalytics(userId);

    ResponseFormatter.success(res, analytics, 'Profile analytics retrieved successfully');
  }
}
```

## API Routes

```typescript
// src/features/profile/routes/enhanced-profile.routes.ts
import { Router } from 'express';
import { EnhancedProfileController } from '../controllers/enhanced-profile.controller';
import { requireAuth } from '../../../middlewares';

const router = Router();
const controller = new EnhancedProfileController();

// Profile management (all routes require authentication)
router.get('/', requireAuth, controller.getProfile);
router.put('/', requireAuth, controller.updateProfile);
router.put('/preferences', requireAuth, controller.updatePreferences);
router.put('/security', requireAuth, controller.updateSecuritySettings);
router.put('/password', requireAuth, controller.changePassword);

// Activity and tracking
router.get('/activity', requireAuth, controller.getActivity);
router.get('/sessions', requireAuth, controller.getSessions);
router.delete('/sessions/:sessionId', requireAuth, controller.revokeSession);
router.get('/security-logs', requireAuth, controller.getSecurityLogs);
router.get('/analytics', requireAuth, controller.getAnalytics);

export default router;
```

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add enhanced profile tables (use the SQL schema above)
-- Run: npm run db:migrate
```

### Step 2: File Structure
```bash
# Create the feature structure
mkdir -p src/features/profile/{controllers,services,routes,shared}

# Create files:
# - src/features/profile/shared/enhanced-profile.schema.ts
# - src/features/profile/shared/interface.ts
# - src/features/profile/services/enhanced-profile.service.ts
# - src/features/profile/controllers/enhanced-profile.controller.ts
# - src/features/profile/routes/enhanced-profile.routes.ts
# - src/features/profile/index.ts
```

### Step 3: Register Routes
```typescript
// src/features/profile/index.ts
import { Router } from 'express';
import enhancedProfileRoutes from './routes/enhanced-profile.routes';

const router = Router();

router.use('/profile', enhancedProfileRoutes);

export default router;
```

### Step 4: Add to Main App
```typescript
// src/app.ts - add enhanced profile routes
import enhancedProfileRoutes from './features/profile';

app.use('/api', enhancedProfileRoutes);
```

## Testing

```typescript
// Test endpoints with these examples:

// Get enhanced profile
GET /api/profile

// Update profile information
PUT /api/profile
{
  "display_name": "John Doe",
  "bio": "Senior Admin",
  "title": "System Administrator",
  "department": "IT",
  "timezone": "America/New_York"
}

// Update preferences
PUT /api/profile/preferences
{
  "theme": "dark",
  "layout_preferences": {
    "sidebar_collapsed": true,
    "animations_enabled": true
  },
  "notification_preferences": {
    "email_notifications": {
      "order_updates": true,
      "security_alerts": true
    }
  }
}

// Change password
PUT /api/profile/password
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456",
  "confirm_password": "newPassword456"
}

// Get activity history
GET /api/profile/activity?activity_type=login&page=1&limit=20

// Get active sessions
GET /api/profile/sessions?device_type=desktop&is_active=true

// Get security logs
GET /api/profile/security-logs?severity=warning&resolved=false

// Get profile analytics
GET /api/profile/analytics
```

This Enhanced Profile API provides comprehensive admin profile management with advanced features for security, preferences, activity tracking, and analytics.