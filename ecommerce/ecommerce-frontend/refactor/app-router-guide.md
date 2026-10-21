# Next.js App Router Data Fetching Guide

> **Applies to:** Next.js 14+, React 19, TanStack Query v5

---

## Table of Contents

1. [Server Components: Direct Query Functions](#1-server-components-direct-query-functions)
2. [Passing Data to Client Components](#2-passing-data-to-client-components)
3. [Hydrating TanStack Query Cache](#3-hydrating-tanstack-query-cache)
4. [When NOT to Use TanStack Query](#4-when-not-to-use-tanstack-query)

---

## 1. Server Components: Direct Query Functions

Server Components can **directly await** query functions. No React Query needed.

### Basic Usage

```tsx
// app/(main)/products/[slug]/page.tsx
import { getProductBySlug, getRelatedProducts } from '@/queries';
import { ProductDetails } from '@/components/product/ProductDetails';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // ✅ Direct call - runs on server, uses Next.js cache
  const product = await getProductBySlug(slug);
  const related = await getRelatedProducts(product.id);

  return <ProductDetails product={product} related={related} />;
}
```

### Parallel Data Fetching

```tsx
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // ✅ Parallel fetching with Promise.all
  const [product, reviews, bundles] = await Promise.all([
    getProductBySlug(slug),
    getProductReviews(slug),
    getProductBundles(slug),
  ]);

  return (
    <>
      <ProductHero product={product} bundles={bundles} />
      <ReviewsSection reviews={reviews} />
    </>
  );
}
```

### With Error Handling

```tsx
import { notFound } from 'next/navigation';
import { isApiError } from '@/api';

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    return <ProductDetails product={product} />;
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      notFound(); // Shows 404 page
    }
    throw error; // Let error boundary handle
  }
}
```

### With Suspense Boundaries

```tsx
import { Suspense } from 'react';

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return (
    <>
      <ProductHero product={product} />
      
      {/* Reviews load independently */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection productId={product.id} />
      </Suspense>

      {/* Related products load independently */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <RelatedProducts productId={product.id} />
      </Suspense>
    </>
  );
}

// Separate async component for streaming
async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);
  return <ReviewsList reviews={reviews.reviews} />;
}
```

---

## 2. Passing Data to Client Components

### Pattern A: Props Only (No Hooks Needed)

For data that doesn't need client-side refetching.

```tsx
// app/(main)/products/[slug]/page.tsx (Server)
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // ✅ Client component receives server data as props
  return <ProductGallery images={product.images || []} />;
}

// components/product/ProductGallery.tsx (Client)
'use client';

interface Props {
  images: string[];
}

export function ProductGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ No API calls, just uses passed data
  return (
    <div>
      <img src={images[activeIndex]} alt="Product" />
      <div className="thumbnails">
        {images.map((img, i) => (
          <button key={i} onClick={() => setActiveIndex(i)}>
            <img src={img} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Pattern B: Props + Local State

For interactive components that transform server data.

```tsx
// Server Component
export default async function CheckoutPage() {
  const addresses = await getAddresses();

  return <AddressSelector addresses={addresses} />;
}

// Client Component
'use client';

interface Props {
  addresses: UserAddress[];
}

export function AddressSelector({ addresses }: Props) {
  const [selectedId, setSelectedId] = useState(
    addresses.find((a) => a.isDefault)?.id
  );

  // ✅ Uses server data, manages selection locally
  return (
    <div>
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          address={addr}
          selected={addr.id === selectedId}
          onSelect={() => setSelectedId(addr.id)}
        />
      ))}
    </div>
  );
}
```

### Pattern C: Props + TanStack Mutations

For forms that need to mutate data.

```tsx
// Server Component
export default async function ProfilePage() {
  const profile = await getCurrentUser();

  return <ProfileForm initialData={profile} />;
}

// Client Component
'use client';

import { useUpdateProfile } from '@/hooks/users';

interface Props {
  initialData: UserProfile;
}

export function ProfileForm({ initialData }: Props) {
  const [formData, setFormData] = useState(initialData);
  const updateProfile = useUpdateProfile();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ✅ Uses mutation hook for updates
    updateProfile.mutate({
      name: formData.name,
      phone: formData.phone,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## 3. Hydrating TanStack Query Cache

Use this pattern when you need:
- Background refetching on stale data
- Real-time updates after initial load
- Consistent cache across navigations

### Setup: Query Provider with HydrationBoundary

```tsx
// app/providers.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Pattern: initialData for Hydration

```tsx
// app/(main)/products/[slug]/page.tsx (Server)
import { getProductBySlug } from '@/queries';

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // ✅ Pass server data as initialData
  return <ProductClient product={product} />;
}

// components/ProductClient.tsx (Client)
'use client';

import { useProduct } from '@/hooks/products';

interface Props {
  product: ProductDetail;
}

export function ProductClient({ product }: Props) {
  // ✅ Hydrate cache with server data
  const { data, isRefetching } = useProduct(product.slug, {
    initialData: product,
  });

  return (
    <div>
      {isRefetching && <span className="text-xs">Updating...</span>}
      <h1>{data.name}</h1>
      <p>{data.price}</p>
    </div>
  );
}
```

### Advanced: Prefetching Multiple Queries (HydrationBoundary)

```tsx
// app/(main)/products/[slug]/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { productKeys, getProductBySlug, getProductReviews } from '@/queries';

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const queryClient = new QueryClient();

  // Prefetch multiple queries
  await queryClient.prefetchQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: () => getProductBySlug(slug),
  });

  // Get product for related queries
  const product = queryClient.getQueryData<ProductDetail>(productKeys.bySlug(slug));

  if (product) {
    await queryClient.prefetchQuery({
      queryKey: productKeys.reviews(product.id),
      queryFn: () => getProductReviews(product.id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductPageClient slug={slug} />
    </HydrationBoundary>
  );
}

// Client component can now use hooks with prefetched data
'use client';

export function ProductPageClient({ slug }: { slug: string }) {
  // ✅ Data already in cache from server
  const { data: product } = useProduct(slug);
  const { data: reviews } = useProductReviews(product?.id || '', {
    enabled: !!product?.id,
  });

  return (
    <>
      <ProductDetails product={product} />
      <ReviewsList reviews={reviews?.reviews} />
    </>
  );
}
```

---

## 4. When NOT to Use TanStack Query

### ❌ DON'T: Static/Read-Only Server Data

```tsx
// ❌ BAD: Unnecessary complexity
export default async function AboutPage() {
  const company = await getCompanyInfo();
  return <AboutClient company={company} />; // Then uses useQuery...
}

// ✅ GOOD: Just use props
export default async function AboutPage() {
  const company = await getCompanyInfo();
  return <AboutContent company={company} />;
}
```

### ❌ DON'T: One-Time Form Submissions

```tsx
// ❌ BAD: Overkill for simple form
const mutation = useMutation({
  mutationFn: sendContactForm,
  onSuccess: () => router.push('/thank-you'),
});

// ✅ GOOD: Direct call with useTransition
const [isPending, startTransition] = useTransition();

const handleSubmit = () => {
  startTransition(async () => {
    await sendContactForm(data);
    router.push('/thank-you');
  });
};
```

### ❌ DON'T: Server-Only Data

```tsx
// ❌ BAD: Product list that never refetches
export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />; // Why hydrate?
}

// ✅ GOOD: Just pass as props
// Client component only handles UI interactions (filters, pagination clicks)
```

### ✅ DO Use TanStack Query For:

| Use Case | Why |
|----------|-----|
| **Cart** | Real-time sync, optimistic updates |
| **User Profile** | Mutations, cache invalidation |
| **Search** | Debouncing, caching results |
| **Notifications** | Polling, real-time updates |
| **Forms with feedback** | Loading states, error handling |
| **Infinite scroll** | Pagination, cache management |

### Decision Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FETCHING DECISION                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Is the data static or rarely changes?                      │
│  ├─ YES → Server Component + Props                          │
│  │                                                          │
│  └─ NO ↓                                                    │
│                                                             │
│  Does the client need to mutate/refetch?                    │
│  ├─ NO → Server Component + Props                           │
│  │                                                          │
│  └─ YES ↓                                                   │
│                                                             │
│  Is it a one-time action?                                   │
│  ├─ YES → useTransition + direct call                       │
│  │                                                          │
│  └─ NO → TanStack Query                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Server → Props** | Static data, no client updates | Product details, About page |
| **Server → Props + Local State** | Interactive UI, no mutations | Image gallery, Tabs |
| **Server → Props + Mutations** | Forms that update server | Profile form, Address manager |
| **Server → TanStack Hydration** | Real-time data, background sync | Cart, Notifications |

---

## File Reference

```
src/
├── queries/           # Pure async functions (works everywhere)
│   └── products/
│       └── queries.ts # getProductBySlug(), etc.
│
├── hooks/             # TanStack wrappers (client-only)
│   └── products/
│       └── index.ts   # useProduct(), etc.
│
└── app/
    └── products/[slug]/
        └── page.tsx   # Server Component → calls queries directly
```

---

*Remember: Start with Server Components. Add TanStack Query only when you need client-side reactivity.*
