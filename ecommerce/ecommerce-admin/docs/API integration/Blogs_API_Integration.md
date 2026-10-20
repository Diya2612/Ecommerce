# Blogs API Integration Guide

## Overview
Complete frontend integration guide for Blog management with API endpoints, TypeScript types, error handling, and implementation examples.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const BLOGS_API = `${API_BASE_URL}/api/blogs`;
```

### Authentication Header
```typescript
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});
```

## TypeScript Types

### Blog Interfaces
```typescript
// Core Blog Interface
export interface Blog {
  id: string;
  title: string;
  quote?: string;
  description?: string;
  content?: string;
  slug: string;
  main_image_pc_url?: string;
  main_image_mobile_url?: string;
  category?: string;
  tags: string[];
  author?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'public' | 'private' | 'draft';
  published_at?: string;
  views_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  subsections?: BlogSubsection[];
}

// Blog Subsection Interface
export interface BlogSubsection {
  id: string;
  blog_id: string;
  title: string;
  content: string;
  image_url?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// Create Blog Request
export interface CreateBlogRequest {
  title: string;
  quote?: string;
  description?: string;
  content?: string;
  slug: string;
  main_image_pc_url?: string;
  main_image_mobile_url?: string;
  category?: string;
  tags?: string[];
  author?: string;
  meta_title?: string;
  meta_description?: string;
  status?: 'public' | 'private' | 'draft';
  published_at?: string;
  subsections?: Omit<BlogSubsection, 'id' | 'blog_id' | 'created_at' | 'updated_at'>[];
}

// Update Blog Request
export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {}

// API Response Types
export interface BlogResponse {
  success: boolean;
  message: string;
  data: Blog;
}

export interface BlogsResponse {
  success: boolean;
  message: string;
  data: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Query Parameters
export interface BlogsQueryParams {
  page?: number;
  limit?: number;
  status?: 'public' | 'private' | 'draft';
  category?: string;
  author?: string;
  search?: string;
  tags?: string[];
}

// Blog Analytics Interface
export interface BlogAnalytics {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  total_views: number;
  popular_categories: Array<{ category: string; count: number }>;
  recent_blogs: Blog[];
  top_viewed_blogs: Blog[];
}
```

## API Service Implementation

### Blog Service Class
```typescript
// src/features/blogs/services/blogService.ts
import axios, { AxiosResponse } from 'axios';

class BlogService {
  private baseURL = `${process.env.REACT_APP_API_URL}/api/blogs`;

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Get All Blogs
  async getBlogs(params?: BlogsQueryParams): Promise<{blogs: Blog[], pagination: any}> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.author) queryParams.append('author', params.author);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.tags?.length) params.tags.forEach(tag => queryParams.append('tags', tag));

      const response: AxiosResponse<BlogsResponse> = await axios.get(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        blogs: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Blog by ID/Slug
  async getBlog(identifier: string): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.get(
        `${this.baseURL}/${identifier}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Blog by Slug (Public)
  async getBlogBySlug(slug: string): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.get(
        `${this.baseURL}/slug/${slug}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create Blog
  async createBlog(blogData: CreateBlogRequest): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.post(
        this.baseURL,
        blogData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update Blog
  async updateBlog(id: string, updateData: UpdateBlogRequest): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.put(
        `${this.baseURL}/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete Blog
  async deleteBlog(id: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Publish Blog
  async publishBlog(id: string): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.post(
        `${this.baseURL}/${id}/publish`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Unpublish Blog
  async unpublishBlog(id: string): Promise<Blog> {
    try {
      const response: AxiosResponse<BlogResponse> = await axios.post(
        `${this.baseURL}/${id}/unpublish`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Increment Blog Views
  async incrementViews(id: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${id}/view`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Blog Categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/categories`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Blog Tags
  async getTags(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/tags`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Blog Analytics
  async getBlogAnalytics(): Promise<BlogAnalytics> {
    try {
      const response = await axios.get(
        `${this.baseURL}/analytics`,
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

export const blogService = new BlogService();
```

## React Hooks Implementation

### useBlogs Hook
```typescript
// src/features/blogs/hooks/useBlogs.ts
import { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';

export const useBlogs = (params?: BlogsQueryParams) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getBlogs(params);
      setBlogs(result.blogs);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [params?.page, params?.limit, params?.status, params?.category, params?.search]);

  const refetch = () => fetchBlogs();

  return {
    blogs,
    pagination,
    loading,
    error,
    refetch
  };
};
```

### useBlog Hook (Single Blog)
```typescript
// src/features/blogs/hooks/useBlog.ts
import { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';

export const useBlog = (id: string) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await blogService.getBlog(id);
        setBlog(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return { blog, loading, error };
};
```

### useBlogMutations Hook
```typescript
// src/features/blogs/hooks/useBlogMutations.ts
import { useState } from 'react';
import { blogService } from '../services/blogService';
import { toast } from '@/utils/toast';

export const useBlogMutations = () => {
  const [loading, setLoading] = useState(false);

  const createBlog = async (blogData: CreateBlogRequest) => {
    setLoading(true);
    try {
      const result = await blogService.createBlog(blogData);
      toast.success('Blog created successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create blog');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (id: string, updateData: UpdateBlogRequest) => {
    setLoading(true);
    try {
      const result = await blogService.updateBlog(id, updateData);
      toast.success('Blog updated successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update blog');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    setLoading(true);
    try {
      await blogService.deleteBlog(id);
      toast.success('Blog deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const publishBlog = async (id: string) => {
    setLoading(true);
    try {
      const result = await blogService.publishBlog(id);
      toast.success('Blog published successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish blog');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unpublishBlog = async (id: string) => {
    setLoading(true);
    try {
      const result = await blogService.unpublishBlog(id);
      toast.success('Blog unpublished successfully!');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unpublish blog');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog,
    loading
  };
};
```

## Component Examples

### BlogsList Component
```tsx
// src/features/blogs/components/BlogsList.tsx
import React, { useState } from 'react';
import { useBlogs } from '../hooks/useBlogs';
import { useBlogMutations } from '../hooks/useBlogMutations';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const BlogsList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<BlogsQueryParams>({
    page: 1,
    limit: 20,
    status: undefined
  });

  const { blogs, pagination, loading, error, refetch } = useBlogs(queryParams);
  const { deleteBlog, publishBlog, unpublishBlog } = useBlogMutations();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(id);
      refetch();
    }
  };

  const handlePublish = async (id: string) => {
    await publishBlog(id);
    refetch();
  };

  const handleUnpublish = async (id: string) => {
    await unpublishBlog(id);
    refetch();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      public: 'green',
      private: 'orange',
      draft: 'gray'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  if (loading) return <div>Loading blogs...</div>;
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
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="draft">Draft</option>
        </select>

        <input
          type="text"
          placeholder="Search blogs..."
          value={queryParams.search || ''}
          onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="p-2 border rounded flex-1"
        />
      </div>

      {/* Blogs Table */}
      <Table>
        <thead>
          <tr>
            <th>Blog</th>
            <th>Category</th>
            <th>Author</th>
            <th>Status</th>
            <th>Views</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map(blog => (
            <tr key={blog.id}>
              <td>
                <div className="flex items-center gap-3">
                  {blog.main_image_pc_url && (
                    <img 
                      src={blog.main_image_pc_url} 
                      alt={blog.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-sm text-gray-500">/{blog.slug}</p>
                    {blog.quote && (
                      <p className="text-sm text-gray-400 italic">"{blog.quote}"</p>
                    )}
                  </div>
                </div>
              </td>
              <td>
                {blog.category ? (
                  <Badge color="blue">{blog.category}</Badge>
                ) : (
                  <span className="text-gray-400">Uncategorized</span>
                )}
              </td>
              <td>{blog.author || 'Anonymous'}</td>
              <td>
                <Badge color={getStatusColor(blog.status)}>
                  {blog.status}
                </Badge>
              </td>
              <td>{blog.views_count.toLocaleString()}</td>
              <td>
                {blog.published_at ? (
                  <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                ) : (
                  <span className="text-gray-400">Not published</span>
                )}
              </td>
              <td className="space-x-2">
                {blog.status === 'draft' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePublish(blog.id)}
                  >
                    Publish
                  </Button>
                )}
                {blog.status === 'public' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUnpublish(blog.id)}
                  >
                    Unpublish
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(blog.id)}
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

### BlogEditor Component
```tsx
// src/features/blogs/components/BlogEditor.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBlogMutations } from '../hooks/useBlogMutations';
import { CreateBlogRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BlogEditorProps {
  onSuccess?: () => void;
  initialData?: Partial<Blog>;
  isEdit?: boolean;
  blogId?: string;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ 
  onSuccess, 
  initialData, 
  isEdit = false,
  blogId 
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateBlogRequest>({
    defaultValues: {
      status: 'draft',
      tags: [],
      ...initialData
    }
  });
  
  const { createBlog, updateBlog, loading } = useBlogMutations();
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const onSubmit = async (data: CreateBlogRequest) => {
    try {
      // Generate slug from title if not provided
      if (!data.slug) {
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      data.tags = tags;

      if (isEdit && blogId) {
        await updateBlog(blogId, data);
      } else {
        await createBlog(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Blog Title *</label>
          <Input
            {...register('title', { required: 'Blog title is required' })}
            placeholder="Enter blog title"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <Input
            {...register('slug', { required: 'Slug is required' })}
            placeholder="blog-slug"
          />
          {errors.slug && <span className="text-red-500 text-sm">{errors.slug.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quote (Tagline)</label>
        <Input
          {...register('quote')}
          placeholder="A compelling quote or tagline for your blog..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (Summary)</label>
        <Textarea
          {...register('description')}
          placeholder="Brief description of your blog post..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content *</label>
        <Textarea
          {...register('content', { required: 'Content is required' })}
          placeholder="Write your blog content here... (supports HTML)"
          rows={10}
          className="font-mono"
        />
        {errors.content && <span className="text-red-500 text-sm">{errors.content.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Input
            {...register('category')}
            placeholder="e.g., Product Guide, Tutorial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <Input
            {...register('author')}
            placeholder="Author name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full p-2 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Main Image (PC) URL</label>
          <Input
            {...register('main_image_pc_url')}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Main Image (Mobile) URL</label>
          <Input
            {...register('main_image_mobile_url')}
            placeholder="https://example.com/mobile-image.jpg"
            type="url"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title (SEO)</label>
          <Input
            {...register('meta_title')}
            placeholder="SEO-optimized title (max 60 chars)"
            maxLength={60}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Description (SEO)</label>
          <Textarea
            {...register('meta_description')}
            placeholder="SEO meta description (max 160 chars)"
            rows={2}
            maxLength={160}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEdit ? 'Update Blog' : 'Create Blog')}
        </Button>
      </div>
    </form>
  );
};
```

## Usage in Frontend Pages

### Blogs Management Page
```tsx
// src/features/blogs/pages/BlogsPage.tsx
import React, { useState } from 'react';
import { BlogsList } from '../components/BlogsList';
import { BlogEditor } from '../components/BlogEditor';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export const BlogsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Blog Post
        </Button>
      </div>

      <BlogsList />

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Blog Post"
        className="max-w-4xl"
      >
        <BlogEditor 
          onSuccess={() => setIsCreateModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};
```

## Next Steps

1. Create the service file: `src/features/blogs/services/blogService.ts`
2. Create the hooks: `src/features/blogs/hooks/`
3. Create the components: `src/features/blogs/components/`
4. Add rich text editor component (like TinyMCE or Quill)
5. Add to your routing system
6. Import and use in your admin panel

This guide provides comprehensive integration for the Blog API with support for rich content, SEO optimization, categorization, and publishing workflow.