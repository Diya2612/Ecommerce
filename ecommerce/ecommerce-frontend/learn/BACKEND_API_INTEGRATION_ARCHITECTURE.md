# Backend API Integration Architecture Plan
## Anant Enterprises Frontend - Production-Ready Data Layer

> **Document Version**: 1.0  
> **Created**: December 26, 2025  
> **Status**: Planning Phase  
> **Reference**: [Next.js Fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Proposed Architecture](#3-proposed-architecture)
4. [Directory Structure](#4-directory-structure)
5. [Core Implementation Layers](#5-core-implementation-layers)
6. [Caching & Revalidation Strategy](#6-caching--revalidation-strategy)
7. [Type System & Contracts](#7-type-system--contracts)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Server vs Client Data Fetching](#9-server-vs-client-data-fetching)
10. [Implementation Phases](#10-implementation-phases)
11. [Code Examples](#11-code-examples)
12. [Performance Optimizations](#12-performance-optimizations)
13. [Security Considerations](#13-security-considerations)
14. [Testing Strategy](#14-testing-strategy)

---

## 1. Executive Summary

### Objective
Transform the current static/mock data architecture into a **production-ready, scalable API integration layer** that leverages Next.js 15's enhanced `fetch` capabilities for server-side rendering, intelligent caching, and on-demand revalidation.

### Key Principles
- **Server-First Fetching**: Prioritize React Server Components for data fetching
- **Type Safety**: End-to-end TypeScript contracts between frontend and backend
- **Intelligent Caching**: Implement tiered caching with tag-based revalidation
- **Error Resilience**: Graceful degradation and comprehensive error boundaries
- **Scalability**: Architecture designed to grow with feature additions

---

## 2. Current State Analysis

### Existing Data Sources
| Component | Data Location | Type |
|-----------|---------------|------|
| `FeaturedProducts.tsx` | Embedded `const PRODUCTS` | Static Mock |
| `ProductHero.tsx` | Embedded product object | Static Mock |
| `mockProfileData.ts` | `src/data/` folder | Mock File |
| Cart/Wishlist | React Context + localStorage | Client State |

### Current Pain Points
1. ❌ Data is duplicated across components
2. ❌ No real-time data capabilities
3. ❌ Tight coupling between UI and data
4. ❌ No caching strategy
5. ❌ No error handling for data fetching
6. ❌ SEO limited due to client-side data

### Current Component Architecture
```
┌─────────────────────────────────────────────────────┐
│                   page.tsx (SSR)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │        Component (Client: "use client")       │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │    const MOCK_DATA = [...]              │  │  │
│  │  │    ↓                                    │  │  │
│  │  │    map(data) → JSX                      │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Proposed Architecture

### New Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP ROUTER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    page.tsx (Server Component)                    │   │
│  │                                                                   │   │
│  │   const data = await api.products.getAll();  ← Server Fetch      │   │
│  │   return <ProductGrid products={data} />     ← Pass as Props     │   │
│  │                                                                   │   │
│  └─────────────────────────────┬────────────────────────────────────┘   │
│                                │                                         │
│  ┌─────────────────────────────▼────────────────────────────────────┐   │
│  │                    API Service Layer                              │   │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │   │ Products │ │  Orders  │ │   Auth   │ │   AMC    │  ...      │   │
│  │   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │   │
│  └────────┼────────────┼────────────┼────────────┼──────────────────┘   │
│           │            │            │            │                       │
│  ┌────────▼────────────▼────────────▼────────────▼──────────────────┐   │
│  │                     Base Fetch Client                             │   │
│  │   • Request/Response Interceptors                                 │   │
│  │   • Error Transformation                                          │   │
│  │   • Auth Token Injection                                          │   │
│  │   • Caching Configuration                                         │   │
│  └───────────────────────────────────────┬──────────────────────────┘   │
│                                          │                               │
├──────────────────────────────────────────┼───────────────────────────────┤
│                                          │                               │
│  ┌───────────────────────────────────────▼───────────────────────────┐  │
│  │                      NEXT.JS DATA CACHE                            │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │  cache: 'force-cache' | 'no-store'                          │ │  │
│  │   │  next: { revalidate: 60, tags: ['products', 'product-123'] }│ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API SERVER                              │
│                   (Your REST/GraphQL Backend)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Directory Structure

### New Folders to Create
```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts           # Base fetch client with interceptors
│   │   ├── config.ts           # API configuration & endpoints
│   │   ├── cache-tags.ts       # Centralized cache tag constants
│   │   └── errors.ts           # Custom error classes
│   │
│   └── services/               # Domain-specific API services
│       ├── products.service.ts
│       ├── orders.service.ts
│       ├── auth.service.ts
│       ├── cart.service.ts
│       ├── amc.service.ts
│       ├── reviews.service.ts
│       └── index.ts            # Barrel export
│
├── types/                      # Centralized TypeScript types
│   ├── api.types.ts            # Generic API response types
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── user.types.ts
│   ├── cart.types.ts
│   └── index.ts                # Barrel export
│
├── hooks/
│   ├── queries/                # Client-side data hooks (for mutations/real-time)
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   └── useAuth.ts
│   └── use-mobile.ts           # (existing)
│
├── actions/                    # Server Actions for mutations
│   ├── cart.actions.ts
│   ├── order.actions.ts
│   └── auth.actions.ts
│
└── data/                       # Keep for fallback mock data
    └── mockProfileData.ts      # (existing)
```

---

## 5. Core Implementation Layers

### Layer 1: API Configuration (`lib/api/config.ts`)
```typescript
// Centralized API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  serverBaseUrl: process.env.API_URL || 'http://backend-internal:8000/api',
  timeout: 10000,
  version: 'v1',
} as const;

export const ENDPOINTS = {
  // Products
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    featured: '/products/featured',
    categories: '/products/categories',
    search: '/products/search',
  },
  // Orders
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    create: '/orders',
  },
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/me',
    refresh: '/auth/refresh',
  },
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: (itemId: string) => `/cart/items/${itemId}`,
    remove: (itemId: string) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
  },
  // AMC
  amc: {
    plans: '/amc/plans',
    userPlans: '/amc/user-plans',
    schedule: (planId: string) => `/amc/plans/${planId}/schedule`,
  },
  // Reviews
  reviews: {
    product: (productId: string) => `/products/${productId}/reviews`,
    create: (productId: string) => `/products/${productId}/reviews`,
  },
} as const;
```

### Layer 2: Cache Tags (`lib/api/cache-tags.ts`)
```typescript
// Centralized cache tags for granular revalidation
export const CACHE_TAGS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_DETAIL: (id: string) => `product-${id}`,
  FEATURED_PRODUCTS: 'featured-products',
  PRODUCT_CATEGORIES: 'product-categories',
  
  // Orders
  ORDERS: 'orders',
  ORDER_DETAIL: (id: string) => `order-${id}`,
  USER_ORDERS: (userId: string) => `user-orders-${userId}`,
  
  // User
  USER_PROFILE: (userId: string) => `user-profile-${userId}`,
  
  // Cart
  CART: (userId: string) => `cart-${userId}`,
  
  // AMC
  AMC_PLANS: 'amc-plans',
  USER_AMC: (userId: string) => `user-amc-${userId}`,
  
  // Reviews
  PRODUCT_REVIEWS: (productId: string) => `product-reviews-${productId}`,
} as const;

// Revalidation intervals (in seconds)
export const REVALIDATION = {
  STATIC: false,           // Never revalidate (use for truly static content)
  REAL_TIME: 0,            // Always fetch fresh (no cache)
  SHORT: 60,               // 1 minute
  MEDIUM: 300,             // 5 minutes  
  LONG: 3600,              // 1 hour
  DAILY: 86400,            // 24 hours
} as const;
```

### Layer 3: Base Fetch Client (`lib/api/client.ts`)
```typescript
import { API_CONFIG } from './config';
import { ApiError, NetworkError, AuthError } from './errors';

type FetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

interface RequestConfig<T = unknown> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: T;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  isServer?: boolean;
}

// Get auth token (works on both server and client)
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Server-side: get from cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  }
  // Client-side: get from cookie or localStorage
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1] || null;
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const baseUrl = typeof window === 'undefined' 
    ? API_CONFIG.serverBaseUrl 
    : API_CONFIG.baseUrl;
    
  const url = new URL(`${baseUrl}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Main fetch function
export async function apiClient<TResponse, TBody = unknown>(
  config: RequestConfig<TBody>
): Promise<TResponse> {
  const {
    endpoint,
    method = 'GET',
    body,
    params,
    headers = {},
    cache,
    revalidate,
    tags,
  } = config;

  const url = buildUrl(endpoint, params);
  const authToken = await getAuthToken();

  const fetchOptions: FetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  // Add Next.js specific caching options
  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined || tags) {
    fetchOptions.next = {
      ...(revalidate !== undefined && { revalidate }),
      ...(tags && { tags }),
    };
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new AuthError('Authentication required', errorBody);
      }
      
      throw new ApiError(
        errorBody.message || `HTTP ${response.status}`,
        response.status,
        errorBody
      );
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as TResponse;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError || error instanceof AuthError) {
      throw error;
    }
    throw new NetworkError('Network request failed', error);
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Partial<RequestConfig>) =>
    apiClient<T>({ endpoint, method: 'GET', ...options }),
    
  post: <T, B = unknown>(endpoint: string, body: B, options?: Partial<RequestConfig<B>>) =>
    apiClient<T, B>({ endpoint, method: 'POST', body, ...options }),
    
  put: <T, B = unknown>(endpoint: string, body: B, options?: Partial<RequestConfig<B>>) =>
    apiClient<T, B>({ endpoint, method: 'PUT', body, ...options }),
    
  patch: <T, B = unknown>(endpoint: string, body: B, options?: Partial<RequestConfig<B>>) =>
    apiClient<T, B>({ endpoint, method: 'PATCH', body, ...options }),
    
  delete: <T>(endpoint: string, options?: Partial<RequestConfig>) =>
    apiClient<T>({ endpoint, method: 'DELETE', ...options }),
};
```

### Layer 4: Custom Errors (`lib/api/errors.ts`)
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string, public body?: unknown) {
    super(message);
    this.name = 'AuthError';
  }
}

// Type guard for error handling
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
```

---

## 6. Caching & Revalidation Strategy

### Caching Tiers

| Data Type | Cache Strategy | Revalidate | Tags | Rationale |
|-----------|---------------|------------|------|-----------|
| **Product Catalog** | `force-cache` | 5 min | `['products']` | Changes infrequently |
| **Product Detail** | `force-cache` | 5 min | `['products', 'product-{id}']` | Granular invalidation |
| **Featured Products** | `force-cache` | 15 min | `['featured-products']` | Marketing controlled |
| **Categories** | `force-cache` | 1 hour | `['categories']` | Very stable |
| **User Cart** | `no-store` | N/A | N/A | Real-time updates |
| **User Orders** | `force-cache` | 1 min | `['user-orders-{id}']` | Recent activity |
| **Reviews** | `force-cache` | 5 min | `['product-reviews-{id}']` | UGC with moderation |
| **AMC Plans** | `force-cache` | 1 hour | `['amc-plans']` | Service catalog |
| **User AMC Status** | `force-cache` | 5 min | `['user-amc-{id}']` | Personal data |

### On-Demand Revalidation (Server Actions)
```typescript
// src/actions/revalidation.actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

// Product revalidation
export async function revalidateProducts() {
  revalidateTag('products');
}

export async function revalidateProduct(id: string) {
  revalidateTag(`product-${id}`);
  revalidatePath(`/product/${id}`);
}

// Cart revalidation after mutation
export async function revalidateUserCart(userId: string) {
  revalidateTag(`cart-${userId}`);
}

// Order revalidation after status change
export async function revalidateUserOrders(userId: string) {
  revalidateTag(`user-orders-${userId}`);
  revalidatePath('/profile/orders');
}

// Review revalidation after submission
export async function revalidateProductReviews(productId: string) {
  revalidateTag(`product-reviews-${productId}`);
  revalidatePath(`/product/${productId}`);
}
```

---

## 7. Type System & Contracts

### Base API Response Types (`types/api.types.ts`)
```typescript
// Standard API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Domain Types (`types/product.types.ts`)
```typescript
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discount: number;
  sku: string;
  category: ProductCategory;
  tags: string[];
  images: ProductImage[];
  features: ProductFeature[];
  specifications: Record<string, string>;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

// Query parameters
export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  featured?: boolean;
}

// Create/Update DTOs
export interface CreateProductReviewDto {
  rating: number;
  title: string;
  comment: string;
}
```

---

## 8. Error Handling Strategy

### Server Component Error Handling
```typescript
// src/app/(main)/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import { productsService } from '@/lib/services';
import { isApiError } from '@/lib/api/errors';

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const product = await productsService.getById(params.id);
    
    if (!product) {
      notFound();
    }
    
    return <ProductDetail product={product} />;
  } catch (error) {
    if (isApiError(error) && error.statusCode === 404) {
      notFound();
    }
    // Throw to trigger error.tsx
    throw error;
  }
}
```

### Error Boundary (`app/(main)/product/[id]/error.tsx`)
```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F51] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We couldn't load this product. Please try again.
          </p>
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### Loading States (`app/(main)/product/[id]/loading.tsx`)
```typescript
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-card" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          
          {/* Details skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 rounded-card" />
            <div className="flex gap-4">
              <Skeleton className="h-16 flex-1 rounded-input" />
              <Skeleton className="h-16 flex-1 rounded-input" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 9. Server vs Client Data Fetching

### Decision Matrix

| Use Case | Approach | Reason |
|----------|----------|--------|
| Initial page load data | **Server Component** | SEO, faster LCP, no loading states |
| User-specific data (auth required) | **Server Component** + cookies | Secure, no token exposure |
| Real-time updates (cart count) | **Client Component** + polling/websocket | Needs reactivity |
| Form submissions | **Server Actions** | Type-safe mutations |
| Infinite scroll | **Client Component** | Pagination after hydration |
| Search with debounce | **Client Component** | User input driven |
| Static content | **Server Component** + `generateStaticParams` | Build-time generation |

### Pattern 1: Server Component Data Fetching
```typescript
// app/(main)/collection/page.tsx
import { productsService } from '@/lib/services';
import { ProductGrid } from '@/components/collection/ProductGrid';

interface Props {
  searchParams: { 
    category?: string; 
    page?: string;
  };
}

export default async function CollectionPage({ searchParams }: Props) {
  const products = await productsService.getAll({
    category: searchParams.category,
    page: Number(searchParams.page) || 1,
    limit: 12,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid products={products.data} meta={products.meta} />
    </div>
  );
}
```

### Pattern 2: Client-Side Mutations via Server Actions
```typescript
// actions/cart.actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { cartService } from '@/lib/services';
import { CACHE_TAGS } from '@/lib/api/cache-tags';

export async function addToCartAction(productId: string, quantity: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const result = await cartService.addItem(productId, quantity);
    revalidateTag(CACHE_TAGS.CART(userId));
    
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add item' 
    };
  }
}
```

### Pattern 3: Client Hook for Real-Time Data
```typescript
// hooks/queries/useCart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types';

export function useCartPolling(intervalMs = 30000) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart', { cache: 'no-store' });
      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, intervalMs);
    return () => clearInterval(interval);
  }, [fetchCart, intervalMs]);

  return { items, isLoading, refetch: fetchCart };
}
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up core infrastructure

- [ ] Create `src/lib/api/` directory structure
- [ ] Implement `config.ts` with environment variables
- [ ] Implement `client.ts` base fetch wrapper
- [ ] Implement `cache-tags.ts` constants
- [ ] Implement `errors.ts` custom error classes
- [ ] Create `src/types/` with base API types
- [ ] Update `next.config.ts` with API domain for images
- [ ] Set up environment variables (`.env.local`, `.env.production`)

### Phase 2: Type Definitions (Week 1)
**Goal**: Define all data contracts

- [ ] Create `types/product.types.ts`
- [ ] Create `types/order.types.ts`
- [ ] Create `types/user.types.ts`
- [ ] Create `types/cart.types.ts`
- [ ] Create `types/amc.types.ts`
- [ ] Create barrel exports in `types/index.ts`
- [ ] Validate types match backend API contracts

### Phase 3: Service Layer (Week 2)
**Goal**: Build domain services

- [ ] Implement `products.service.ts`
- [ ] Implement `orders.service.ts`
- [ ] Implement `auth.service.ts`
- [ ] Implement `cart.service.ts`
- [ ] Implement `amc.service.ts`
- [ ] Implement `reviews.service.ts`
- [ ] Create barrel export in `services/index.ts`
- [ ] Write unit tests for services

### Phase 4: Page Migration - Products (Week 2-3)
**Goal**: Migrate product pages to server fetching

- [ ] Update `app/(main)/page.tsx` (Homepage)
  - Fetch featured products server-side
  - Pass to `FeaturedProducts` as props
- [ ] Update `app/(main)/collection/page.tsx`
  - Server-side product listing
  - URL-based filtering
- [ ] Update `app/(main)/product/[id]/page.tsx`
  - Server-side product detail fetch
  - Add `loading.tsx` and `error.tsx`
- [ ] Add `generateStaticParams` for popular products
- [ ] Remove embedded mock data from components

### Phase 5: Page Migration - User Data (Week 3)
**Goal**: Migrate user-specific pages

- [ ] Update profile pages
  - Orders list
  - Addresses
  - AMC plans
- [ ] Implement authentication flow
- [ ] Add protected route handling
- [ ] Set up cookie-based session management

### Phase 6: Server Actions (Week 3-4)
**Goal**: Implement mutations

- [ ] Cart actions (add, remove, update quantity)
- [ ] Order actions (create, cancel)
- [ ] Review actions (submit)
- [ ] Profile actions (update)
- [ ] Implement optimistic updates where applicable

### Phase 7: Real-Time Features (Week 4)
**Goal**: Add dynamic client features

- [ ] Cart count polling/sync
- [ ] Stock availability updates
- [ ] Search with autocomplete
- [ ] Infinite scroll for product lists

### Phase 8: Error Handling & Polish (Week 4)
**Goal**: Production hardening

- [ ] Add error boundaries to all route segments
- [ ] Implement retry logic for transient failures
- [ ] Add loading skeletons
- [ ] Set up error logging/monitoring
- [ ] Performance testing
- [ ] Cache hit rate optimization

---

## 11. Code Examples

### Example: Products Service (`lib/services/products.service.ts`)
```typescript
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/config';
import { CACHE_TAGS, REVALIDATION } from '@/lib/api/cache-tags';
import type { 
  Product, 
  ProductListParams, 
  PaginatedResponse, 
  ApiResponse 
} from '@/types';

export const productsService = {
  /**
   * Get all products with optional filters
   */
  async getAll(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>(ENDPOINTS.products.list, {
      params,
      revalidate: REVALIDATION.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS],
    });
  },

  /**
   * Get a single product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(
      ENDPOINTS.products.detail(id),
      {
        revalidate: REVALIDATION.MEDIUM,
        tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT_DETAIL(id)],
      }
    );
    return response.data;
  },

  /**
   * Get featured products for homepage
   */
  async getFeatured(): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(
      ENDPOINTS.products.featured,
      {
        revalidate: REVALIDATION.LONG,
        tags: [CACHE_TAGS.FEATURED_PRODUCTS],
      }
    );
    return response.data;
  },

  /**
   * Search products (client-side, no cache)
   */
  async search(query: string): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(
      ENDPOINTS.products.search,
      {
        params: { q: query },
        cache: 'no-store',
      }
    );
    return response.data;
  },
};
```

### Example: Updated Homepage (`app/(main)/page.tsx`)
```typescript
import { Hero } from '@/components/home/Hero';
import { Brands } from '@/components/home/Brands';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { DealOfTheDay } from '@/components/home/DealOfTheDay';
import { Testimonials } from '@/components/home/Testimonials';
import { CallToAction } from '@/components/home/Footer';
import { productsService } from '@/lib/services';

export default async function HomePage() {
  // Parallel data fetching for performance
  const [featuredProducts, dealProduct] = await Promise.all([
    productsService.getFeatured(),
    productsService.getDealOfTheDay(),
  ]);

  return (
    <>
      <Hero />
      <Brands />
      <Categories />
      <FeaturedProducts products={featuredProducts} />
      <DealOfTheDay product={dealProduct} />
      <Testimonials />
      <CallToAction />
    </>
  );
}
```

### Example: Updated FeaturedProducts Component
```typescript
// components/home/FeaturedProducts.tsx
'use client';

import { Product } from '@/types';
// ... other imports

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [mobileCarouselIndex, setMobileCarouselIndex] = useState(0);

  // Component now receives data as props instead of using embedded constants
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* ... header content ... */}
        
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* ... mobile carousel ... */}
      </div>
    </section>
  );
}
```

---

## 12. Performance Optimizations

### 1. Parallel Data Fetching
```typescript
// DON'T: Sequential fetches
const products = await getProducts();
const categories = await getCategories();
const deals = await getDeals();

// DO: Parallel fetches
const [products, categories, deals] = await Promise.all([
  getProducts(),
  getCategories(),
  getDeals(),
]);
```

### 2. Static Generation for Popular Pages
```typescript
// app/(main)/product/[id]/page.tsx
export async function generateStaticParams() {
  const products = await productsService.getPopular({ limit: 50 });
  
  return products.map((product) => ({
    id: product.id,
  }));
}
```

### 3. Streaming with Suspense
```typescript
// app/(main)/page.tsx
import { Suspense } from 'react';
import { FeaturedProductsSkeleton } from '@/components/home/FeaturedProductsSkeleton';

// Async component
async function FeaturedProductsLoader() {
  const products = await productsService.getFeatured();
  return <FeaturedProducts products={products} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Brands />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProductsLoader />
      </Suspense>
    </>
  );
}
```

### 4. Request Deduplication
Next.js automatically deduplicates `fetch` requests with the same URL and options during a single server render. No additional configuration needed.

### 5. Image Optimization
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',
        pathname: '/products/**',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

---

## 13. Security Considerations

### 1. Environment Variables
```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_URL=http://localhost:8000/api  # Server-only

# .env.production
NEXT_PUBLIC_API_URL=https://api.anantenterprises.com
API_URL=http://backend-internal:8000/api  # Internal Docker network
```

### 2. Token Handling
- Store auth tokens in **HTTP-only cookies** (not localStorage)
- Use `cookies()` from `next/headers` in Server Components
- Never expose tokens in client-side code

### 3. Input Validation
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1).max(100),
  })),
  shippingAddressId: z.string().uuid(),
  paymentMethod: z.enum(['cod', 'online', 'upi']),
});

export async function createOrderAction(formData: FormData) {
  const validated = CreateOrderSchema.parse({
    items: JSON.parse(formData.get('items') as string),
    shippingAddressId: formData.get('shippingAddressId'),
    paymentMethod: formData.get('paymentMethod'),
  });
  
  // Proceed with validated data
}
```

### 4. API Route Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  
  // Protect user-specific routes
  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*'],
};
```

---

## 14. Testing Strategy

### 1. Service Tests
```typescript
// __tests__/services/products.service.test.ts
import { productsService } from '@/lib/services';

// Mock fetch
global.fetch = jest.fn();

describe('ProductsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all products with correct caching', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0 } }),
    });

    await productsService.getAll({ page: 1 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products'),
      expect.objectContaining({
        next: expect.objectContaining({
          tags: ['products'],
        }),
      })
    );
  });
});
```

### 2. Integration Tests
```typescript
// __tests__/pages/collection.test.tsx
import { render, screen } from '@testing-library/react';
import CollectionPage from '@/app/(main)/collection/page';

// Mock the service
jest.mock('@/lib/services', () => ({
  productsService: {
    getAll: jest.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Test Product' }],
      meta: { total: 1 },
    }),
  },
}));

describe('Collection Page', () => {
  it('renders products from API', async () => {
    const Page = await CollectionPage({ searchParams: {} });
    render(Page);
    
    expect(await screen.findByText('Test Product')).toBeInTheDocument();
  });
});
```

### 3. E2E Tests (Playwright)
```typescript
// e2e/collection.spec.ts
import { test, expect } from '@playwright/test';

test('collection page loads products', async ({ page }) => {
  await page.goto('/collection');
  
  // Wait for products to load
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  
  // Test filtering
  await page.click('[data-testid="filter-category-ro"]');
  await expect(page).toHaveURL(/category=ro/);
});
```

---

## Appendix A: Checklist for Each Migrated Page

For every page migrated to the new architecture:

- [ ] Data fetched in Server Component or via Server Action
- [ ] Types imported from `@/types`
- [ ] Service method used from `@/lib/services`
- [ ] Appropriate cache tags applied
- [ ] Revalidation interval set
- [ ] `loading.tsx` created
- [ ] `error.tsx` created
- [ ] Mock data removed from component
- [ ] Props interface defined for components receiving data
- [ ] Unit tests written
- [ ] Smoke tested in development
- [ ] Performance checked with React DevTools

---

## Appendix B: Quick Reference - Next.js Fetch Options

```typescript
// Force cache (default in production builds)
fetch(url, { cache: 'force-cache' });

// Never cache (always fetch fresh)
fetch(url, { cache: 'no-store' });

// Revalidate after N seconds
fetch(url, { next: { revalidate: 60 } });

// Never revalidate (cache forever)
fetch(url, { next: { revalidate: false } });

// Add cache tags for on-demand revalidation
fetch(url, { next: { tags: ['products', 'product-123'] } });

// Revalidate by tag (in Server Action)
import { revalidateTag } from 'next/cache';
revalidateTag('products');

// Revalidate by path (in Server Action)
import { revalidatePath } from 'next/cache';
revalidatePath('/collection');
```

---

**Document maintained by**: Development Team  
**Last updated**: December 26, 2025  
**Next review**: After Phase 2 completion
