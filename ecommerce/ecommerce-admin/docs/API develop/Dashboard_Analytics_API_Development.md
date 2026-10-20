# Dashboard Analytics API Development Guide

## Overview
Complete backend implementation guide for Dashboard Analytics API to provide comprehensive business intelligence, KPIs, charts, and performance metrics for the admin dashboard.

## Database Schema

### Analytics Tables
```sql
-- analytics_snapshots table (for cached/pre-calculated metrics)
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    metrics JSONB NOT NULL, -- Stored calculated metrics
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(snapshot_date, snapshot_type)
);

-- analytics_events table (for tracking custom events)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'product_view', 'order_placed', etc.
    entity_type VARCHAR(50), -- 'product', 'order', 'user', etc.
    entity_id UUID,
    user_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_date ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_snapshots_date_type ON analytics_snapshots(snapshot_date, snapshot_type);
```

## Drizzle Schema Implementation

```typescript
// src/features/dashboard/shared/analytics.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  date,
  jsonb,
  timestamp,
  text,
  inet,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from '../../user/shared/user.schema';

export const analyticsSnapshots = pgTable(
  'analytics_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    snapshot_date: date('snapshot_date').notNull(),
    snapshot_type: varchar('snapshot_type', { length: 50 }).notNull(),
    metrics: jsonb('metrics').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueDateType: unique('analytics_snapshots_date_type_unique').on(
      table.snapshot_date,
      table.snapshot_type
    ),
  })
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    event_type: varchar('event_type', { length: 100 }).notNull(),
    entity_type: varchar('entity_type', { length: 50 }),
    entity_id: uuid('entity_id'),
    user_id: uuid('user_id').references(() => users.id),
    metadata: jsonb('metadata').default({}),
    ip_address: inet('ip_address'),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index('analytics_events_type_idx').on(table.event_type),
    dateIdx: index('analytics_events_date_idx').on(table.created_at),
    userIdx: index('analytics_events_user_idx').on(table.user_id),
    entityIdx: index('analytics_events_entity_idx').on(table.entity_type, table.entity_id),
  })
);

// TypeScript types
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type NewAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
```

## Interface Types

```typescript
// src/features/dashboard/shared/interface.ts

// Dashboard Overview Metrics
export interface IDashboardOverview {
  // Revenue metrics
  total_revenue: string;
  revenue_growth: number; // percentage
  monthly_revenue: string;
  revenue_trend: Array<{ date: string; amount: string }>;

  // Order metrics
  total_orders: number;
  orders_growth: number;
  pending_orders: number;
  completed_orders: number;
  average_order_value: string;
  orders_trend: Array<{ date: string; count: number }>;

  // Customer metrics
  total_customers: number;
  customers_growth: number;
  new_customers_today: number;
  new_customers_month: number;
  customer_retention_rate: number;
  customers_trend: Array<{ date: string; count: number }>;

  // Product metrics
  total_products: number;
  active_products: number;
  draft_products: number;
  low_stock_products: number;
  out_of_stock_products: number;

  // Content metrics
  total_blogs: number;
  published_blogs: number;
  total_collections: number;
  active_collections: number;
}

// Sales Analytics
export interface ISalesAnalytics {
  total_revenue: string;
  total_orders: number;
  average_order_value: string;
  conversion_rate: number;
  
  // Time series data
  revenue_by_day: Array<{
    date: string;
    revenue: string;
    orders_count: number;
    average_order_value: string;
  }>;
  
  revenue_by_month: Array<{
    month: string;
    year: number;
    revenue: string;
    orders_count: number;
    growth_rate: number;
  }>;
  
  // Top performing products
  top_products: Array<{
    product_id: string;
    product_title: string;
    total_sold: number;
    revenue: string;
    growth_rate: number;
  }>;
  
  // Order status distribution
  order_status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
    revenue: string;
  }>;

  // Payment method distribution
  payment_method_distribution: Array<{
    method: string;
    count: number;
    percentage: number;
    revenue: string;
  }>;
}

// Customer Analytics
export interface ICustomerAnalytics {
  total_customers: number;
  new_customers_this_month: number;
  customer_growth_rate: number;
  customer_lifetime_value: string;
  
  // Customer segmentation
  customers_by_type: Array<{
    type: 'individual' | 'business';
    count: number;
    percentage: number;
    revenue: string;
  }>;
  
  // Geographic distribution
  customers_by_location: Array<{
    country: string;
    state?: string;
    count: number;
    percentage: number;
  }>;
  
  // Customer behavior
  average_order_value: string;
  repeat_customer_rate: number;
  customer_retention_rate: number;
  
  // Registration trends
  registrations_by_day: Array<{
    date: string;
    count: number;
    cumulative_count: number;
  }>;

  // Top customers
  top_customers: Array<{
    user_id: string;
    customer_name: string;
    customer_email: string;
    total_orders: number;
    total_spent: string;
    last_order_date: string;
  }>;
}

// Product Analytics
export interface IProductAnalytics {
  total_products: number;
  active_products: number;
  draft_products: number;
  archived_products: number;
  
  // Inventory alerts
  low_stock_alerts: Array<{
    product_id: string;
    product_title: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
  }>;
  
  // Product performance
  best_selling_products: Array<{
    product_id: string;
    product_title: string;
    units_sold: number;
    revenue: string;
    profit_margin: string;
  }>;

  worst_performing_products: Array<{
    product_id: string;
    product_title: string;
    units_sold: number;
    revenue: string;
    views: number;
  }>;
  
  // Category performance
  category_performance: Array<{
    category: string;
    products_count: number;
    total_sales: string;
    units_sold: number;
    average_price: string;
  }>;

  // Product views vs sales
  conversion_metrics: Array<{
    product_id: string;
    product_title: string;
    views: number;
    orders: number;
    conversion_rate: number;
  }>;
}

// Time range filter
export interface ITimeRange {
  start_date?: string;
  end_date?: string;
  period?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
}

// Chart data interfaces
export interface IChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

// Export data interface
export interface IExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  data_type: 'overview' | 'sales' | 'customers' | 'products';
  time_range: ITimeRange;
  include_charts?: boolean;
}
```

## Service Implementation

```typescript
// src/features/dashboard/services/analytics.service.ts
import { eq, and, desc, count, sum, avg, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../database';
import { orders } from '../../orders/shared/orders.schema';
import { orderItems } from '../../orders/shared/order-items.schema';
import { products } from '../../product/shared/product.schema';
import { users } from '../../user/shared/user.schema';
import { blogs } from '../../blog/shared/blog.schema';
import { collections } from '../../collection/shared/collection.schema';
import { analyticsSnapshots, analyticsEvents } from '../shared/analytics.schema';
import {
  IDashboardOverview,
  ISalesAnalytics,
  ICustomerAnalytics,
  IProductAnalytics,
  ITimeRange,
  IChartData
} from '../shared/interface';

export class AnalyticsService {
  // Get dashboard overview metrics
  async getDashboardOverview(timeRange?: ITimeRange): Promise<IDashboardOverview> {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    // Revenue metrics
    const revenueMetrics = await this.getRevenueMetrics(startDate, endDate);
    
    // Order metrics
    const orderMetrics = await this.getOrderMetrics(startDate, endDate);
    
    // Customer metrics
    const customerMetrics = await this.getCustomerMetrics(startDate, endDate);
    
    // Product metrics
    const productMetrics = await this.getProductMetrics();
    
    // Content metrics
    const contentMetrics = await this.getContentMetrics();

    return {
      // Revenue
      total_revenue: revenueMetrics.total_revenue,
      revenue_growth: revenueMetrics.growth_rate,
      monthly_revenue: revenueMetrics.monthly_revenue,
      revenue_trend: revenueMetrics.trend,

      // Orders
      total_orders: orderMetrics.total_orders,
      orders_growth: orderMetrics.growth_rate,
      pending_orders: orderMetrics.pending_orders,
      completed_orders: orderMetrics.completed_orders,
      average_order_value: orderMetrics.average_order_value,
      orders_trend: orderMetrics.trend,

      // Customers
      total_customers: customerMetrics.total_customers,
      customers_growth: customerMetrics.growth_rate,
      new_customers_today: customerMetrics.new_today,
      new_customers_month: customerMetrics.new_month,
      customer_retention_rate: customerMetrics.retention_rate,
      customers_trend: customerMetrics.trend,

      // Products
      total_products: productMetrics.total,
      active_products: productMetrics.active,
      draft_products: productMetrics.draft,
      low_stock_products: productMetrics.low_stock,
      out_of_stock_products: productMetrics.out_of_stock,

      // Content
      total_blogs: contentMetrics.total_blogs,
      published_blogs: contentMetrics.published_blogs,
      total_collections: contentMetrics.total_collections,
      active_collections: contentMetrics.active_collections,
    };
  }

  // Get detailed sales analytics
  async getSalesAnalytics(timeRange?: ITimeRange): Promise<ISalesAnalytics> {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    // Total sales metrics
    const [totalMetrics] = await db
      .select({
        total_revenue: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
        total_orders: sql<number>`COUNT(*)`,
        average_order_value: sql<string>`COALESCE(AVG(${orders.total_amount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      );

    // Revenue by day
    const revenueByDay = await db
      .select({
        date: sql<string>`DATE(${orders.created_at})`,
        revenue: sql<string>`SUM(${orders.total_amount})`,
        orders_count: sql<number>`COUNT(*)`,
        average_order_value: sql<string>`AVG(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(sql`DATE(${orders.created_at})`)
      .orderBy(sql`DATE(${orders.created_at})`);

    // Revenue by month
    const revenueByMonth = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.created_at}, 'Month')`,
        year: sql<number>`EXTRACT(YEAR FROM ${orders.created_at})`,
        revenue: sql<string>`SUM(${orders.total_amount})`,
        orders_count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(sql`EXTRACT(YEAR FROM ${orders.created_at}), EXTRACT(MONTH FROM ${orders.created_at})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${orders.created_at}), EXTRACT(MONTH FROM ${orders.created_at})`);

    // Top products
    const topProducts = await db
      .select({
        product_id: orderItems.product_id,
        product_title: orderItems.product_title,
        total_sold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<string>`SUM(${orderItems.line_total})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(orderItems.product_id, orderItems.product_title)
      .orderBy(desc(sql`SUM(${orderItems.line_total})`))
      .limit(10);

    // Order status distribution
    const orderStatusDistribution = await db
      .select({
        status: orders.order_status,
        count: sql<number>`COUNT(*)`,
        revenue: sql<string>`SUM(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(orders.order_status);

    // Payment method distribution
    const paymentMethodDistribution = await db
      .select({
        method: orders.payment_method,
        count: sql<number>`COUNT(*)`,
        revenue: sql<string>`SUM(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(orders.payment_method);

    // Calculate conversion rate (placeholder - implement based on your tracking)
    const conversionRate = 2.5; // Implement actual calculation

    return {
      total_revenue: totalMetrics.total_revenue,
      total_orders: totalMetrics.total_orders,
      average_order_value: totalMetrics.average_order_value,
      conversion_rate: conversionRate,
      revenue_by_day: revenueByDay,
      revenue_by_month: revenueByMonth.map(item => ({
        ...item,
        growth_rate: 0 // Calculate actual growth rate
      })),
      top_products: topProducts.map(item => ({
        ...item,
        growth_rate: 0 // Calculate actual growth rate
      })),
      order_status_distribution: orderStatusDistribution.map(item => ({
        ...item,
        percentage: 0 // Calculate percentage
      })),
      payment_method_distribution: paymentMethodDistribution.map(item => ({
        ...item,
        percentage: 0 // Calculate percentage
      })),
    };
  }

  // Get customer analytics
  async getCustomerAnalytics(timeRange?: ITimeRange): Promise<ICustomerAnalytics> {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    // Total customers
    const [totalCustomers] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.is_deleted, false));

    // New customers this month
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    
    const [newCustomersThisMonth] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, firstOfMonth)
        )
      );

    // Customer segmentation by type
    const customersByType = await db
      .select({
        type: users.user_type,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(eq(users.is_deleted, false))
      .groupBy(users.user_type);

    // Top customers by revenue
    const topCustomers = await db
      .select({
        user_id: users.id,
        customer_name: users.name,
        customer_email: users.email,
        total_orders: sql<number>`COUNT(${orders.id})`,
        total_spent: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
        last_order_date: sql<string>`MAX(${orders.created_at})`,
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.user_id))
      .where(eq(users.is_deleted, false))
      .groupBy(users.id, users.name, users.email)
      .orderBy(desc(sql`COALESCE(SUM(${orders.total_amount}), 0)`))
      .limit(10);

    // Customer registrations by day
    const registrationsByDay = await db
      .select({
        date: sql<string>`DATE(${users.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, startDate),
          lte(users.created_at, endDate)
        )
      )
      .groupBy(sql`DATE(${users.created_at})`)
      .orderBy(sql`DATE(${users.created_at})`);

    return {
      total_customers: totalCustomers.count,
      new_customers_this_month: newCustomersThisMonth.count,
      customer_growth_rate: 0, // Calculate growth rate
      customer_lifetime_value: '0', // Calculate CLV
      customers_by_type: customersByType.map(item => ({
        ...item,
        percentage: 0, // Calculate percentage
        revenue: '0', // Calculate revenue by type
      })),
      customers_by_location: [], // Implement geo analytics if needed
      average_order_value: '0', // Calculate from orders
      repeat_customer_rate: 0, // Calculate repeat rate
      customer_retention_rate: 0, // Calculate retention
      registrations_by_day: registrationsByDay.map((item, index, arr) => ({
        ...item,
        cumulative_count: arr.slice(0, index + 1).reduce((sum, curr) => sum + curr.count, 0),
      })),
      top_customers,
    };
  }

  // Get product analytics
  async getProductAnalytics(): Promise<IProductAnalytics> {
    // Product counts by status
    const productCounts = await db
      .select({
        status: products.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(eq(products.is_deleted, false))
      .groupBy(products.status);

    // Best selling products
    const bestSellingProducts = await db
      .select({
        product_id: orderItems.product_id,
        product_title: orderItems.product_title,
        units_sold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<string>`SUM(${orderItems.line_total})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .where(eq(orders.is_deleted, false))
      .groupBy(orderItems.product_id, orderItems.product_title)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(10);

    // Category performance
    const categoryPerformance = await db
      .select({
        category: products.category_tier_1,
        products_count: sql<number>`COUNT(DISTINCT ${products.id})`,
        units_sold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        total_sales: sql<string>`COALESCE(SUM(${orderItems.line_total}), 0)`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.product_id))
      .where(eq(products.is_deleted, false))
      .groupBy(products.category_tier_1)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.line_total}), 0)`));

    const totalProducts = productCounts.reduce((sum, item) => sum + item.count, 0);
    const activeProducts = productCounts.find(item => item.status === 'active')?.count || 0;
    const draftProducts = productCounts.find(item => item.status === 'draft')?.count || 0;
    const archivedProducts = productCounts.find(item => item.status === 'archived')?.count || 0;

    return {
      total_products: totalProducts,
      active_products: activeProducts,
      draft_products: draftProducts,
      archived_products: archivedProducts,
      low_stock_alerts: [], // Implement inventory tracking
      best_selling_products: bestSellingProducts.map(item => ({
        ...item,
        profit_margin: '0', // Calculate profit margin
      })),
      worst_performing_products: [], // Implement worst performers
      category_performance: categoryPerformance.map(item => ({
        ...item,
        category: item.category || 'Uncategorized',
        average_price: '0', // Calculate average price
      })),
      conversion_metrics: [], // Implement conversion tracking
    };
  }

  // Get chart data for specific metric
  async getChartData(chartType: string, timeRange?: ITimeRange): Promise<IChartData> {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    switch (chartType) {
      case 'revenue_trend':
        return this.getRevenueChartData(startDate, endDate);
      case 'orders_trend':
        return this.getOrdersChartData(startDate, endDate);
      case 'customers_trend':
        return this.getCustomersChartData(startDate, endDate);
      case 'top_products':
        return this.getTopProductsChartData(startDate, endDate);
      default:
        throw new Error('Invalid chart type');
    }
  }

  // Helper methods
  private parseTimeRange(timeRange?: ITimeRange) {
    const endDate = new Date();
    let startDate = new Date();

    if (timeRange?.period) {
      switch (timeRange.period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last_7_days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'last_30_days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'this_month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_month':
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'this_year':
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setFullYear(endDate.getFullYear() - 1);
          endDate.setMonth(11);
          endDate.setDate(31);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    } else if (timeRange?.start_date && timeRange?.end_date) {
      startDate = new Date(timeRange.start_date);
      endDate = new Date(timeRange.end_date);
    }

    return { startDate, endDate };
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const [current] = await db
      .select({
        total_revenue: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      );

    // Calculate previous period for growth rate
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    
    const [previous] = await db
      .select({
        total_revenue: sql<string>`COALESCE(SUM(${orders.total_amount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, prevStartDate),
          lte(orders.created_at, startDate)
        )
      );

    const growthRate = previous.total_revenue !== '0' 
      ? ((parseFloat(current.total_revenue) - parseFloat(previous.total_revenue)) / parseFloat(previous.total_revenue)) * 100
      : 0;

    // Get trend data (last 7 days)
    const trend = await db
      .select({
        date: sql<string>`DATE(${orders.created_at})`,
        amount: sql<string>`SUM(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`DATE(${orders.created_at})`)
      .orderBy(sql`DATE(${orders.created_at})`);

    return {
      total_revenue: current.total_revenue,
      growth_rate: growthRate,
      monthly_revenue: current.total_revenue, // Implement monthly calculation
      trend,
    };
  }

  private async getOrderMetrics(startDate: Date, endDate: Date) {
    const [metrics] = await db
      .select({
        total_orders: sql<number>`COUNT(*)`,
        pending_orders: sql<number>`COUNT(*) FILTER (WHERE ${orders.order_status} = 'pending')`,
        completed_orders: sql<number>`COUNT(*) FILTER (WHERE ${orders.order_status} = 'delivered')`,
        average_order_value: sql<string>`AVG(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      );

    // Get trend data
    const trend = await db
      .select({
        date: sql<string>`DATE(${orders.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`DATE(${orders.created_at})`)
      .orderBy(sql`DATE(${orders.created_at})`);

    return {
      ...metrics,
      growth_rate: 0, // Calculate growth rate
      trend,
    };
  }

  private async getCustomerMetrics(startDate: Date, endDate: Date) {
    const [total] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.is_deleted, false));

    const [newToday] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, new Date(new Date().setHours(0, 0, 0, 0)))
        )
      );

    const [newMonth] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, new Date(new Date().setDate(1)))
        )
      );

    const trend = await db
      .select({
        date: sql<string>`DATE(${users.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`DATE(${users.created_at})`)
      .orderBy(sql`DATE(${users.created_at})`);

    return {
      total_customers: total.count,
      new_today: newToday.count,
      new_month: newMonth.count,
      growth_rate: 0, // Calculate growth rate
      retention_rate: 0, // Calculate retention rate
      trend,
    };
  }

  private async getProductMetrics() {
    const [metrics] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${products.status} = 'active')`,
        draft: sql<number>`COUNT(*) FILTER (WHERE ${products.status} = 'draft')`,
      })
      .from(products)
      .where(eq(products.is_deleted, false));

    return {
      ...metrics,
      low_stock: 0, // Implement inventory tracking
      out_of_stock: 0, // Implement inventory tracking
    };
  }

  private async getContentMetrics() {
    const [blogMetrics] = await db
      .select({
        total_blogs: sql<number>`COUNT(*)`,
        published_blogs: sql<number>`COUNT(*) FILTER (WHERE ${blogs.status} = 'public')`,
      })
      .from(blogs);

    const [collectionMetrics] = await db
      .select({
        total_collections: sql<number>`COUNT(*)`,
        active_collections: sql<number>`COUNT(*) FILTER (WHERE ${collections.status} = 'active')`,
      })
      .from(collections);

    return {
      ...blogMetrics,
      ...collectionMetrics,
    };
  }

  private async getRevenueChartData(startDate: Date, endDate: Date): Promise<IChartData> {
    const data = await db
      .select({
        date: sql<string>`DATE(${orders.created_at})`,
        revenue: sql<number>`SUM(${orders.total_amount})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(sql`DATE(${orders.created_at})`)
      .orderBy(sql`DATE(${orders.created_at})`);

    return {
      labels: data.map(item => item.date),
      datasets: [{
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }],
    };
  }

  private async getOrdersChartData(startDate: Date, endDate: Date): Promise<IChartData> {
    const data = await db
      .select({
        date: sql<string>`DATE(${orders.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(sql`DATE(${orders.created_at})`)
      .orderBy(sql`DATE(${orders.created_at})`);

    return {
      labels: data.map(item => item.date),
      datasets: [{
        label: 'Orders',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      }],
    };
  }

  private async getCustomersChartData(startDate: Date, endDate: Date): Promise<IChartData> {
    const data = await db
      .select({
        date: sql<string>`DATE(${users.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(
        and(
          eq(users.is_deleted, false),
          gte(users.created_at, startDate),
          lte(users.created_at, endDate)
        )
      )
      .groupBy(sql`DATE(${users.created_at})`)
      .orderBy(sql`DATE(${users.created_at})`);

    return {
      labels: data.map(item => item.date),
      datasets: [{
        label: 'New Customers',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
      }],
    };
  }

  private async getTopProductsChartData(startDate: Date, endDate: Date): Promise<IChartData> {
    const data = await db
      .select({
        product_title: orderItems.product_title,
        revenue: sql<number>`SUM(${orderItems.line_total})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .where(
        and(
          eq(orders.is_deleted, false),
          gte(orders.created_at, startDate),
          lte(orders.created_at, endDate)
        )
      )
      .groupBy(orderItems.product_title)
      .orderBy(desc(sql`SUM(${orderItems.line_total})`))
      .limit(5);

    return {
      labels: data.map(item => item.product_title),
      datasets: [{
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      }],
    };
  }
}

export const analyticsService = new AnalyticsService();
```

## API Controllers

```typescript
// src/features/dashboard/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service';
import { ResponseFormatter } from '../../../utils';

const timeRangeSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  period: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month', 'this_year', 'last_year', 'custom']).optional(),
});

export class DashboardController {
  // Get dashboard overview
  async getOverview(req: Request, res: Response): Promise<void> {
    const timeRange = timeRangeSchema.parse(req.query);

    const overview = await analyticsService.getDashboardOverview(timeRange);

    ResponseFormatter.success(res, overview, 'Dashboard overview retrieved successfully');
  }

  // Get sales analytics
  async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    const timeRange = timeRangeSchema.parse(req.query);

    const salesAnalytics = await analyticsService.getSalesAnalytics(timeRange);

    ResponseFormatter.success(res, salesAnalytics, 'Sales analytics retrieved successfully');
  }

  // Get customer analytics
  async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    const timeRange = timeRangeSchema.parse(req.query);

    const customerAnalytics = await analyticsService.getCustomerAnalytics(timeRange);

    ResponseFormatter.success(res, customerAnalytics, 'Customer analytics retrieved successfully');
  }

  // Get product analytics
  async getProductAnalytics(req: Request, res: Response): Promise<void> {
    const productAnalytics = await analyticsService.getProductAnalytics();

    ResponseFormatter.success(res, productAnalytics, 'Product analytics retrieved successfully');
  }

  // Get chart data
  async getChartData(req: Request, res: Response): Promise<void> {
    const chartType = req.params.type;
    const timeRange = timeRangeSchema.parse(req.query);

    const chartData = await analyticsService.getChartData(chartType, timeRange);

    ResponseFormatter.success(res, chartData, 'Chart data retrieved successfully');
  }
}
```

## API Routes

```typescript
// src/features/dashboard/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth, requirePermission } from '../../../middlewares';

const router = Router();
const controller = new DashboardController();

// All dashboard routes require admin authentication
router.get('/overview', requireAuth, requirePermission('dashboard:read'), controller.getOverview);
router.get('/sales', requireAuth, requirePermission('dashboard:read'), controller.getSalesAnalytics);
router.get('/customers', requireAuth, requirePermission('dashboard:read'), controller.getCustomerAnalytics);
router.get('/products', requireAuth, requirePermission('dashboard:read'), controller.getProductAnalytics);
router.get('/charts/:type', requireAuth, requirePermission('dashboard:read'), controller.getChartData);

export default router;
```

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add analytics tables (use the SQL schema above)
-- Run: npm run db:migrate
```

### Step 2: File Structure
```bash
# Create the feature structure
mkdir -p src/features/dashboard/{controllers,services,routes,shared}

# Create files:
# - src/features/dashboard/shared/analytics.schema.ts
# - src/features/dashboard/shared/interface.ts
# - src/features/dashboard/services/analytics.service.ts
# - src/features/dashboard/controllers/dashboard.controller.ts
# - src/features/dashboard/routes/dashboard.routes.ts
# - src/features/dashboard/index.ts
```

### Step 3: Register Routes
```typescript
// src/features/dashboard/index.ts
import { Router } from 'express';
import dashboardRoutes from './routes/dashboard.routes';

const router = Router();

router.use('/dashboard', dashboardRoutes);

export default router;
```

### Step 4: Add to Main App
```typescript
// src/app.ts - add dashboard routes
import dashboardRoutes from './features/dashboard';

app.use('/api', dashboardRoutes);
```

## Testing

```typescript
// Test endpoints with these examples:

// Get dashboard overview
GET /api/dashboard/overview?period=last_30_days

// Get sales analytics
GET /api/dashboard/sales?period=this_month

// Get customer analytics
GET /api/dashboard/customers?period=last_7_days

// Get product analytics
GET /api/dashboard/products

// Get chart data
GET /api/dashboard/charts/revenue_trend?period=last_30_days
GET /api/dashboard/charts/top_products?period=this_month
```

This Dashboard Analytics API provides comprehensive business intelligence for the admin dashboard with KPIs, trends, and detailed analytics across all business areas.