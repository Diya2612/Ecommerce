# Products API Integration Guide - Admin Dashboard

## Overview
Complete frontend integration guide for **Admin Product Management** with API endpoints, TypeScript types, error handling, and implementation examples. This guide focuses exclusively on admin dashboard functionality for managing products.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const PRODUCTS_API = `${API_BASE_URL}/api/products`;
// Note: All product management endpoints require admin authentication
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

// Note: All product management operations require admin permissions:
// - products:create (for creating products)
// - products:read (for viewing all products including drafts)
// - products:update (for updating products)
// - products:delete (for deleting products)
```

## TypeScript Types

### Product Interfaces
```typescript
// Core Product Interface
export interface Product {
  id: string;
  slug: string;
  product_title: string;
  secondary_title?: string;
  short_description?: string;
  full_description?: string;
  status: 'draft' | 'active' | 'archived' | 'scheduled';
  sku: string;
  selling_price: string;
  cost_price?: string;
  compare_at_price?: string;
  category_tier_1?: string;
  category_tier_2?: string;
  category_tier_3?: string;
  category_tier_4?: string;
  primary_image_url?: string;
  additional_images?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

// Create Product Request
export interface CreateProductRequest {
  slug: string;
  product_title: string;
  secondary_title?: string;
  short_description?: string;
  full_description?: string;
  status?: 'draft' | 'active' | 'archived' | 'scheduled';
  sku: string;
  selling_price: string;
  cost_price?: string;
  compare_at_price?: string;
  category_tier_1?: string;
  category_tier_2?: string;
  category_tier_3?: string;
  category_tier_4?: string;
  primary_image_url?: string;
  additional_images?: string[];
  meta_title?: string;
  meta_description?: string;
}

// Update Product Request
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// API Response Types
export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Query Parameters
export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'active' | 'archived' | 'scheduled';
  category_tier_1?: string;
  category_tier_2?: string;
  search?: string;
}
```

## API Service Implementation

### Products Service Class
```typescript
// src/features/products/services/productService.ts
import axios, { AxiosResponse } from 'axios';

class ProductService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api/products`;

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Create Product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response: AxiosResponse<ProductResponse> = await axios.post(
        this.baseURL,
        productData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get All Products (Admin)
  async getProducts(params?: ProductsQueryParams): Promise<{products: Product[], pagination: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category_tier_1) queryParams.append('category_tier_1', params.category_tier_1);
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<ProductsResponse> = await axios.get(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        products: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const response: AxiosResponse<ProductResponse> = await axios.get(
        `${this.baseURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update Product
  async updateProduct(id: string, updateData: UpdateProductRequest): Promise<Product> {
    try {
      const response: AxiosResponse<ProductResponse> = await axios.put(
        `${this.baseURL}/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete Product
  async deleteProduct(id: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${id}`,
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

export const productService = new ProductService();
```

## React Hooks Implementation

### useProducts Hook
```typescript
// src/features/products/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = (params?: ProductsQueryParams) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getProducts(params);
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params?.page, params?.limit, params?.status, params?.category_tier_1, params?.search]);

  const refetch = () => fetchProducts();

  return {
    products,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useProduct Hook (Single Product)
```typescript
// src/features/products/hooks/useProduct.ts
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await productService.getProductById(id);
        setProduct(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
```

### useProductMutations Hook
```typescript
// src/features/products/hooks/useProductMutations.ts
import { useState } from 'react';
import { productService } from '../services/productService';
import { toast } from '@/utils/toast';

export const useProductMutations = () => {
  const [loading, setLoading] = useState(false);

  const createProduct = async (productData: CreateProductRequest) => {
    setLoading(true);
    try {
      const result = await productService.createProduct(productData);
      toast.success('Product created successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updateData: UpdateProductRequest) => {
    setLoading(true);
    try {
      const result = await productService.updateProduct(id, updateData);
      toast.success('Product updated successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    loading
  };
};
```

## Component Examples

### ProductList Component
```tsx
// src/features/products/components/ProductList.tsx
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useProductMutations } from '../hooks/useProductMutations';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';

export const ProductList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<ProductsQueryParams>({
    page: 1,
    limit: 20,
    status: undefined
  });

  const { products, pagination, loading, error, refetch } = useProducts(queryParams);
  const { deleteProduct } = useProductMutations();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      refetch();
    }
  };

  const handleStatusFilter = (status: string) => {
    setQueryParams(prev => ({ ...prev, status: status as any, page: 1 }));
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={!queryParams.status ? "default" : "outline"}
          onClick={() => handleStatusFilter('')}
        >
          All
        </Button>
        <Button 
          variant={queryParams.status === 'active' ? "default" : "outline"}
          onClick={() => handleStatusFilter('active')}
        >
          Active
        </Button>
        <Button 
          variant={queryParams.status === 'draft' ? "default" : "outline"}
          onClick={() => handleStatusFilter('draft')}
        >
          Draft
        </Button>
      </div>

      {/* Products Table */}
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.product_title}</td>
              <td>{product.sku}</td>
              <td>${product.selling_price}</td>
              <td>{product.status}</td>
              <td>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(product.id)}
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

### ProductForm Component
```tsx
// src/features/products/components/ProductForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useProductMutations } from '../hooks/useProductMutations';
import { CreateProductRequest } from '../types';

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Product>;
  isEdit?: boolean;
  productId?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  onSuccess, 
  initialData, 
  isEdit = false,
  productId 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProductRequest>({
    defaultValues: initialData
  });
  
  const { createProduct, updateProduct, loading } = useProductMutations();

  const onSubmit = async (data: CreateProductRequest) => {
    try {
      if (isEdit && productId) {
        await updateProduct(productId, data);
      } else {
        await createProduct(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Product Title *</label>
        <input
          {...register('product_title', { required: 'Product title is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.product_title && <span className="text-red-500">{errors.product_title.message}</span>}
      </div>

      <div>
        <label>SKU *</label>
        <input
          {...register('sku', { required: 'SKU is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.sku && <span className="text-red-500">{errors.sku.message}</span>}
      </div>

      <div>
        <label>Selling Price *</label>
        <input
          {...register('selling_price', { required: 'Selling price is required' })}
          type="number"
          step="0.01"
          className="w-full p-2 border rounded"
        />
        {errors.selling_price && <span className="text-red-500">{errors.selling_price.message}</span>}
      </div>

      <div>
        <label>Status</label>
        <select
          {...register('status')}
          className="w-full p-2 border rounded"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
      </Button>
    </form>
  );
};
```

## Error Handling

### Global Error Types
```typescript
// src/features/products/types/errors.ts
export interface APIError {
  message: string;
  status: number;
  code?: string;
}

export const handleProductAPIError = (error: any): string => {
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in.';
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.response?.status === 409) {
    return 'Product SKU or slug already exists.';
  }
  if (error.response?.status === 404) {
    return 'Product not found.';
  }
  return error.response?.data?.message || 'An unexpected error occurred.';
};
```

## Usage in Frontend Pages

### Products Page Integration
```tsx
// src/features/products/pages/ProductsPage.tsx
import React, { useState } from 'react';
import { ProductList } from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { Modal } from '@/components/ui/modal';

export const ProductsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Product
        </Button>
      </div>

      <ProductList />

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Product"
      >
        <ProductForm 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            // Refetch products list
          }} 
        />
      </Modal>
    </div>
  );
};
```

## Next Steps

1. Create the service file: `src/features/products/services/productService.ts`
2. Create the hooks: `src/features/products/hooks/`
3. Create the components: `src/features/products/components/`
4. Add to your routing system
5. Import and use in your admin panel

This guide provides everything needed to integrate the Products API with your frontend. The backend is fully implemented and ready for integration.