# Home Page Data Layer

## Overview
This directory contains server-side data fetching functions for the home page components. All functions use React's `cache()` for request deduplication and Next.js caching strategies for optimal performance.

## Data Fetchers

### `getHeroSlides()`
**File:** `getHeroSlides.ts`  
**Returns:** `Promise<HeroSlide[]>`  
**Cache:** Daily revalidation (24 hours)  
**Purpose:** Fetches carousel slides for hero section

### `getFeaturedProducts()`
**File:** `getFeaturedProducts.ts`  
**Returns:** `Promise<Product[]>`  
**Cache:** Hourly revalidation (1 hour)  
**Purpose:** Fetches featured products for home page

### `getBrands()`
**File:** `getBrands.ts`  
**Returns:** `Promise<Brand[]>`  
**Cache:** Daily revalidation (24 hours)  
**Purpose:** Fetches brand logos to display

### `getTestimonials()`
**File:** `getTestimonials.ts`  
**Returns:** `Promise<Testimonial[]>`  
**Cache:** Hourly revalidation (1 hour)  
**Purpose:** Fetches customer testimonials

## Usage

### In Server Components

```tsx
import { getFeaturedProducts } from '@/lib/data/home';

export async function FeaturedProductsSection() {
  const products = await getFeaturedProducts();
  
  return (
    <section>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
```

### Parallel Data Fetching

```tsx
const [hero, products, brands] = await Promise.all([
  getHeroSlides(),
  getFeaturedProducts(),
  getBrands(),
]);
```

## Current Implementation

All data fetchers currently return **static fallback data**. This is intentional for Phase 1.

### Migration Path

1. **Phase 1 (Current)**: Static data, establish patterns ✅
2. **Phase 2**: Connect to API endpoints when backend is ready
3. **Phase 3**: Add on-demand revalidation

## Backend Integration (Future)

When backend is ready, uncomment API calls:

```typescript
const response = await fetch(
  `${process.env.API_BASE_URL}/products/featured`,
  {
    next: {
      ...HOME_PAGE_CACHE.featuredProducts,
      tags: [CACHE_TAGS.FEATURED_PRODUCTS],
    },
  }
);
```

## Testing

Test all data fetchers at once:
```
http://localhost:3000/api/test-home-data
```

## Cache Configuration

See `@/lib/cache/strategies.ts` for cache strategies.

## Types

All return types are defined in `@/types/home.ts`.
