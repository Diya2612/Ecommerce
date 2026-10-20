# Dashboard Analytics API Integration Guide

## Overview
Complete frontend integration guide for Dashboard Analytics with aggregated data from all features, charts, and KPIs.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const ANALYTICS_API = `${API_BASE_URL}/api/analytics`;
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});
```

## TypeScript Types

### Analytics Interfaces
```typescript
// Dashboard Overview Stats
export interface DashboardStats {
  // Orders Stats
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  orders_growth: number; // percentage
  revenue_total: string;
  revenue_growth: number; // percentage
  
  // Products Stats
  total_products: number;
  active_products: number;
  draft_products: number;
  low_stock_products: number;
  
  // Customers Stats
  total_customers: number;
  new_customers_today: number;
  customers_growth: number; // percentage
  
  // Content Stats
  total_blogs: number;
  published_blogs: number;
  total_collections: number;
  active_collections: number;
  
  // Recent Activity
  recent_orders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: string;
    status: string;
    created_at: string;
  }>;
  
  recent_customers: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
  }>;
  
  low_stock_items: Array<{
    id: string;
    product_title: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
  }>;
}

// Sales Analytics
export interface SalesAnalytics {
  total_revenue: string;
  total_orders: number;
  average_order_value: string;
  conversion_rate: number;
  
  // Time series data
  revenue_by_day: Array<{
    date: string;
    revenue: string;
    orders_count: number;
  }>;
  
  revenue_by_month: Array<{
    month: string;
    year: number;
    revenue: string;
    orders_count: number;
  }>;
  
  // Top performing items
  top_products: Array<{
    product_id: string;
    product_title: string;
    total_sold: number;
    revenue: string;
  }>;
  
  // Order status breakdown
  order_status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

// Customer Analytics
export interface CustomerAnalytics {
  total_customers: number;
  new_customers_this_month: number;
  customer_growth_rate: number;
  
  // Customer segmentation
  customers_by_type: Array<{
    type: 'individual' | 'business';
    count: number;
    percentage: number;
  }>;
  
  // Geographic distribution (if available)
  customers_by_location: Array<{
    country: string;
    state: string;
    count: number;
  }>;
  
  // Customer lifetime value
  average_order_value: string;
  repeat_customer_rate: number;
  
  // Registration trend
  registrations_by_day: Array<{
    date: string;
    count: number;
  }>;
}

// Inventory Analytics
export interface InventoryAnalytics {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  
  // Stock alerts
  stock_alerts: Array<{
    product_id: string;
    product_title: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
    status: 'out_of_stock' | 'low_stock';
  }>;
  
  // Product performance
  best_selling_products: Array<{
    product_id: string;
    product_title: string;
    units_sold: number;
    revenue: string;
  }>;
  
  // Category performance
  category_performance: Array<{
    category: string;
    products_count: number;
    total_sales: string;
  }>;
}

// Content Analytics
export interface ContentAnalytics {
  // Blog stats
  total_blogs: number;
  published_blogs: number;
  total_blog_views: number;
  
  popular_blogs: Array<{
    id: string;
    title: string;
    views_count: number;
    published_at: string;
  }>;
  
  // Collection stats
  total_collections: number;
  active_collections: number;
  
  popular_collections: Array<{
    id: string;
    title: string;
    products_count: number;
    total_sales: string;
  }>;
}

// Time Range Filter
export interface TimeRangeFilter {
  start_date?: string;
  end_date?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

// API Response Types
export interface AnalyticsResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

## API Service Implementation

### Analytics Service Class
```typescript
// src/features/dashboard/services/analyticsService.ts
import axios, { AxiosResponse } from 'axios';

class AnalyticsService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api`;

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Dashboard Overview Stats
  async getDashboardStats(timeRange?: TimeRangeFilter): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.start_date) params.append('start_date', timeRange.start_date);
      if (timeRange?.end_date) params.append('end_date', timeRange.end_date);
      if (timeRange?.period) params.append('period', timeRange.period);

      const response: AxiosResponse<AnalyticsResponse<DashboardStats>> = await axios.get(
        `${this.baseURL}/dashboard/stats?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sales Analytics
  async getSalesAnalytics(timeRange?: TimeRangeFilter): Promise<SalesAnalytics> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.start_date) params.append('start_date', timeRange.start_date);
      if (timeRange?.end_date) params.append('end_date', timeRange.end_date);
      if (timeRange?.period) params.append('period', timeRange.period);

      const response: AxiosResponse<AnalyticsResponse<SalesAnalytics>> = await axios.get(
        `${this.baseURL}/analytics/sales?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Customer Analytics
  async getCustomerAnalytics(timeRange?: TimeRangeFilter): Promise<CustomerAnalytics> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.start_date) params.append('start_date', timeRange.start_date);
      if (timeRange?.end_date) params.append('end_date', timeRange.end_date);
      if (timeRange?.period) params.append('period', timeRange.period);

      const response: AxiosResponse<AnalyticsResponse<CustomerAnalytics>> = await axios.get(
        `${this.baseURL}/analytics/customers?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Inventory Analytics
  async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    try {
      const response: AxiosResponse<AnalyticsResponse<InventoryAnalytics>> = await axios.get(
        `${this.baseURL}/analytics/inventory`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Content Analytics
  async getContentAnalytics(timeRange?: TimeRangeFilter): Promise<ContentAnalytics> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.start_date) params.append('start_date', timeRange.start_date);
      if (timeRange?.end_date) params.append('end_date', timeRange.end_date);
      if (timeRange?.period) params.append('period', timeRange.period);

      const response: AxiosResponse<AnalyticsResponse<ContentAnalytics>> = await axios.get(
        `${this.baseURL}/analytics/content?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Orders Analytics (from orders service)
  async getOrdersStats(timeRange?: TimeRangeFilter): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.start_date) params.append('start_date', timeRange.start_date);
      if (timeRange?.end_date) params.append('end_date', timeRange.end_date);
      if (timeRange?.period) params.append('period', timeRange.period);

      const response = await axios.get(
        `${this.baseURL}/orders/analytics?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Products Analytics (from products service)
  async getProductsStats(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/products/analytics`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handler
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(`API Error: ${message}`);
    } else if (error.request) {
      throw new Error('Network Error: No response received');
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

export const analyticsService = new AnalyticsService();
```

## React Hooks Implementation

### useDashboardStats Hook
```typescript
// src/features/dashboard/hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useDashboardStats = (timeRange?: TimeRangeFilter) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDashboardStats(timeRange);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange?.period, timeRange?.start_date, timeRange?.end_date]);

  const refetch = () => fetchStats();

  return { stats, loading, error, refetch };
};
```

### useAnalytics Hook
```typescript
// src/features/dashboard/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = (timeRange?: TimeRangeFilter) => {
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sales, customers, inventory, content] = await Promise.all([
        analyticsService.getSalesAnalytics(timeRange),
        analyticsService.getCustomerAnalytics(timeRange),
        analyticsService.getInventoryAnalytics(),
        analyticsService.getContentAnalytics(timeRange)
      ]);

      setSalesAnalytics(sales);
      setCustomerAnalytics(customers);
      setInventoryAnalytics(inventory);
      setContentAnalytics(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange?.period, timeRange?.start_date, timeRange?.end_date]);

  const refetch = () => fetchAllAnalytics();

  return {
    salesAnalytics,
    customerAnalytics,
    inventoryAnalytics,
    contentAnalytics,
    loading,
    error,
    refetch
  };
};
```

## Component Examples

### DashboardOverview Component
```tsx
// src/features/dashboard/components/DashboardOverview.tsx
import React, { useState } from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DashboardOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>({ period: 'month' });
  const { stats, loading, error } = useDashboardStats(timeRange);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex gap-2">
        <select 
          value={timeRange.period || ''}
          onChange={(e) => setTimeRange({ period: e.target.value as any })}
          className="p-2 border rounded"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue_total}</div>
            <div className={`text-sm ${stats.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue_growth >= 0 ? '↗' : '↘'} {Math.abs(stats.revenue_growth)}%
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_orders.toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              {stats.pending_orders} pending
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_customers.toLocaleString()}</div>
            <div className="text-sm text-green-600">
              +{stats.new_customers_today} today
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_products}</div>
            <div className="text-sm text-gray-500">
              {stats.active_products} active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_orders.map(order => (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total_amount}</p>
                    <Badge color={order.status === 'completed' ? 'green' : 'yellow'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.low_stock_items.slice(0, 5).map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product_title}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge color="red">
                      {item.current_stock} left
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### SalesChart Component
```tsx
// src/features/dashboard/components/SalesChart.tsx
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: string;
    orders_count: number;
  }>;
  type?: 'line' | 'bar';
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, type = 'line' }) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => parseFloat(item.revenue)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: data.map(item => item.orders_count),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Performance',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders Count'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return type === 'line' ? (
    <Line data={chartData} options={options} />
  ) : (
    <Bar data={chartData} options={options} />
  );
};
```

## Usage in Frontend Pages

### Dashboard Page Integration
```tsx
// src/features/dashboard/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { DashboardOverview } from '../components/DashboardOverview';
import { SalesChart } from '../components/SalesChart';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>({ period: 'month' });
  const { salesAnalytics, loading } = useAnalytics(timeRange);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Overview Section */}
      <DashboardOverview />

      {/* Analytics Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading chart...</div>
              ) : salesAnalytics ? (
                <SalesChart data={salesAnalytics.revenue_by_day} />
              ) : (
                <div>No sales data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Customer analytics charts would go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Inventory charts and alerts would go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Blog and collection performance charts would go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## Required Dependencies

Install chart.js for data visualization:

```bash
npm install chart.js react-chartjs-2
```

## Next Steps

1. Create the service file: `src/features/dashboard/services/analyticsService.ts`
2. Create the hooks: `src/features/dashboard/hooks/`
3. Create the chart components: `src/features/dashboard/components/`
4. Install chart.js dependencies
5. Implement real-time data updates with WebSocket (optional)
6. Add export functionality for reports
7. Add date range pickers for custom time ranges

This guide provides a comprehensive dashboard analytics system that aggregates data from all features and presents it in a visually appealing format with charts and KPIs.