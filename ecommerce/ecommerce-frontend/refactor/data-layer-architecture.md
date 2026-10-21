# Data Layer Architecture

> **Version:** 1.0  
> **Status:** Proposed  
> **Author:** Staff Engineer Review

---

## 1. Design Philosophy: Single Source of Truth

The core principle is **one query function per endpoint**, consumed differently by server and client contexts.

```
                    ┌─────────────────────────────────────┐
                    │         SINGLE QUERY FUNCTION        │
                    │    getProduct(id): Promise<Product>  │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  Server Component │  │  Client Hook    │  │  Server Action  │
    │  await getProduct │  │  useProduct()   │  │  revalidateTag  │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Key Benefits:**
- No duplicate fetch logic
- Types shared across contexts
- Cache tags managed centrally
- Easy migration between client/server

---

## 2. Folder Structure

```
src/
├── api/                          # 🆕 Core API Layer
│   ├── client.ts                 # Unified fetch wrapper (env-aware)
│   ├── types.ts                  # Shared API types
│   └── errors.ts                 # Custom error classes
│
├── queries/                      # 🆕 Query Functions (SSOT)
│   ├── products/
│   │   ├── keys.ts               # Query keys factory
│   │   ├── queries.ts            # Query functions (getProduct, getProducts)
│   │   └── types.ts              # Feature-specific types
│   ├── cart/
│   │   ├── keys.ts
│   │   ├── queries.ts
│   │   ├── mutations.ts          # Mutation functions
│   │   └── types.ts
│   ├── orders/
│   │   ├── keys.ts
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── types.ts
│   └── users/
│       ├── keys.ts
│       ├── queries.ts
│       ├── mutations.ts
│       └── types.ts
│
├── hooks/                        # 🆕 TanStack Query Hooks
│   ├── products/
│   │   ├── useProduct.ts         # Single product
│   │   ├── useProducts.ts        # Product list
│   │   └── useProductSearch.ts   # Search
│   ├── cart/
│   │   ├── useCart.ts
│   │   └── useCartMutations.ts
│   ├── orders/
│   │   ├── useOrders.ts
│   │   └── useOrderMutations.ts
│   └── users/
│       ├── useProfile.ts
│       └── useAddresses.ts
│
├── lib/
│   ├── cache/
│   │   └── tags.ts               # Cache tag constants
│   └── query-client.ts           # TanStack Query config
│
└── app/                          # Next.js App Router
    └── (main)/
        └── products/
            └── [slug]/
                └── page.tsx      # Uses query functions directly
```

---

## 3. Core API Client

**File:** `src/api/client.ts`

```typescript
import { getSession } from '@/lib/supabase/server';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  revalidate?: number | false;
  tags?: string[];
}

/**
 * Environment-aware API client
 * - Server: Uses cookies for auth, Next.js cache
 * - Client: Uses Supabase session, no cache options
 */
export async function api<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, auth = false, revalidate, tags, ...init } = options;
  const isServer = typeof window === 'undefined';

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };

  // Auth token injection
  if (auth) {
    const token = isServer
      ? (await getSession())?.access_token
      : (await getSupabaseBrowserClient()?.auth.getSession())?.data.session?.access_token;
    
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build fetch options
  const fetchOptions: RequestInit & { next?: object } = {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  // Server-only: Add Next.js cache options
  if (isServer && (revalidate !== undefined || tags?.length)) {
    fetchOptions.next = { revalidate, tags };
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Request failed', response.status);
  }

  const json = await response.json();
  return json.data ?? json; // Unwrap { data: ... } wrapper
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## 4. Query Functions (Single Source of Truth)

**File:** `src/queries/products/keys.ts`

```typescript
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bySlug: (slug: string) => [...productKeys.all, 'slug', slug] as const,
  related: (id: string) => [...productKeys.detail(id), 'related'] as const,
  reviews: (id: string) => [...productKeys.detail(id), 'reviews'] as const,
};
```

**File:** `src/queries/products/queries.ts`

```typescript
import { api } from '@/api/client';
import { CACHE_TAGS } from '@/lib/cache/tags';
import type { Product, ProductsResponse } from './types';

/**
 * Get single product by slug
 * Works in both Server Components and TanStack Query
 */
export async function getProduct(slug: string): Promise<Product> {
  return api<Product>(`/products/slug/${slug}`, {
    revalidate: 3600,
    tags: [CACHE_TAGS.PRODUCT, `product:${slug}`],
  });
}

/**
 * Get products with filters
 */
export async function getProducts(
  filters: Record<string, string | number> = {}
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
  
  return api<ProductsResponse>(`/products?${params}`, {
    revalidate: 60,
    tags: [CACHE_TAGS.PRODUCTS],
  });
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
  return api<Product[]>(`/products/${productId}/related`, {
    revalidate: 3600,
    tags: [CACHE_TAGS.RELATED_PRODUCTS],
  });
}

/**
 * Search products (no caching - real-time)
 */
export async function searchProducts(query: string): Promise<Product[]> {
  return api<Product[]>(`/products/search?q=${encodeURIComponent(query)}&limit=10`, {
    revalidate: false, // No cache for search
  });
}
```

---

## 5. TanStack Query Hooks

**File:** `src/hooks/products/useProduct.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { productKeys } from '@/queries/products/keys';
import { getProduct } from '@/queries/products/queries';
import type { Product } from '@/queries/products/types';

interface UseProductOptions {
  initialData?: Product;
  enabled?: boolean;
}

export function useProduct(slug: string, options: UseProductOptions = {}) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: () => getProduct(slug),
    initialData: options.initialData,
    enabled: options.enabled ?? !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

**File:** `src/hooks/products/useProductSearch.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { productKeys } from '@/queries/products/keys';
import { searchProducts } from '@/queries/products/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useProductSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}
```

---

## 6. Next.js App Router Integration

### Server Component Usage

```typescript
// app/(main)/products/[slug]/page.tsx
import { getProduct, getRelatedProducts } from '@/queries/products/queries';
import { ProductDetails } from '@/components/product/ProductDetails';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  // Direct call - runs on server, uses Next.js cache
  const product = await getProduct(slug);
  const related = await getRelatedProducts(product.id);

  return (
    <ProductDetails 
      product={product} 
      relatedProducts={related}
    />
  );
}

// Generate static params for popular products
export async function generateStaticParams() {
  const { products } = await getProducts({ limit: 100 });
  return products.map((p) => ({ slug: p.slug }));
}
```

### Client Component with SSR Hydration

```typescript
// components/product/ProductDetails.tsx
'use client';

import { useProduct } from '@/hooks/products/useProduct';
import type { Product } from '@/queries/products/types';

interface Props {
  product: Product; // SSR data
  relatedProducts: Product[];
}

export function ProductDetails({ product, relatedProducts }: Props) {
  // Hydrate with SSR data, enable background refetch
  const { data, isRefetching } = useProduct(product.slug, {
    initialData: product,
  });

  return (
    <div>
      {isRefetching && <RefetchIndicator />}
      <h1>{data?.name}</h1>
      {/* ... */}
    </div>
  );
}
```

### Server Actions for Mutations

```typescript
// app/actions/cart.ts
'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/api/client';
import { CACHE_TAGS } from '@/lib/cache/tags';

export async function addToCart(productId: string, quantity: number) {
  await api('/cart/items', {
    method: 'POST',
    body: { product_id: productId, quantity },
    auth: true,
  });

  revalidateTag(CACHE_TAGS.CART);
}
```

---

## 7. Complete Flow Example: Product Feature

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT FEATURE FLOW                              │
└──────────────────────────────────────────────────────────────────────────┘

1. USER VISITS /products/water-purifier-pro
   │
   ▼
2. SERVER COMPONENT (page.tsx)
   │
   │  const product = await getProduct('water-purifier-pro');
   │  // → api('/products/slug/water-purifier-pro', { revalidate: 3600 })
   │  // → Next.js checks cache, serves or fetches
   │
   ▼
3. RSC RENDERS HTML
   │
   │  <ProductDetails product={product} />  // Pass as prop
   │
   ▼
4. CLIENT HYDRATION
   │
   │  useProduct('water-purifier-pro', { initialData: product })
   │  // → No fetch on mount (has initialData)
   │  // → Background refetch after staleTime
   │
   ▼
5. USER ADDS TO CART (Client Mutation)
   │
   │  const addMutation = useAddToCart();
   │  addMutation.mutate({ productId, quantity });
   │  // → Optimistic update
   │  // → api('/cart/items', { method: 'POST', auth: true })
   │  // → Invalidate cart query on success
   │
   ▼
6. CACHE INVALIDATION
   │
   │  // On success: queryClient.invalidateQueries(['cart'])
   │  // For ISR: revalidateTag('cart') in Server Action
   │
   └───────────────────────────────────────────────────────────────────────
```

---

## 8. Cache Strategy

| Data Type | Strategy | Revalidate | Tags |
|-----------|----------|------------|------|
| Product Details | ISR | 3600s | `product:{slug}` |
| Product List | ISR | 60s | `products` |
| Cart | Client-only | - | React Query |
| User Profile | Client-only | - | React Query |
| Filters | ISR | 3600s | `filters` |
| Reviews | ISR | 1800s | `reviews:{productId}` |

---

## 9. Migration Path

### Phase 1: Create New Structure
```
src/api/client.ts         ← New unified client
src/queries/products/     ← Move logic here
```

### Phase 2: Migrate Feature by Feature
```
1. Products (lowest risk)
2. Filters & Collections
3. Cart (most complex)
4. Orders & Payments
```

### Phase 3: Deprecate Old Files
```
❌ src/services/           → Delete after migration
❌ src/lib/api-client.ts   → Delete after migration
❌ src/lib/data/           → Merge into queries/
```

---

## 10. Key Principles

1. **Query functions are framework-agnostic** — Can be used in RSC, hooks, or tests
2. **Hooks are thin wrappers** — Only add React Query config
3. **Cache tags are centralized** — Single source in `lib/cache/tags.ts`
4. **Types flow from queries** — Components import from queries, not separate type files
5. **Mutations live beside queries** — Same feature folder

---

*This architecture scales from 5 to 500 endpoints while maintaining clarity.*
