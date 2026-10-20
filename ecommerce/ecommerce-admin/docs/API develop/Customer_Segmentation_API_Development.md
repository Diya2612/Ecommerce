# Customer Segmentation API Development Guide

## Overview
Complete backend implementation guide for Customer Segmentation API to enable advanced customer grouping, filtering, targeting, and automated segment management for marketing and analytics purposes.

## Database Schema

### Customer Segments Tables
```sql
-- customer_segments table (segment definitions)
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_name VARCHAR(255) NOT NULL,
    description TEXT,
    segment_type VARCHAR(50) NOT NULL, -- 'static', 'dynamic', 'behavioral'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'archived', 'draft'
    
    -- Segment criteria (for dynamic segments)
    criteria JSONB DEFAULT '{}',
    
    -- Manual customer list (for static segments)
    customer_ids UUID[] DEFAULT '{}',
    
    -- Analytics
    customer_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- customer_segment_memberships table (for tracking membership history)
CREATE TABLE customer_segment_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    segment_id UUID NOT NULL REFERENCES customer_segments(id),
    
    -- Membership details
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Tracking
    source VARCHAR(50) DEFAULT 'automatic', -- 'automatic', 'manual', 'import'
    added_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- customer_segment_campaigns table (for marketing campaigns)
CREATE TABLE customer_segment_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES customer_segments(id),
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'notification', 'discount'
    
    -- Campaign content
    subject VARCHAR(500),
    content TEXT,
    discount_code VARCHAR(100),
    discount_amount DECIMAL(10,2),
    discount_type VARCHAR(20), -- 'percentage', 'fixed'
    
    -- Scheduling
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Status and analytics
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
    recipients_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_customer_segments_type ON customer_segments(segment_type);
CREATE INDEX idx_customer_segments_status ON customer_segments(status);
CREATE INDEX idx_customer_segments_created_by ON customer_segments(created_by);
CREATE INDEX idx_customer_segment_memberships_customer ON customer_segment_memberships(customer_id);
CREATE INDEX idx_customer_segment_memberships_segment ON customer_segment_memberships(segment_id);
CREATE INDEX idx_customer_segment_memberships_active ON customer_segment_memberships(is_active);
CREATE INDEX idx_customer_segment_campaigns_segment ON customer_segment_campaigns(segment_id);
CREATE INDEX idx_customer_segment_campaigns_status ON customer_segment_campaigns(status);
```

## Drizzle Schema Implementation

```typescript
// src/features/customer-segment/shared/customer-segment.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  integer,
  timestamp,
  boolean,
  decimal,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';
import { relations } from 'drizzle-orm';

// Enums
export const segmentTypeEnum = pgEnum('segment_type', ['static', 'dynamic', 'behavioral']);
export const segmentStatusEnum = pgEnum('segment_status', ['active', 'archived', 'draft']);
export const campaignTypeEnum = pgEnum('campaign_type', ['email', 'sms', 'notification', 'discount']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'scheduled', 'sent', 'cancelled']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const membershipSourceEnum = pgEnum('membership_source', ['automatic', 'manual', 'import']);

// Customer Segments Table
export const customerSegments = pgTable(
  'customer_segments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    segment_name: varchar('segment_name', { length: 255 }).notNull(),
    description: text('description'),
    segment_type: segmentTypeEnum('segment_type').notNull(),
    status: segmentStatusEnum('status').notNull().default('active'),
    
    // Criteria and data
    criteria: jsonb('criteria').default({}),
    customer_ids: uuid('customer_ids').array().default(sql`'{}'::uuid[]`),
    
    // Analytics
    customer_count: integer('customer_count').default(0),
    last_updated: timestamp('last_updated').defaultNow(),
    
    // Audit fields
    created_by: uuid('created_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false),
  },
  (table) => ({
    typeIdx: index('customer_segments_type_idx').on(table.segment_type),
    statusIdx: index('customer_segments_status_idx').on(table.status),
    createdByIdx: index('customer_segments_created_by_idx').on(table.created_by),
  })
);

// Customer Segment Memberships Table
export const customerSegmentMemberships = pgTable(
  'customer_segment_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customer_id: uuid('customer_id').notNull().references(() => users.id),
    segment_id: uuid('segment_id').notNull().references(() => customerSegments.id),
    
    // Membership details
    joined_at: timestamp('joined_at').defaultNow(),
    left_at: timestamp('left_at'),
    is_active: boolean('is_active').default(true),
    
    // Tracking
    source: membershipSourceEnum('source').default('automatic'),
    added_by: uuid('added_by').references(() => users.id),
    
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index('customer_segment_memberships_customer_idx').on(table.customer_id),
    segmentIdx: index('customer_segment_memberships_segment_idx').on(table.segment_id),
    activeIdx: index('customer_segment_memberships_active_idx').on(table.is_active),
  })
);

// Customer Segment Campaigns Table
export const customerSegmentCampaigns = pgTable(
  'customer_segment_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    segment_id: uuid('segment_id').notNull().references(() => customerSegments.id),
    campaign_name: varchar('campaign_name', { length: 255 }).notNull(),
    campaign_type: campaignTypeEnum('campaign_type').notNull(),
    
    // Campaign content
    subject: varchar('subject', { length: 500 }),
    content: text('content'),
    discount_code: varchar('discount_code', { length: 100 }),
    discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }),
    discount_type: discountTypeEnum('discount_type'),
    
    // Scheduling
    scheduled_at: timestamp('scheduled_at'),
    sent_at: timestamp('sent_at'),
    
    // Analytics
    status: campaignStatusEnum('status').default('draft'),
    recipients_count: integer('recipients_count').default(0),
    opened_count: integer('opened_count').default(0),
    clicked_count: integer('clicked_count').default(0),
    converted_count: integer('converted_count').default(0),
    
    // Audit fields
    created_by: uuid('created_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    is_deleted: boolean('is_deleted').default(false),
  },
  (table) => ({
    segmentIdx: index('customer_segment_campaigns_segment_idx').on(table.segment_id),
    statusIdx: index('customer_segment_campaigns_status_idx').on(table.status),
  })
);

// Relations
export const customerSegmentsRelations = relations(customerSegments, ({ one, many }) => ({
  creator: one(users, {
    fields: [customerSegments.created_by],
    references: [users.id],
  }),
  memberships: many(customerSegmentMemberships),
  campaigns: many(customerSegmentCampaigns),
}));

export const customerSegmentMembershipsRelations = relations(customerSegmentMemberships, ({ one }) => ({
  customer: one(users, {
    fields: [customerSegmentMemberships.customer_id],
    references: [users.id],
  }),
  segment: one(customerSegments, {
    fields: [customerSegmentMemberships.segment_id],
    references: [customerSegments.id],
  }),
  addedBy: one(users, {
    fields: [customerSegmentMemberships.added_by],
    references: [users.id],
  }),
}));

export const customerSegmentCampaignsRelations = relations(customerSegmentCampaigns, ({ one }) => ({
  segment: one(customerSegments, {
    fields: [customerSegmentCampaigns.segment_id],
    references: [customerSegments.id],
  }),
  creator: one(users, {
    fields: [customerSegmentCampaigns.created_by],
    references: [users.id],
  }),
}));

// TypeScript types
export type CustomerSegment = typeof customerSegments.$inferSelect;
export type NewCustomerSegment = typeof customerSegments.$inferInsert;
export type CustomerSegmentMembership = typeof customerSegmentMemberships.$inferSelect;
export type NewCustomerSegmentMembership = typeof customerSegmentMemberships.$inferInsert;
export type CustomerSegmentCampaign = typeof customerSegmentCampaigns.$inferSelect;
export type NewCustomerSegmentCampaign = typeof customerSegmentCampaigns.$inferInsert;
```

## Interface Types

```typescript
// src/features/customer-segment/shared/interface.ts

// Segment criteria interfaces
export interface ISegmentCriteria {
  // Customer properties
  customer_type?: 'individual' | 'business';
  registration_date?: {
    operator: 'before' | 'after' | 'between';
    date?: string;
    start_date?: string;
    end_date?: string;
  };
  location?: {
    countries?: string[];
    states?: string[];
    cities?: string[];
  };
  
  // Order behavior
  total_orders?: {
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
    value?: number;
    min_value?: number;
    max_value?: number;
  };
  total_spent?: {
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
    value?: number;
    min_value?: number;
    max_value?: number;
  };
  average_order_value?: {
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
    value?: number;
    min_value?: number;
    max_value?: number;
  };
  last_order_date?: {
    operator: 'before' | 'after' | 'between';
    date?: string;
    start_date?: string;
    end_date?: string;
  };
  
  // Product preferences
  purchased_products?: string[]; // Product IDs
  purchased_categories?: string[]; // Category names
  never_purchased_categories?: string[];
  
  // Engagement
  email_subscribed?: boolean;
  last_login?: {
    operator: 'before' | 'after' | 'between';
    date?: string;
    start_date?: string;
    end_date?: string;
  };
}

// Main segment interfaces
export interface ICustomerSegment {
  id: string;
  segment_name: string;
  description?: string;
  segment_type: 'static' | 'dynamic' | 'behavioral';
  status: 'active' | 'archived' | 'draft';
  criteria: ISegmentCriteria;
  customer_ids: string[];
  customer_count: number;
  last_updated: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ICustomerSegmentWithDetails extends ICustomerSegment {
  creator_name?: string;
  customers?: ISegmentCustomer[];
  campaigns?: ICustomerSegmentCampaign[];
}

export interface ISegmentCustomer {
  id: string;
  name: string;
  email: string;
  customer_type: 'individual' | 'business';
  total_orders: number;
  total_spent: string;
  average_order_value: string;
  last_order_date?: string;
  registration_date: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  membership_date: string;
  membership_source: 'automatic' | 'manual' | 'import';
}

export interface ICustomerSegmentMembership {
  id: string;
  customer_id: string;
  segment_id: string;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  source: 'automatic' | 'manual' | 'import';
  added_by?: string;
  created_at: string;
}

// Campaign interfaces
export interface ICustomerSegmentCampaign {
  id: string;
  segment_id: string;
  campaign_name: string;
  campaign_type: 'email' | 'sms' | 'notification' | 'discount';
  subject?: string;
  content?: string;
  discount_code?: string;
  discount_amount?: string;
  discount_type?: 'percentage' | 'fixed';
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ICampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  roi: number;
}

// Request/Response interfaces
export interface ICreateSegmentRequest {
  segment_name: string;
  description?: string;
  segment_type: 'static' | 'dynamic' | 'behavioral';
  criteria?: ISegmentCriteria;
  customer_ids?: string[];
}

export interface IUpdateSegmentRequest {
  segment_name?: string;
  description?: string;
  criteria?: ISegmentCriteria;
  customer_ids?: string[];
  status?: 'active' | 'archived' | 'draft';
}

export interface ISegmentFilterRequest {
  segment_type?: 'static' | 'dynamic' | 'behavioral';
  status?: 'active' | 'archived' | 'draft';
  created_by?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'segment_name' | 'created_at' | 'updated_at' | 'customer_count';
  sort_order?: 'asc' | 'desc';
}

export interface ICreateCampaignRequest {
  segment_id: string;
  campaign_name: string;
  campaign_type: 'email' | 'sms' | 'notification' | 'discount';
  subject?: string;
  content?: string;
  discount_code?: string;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  scheduled_at?: string;
}

export interface ISegmentExportRequest {
  segment_id: string;
  format: 'csv' | 'xlsx';
  include_customer_details?: boolean;
  fields?: string[];
}

// Analytics interfaces
export interface ISegmentAnalytics {
  segment_id: string;
  segment_name: string;
  
  // Basic metrics
  total_customers: number;
  active_customers: number;
  growth_rate: number;
  
  // Revenue metrics
  total_revenue: string;
  average_revenue_per_customer: string;
  revenue_contribution: number; // percentage of total business
  
  // Engagement metrics
  average_order_frequency: number;
  customer_lifetime_value: string;
  retention_rate: number;
  
  // Campaign performance
  campaigns_sent: number;
  average_open_rate: number;
  average_click_rate: number;
  average_conversion_rate: number;
  
  // Trends
  customer_growth_trend: Array<{
    date: string;
    count: number;
  }>;
  revenue_trend: Array<{
    date: string;
    amount: string;
  }>;
}
```

## Service Implementation

```typescript
// src/features/customer-segment/services/customer-segment.service.ts
import { eq, and, desc, count, sum, sql, inArray, or, ilike } from 'drizzle-orm';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { orders } from '../../orders/shared/orders.schema';
import { orderItems } from '../../orders/shared/order-items.schema';
import {
  customerSegments,
  customerSegmentMemberships,
  customerSegmentCampaigns,
  NewCustomerSegment,
  NewCustomerSegmentMembership,
  NewCustomerSegmentCampaign,
} from '../shared/customer-segment.schema';
import {
  ICustomerSegment,
  ICustomerSegmentWithDetails,
  ISegmentCustomer,
  ISegmentCriteria,
  ICreateSegmentRequest,
  IUpdateSegmentRequest,
  ISegmentFilterRequest,
  ISegmentAnalytics,
} from '../shared/interface';

export class CustomerSegmentService {
  // Create new customer segment
  async createSegment(data: ICreateSegmentRequest, userId: string): Promise<ICustomerSegment> {
    const newSegment: NewCustomerSegment = {
      segment_name: data.segment_name,
      description: data.description,
      segment_type: data.segment_type,
      criteria: data.criteria || {},
      customer_ids: data.customer_ids || [],
      created_by: userId,
    };

    const [segment] = await db
      .insert(customerSegments)
      .values(newSegment)
      .returning();

    // For static segments, add customer memberships
    if (data.segment_type === 'static' && data.customer_ids?.length) {
      await this.addCustomersToSegment(segment.id, data.customer_ids, userId, 'manual');
    }

    // For dynamic segments, evaluate criteria and add matching customers
    if (data.segment_type === 'dynamic' && data.criteria) {
      await this.evaluateAndUpdateDynamicSegment(segment.id);
    }

    return this.mapToInterface(segment);
  }

  // Get all segments with filtering
  async getSegments(filters: ISegmentFilterRequest): Promise<{
    segments: ICustomerSegment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [eq(customerSegments.is_deleted, false)];

    if (filters.segment_type) {
      whereConditions.push(eq(customerSegments.segment_type, filters.segment_type));
    }

    if (filters.status) {
      whereConditions.push(eq(customerSegments.status, filters.status));
    }

    if (filters.created_by) {
      whereConditions.push(eq(customerSegments.created_by, filters.created_by));
    }

    if (filters.search) {
      whereConditions.push(
        or(
          ilike(customerSegments.segment_name, `%${filters.search}%`),
          ilike(customerSegments.description, `%${filters.search}%`)
        )!
      );
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(customerSegments)
      .where(and(...whereConditions));

    // Get segments with pagination
    let orderBy;
    const sortOrder = filters.sort_order === 'desc' ? desc : asc;
    
    switch (filters.sort_by) {
      case 'segment_name':
        orderBy = sortOrder(customerSegments.segment_name);
        break;
      case 'customer_count':
        orderBy = sortOrder(customerSegments.customer_count);
        break;
      case 'updated_at':
        orderBy = sortOrder(customerSegments.updated_at);
        break;
      default:
        orderBy = desc(customerSegments.created_at);
    }

    const segments = await db
      .select()
      .from(customerSegments)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      segments: segments.map(this.mapToInterface),
      total,
      page,
      limit,
    };
  }

  // Get segment by ID with full details
  async getSegmentById(segmentId: string, includeCustomers = false): Promise<ICustomerSegmentWithDetails | null> {
    const segment = await db
      .select()
      .from(customerSegments)
      .where(and(
        eq(customerSegments.id, segmentId),
        eq(customerSegments.is_deleted, false)
      ))
      .limit(1);

    if (!segment.length) return null;

    let segmentData: ICustomerSegmentWithDetails = this.mapToInterface(segment[0]);

    // Include creator name
    const creator = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, segment[0].created_by!))
      .limit(1);

    if (creator.length) {
      segmentData.creator_name = creator[0].name;
    }

    // Include customers if requested
    if (includeCustomers) {
      segmentData.customers = await this.getSegmentCustomers(segmentId);
    }

    // Include campaigns
    segmentData.campaigns = await this.getSegmentCampaigns(segmentId);

    return segmentData;
  }

  // Update segment
  async updateSegment(segmentId: string, data: IUpdateSegmentRequest, userId: string): Promise<ICustomerSegment | null> {
    const updateData: Partial<NewCustomerSegment> = {
      updated_at: new Date(),
    };

    if (data.segment_name) updateData.segment_name = data.segment_name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.criteria) updateData.criteria = data.criteria;
    if (data.customer_ids) updateData.customer_ids = data.customer_ids;

    const [updatedSegment] = await db
      .update(customerSegments)
      .set(updateData)
      .where(and(
        eq(customerSegments.id, segmentId),
        eq(customerSegments.is_deleted, false)
      ))
      .returning();

    if (!updatedSegment) return null;

    // If updating customer_ids for static segment, update memberships
    if (data.customer_ids && updatedSegment.segment_type === 'static') {
      await this.updateStaticSegmentMemberships(segmentId, data.customer_ids, userId);
    }

    // If updating criteria for dynamic segment, re-evaluate
    if (data.criteria && updatedSegment.segment_type === 'dynamic') {
      await this.evaluateAndUpdateDynamicSegment(segmentId);
    }

    return this.mapToInterface(updatedSegment);
  }

  // Delete segment (soft delete)
  async deleteSegment(segmentId: string): Promise<boolean> {
    const [deleted] = await db
      .update(customerSegments)
      .set({
        is_deleted: true,
        updated_at: new Date(),
      })
      .where(and(
        eq(customerSegments.id, segmentId),
        eq(customerSegments.is_deleted, false)
      ))
      .returning();

    return !!deleted;
  }

  // Get customers in a segment
  async getSegmentCustomers(segmentId: string): Promise<ISegmentCustomer[]> {
    const customersWithMembership = await db
      .select({
        // Customer data
        id: users.id,
        name: users.name,
        email: users.email,
        customer_type: users.user_type,
        registration_date: users.created_at,
        
        // Membership data
        membership_date: customerSegmentMemberships.joined_at,
        membership_source: customerSegmentMemberships.source,
      })
      .from(customerSegmentMemberships)
      .innerJoin(users, eq(customerSegmentMemberships.customer_id, users.id))
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true),
        eq(users.is_deleted, false)
      ))
      .orderBy(desc(customerSegmentMemberships.joined_at));

    // Get order statistics for each customer
    const customerIds = customersWithMembership.map(c => c.id);
    
    if (!customerIds.length) return [];

    const customerStats = await db
      .select({
        customer_id: orders.user_id,
        total_orders: sql<number>`COUNT(*)`,
        total_spent: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
        average_order_value: sql<string>`COALESCE(AVG(${orders.total_amount}), 0)`,
        last_order_date: sql<string>`MAX(${orders.created_at})`,
      })
      .from(orders)
      .where(and(
        inArray(orders.user_id, customerIds),
        eq(orders.is_deleted, false)
      ))
      .groupBy(orders.user_id);

    // Combine customer data with statistics
    return customersWithMembership.map(customer => {
      const stats = customerStats.find(s => s.customer_id === customer.id);
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        customer_type: customer.customer_type as 'individual' | 'business',
        registration_date: customer.registration_date.toISOString(),
        membership_date: customer.membership_date.toISOString(),
        membership_source: customer.membership_source,
        total_orders: stats?.total_orders || 0,
        total_spent: stats?.total_spent || '0',
        average_order_value: stats?.average_order_value || '0',
        last_order_date: stats?.last_order_date || undefined,
      };
    });
  }

  // Add customers to segment
  async addCustomersToSegment(
    segmentId: string,
    customerIds: string[],
    userId: string,
    source: 'automatic' | 'manual' | 'import' = 'manual'
  ): Promise<void> {
    // Remove existing memberships for these customers
    await db
      .update(customerSegmentMemberships)
      .set({ is_active: false, left_at: new Date() })
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        inArray(customerSegmentMemberships.customer_id, customerIds)
      ));

    // Add new memberships
    const memberships: NewCustomerSegmentMembership[] = customerIds.map(customerId => ({
      customer_id: customerId,
      segment_id: segmentId,
      source,
      added_by: userId,
    }));

    await db.insert(customerSegmentMemberships).values(memberships);

    // Update segment customer count
    await this.updateSegmentCustomerCount(segmentId);
  }

  // Remove customers from segment
  async removeCustomersFromSegment(segmentId: string, customerIds: string[]): Promise<void> {
    await db
      .update(customerSegmentMemberships)
      .set({ is_active: false, left_at: new Date() })
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        inArray(customerSegmentMemberships.customer_id, customerIds),
        eq(customerSegmentMemberships.is_active, true)
      ));

    // Update segment customer count
    await this.updateSegmentCustomerCount(segmentId);
  }

  // Evaluate and update dynamic segment
  async evaluateAndUpdateDynamicSegment(segmentId: string): Promise<void> {
    const segment = await db
      .select()
      .from(customerSegments)
      .where(eq(customerSegments.id, segmentId))
      .limit(1);

    if (!segment.length || segment[0].segment_type !== 'dynamic') return;

    const criteria = segment[0].criteria as ISegmentCriteria;
    const matchingCustomers = await this.findCustomersByCriteria(criteria);
    
    // Get current segment members
    const currentMembers = await db
      .select({ customer_id: customerSegmentMemberships.customer_id })
      .from(customerSegmentMemberships)
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true)
      ));

    const currentCustomerIds = currentMembers.map(m => m.customer_id);
    const newCustomerIds = matchingCustomers.map(c => c.id);

    // Remove customers who no longer match
    const toRemove = currentCustomerIds.filter(id => !newCustomerIds.includes(id));
    if (toRemove.length) {
      await this.removeCustomersFromSegment(segmentId, toRemove);
    }

    // Add new customers who now match
    const toAdd = newCustomerIds.filter(id => !currentCustomerIds.includes(id));
    if (toAdd.length) {
      await this.addCustomersToSegment(segmentId, toAdd, segment[0].created_by!, 'automatic');
    }

    // Update last_updated timestamp
    await db
      .update(customerSegments)
      .set({ last_updated: new Date() })
      .where(eq(customerSegments.id, segmentId));
  }

  // Find customers by criteria
  async findCustomersByCriteria(criteria: ISegmentCriteria): Promise<Array<{ id: string }>> {
    let query = db.select({ id: users.id }).from(users);
    const whereConditions = [eq(users.is_deleted, false)];

    // Customer type filter
    if (criteria.customer_type) {
      whereConditions.push(eq(users.user_type, criteria.customer_type));
    }

    // Registration date filter
    if (criteria.registration_date) {
      const regDate = criteria.registration_date;
      if (regDate.operator === 'before' && regDate.date) {
        whereConditions.push(sql`${users.created_at} < ${regDate.date}`);
      } else if (regDate.operator === 'after' && regDate.date) {
        whereConditions.push(sql`${users.created_at} > ${regDate.date}`);
      } else if (regDate.operator === 'between' && regDate.start_date && regDate.end_date) {
        whereConditions.push(sql`${users.created_at} BETWEEN ${regDate.start_date} AND ${regDate.end_date}`);
      }
    }

    // Add order-based filters by joining with orders
    let needsOrderJoin = !!(criteria.total_orders || criteria.total_spent || criteria.average_order_value || criteria.last_order_date);

    if (needsOrderJoin) {
      query = query.leftJoin(orders, eq(users.id, orders.user_id));
      whereConditions.push(eq(orders.is_deleted, false));
    }

    return await query.where(and(...whereConditions)).groupBy(users.id);
  }

  // Get segment analytics
  async getSegmentAnalytics(segmentId: string): Promise<ISegmentAnalytics> {
    const segment = await db
      .select()
      .from(customerSegments)
      .where(eq(customerSegments.id, segmentId))
      .limit(1);

    if (!segment.length) {
      throw new Error('Segment not found');
    }

    // Get basic customer metrics
    const [customerMetrics] = await db
      .select({
        total_customers: sql<number>`COUNT(*)`,
      })
      .from(customerSegmentMemberships)
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true)
      ));

    // Get revenue metrics for segment customers
    const [revenueMetrics] = await db
      .select({
        total_revenue: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
        average_revenue_per_customer: sql<string>`COALESCE(AVG(${orders.total_amount}), 0)`,
      })
      .from(customerSegmentMemberships)
      .innerJoin(orders, eq(customerSegmentMemberships.customer_id, orders.user_id))
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true),
        eq(orders.is_deleted, false)
      ));

    // Get campaign metrics
    const [campaignMetrics] = await db
      .select({
        campaigns_sent: sql<number>`COUNT(*)`,
        average_open_rate: sql<number>`AVG(CASE WHEN recipients_count > 0 THEN opened_count::float / recipients_count * 100 ELSE 0 END)`,
        average_click_rate: sql<number>`AVG(CASE WHEN recipients_count > 0 THEN clicked_count::float / recipients_count * 100 ELSE 0 END)`,
        average_conversion_rate: sql<number>`AVG(CASE WHEN recipients_count > 0 THEN converted_count::float / recipients_count * 100 ELSE 0 END)`,
      })
      .from(customerSegmentCampaigns)
      .where(and(
        eq(customerSegmentCampaigns.segment_id, segmentId),
        eq(customerSegmentCampaigns.status, 'sent')
      ));

    return {
      segment_id: segmentId,
      segment_name: segment[0].segment_name,
      total_customers: customerMetrics.total_customers,
      active_customers: customerMetrics.total_customers, // For now, same as total
      growth_rate: 0, // Calculate based on historical data
      total_revenue: revenueMetrics.total_revenue,
      average_revenue_per_customer: revenueMetrics.average_revenue_per_customer,
      revenue_contribution: 0, // Calculate percentage of total business
      average_order_frequency: 0, // Calculate from order data
      customer_lifetime_value: '0', // Calculate CLV
      retention_rate: 0, // Calculate retention
      campaigns_sent: campaignMetrics.campaigns_sent,
      average_open_rate: campaignMetrics.average_open_rate || 0,
      average_click_rate: campaignMetrics.average_click_rate || 0,
      average_conversion_rate: campaignMetrics.average_conversion_rate || 0,
      customer_growth_trend: [], // Implement trend analysis
      revenue_trend: [], // Implement revenue trend
    };
  }

  // Helper methods
  private async updateSegmentCustomerCount(segmentId: string): Promise<void> {
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(customerSegmentMemberships)
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true)
      ));

    await db
      .update(customerSegments)
      .set({ customer_count: count, last_updated: new Date() })
      .where(eq(customerSegments.id, segmentId));
  }

  private async updateStaticSegmentMemberships(
    segmentId: string,
    customerIds: string[],
    userId: string
  ): Promise<void> {
    // Deactivate all current memberships
    await db
      .update(customerSegmentMemberships)
      .set({ is_active: false, left_at: new Date() })
      .where(and(
        eq(customerSegmentMemberships.segment_id, segmentId),
        eq(customerSegmentMemberships.is_active, true)
      ));

    // Add new memberships
    if (customerIds.length) {
      await this.addCustomersToSegment(segmentId, customerIds, userId, 'manual');
    }
  }

  private async getSegmentCampaigns(segmentId: string) {
    return await db
      .select()
      .from(customerSegmentCampaigns)
      .where(and(
        eq(customerSegmentCampaigns.segment_id, segmentId),
        eq(customerSegmentCampaigns.is_deleted, false)
      ))
      .orderBy(desc(customerSegmentCampaigns.created_at));
  }

  private mapToInterface(segment: CustomerSegment): ICustomerSegment {
    return {
      id: segment.id,
      segment_name: segment.segment_name,
      description: segment.description || undefined,
      segment_type: segment.segment_type,
      status: segment.status,
      criteria: segment.criteria as ISegmentCriteria,
      customer_ids: segment.customer_ids,
      customer_count: segment.customer_count,
      last_updated: segment.last_updated.toISOString(),
      created_by: segment.created_by!,
      created_at: segment.created_at.toISOString(),
      updated_at: segment.updated_at.toISOString(),
      is_deleted: segment.is_deleted,
    };
  }
}

export const customerSegmentService = new CustomerSegmentService();
```

## API Controllers

```typescript
// src/features/customer-segment/controllers/customer-segment.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { customerSegmentService } from '../services/customer-segment.service';
import { ResponseFormatter } from '../../../utils';

const segmentCriteriaSchema = z.object({
  customer_type: z.enum(['individual', 'business']).optional(),
  registration_date: z.object({
    operator: z.enum(['before', 'after', 'between']),
    date: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }).optional(),
  location: z.object({
    countries: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
  }).optional(),
  total_orders: z.object({
    operator: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'between']),
    value: z.number().optional(),
    min_value: z.number().optional(),
    max_value: z.number().optional(),
  }).optional(),
  total_spent: z.object({
    operator: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'between']),
    value: z.number().optional(),
    min_value: z.number().optional(),
    max_value: z.number().optional(),
  }).optional(),
  // Add more criteria as needed
});

const createSegmentSchema = z.object({
  segment_name: z.string().min(1).max(255),
  description: z.string().optional(),
  segment_type: z.enum(['static', 'dynamic', 'behavioral']),
  criteria: segmentCriteriaSchema.optional(),
  customer_ids: z.array(z.string().uuid()).optional(),
});

const updateSegmentSchema = createSegmentSchema.partial().extend({
  status: z.enum(['active', 'archived', 'draft']).optional(),
});

const filterSegmentsSchema = z.object({
  segment_type: z.enum(['static', 'dynamic', 'behavioral']).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  created_by: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort_by: z.enum(['segment_name', 'created_at', 'updated_at', 'customer_count']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export class CustomerSegmentController {
  // Create new segment
  async createSegment(req: Request, res: Response): Promise<void> {
    const body = createSegmentSchema.parse(req.body);
    const userId = req.user!.id;

    const segment = await customerSegmentService.createSegment(body, userId);

    ResponseFormatter.success(res, segment, 'Customer segment created successfully', 201);
  }

  // Get all segments with filtering
  async getSegments(req: Request, res: Response): Promise<void> {
    const filters = filterSegmentsSchema.parse(req.query);

    const result = await customerSegmentService.getSegments(filters);

    ResponseFormatter.success(res, result, 'Customer segments retrieved successfully');
  }

  // Get segment by ID
  async getSegmentById(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;
    const includeCustomers = req.query.include_customers === 'true';

    const segment = await customerSegmentService.getSegmentById(segmentId, includeCustomers);

    if (!segment) {
      return ResponseFormatter.error(res, 'Customer segment not found', 404);
    }

    ResponseFormatter.success(res, segment, 'Customer segment retrieved successfully');
  }

  // Update segment
  async updateSegment(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;
    const body = updateSegmentSchema.parse(req.body);
    const userId = req.user!.id;

    const segment = await customerSegmentService.updateSegment(segmentId, body, userId);

    if (!segment) {
      return ResponseFormatter.error(res, 'Customer segment not found', 404);
    }

    ResponseFormatter.success(res, segment, 'Customer segment updated successfully');
  }

  // Delete segment
  async deleteSegment(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;

    const deleted = await customerSegmentService.deleteSegment(segmentId);

    if (!deleted) {
      return ResponseFormatter.error(res, 'Customer segment not found', 404);
    }

    ResponseFormatter.success(res, null, 'Customer segment deleted successfully');
  }

  // Get segment customers
  async getSegmentCustomers(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;

    const customers = await customerSegmentService.getSegmentCustomers(segmentId);

    ResponseFormatter.success(res, { customers }, 'Segment customers retrieved successfully');
  }

  // Add customers to segment
  async addCustomersToSegment(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;
    const { customer_ids } = z.object({
      customer_ids: z.array(z.string().uuid()).min(1),
    }).parse(req.body);
    const userId = req.user!.id;

    await customerSegmentService.addCustomersToSegment(segmentId, customer_ids, userId);

    ResponseFormatter.success(res, null, 'Customers added to segment successfully');
  }

  // Remove customers from segment
  async removeCustomersFromSegment(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;
    const { customer_ids } = z.object({
      customer_ids: z.array(z.string().uuid()).min(1),
    }).parse(req.body);

    await customerSegmentService.removeCustomersFromSegment(segmentId, customer_ids);

    ResponseFormatter.success(res, null, 'Customers removed from segment successfully');
  }

  // Get segment analytics
  async getSegmentAnalytics(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;

    const analytics = await customerSegmentService.getSegmentAnalytics(segmentId);

    ResponseFormatter.success(res, analytics, 'Segment analytics retrieved successfully');
  }

  // Refresh dynamic segment
  async refreshDynamicSegment(req: Request, res: Response): Promise<void> {
    const segmentId = req.params.id;

    await customerSegmentService.evaluateAndUpdateDynamicSegment(segmentId);

    ResponseFormatter.success(res, null, 'Dynamic segment refreshed successfully');
  }
}
```

## API Routes

```typescript
// src/features/customer-segment/routes/customer-segment.routes.ts
import { Router } from 'express';
import { CustomerSegmentController } from '../controllers/customer-segment.controller';
import { requireAuth, requirePermission } from '../../../middlewares';

const router = Router();
const controller = new CustomerSegmentController();

// Segment management
router.post('/', requireAuth, requirePermission('customer_segments:create'), controller.createSegment);
router.get('/', requireAuth, requirePermission('customer_segments:read'), controller.getSegments);
router.get('/:id', requireAuth, requirePermission('customer_segments:read'), controller.getSegmentById);
router.put('/:id', requireAuth, requirePermission('customer_segments:update'), controller.updateSegment);
router.delete('/:id', requireAuth, requirePermission('customer_segments:delete'), controller.deleteSegment);

// Segment customers management
router.get('/:id/customers', requireAuth, requirePermission('customer_segments:read'), controller.getSegmentCustomers);
router.post('/:id/customers', requireAuth, requirePermission('customer_segments:update'), controller.addCustomersToSegment);
router.delete('/:id/customers', requireAuth, requirePermission('customer_segments:update'), controller.removeCustomersFromSegment);

// Segment analytics and operations
router.get('/:id/analytics', requireAuth, requirePermission('customer_segments:read'), controller.getSegmentAnalytics);
router.post('/:id/refresh', requireAuth, requirePermission('customer_segments:update'), controller.refreshDynamicSegment);

export default router;
```

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add customer segmentation tables (use the SQL schema above)
-- Run: npm run db:migrate
```

### Step 2: File Structure
```bash
# Create the feature structure
mkdir -p src/features/customer-segment/{controllers,services,routes,shared}

# Create files:
# - src/features/customer-segment/shared/customer-segment.schema.ts
# - src/features/customer-segment/shared/interface.ts
# - src/features/customer-segment/services/customer-segment.service.ts
# - src/features/customer-segment/controllers/customer-segment.controller.ts
# - src/features/customer-segment/routes/customer-segment.routes.ts
# - src/features/customer-segment/index.ts
```

### Step 3: Register Routes
```typescript
// src/features/customer-segment/index.ts
import { Router } from 'express';
import customerSegmentRoutes from './routes/customer-segment.routes';

const router = Router();

router.use('/customer-segments', customerSegmentRoutes);

export default router;
```

### Step 4: Add to Main App
```typescript
// src/app.ts - add customer segment routes
import customerSegmentRoutes from './features/customer-segment';

app.use('/api', customerSegmentRoutes);
```

## Testing

```typescript
// Test endpoints with these examples:

// Create segment
POST /api/customer-segments
{
  "segment_name": "High Value Customers",
  "description": "Customers who have spent more than $1000",
  "segment_type": "dynamic",
  "criteria": {
    "total_spent": {
      "operator": "gt",
      "value": 1000
    }
  }
}

// Get all segments
GET /api/customer-segments?segment_type=dynamic&status=active

// Get segment with customers
GET /api/customer-segments/{id}?include_customers=true

// Add customers to segment
POST /api/customer-segments/{id}/customers
{
  "customer_ids": ["customer-uuid-1", "customer-uuid-2"]
}

// Get segment analytics
GET /api/customer-segments/{id}/analytics

// Refresh dynamic segment
POST /api/customer-segments/{id}/refresh
```

This Customer Segmentation API provides comprehensive customer grouping, targeting, and campaign management capabilities for advanced marketing automation and customer analysis.