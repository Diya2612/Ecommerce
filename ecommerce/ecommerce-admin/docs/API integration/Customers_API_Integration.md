# Customers (Users) API Integration Guide - Admin Dashboard

## Overview
Complete frontend integration guide for **Admin Customer Management** with API endpoints, TypeScript types, error handling, and implementation examples. This guide focuses exclusively on admin dashboard functionality for managing customers/users.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const USERS_API = `${API_BASE_URL}/api/users`;
// Note: All user management endpoints require admin authentication with users:read permission
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

// Note: Admin permissions required:
// - users:read (for viewing all users)
// - users:update (for updating user profiles) 
// - users:delete (for deleting users)
```

## TypeScript Types

### User Interfaces
```typescript
// Core User Interface
export interface User {
  id: string;
  auth_id?: string | null;
  user_type: 'individual' | 'business';
  name: string;
  email: string;
  email_verified: boolean;
  email_verified_at?: string | null;
  phone_number?: string;
  phone_country_code?: string;
  phone_verified: boolean;
  phone_verified_at?: string | null;
  profile_image_url?: string;
  date_of_birth?: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  preferred_language: string;
  preferred_currency: string;
  timezone: string;
  created_by?: string | null;
  created_at: string;
  updated_by?: string | null;
  updated_at: string;
  is_deleted: boolean;
  deleted_by?: string | null;
  deleted_at?: string | null;
}

// User Address Interface
export interface UserAddress {
  id: string;
  user_id: string;
  address_type: 'billing' | 'shipping' | 'both' | 'company';
  is_default: boolean;
  recipient_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark?: string;
  phone_number?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

// Update User Request
export interface UpdateUserRequest {
  name?: string;
  phone_number?: string;
  phone_country_code?: string;
  profile_image_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;
}

// Create Address Request
export interface CreateAddressRequest {
  address_type: 'billing' | 'shipping' | 'both' | 'company';
  is_default?: boolean;
  recipient_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark?: string;
  phone_number?: string;
  instructions?: string;
}

// Update Address Request
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// API Response Types
export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: UserAddress;
}

export interface AddressesResponse {
  success: boolean;
  message: string;
  data: UserAddress[];
}

// Query Parameters
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  user_type?: 'individual' | 'business';
  email_verified?: boolean;
}

// Wishlist Item Interface
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_variant_id?: string;
  product_title: string;
  product_sku: string;
  selling_price: string;
  primary_image_url?: string;
  added_at: string;
  purchased_at?: string | null;
}
```

## API Service Implementation

### User Service Class
```typescript
// src/features/customers/services/customerService.ts
import axios, { AxiosResponse } from 'axios';

class CustomerService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api/users`;

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Get All Users (Admin Only) - Main function for admin dashboard
  async getAllUsers(params?: UsersQueryParams): Promise<{users: User[], pagination: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.user_type) queryParams.append('user_type', params.user_type);
      if (params?.email_verified !== undefined) queryParams.append('email_verified', params.email_verified.toString());

      const response: AxiosResponse<UsersResponse> = await axios.get(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        users: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get User by ID (Admin Access)
  async getUserById(id: string): Promise<User> {
    try {
      const response: AxiosResponse<UserResponse> = await axios.get(
        `${this.baseURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update User (Admin Only)
  async updateUser(id: string, updateData: UpdateUserRequest): Promise<User> {
    try {
      const response: AxiosResponse<UserResponse> = await axios.put(
        `${this.baseURL}/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete User (Admin Only)
  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get User Addresses
  async getUserAddresses(userId?: string): Promise<UserAddress[]> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/addresses` : `${this.baseURL}/addresses`;
      const response: AxiosResponse<AddressesResponse> = await axios.get(
        url,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create User Address
  async createUserAddress(addressData: CreateAddressRequest, userId?: string): Promise<UserAddress> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/addresses` : `${this.baseURL}/addresses`;
      const response: AxiosResponse<AddressResponse> = await axios.post(
        url,
        addressData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update User Address
  async updateUserAddress(addressId: string, updateData: UpdateAddressRequest, userId?: string): Promise<UserAddress> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/addresses/${addressId}` : `${this.baseURL}/addresses/${addressId}`;
      const response: AxiosResponse<AddressResponse> = await axios.put(
        url,
        updateData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete User Address
  async deleteUserAddress(addressId: string, userId?: string): Promise<void> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/addresses/${addressId}` : `${this.baseURL}/addresses/${addressId}`;
      await axios.delete(
        url,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Set Default Address
  async setDefaultAddress(addressId: string, userId?: string): Promise<void> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/addresses/${addressId}/set-default` : `${this.baseURL}/addresses/${addressId}/set-default`;
      await axios.post(
        url,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get User Orders
  async getUserOrders(userId: string, params?: { page?: number; limit?: number }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(
        `${this.baseURL}/${userId}/orders?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get User Wishlist
  async getUserWishlist(userId?: string): Promise<WishlistItem[]> {
    try {
      const url = userId ? `${this.baseURL}/${userId}/wishlist` : `${this.baseURL}/wishlist`;
      const response = await axios.get(
        url,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add to Wishlist
  async addToWishlist(productId: string, variantId?: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/wishlist`,
        { product_id: productId, product_variant_id: variantId },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove from Wishlist
  async removeFromWishlist(productId: string, variantId?: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/wishlist`,
        { 
          headers: this.getAuthHeaders(),
          data: { product_id: productId, product_variant_id: variantId }
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Move Wishlist to Cart
  async moveWishlistToCart(productId: string, quantity: number = 1): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/wishlist/move-to-cart`,
        { product_id: productId, quantity },
        { headers: this.getAuthHeaders() }
      );
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

export const customerService = new CustomerService();
```

## React Hooks Implementation

### useCustomers Hook
```typescript
// src/features/customers/hooks/useCustomers.ts
import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export const useCustomers = (params?: UsersQueryParams) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getAllUsers(params);
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params?.page, params?.limit, params?.search, params?.user_type, params?.email_verified]);

  const refetch = () => fetchUsers();

  return {
    users,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useCustomer Hook (Single Customer)
```typescript
// src/features/customers/hooks/useCustomer.ts
import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export const useCustomer = (id: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await customerService.getUserById(id);
        setUser(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
};
```

### useCustomerMutations Hook
```typescript
// src/features/customers/hooks/useCustomerMutations.ts
import { useState } from 'react';
import { customerService } from '../services/customerService';
import { toast } from '@/utils/toast';

export const useCustomerMutations = () => {
  const [loading, setLoading] = useState(false);

  const updateUser = async (id: string, updateData: UpdateUserRequest) => {
    setLoading(true);
    try {
      const result = await customerService.updateUser(id, updateData);
      toast.success('Customer updated successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update customer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await customerService.deleteUser(id);
      toast.success('Customer deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete customer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUser,
    deleteUser,
    loading
  };
};
```

### useUserAddresses Hook
```typescript
// src/features/customers/hooks/useUserAddresses.ts
import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export const useUserAddresses = (userId?: string) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getUserAddresses(userId);
      setAddresses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const refetch = () => fetchAddresses();

  return {
    addresses,
    loading,
    error,
    refetch
  };
};
```

## Component Examples

### CustomersList Component
```tsx
// src/features/customers/components/CustomersList.tsx
import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const CustomersList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 20,
    user_type: undefined
  });

  const { users, pagination, loading, error, refetch } = useCustomers(queryParams);
  const { deleteUser } = useCustomerMutations();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteUser(id);
      refetch();
    }
  };

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <select 
          value={queryParams.user_type || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, user_type: e.target.value as any, page: 1 }))}
          className="p-2 border rounded"
        >
          <option value="">All Customer Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>

        <input
          type="text"
          placeholder="Search customers..."
          value={queryParams.search || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="p-2 border rounded flex-1"
        />
      </div>

      {/* Customers Table */}
      <Table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profile_image_url} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <p>{user.email}</p>
                  {user.email_verified && (
                    <Badge color="green" size="sm">Verified</Badge>
                  )}
                </div>
              </td>
              <td>
                {user.phone_number ? (
                  <div>
                    <p>{user.phone_country_code} {user.phone_number}</p>
                    {user.phone_verified && (
                      <Badge color="green" size="sm">Verified</Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">No phone</span>
                )}
              </td>
              <td>
                <Badge color={user.user_type === 'business' ? 'blue' : 'gray'}>
                  {user.user_type}
                </Badge>
              </td>
              <td>
                <Badge color={user.is_deleted ? 'red' : 'green'}>
                  {user.is_deleted ? 'Deleted' : 'Active'}
                </Badge>
              </td>
              <td>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  disabled={user.is_deleted}
                >
                  Delete
                </Button>
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

### CustomerDetail Component
```tsx
// src/features/customers/components/CustomerDetail.tsx
import React, { useState } from 'react';
import { useCustomer } from '../hooks/useCustomer';
import { useUserAddresses } from '../hooks/useUserAddresses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerDetailProps {
  customerId: string;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId }) => {
  const { user, loading: userLoading, error: userError } = useCustomer(customerId);
  const { addresses, loading: addressesLoading } = useUserAddresses(customerId);

  if (userLoading) return <div>Loading customer...</div>;
  if (userError) return <div>Error: {userError}</div>;
  if (!user) return <div>Customer not found</div>;

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.profile_image_url} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge color={user.user_type === 'business' ? 'blue' : 'gray'}>
                  {user.user_type}
                </Badge>
                <Badge color={user.is_deleted ? 'red' : 'green'}>
                  {user.is_deleted ? 'Deleted' : 'Active'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="flex items-center gap-2">
                    {user.email}
                    {user.email_verified && <Badge color="green" size="sm">Verified</Badge>}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="flex items-center gap-2">
                    {user.phone_number ? `${user.phone_country_code} ${user.phone_number}` : 'Not provided'}
                    {user.phone_verified && <Badge color="green" size="sm">Verified</Badge>}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>{new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p>{user.date_of_birth || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p>{user.gender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Preferred Language</label>
                  <p>{user.preferred_language}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Preferred Currency</label>
                  <p>{user.preferred_currency}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Timezone</label>
                  <p>{user.timezone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div>Loading addresses...</div>
              ) : addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div key={address.id} className="border p-4 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge color="blue">{address.address_type}</Badge>
                        {address.is_default && <Badge color="green">Default</Badge>}
                      </div>
                      <p className="font-medium">{address.recipient_name}</p>
                      {address.company_name && <p>{address.company_name}</p>}
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                      {address.phone_number && <p>Phone: {address.phone_number}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No addresses found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Order history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## Usage in Frontend Pages

### Customers Page Integration
```tsx
// src/features/customers/pages/CustomersPage.tsx
import React, { useState } from 'react';
import { CustomersList } from '../components/CustomersList';
import { CustomerDetail } from '../components/CustomerDetail';
import { Button } from '@/components/ui/button';

export const CustomersPage: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  if (selectedCustomerId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedCustomerId(null)}>
            ← Back to Customers
          </Button>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        <CustomerDetail customerId={selectedCustomerId} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>
      <CustomersList />
    </div>
  );
};
```

## Next Steps

1. Create the service file: `src/features/customers/services/customerService.ts`
2. Create the hooks: `src/features/customers/hooks/`
3. Create the components: `src/features/customers/components/`
4. Add to your routing system
5. Import and use in your admin panel

This guide provides comprehensive integration for the Customer/User management API with your frontend. The backend includes user management, addresses, wishlist, and order history functionality.