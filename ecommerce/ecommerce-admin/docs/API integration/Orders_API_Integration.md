# Orders API Integration Guide

## Overview
Complete frontend integration guide for Orders management with API endpoints, TypeScript types, error handling, and implementation examples.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// Admin-only endpoints for order management
const ADMIN_ORDERS_API = `${API_BASE_URL}/api/admin/orders`;
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});
```

## TypeScript Types

### Order Interfaces
```typescript
// Core Order Interface
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  cart_id?: string;
  shipping_address_id: string;
  billing_address_id: string;
  channel: 'web' | 'app' | 'pos' | 'marketplace' | 'other';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  is_draft: boolean;
  payment_method: string;
  payment_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed' | 'partially_refunded';
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';
  subtotal_amount: string;
  discount_amount: string;
  shipping_amount: string;
  tax_amount: string;
  total_amount: string;
  total_quantity: number;
  customer_note?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

// Order Item Interface
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id?: string;
  product_title: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  line_subtotal: string;
  discount_amount: string;
  line_total: string;
}

// Create Order Request
export interface CreateOrderRequest {
  shipping_address_id: string;
  billing_address_id?: string;
  payment_method?: string;
  customer_note?: string;
}

// Update Order Status Request
export interface UpdateOrderStatusRequest {
  order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed';
  fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';
  admin_note?: string;
}

// API Response Types
export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order & { order_items?: OrderItem[] };
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Query Parameters for Admin Orders
export interface AdminOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed';
  fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';
  from_date?: string;
  to_date?: string;
  search?: string;
}

// User Orders Query Parameters
export interface UserOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
}
```

## API Service Implementation

### Orders Service Class
```typescript
// src/features/orders/services/orderService.ts
import axios, { AxiosResponse } from 'axios';

class OrderService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api`;
  
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Get All Orders (Admin Only) - Main endpoint for admin dashboard
  async getAdminOrders(params?: AdminOrdersQueryParams): Promise<{orders: Order[], pagination: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
      if (params?.fulfillment_status) queryParams.append('fulfillment_status', params.fulfillment_status);
      if (params?.from_date) queryParams.append('from_date', params.from_date);
      if (params?.to_date) queryParams.append('to_date', params.to_date);
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<OrdersResponse> = await axios.get(
        `${this.baseURL}/admin/orders?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        orders: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Order by ID (Admin Access)
  async getOrderById(id: string): Promise<Order & { order_items: OrderItem[] }> {
    try {
      const response: AxiosResponse<OrderResponse> = await axios.get(
        `${this.baseURL}/orders/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data as Order & { order_items: OrderItem[] };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update Order Status (Admin Only)
  async updateOrderStatus(id: string, updateData: UpdateOrderStatusRequest): Promise<Order> {
    try {
      const response: AxiosResponse<OrderResponse> = await axios.put(
        `${this.baseURL}/admin/orders/${id}/status`,
        updateData,
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

export const orderService = new OrderService();
```

## React Hooks Implementation

### useOrders Hook (User Orders)
```typescript
// src/features/orders/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrders = (params?: UserOrdersQueryParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getUserOrders(params);
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [params?.page, params?.limit, params?.status]);

  const refetch = () => fetchOrders();

  return {
    orders,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useAdminOrders Hook
```typescript
// src/features/orders/hooks/useAdminOrders.ts
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useAdminOrders = (params?: AdminOrdersQueryParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getAdminOrders(params);
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    params?.page, 
    params?.limit, 
    params?.status, 
    params?.payment_status, 
    params?.fulfillment_status,
    params?.from_date,
    params?.to_date,
    params?.search
  ]);

  const refetch = () => fetchOrders();

  return {
    orders,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useOrder Hook (Single Order)
```typescript
// src/features/orders/hooks/useOrder.ts
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await orderService.getOrderById(id);
        setOrder(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return { order, loading, error };
};
```

### useOrderMutations Hook
```typescript
// src/features/orders/hooks/useOrderMutations.ts
import { useState } from 'react';
import { orderService } from '../services/orderService';
import { toast } from '@/utils/toast';

export const useOrderMutations = () => {
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData: CreateOrderRequest) => {
    setLoading(true);
    try {
      const result = await orderService.createOrder(orderData);
      toast.success('Order created successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, updateData: UpdateOrderStatusRequest) => {
    setLoading(true);
    try {
      const result = await orderService.updateOrderStatus(id, updateData);
      toast.success('Order status updated successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: string, reason?: string) => {
    setLoading(true);
    try {
      await orderService.cancelOrder(id, reason);
      toast.success('Order cancelled successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    updateOrderStatus,
    cancelOrder,
    loading
  };
};
```

## Component Examples

### AdminOrdersList Component
```tsx
// src/features/orders/components/AdminOrdersList.tsx
import React, { useState } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const AdminOrdersList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<AdminOrdersQueryParams>({
    page: 1,
    limit: 20,
    status: undefined
  });

  const { orders, pagination, loading, error, refetch } = useAdminOrders(queryParams);
  const { updateOrderStatus } = useOrderMutations();

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, { order_status: status as any });
    refetch();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      processing: 'purple',
      shipped: 'orange',
      delivered: 'green',
      cancelled: 'red',
      refunded: 'gray'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <select 
          value={queryParams.status || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
          className="p-2 border rounded"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select 
          value={queryParams.payment_status || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, payment_status: e.target.value as any, page: 1 }))}
          className="p-2 border rounded"
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <input
          type="text"
          placeholder="Search by order number or customer email"
          value={queryParams.search || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="p-2 border rounded flex-1"
        />
      </div>

      {/* Orders Table */}
      <Table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="font-mono">{order.order_number}</td>
              <td>
                <Badge color={getStatusColor(order.order_status)}>
                  {order.order_status}
                </Badge>
              </td>
              <td>
                <Badge color={getStatusColor(order.payment_status)}>
                  {order.payment_status}
                </Badge>
              </td>
              <td>${order.total_amount}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>
                {order.order_status === 'confirmed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                  >
                    Process
                  </Button>
                )}
                {order.order_status === 'processing' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'shipped')}
                  >
                    Ship
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button 
              disabled={pagination.page === 1}
              onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Previous
            </Button>
            <Button 
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### OrderDetail Component
```tsx
// src/features/orders/components/OrderDetail.tsx
import React from 'react';
import { useOrder } from '../hooks/useOrder';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderDetailProps {
  orderId: string;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
  const { order, loading, error } = useOrder(orderId);
  const { updateOrderStatus, loading: updating } = useOrderMutations();

  if (loading) return <div>Loading order...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  const handleStatusUpdate = async (status: string) => {
    await updateOrderStatus(order.id, { order_status: status as any });
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Order {order.order_number}</span>
            <Badge color="blue">{order.order_status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <Badge color="yellow">{order.payment_status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-lg">${order.total_amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-medium">{order.total_quantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h4 className="font-medium">{item.product_title}</h4>
                  <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.line_total}</p>
                  <p className="text-sm text-gray-500">${item.unit_price} each</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {order.order_status === 'pending' && (
              <Button onClick={() => handleStatusUpdate('confirmed')} disabled={updating}>
                Confirm Order
              </Button>
            )}
            {order.order_status === 'confirmed' && (
              <Button onClick={() => handleStatusUpdate('processing')} disabled={updating}>
                Start Processing
              </Button>
            )}
            {order.order_status === 'processing' && (
              <Button onClick={() => handleStatusUpdate('shipped')} disabled={updating}>
                Mark as Shipped
              </Button>
            )}
            {order.order_status === 'shipped' && (
              <Button onClick={() => handleStatusUpdate('delivered')} disabled={updating}>
                Mark as Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## Usage in Frontend Pages

### Orders Management Page
```tsx
// src/features/orders/pages/OrdersPage.tsx
import React, { useState } from 'react';
import { AdminOrdersList } from '../components/AdminOrdersList';
import { OrderDetail } from '../components/OrderDetail';
import { Button } from '@/components/ui/button';

export const OrdersPage: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (selectedOrderId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedOrderId(null)}>
            ← Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <OrderDetail orderId={selectedOrderId} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
      </div>
      <AdminOrdersList />
    </div>
  );
};
```

## Next Steps

1. Create the service file: `src/features/orders/services/orderService.ts`
2. Create the hooks: `src/features/orders/hooks/`
3. Create the components: `src/features/orders/components/`
4. Add to your routing system
5. Import and use in your admin panel

This guide provides comprehensive integration for the Orders API with your frontend. The backend is fully implemented with order creation from cart, status updates, and admin management capabilities.