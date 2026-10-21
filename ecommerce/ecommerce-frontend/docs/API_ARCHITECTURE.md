# API Architecture Guide

A comprehensive guide for working with the frontend API architecture. Use this when adding new endpoints, query functions, or hooks.

---

## Architecture Overview

```
src/
├── api/                    # Core API layer
│   ├── client.ts           # Base api() function for client components
│   ├── server.ts           # serverApi() for Server Components
│   ├── errors.ts           # Error classes (ApiError, NotFoundError, etc.)
│   ├── types.ts            # Type definitions
│   └── index.ts            # Public exports
│
├── queries/                # Domain-organized async functions
│   ├── products/           # Product queries
│   ├── orders/             # Order queries
│   ├── users/              # User queries
│   ├── cart/               # Cart queries
│   ├── auth/               # Auth queries
│   ├── tiers/              # Category/tier queries
│   └── index.ts            # Barrel export
│
└── hooks/queries/          # TanStack Query hooks
    ├── products/
    ├── orders/
    └── useAddresses.ts
```

---

## Quick Reference

### Importing

```typescript
// Client Components - use api()
import { api } from '@/api';

// Server Components - use serverApi()
import { serverApi } from '@/api/server';

// Query functions (both client & server)
import { getProducts, productKeys } from '@/queries';

// Error handling
import { ApiError, isApiError, NotFoundError } from '@/api';
```

---

## Adding a New API Endpoint

### Step 1: Create Query Module

Create a folder structure for your domain:

```
src/queries/
└── [domain]/
    ├── keys.ts      # Query cache keys
    ├── queries.ts   # Async functions
    ├── types.ts     # TypeScript types (optional)
    └── index.ts     # Barrel export
```

### Step 2: Define Query Keys

```typescript
// src/queries/example/keys.ts

export const exampleKeys = {
    all: ['example'] as const,
    lists: () => [...exampleKeys.all, 'list'] as const,
    list: (params?: ExampleParams) => [...exampleKeys.lists(), params] as const,
    detail: (id: string) => [...exampleKeys.all, 'detail', id] as const,
};
```

### Step 3: Write Query Functions

```typescript
// src/queries/example/queries.ts

import { api } from '@/api';
import type { Example, ExampleParams, ExampleResponse } from './types';

/**
 * Get all examples with optional filters
 */
export async function getExamples(params?: ExampleParams): Promise<Example[]> {
    return api<Example[]>('/examples', {
        params,  // Will be converted to query string
    });
}

/**
 * Get single example by ID
 */
export async function getExampleById(id: string): Promise<Example> {
    return api<Example>(`/examples/${id}`);
}

/**
 * Create a new example (requires auth)
 */
export async function createExample(data: CreateExampleData): Promise<Example> {
    return api.post<Example>('/examples', data, { auth: true });
}

/**
 * Update an example
 */
export async function updateExample(id: string, data: UpdateExampleData): Promise<Example> {
    return api.patch<Example>(`/examples/${id}`, data, { auth: true });
}

/**
 * Delete an example
 */
export async function deleteExample(id: string): Promise<void> {
    return api.delete(`/examples/${id}`, { auth: true });
}
```

### Step 4: Export from Module Index

```typescript
// src/queries/example/index.ts
export { exampleKeys } from './keys';
export * from './queries';
export type * from './types';
```

### Step 5: Add to Main Queries Index

```typescript
// src/queries/index.ts
// ... existing exports ...

// Example
export {
    exampleKeys,
    getExamples,
    getExampleById,
    createExample,
    updateExample,
    deleteExample,
} from './example';

export type { Example, ExampleParams, CreateExampleData } from './example';
```

---

## API Function Options

```typescript
interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;                    // Auto-serialized to JSON
    headers?: Record<string, string>;
    auth?: boolean;                    // Include auth token
    revalidate?: number | false;       // Next.js cache revalidation
    tags?: string[];                   // Cache tags for invalidation
    params?: Record<string, unknown>;  // Query parameters
}

// Examples
await api('/products');
await api('/products', { auth: true });
await api.post('/orders', orderData, { auth: true });
await api.patch(`/users/${id}`, userData, { auth: true });
await api.delete(`/cart/${itemId}`, { auth: true });
```

---

## Server Components

For React Server Components, Route Handlers, or Server Actions, use `serverApi`:

```typescript
// src/app/dashboard/page.tsx
import { serverApi } from '@/api/server';

export default async function DashboardPage() {
    // serverApi automatically gets auth from cookies
    const data = await serverApi<DashboardData>('/dashboard', { auth: true });
    
    return <Dashboard data={data} />;
}
```

Key differences:
- Import from `@/api/server` (not `@/api`)
- Only works in server context
- Auth token retrieved from cookies automatically

---

## Creating TanStack Query Hooks

```typescript
// src/hooks/queries/example/useExamples.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    exampleKeys, 
    getExamples, 
    getExampleById,
    createExample,
    updateExample,
    deleteExample 
} from '@/queries';

// Query hook for list
export function useExamples(params?: ExampleParams) {
    return useQuery({
        queryKey: exampleKeys.list(params),
        queryFn: () => getExamples(params),
    });
}

// Query hook for single item
export function useExample(id: string) {
    return useQuery({
        queryKey: exampleKeys.detail(id),
        queryFn: () => getExampleById(id),
        enabled: !!id,
    });
}

// Mutation hook for create
export function useCreateExample() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createExample,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
        },
    });
}

// Mutation hook for update
export function useUpdateExample() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateExampleData }) => 
            updateExample(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: exampleKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
        },
    });
}

// Mutation hook for delete
export function useDeleteExample() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteExample,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
        },
    });
}
```

---

## Error Handling

```typescript
import { isApiError, ApiError, NotFoundError } from '@/api';

try {
    const data = await getProductById(id);
} catch (error) {
    if (isApiError(error)) {
        if (error.status === 404) {
            // Handle not found
        } else if (error.status === 401) {
            // Handle unauthorized
        }
        console.error(`API Error: ${error.message}`);
    }
    throw error;
}
```

Available error classes:
- `ApiError` - Base error (all API errors)
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ValidationError` - 422
- `RateLimitError` - 429
- `NetworkError` - Network failures

---

## Existing Query Modules

| Module | Key Functions | Type Exports |
|--------|--------------|--------------|
| `products` | `getProducts`, `getProductById`, `getProductBySlug`, `searchProducts` | `ProductDetail`, `GetProductsParams` |
| `orders` | `getOrders`, `getOrderById`, `createOrder`, `cancelOrder`, `retryPayment` | `Order`, `CreateOrderData` |
| `users` | `getCurrentUser`, `updateProfile`, `getAddresses`, `createAddress` | `UserProfile`, `AddressData` |
| `cart` | `getCart`, `addToCart`, `updateCartItem`, `removeFromCart` | `Cart`, `CartItem` |
| `auth` | `syncUser`, `resetPassword` | `AuthResponse` |
| `tiers` | `getTierHierarchy`, `getAllTiers`, `getTierById` | `TierParams` |

---

## Best Practices

1. **Always use query keys factory** - Enables proper cache invalidation
2. **Type everything** - Use generic `api<T>()` for type safety
3. **Handle errors** - Use try/catch with `isApiError()`
4. **Invalidate on mutations** - Keep cache in sync
5. **Use `auth: true`** - For authenticated endpoints
6. **Server vs Client** - Use `serverApi` in RSC, `api` in client components
