# Collections API Integration Guide

## Overview
Complete frontend integration guide for Collections management with API endpoints, TypeScript types, error handling, and implementation examples.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const COLLECTIONS_API = `${API_BASE_URL}/api/collections`;
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});
```

## TypeScript Types

### Collection Interfaces
```typescript
// Core Collection Interface
export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: 'manual' | 'automated';
  status: 'active' | 'inactive' | 'draft';
  sort_order: 'best-selling' | 'price-asc' | 'price-desc' | 'manual' | 'created-desc' | 'created-asc';
  condition_match_type: 'all' | 'any';
  banner_image_url?: string;
  mobile_banner_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  products?: CollectionProduct[];
  total_products?: number;
}

// Collection Product Interface
export interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  position: number;
  product_title: string;
  product_sku: string;
  selling_price: string;
  primary_image_url?: string;
  status: string;
  created_at: string;
}

// Collection Rule Interface (for automated collections)
export interface CollectionRule {
  id: string;
  collection_id: string;
  condition_type: 'product_title' | 'product_tag' | 'product_category' | 'product_price' | 'product_weight';
  condition_operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal';
  condition_value: string;
  created_at: string;
}

// Create Collection Request
export interface CreateCollectionRequest {
  title: string;
  slug: string;
  description?: string;
  type?: 'manual' | 'automated';
  status?: 'active' | 'inactive' | 'draft';
  sort_order?: 'best-selling' | 'price-asc' | 'price-desc' | 'manual' | 'created-desc' | 'created-asc';
  condition_match_type?: 'all' | 'any';
  banner_image_url?: string;
  mobile_banner_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  published_at?: string;
  rules?: Omit<CollectionRule, 'id' | 'collection_id' | 'created_at'>[];
  product_ids?: string[];
}

// Update Collection Request
export interface UpdateCollectionRequest extends Partial<CreateCollectionRequest> {}

// API Response Types
export interface CollectionResponse {
  success: boolean;
  message: string;
  data: Collection;
}

export interface CollectionsResponse {
  success: boolean;
  message: string;
  data: Collection[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Query Parameters
export interface CollectionsQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'draft';
  type?: 'manual' | 'automated';
  search?: string;
}
```

## API Service Implementation

### Collections Service Class
```typescript
// src/features/collections/services/collectionService.ts
import axios, { AxiosResponse } from 'axios';

class CollectionService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api/collections`;

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Get All Collections
  async getCollections(params?: CollectionsQueryParams): Promise<{collections: Collection[], pagination?: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<CollectionsResponse> = await axios.get(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        collections: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Collection by ID/Slug
  async getCollection(identifier: string): Promise<Collection> {
    try {
      const response: AxiosResponse<CollectionResponse> = await axios.get(
        `${this.baseURL}/${identifier}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Collection by Slug (Public)
  async getCollectionBySlug(slug: string): Promise<Collection> {
    try {
      const response: AxiosResponse<CollectionResponse> = await axios.get(
        `${this.baseURL}/slug/${slug}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create Collection
  async createCollection(collectionData: CreateCollectionRequest): Promise<Collection> {
    try {
      const response: AxiosResponse<CollectionResponse> = await axios.post(
        this.baseURL,
        collectionData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update Collection
  async updateCollection(id: string, updateData: UpdateCollectionRequest): Promise<Collection> {
    try {
      const response: AxiosResponse<CollectionResponse> = await axios.put(
        `${this.baseURL}/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete Collection
  async deleteCollection(id: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add Products to Collection
  async addProductsToCollection(collectionId: string, productIds: string[]): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${collectionId}/products`,
        { product_ids: productIds },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove Product from Collection
  async removeProductFromCollection(collectionId: string, productId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${collectionId}/products/${productId}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update Product Position in Collection
  async updateProductPosition(collectionId: string, productId: string, position: number): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${collectionId}/products/${productId}/position`,
        { position },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Collection Products
  async getCollectionProducts(collectionId: string, params?: { page?: number; limit?: number }): Promise<{products: CollectionProduct[], pagination?: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(
        `${this.baseURL}/${collectionId}/products?${queryParams.toString()}`,
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

  // Sync Automated Collection (refresh products based on rules)
  async syncAutomatedCollection(collectionId: string): Promise<Collection> {
    try {
      const response: AxiosResponse<CollectionResponse> = await axios.post(
        `${this.baseURL}/${collectionId}/sync`,
        {},
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

export const collectionService = new CollectionService();
```

## React Hooks Implementation

### useCollections Hook
```typescript
// src/features/collections/hooks/useCollections.ts
import { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';

export const useCollections = (params?: CollectionsQueryParams) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await collectionService.getCollections(params);
      setCollections(result.collections);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [params?.page, params?.limit, params?.status, params?.type, params?.search]);

  const refetch = () => fetchCollections();

  return {
    collections,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useCollection Hook (Single Collection)
```typescript
// src/features/collections/hooks/useCollection.ts
import { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';

export const useCollection = (id: string) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await collectionService.getCollection(id);
        setCollection(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch collection');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  return { collection, loading, error };
};
```

### useCollectionMutations Hook
```typescript
// src/features/collections/hooks/useCollectionMutations.ts
import { useState } from 'react';
import { collectionService } from '../services/collectionService';
import { toast } from '@/utils/toast';

export const useCollectionMutations = () => {
  const [loading, setLoading] = useState(false);

  const createCollection = async (collectionData: CreateCollectionRequest) => {
    setLoading(true);
    try {
      const result = await collectionService.createCollection(collectionData);
      toast.success('Collection created successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create collection');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (id: string, updateData: UpdateCollectionRequest) => {
    setLoading(true);
    try {
      const result = await collectionService.updateCollection(id, updateData);
      toast.success('Collection updated successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update collection');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id: string) => {
    setLoading(true);
    try {
      await collectionService.deleteCollection(id);
      toast.success('Collection deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete collection');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addProductsToCollection = async (collectionId: string, productIds: string[]) => {
    setLoading(true);
    try {
      await collectionService.addProductsToCollection(collectionId, productIds);
      toast.success('Products added to collection successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add products');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProductFromCollection = async (collectionId: string, productId: string) => {
    setLoading(true);
    try {
      await collectionService.removeProductFromCollection(collectionId, productId);
      toast.success('Product removed from collection!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove product');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncAutomatedCollection = async (collectionId: string) => {
    setLoading(true);
    try {
      const result = await collectionService.syncAutomatedCollection(collectionId);
      toast.success('Collection synced successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync collection');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCollection,
    updateCollection,
    deleteCollection,
    addProductsToCollection,
    removeProductFromCollection,
    syncAutomatedCollection,
    loading
  };
};
```

## Component Examples

### CollectionsList Component
```tsx
// src/features/collections/components/CollectionsList.tsx
import React, { useState } from 'react';
import { useCollections } from '../hooks/useCollections';
import { useCollectionMutations } from '../hooks/useCollectionMutations';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const CollectionsList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<CollectionsQueryParams>({
    page: 1,
    limit: 20,
    status: undefined
  });

  const { collections, pagination, loading, error, refetch } = useCollections(queryParams);
  const { deleteCollection, syncAutomatedCollection } = useCollectionMutations();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      await deleteCollection(id);
      refetch();
    }
  };

  const handleSync = async (id: string) => {
    await syncAutomatedCollection(id);
    refetch();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      draft: 'yellow'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getTypeColor = (type: string) => {
    return type === 'automated' ? 'blue' : 'gray';
  };

  if (loading) return <div>Loading collections...</div>;
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
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>

        <select 
          value={queryParams.type || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, type: e.target.value as any, page: 1 }))}
          className="p-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="manual">Manual</option>
          <option value="automated">Automated</option>
        </select>

        <input
          type="text"
          placeholder="Search collections..."
          value={queryParams.search || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="p-2 border rounded flex-1"
        />
      </div>

      {/* Collections Table */}
      <Table>
        <thead>
          <tr>
            <th>Collection</th>
            <th>Type</th>
            <th>Status</th>
            <th>Products</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(collection => (
            <tr key={collection.id}>
              <td>
                <div className="flex items-center gap-3">
                  {collection.banner_image_url && (
                    <img 
                      src={collection.banner_image_url} 
                      alt={collection.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{collection.title}</p>
                    <p className="text-sm text-gray-500">/{collection.slug}</p>
                  </div>
                </div>
              </td>
              <td>
                <Badge color={getTypeColor(collection.type)}>
                  {collection.type}
                </Badge>
              </td>
              <td>
                <Badge color={getStatusColor(collection.status)}>
                  {collection.status}
                </Badge>
              </td>
              <td>{collection.total_products || 0}</td>
              <td>{new Date(collection.updated_at).toLocaleDateString()}</td>
              <td className="space-x-2">
                {collection.type === 'automated' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSync(collection.id)}
                  >
                    Sync
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(collection.id)}
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

### CollectionForm Component
```tsx
// src/features/collections/components/CollectionForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCollectionMutations } from '../hooks/useCollectionMutations';
import { CreateCollectionRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface CollectionFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Collection>;
  isEdit?: boolean;
  collectionId?: string;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({ 
  onSuccess, 
  initialData, 
  isEdit = false,
  collectionId 
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateCollectionRequest>({
    defaultValues: {
      type: 'manual',
      status: 'draft',
      sort_order: 'manual',
      condition_match_type: 'all',
      ...initialData
    }
  });
  
  const { createCollection, updateCollection, loading } = useCollectionMutations();
  const watchType = watch('type');

  const onSubmit = async (data: CreateCollectionRequest) => {
    try {
      // Generate slug from title if not provided
      if (!data.slug) {
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      if (isEdit && collectionId) {
        await updateCollection(collectionId, data);
      } else {
        await createCollection(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Collection Title *</label>
          <Input
            {...register('title', { required: 'Collection title is required' })}
            placeholder="Enter collection title"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <Input
            {...register('slug', { required: 'Slug is required' })}
            placeholder="collection-slug"
          />
          {errors.slug && <span className="text-red-500 text-sm">{errors.slug.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Describe your collection..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full p-2 border rounded"
          >
            <option value="manual">Manual</option>
            <option value="automated">Automated</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full p-2 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <select
            {...register('sort_order')}
            className="w-full p-2 border rounded"
          >
            <option value="manual">Manual</option>
            <option value="best-selling">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {watchType === 'automated' && (
        <div>
          <label className="block text-sm font-medium mb-1">Condition Match Type</label>
          <select
            {...register('condition_match_type')}
            className="w-full p-2 border rounded"
          >
            <option value="all">Match ALL conditions (AND)</option>
            <option value="any">Match ANY condition (OR)</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Banner Image URL</label>
          <Input
            {...register('banner_image_url')}
            placeholder="https://example.com/banner.jpg"
            type="url"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mobile Banner URL</label>
          <Input
            {...register('mobile_banner_image_url')}
            placeholder="https://example.com/mobile-banner.jpg"
            type="url"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <Input
            {...register('meta_title')}
            placeholder="SEO meta title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <Textarea
            {...register('meta_description')}
            placeholder="SEO meta description"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? 'Update Collection' : 'Create Collection')}
        </Button>
      </div>
    </form>
  );
};
```

## Usage in Frontend Pages

### Collections Management Page
```tsx
// src/features/collections/pages/CollectionsPage.tsx
import React, { useState } from 'react';
import { CollectionsList } from '../components/CollectionsList';
import { CollectionForm } from '../components/CollectionForm';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export const CollectionsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Collection
        </Button>
      </div>

      <CollectionsList />

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Collection"
        className="max-w-4xl"
      >
        <CollectionForm 
          onSuccess={() => setIsCreateModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};
```

## Next Steps

1. Create the service file: `src/features/collections/services/collectionService.ts`
2. Create the hooks: `src/features/collections/hooks/`
3. Create the components: `src/features/collections/components/`
4. Add to your routing system
5. Import and use in your admin panel

This guide provides comprehensive integration for the Collections API with support for both manual and automated collections, product management within collections, and full CRUD operations.