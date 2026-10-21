# Data Layer Migration & Cleanup Guide

> **Status:** Migration In Progress  
> **Created:** January 2026  
> **Goal:** Prevent architectural drift and maintain single source of truth

---

## 1. Files to Deprecate/Delete

After migrating all consumers to the new architecture, delete these:

### 🔴 High Priority (Direct Duplicates)

| File | Replaced By | Action |
|------|-------------|--------|
| `src/lib/api-client.ts` | `src/api/client.ts` | **DELETE** after migration |
| `src/lib/server-api-client.ts` | `src/api/client.ts` | **DELETE** after migration |
| `src/services/auth/auth.service.ts` | `src/queries/auth/queries.ts` | **DELETE** |
| `src/services/cart/cart.service.ts` | `src/queries/cart/queries.ts` | **DELETE** |
| `src/services/discount/discount.service.ts` | `src/queries/cart/queries.ts` | **DELETE** |
| `src/services/order/order.service.ts` | `src/queries/orders/queries.ts` | **DELETE** |
| `src/services/product/product.service.ts` | `src/queries/products/queries.ts` | **DELETE** |
| `src/services/user/user.service.ts` | `src/queries/users/queries.ts` | **DELETE** |

### 🟡 Medium Priority (Data Layer Consolidation)

These files use direct `fetch` and should migrate to use `@/api`:

```
src/lib/data/product/getRelatedProducts.ts    → Use getRelatedProducts() from @/queries
src/lib/data/product/getProductReviews.ts     → Use getProductReviews() from @/queries
src/lib/data/product/getProductBundles.ts     → Use getProductBundles() from @/queries
src/lib/data/product/getCategoryProducts.ts   → Use getProductsByCategory() from @/queries
src/lib/data/product/getBrandProducts.ts      → Use getProductsByBrand() from @/queries
src/lib/data/collection/getFilterOptions.ts   → Use getFilterOptions() from @/queries
```

### 🟢 Low Priority (After Full Migration)

```
src/services/                    → DELETE entire folder
src/lib/services/               → DELETE if exists
Old hooks in src/hooks/useCart.ts that duplicate src/hooks/cart/
```

---

## 2. ESLint Rules to Prevent Architectural Drift

Add to `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Prevent direct fetch calls outside api/ folder
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='fetch']",
        message: 'Use api() from @/api instead of direct fetch. Exception: src/api/*',
      },
    ],

    // Prevent importing from deprecated paths
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/lib/api-client',
            message: 'Use @/api instead. The old api-client is deprecated.',
          },
          {
            name: '@/lib/server-api-client',
            message: 'Use @/api instead. The server-api-client is deprecated.',
          },
          {
            name: '@/services/auth/auth.service',
            message: 'Use @/queries/auth instead.',
          },
          {
            name: '@/services/cart/cart.service',
            message: 'Use @/queries/cart instead.',
          },
          {
            name: '@/services/discount/discount.service',
            message: 'Use @/queries/cart instead.',
          },
          {
            name: '@/services/order/order.service',
            message: 'Use @/queries/orders instead.',
          },
          {
            name: '@/services/product/product.service',
            message: 'Use @/queries/products instead.',
          },
          {
            name: '@/services/user/user.service',
            message: 'Use @/queries/users instead.',
          },
        ],
        patterns: [
          {
            group: ['@/services/*'],
            message: 'Import from @/queries instead. Services are deprecated.',
          },
        ],
      },
    ],
  },

  overrides: [
    {
      // Allow fetch in api client
      files: ['src/api/**/*.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Allow fetch in auth routes (callbacks, etc.)
      files: ['src/app/auth/**/*.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
```

---

## 3. Folder Boundaries

### Architecture Diagram

```
src/
├── api/                    # Core fetch wrapper (framework-agnostic)
│   ├── client.ts           # ONLY file that calls fetch()
│   ├── errors.ts           # Error classes
│   └── types.ts            # API types
│
├── queries/                # Data fetching functions (single source of truth)
│   ├── products/           # One folder per domain
│   │   ├── keys.ts         # Query key factory
│   │   ├── types.ts        # Domain types
│   │   ├── queries.ts      # Read operations
│   │   └── index.ts        # Barrel export
│   ├── cart/
│   ├── orders/
│   ├── users/
│   └── auth/
│
├── hooks/                  # TanStack Query wrappers (client-only)
│   ├── products/           # Mirrors queries/ structure
│   ├── cart/
│   ├── orders/
│   └── users/
│
├── components/             # UI components
│   └── [feature]/
│       ├── server/         # Server Components (use queries directly)
│       └── client/         # Client Components (use hooks)
│
├── app/                    # Next.js routes
│   └── [route]/
│       └── page.tsx        # Server Component (uses queries)
│
└── lib/                    # Utilities (NO API calls here)
    ├── cache/              # Cache tags
    ├── supabase/           # Auth only
    └── utils/              # Pure utilities
```

### Import Rules

| From | Can Import | Cannot Import |
|------|------------|---------------|
| `api/` | Nothing from src | - |
| `queries/` | `api/`, `lib/cache` | `hooks/`, `components/` |
| `hooks/` | `queries/` | `api/` directly |
| `components/server/` | `queries/` | `hooks/` |
| `components/client/` | `hooks/` | `queries/` directly* |
| `app/page.tsx` | `queries/`, `components/` | - |

*Exception: Can import query keys for cache invalidation

---

## 4. Developer Documentation

### Quick Reference: Where to Put Code

| I want to... | Put it in... |
|--------------|--------------|
| Add a new API endpoint | `src/queries/[feature]/queries.ts` |
| Add a new React hook | `src/hooks/[feature]/index.ts` |
| Add a shared type | `src/queries/[feature]/types.ts` |
| Add a cache tag | `src/lib/cache/tags.ts` |
| Fetch in Server Component | Call query function directly |
| Fetch in Client Component | Use hook from `@/hooks` |

### Adding a New Feature (Checklist)

1. [ ] Create query key factory: `src/queries/[feature]/keys.ts`
2. [ ] Define types: `src/queries/[feature]/types.ts`
3. [ ] Write query functions: `src/queries/[feature]/queries.ts`
4. [ ] Export from index: `src/queries/[feature]/index.ts`
5. [ ] Add to master index: `src/queries/index.ts`
6. [ ] Create hooks if needed: `src/hooks/[feature]/index.ts`
7. [ ] Add cache tags if needed: `src/lib/cache/tags.ts`

### Common Mistakes

```tsx
// ❌ WRONG: Direct fetch in component
const data = await fetch('/api/products');

// ✅ CORRECT: Use query function
import { getProducts } from '@/queries';
const data = await getProducts();
```

```tsx
// ❌ WRONG: Using old service
import { ProductService } from '@/services/product/product.service';

// ✅ CORRECT: Use new queries
import { getProductBySlug } from '@/queries';
```

```tsx
// ❌ WRONG: useQuery with direct fetch
useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('/products').then(r => r.json()),
});

// ✅ CORRECT: Use query function
useQuery({
  queryKey: productKeys.lists(),
  queryFn: getProducts,
});
```

### Migration Steps for Existing Code

1. **Find usages**: Search for imports from `@/services/` or `@/lib/api-client`
2. **Replace imports**: Change to `@/queries/[feature]`
3. **Update calls**: Function signatures should be compatible
4. **For hooks**: Use the new hooks from `@/hooks/[feature]`
5. **Test**: Ensure data flows correctly

---

## 5. Enforcement Checklist

- [ ] Add ESLint rules from section 2
- [ ] Run `npm run lint` and fix violations
- [ ] Add pre-commit hook to prevent new violations
- [ ] Document in team wiki/README
- [ ] Add architecture diagram to CONTRIBUTING.md
- [ ] Delete deprecated files after migration complete

---

## 6. CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/lint.yml
- name: Check for deprecated imports
  run: |
    if grep -r "@/services/" src/app src/components --include="*.ts" --include="*.tsx"; then
      echo "Found deprecated @/services imports!"
      exit 1
    fi
    
    if grep -r "@/lib/api-client" src --include="*.ts" --include="*.tsx"; then
      echo "Found deprecated @/lib/api-client imports!"
      exit 1
    fi
```

---

*Last updated: January 13, 2026*
