# Admin Panel Template - Best Practices & Guidelines

## 🎯 Overview

This admin panel template is designed to be:
- **Scalable**: Feature-based architecture grows with your application
- **Maintainable**: Clear separation of concerns and consistent patterns
- **AI-Friendly**: Predictable structure that AI tools can easily understand
- **Developer-Friendly**: Intuitive organization and comprehensive documentation

## 📁 Folder Structure Philosophy

### 1. **`features/`** - Domain-Driven Features
Each feature is self-contained with all its related code:
```
features/
└── products/
    ├── pages/          # UI pages for this feature
    ├── components/     # Feature-specific components
    ├── hooks/          # Feature-specific React hooks
    ├── services/       # API calls for this feature
    ├── types/          # TypeScript types/interfaces
    ├── validation/     # Feature-specific validation schemas
    ├── data/           # Mock data or constants
    └── utils/          # Feature-specific utilities
```

**When to use:**
- Creating a new business domain (e.g., products, orders, customers)
- Code that's specific to one feature
- Pages that belong to a feature

### 2. **`lib/`** - Core Infrastructure
Contains foundational code that powers the application:

```
lib/
├── api/               # HTTP client & API methods
│   ├── httpClient.ts  # Axios configuration
│   ├── baseApi.ts     # CRUD operations
│   └── index.ts       
├── constants/         # Application-wide constants
│   └── apiRoutes.ts   # API endpoint definitions
├── validation/        # Global validation utilities
│   ├── createSchema.ts
│   └── schemas.ts     # Common schemas
└── utils.ts           # Core utility (cn function)
```

**When to use:**
- HTTP client configuration
- API endpoint constants
- Global validation schemas
- Core utilities needed everywhere

### 3. **`components/`** - Reusable UI Components
Shared components used across multiple features:

```
components/
├── ui/               # Generic UI components
│   ├── GenericTable.tsx
│   ├── FiltersBar.tsx
│   ├── DateRangePicker.tsx
│   └── ...
└── forms/            # Form components
    └── FormikForm.tsx
```

**When to use:**
- Component used by 2+ features
- Generic UI patterns (tables, filters, modals)
- Form components

**When NOT to use:**
- Feature-specific components → Put in `features/[feature]/components/`

### 4. **`hooks/`** - Reusable React Hooks
Custom hooks that manage reusable state logic:

```
hooks/
├── usePagination.ts
├── useSearch.ts
├── useFilters.ts
├── useDateRange.ts
└── use-mobile.ts
```

**When to use:**
- Reusable state management logic
- Hooks used by multiple features

**When NOT to use:**
- Feature-specific hooks → Put in `features/[feature]/hooks/`

### 5. **`utils/`** - Utility Functions
Helper functions and utilities:

```
utils/
├── toast.ts          # Notification helpers
├── cn.ts             # className utility
├── fileUtils.ts      # File operations
└── index.ts
```

**When to use:**
- Pure helper functions
- Formatting utilities
- Conversion functions

### 6. **`config/`** - Configuration Files
Application configuration:

```
config/
├── queryClient.ts    # React Query setup
└── menuConfig.ts     # Navigation configuration
```

### 7. **`layouts/`** - Layout Components
Page layout wrappers:

```
layouts/
├── Layout.tsx
├── Sidebar.tsx
├── Header.tsx
└── ProtectedRoute.tsx
```

## 🔧 Best Practices

### Naming Conventions

#### Files & Folders
- **Components**: PascalCase (e.g., `ProductCard.tsx`, `GenericTable.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useProducts.ts`, `usePagination.ts`)
- **Utils**: camelCase (e.g., `formatCurrency.ts`, `validateEmail.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `product.types.ts`)
- **Services**: camelCase with 'Service' suffix (e.g., `productService.ts`)
- **Constants**: camelCase or UPPER_SNAKE_CASE (e.g., `apiRoutes.ts`, `API_ROUTES`)
- **Folders**: kebab-case or camelCase (e.g., `form-sections/` or `formSections/`)

#### Variables & Functions
```typescript
// Constants
export const API_BASE_URL = 'https://api.example.com';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Functions
export function formatCurrency(amount: number): string { }
export const calculateTotal = (items: Item[]) => { }

// React Components
export function ProductCard({ product }: Props) { }
export const GenericTable = <T,>({ columns, data }: Props<T>) => { }

// Hooks
export const usePagination = (options) => { }

// Types
export interface Product { }
export type OrderStatus = 'pending' | 'completed';
```

### Import Organization

Organize imports in this order:
```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// 2. UI library components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Internal components (shared)
import { GenericTable } from '@/components';
import { usePagination } from '@/hooks';

// 4. Feature-specific imports
import { productService } from '../services/productService';
import type { Product } from '../types/product.types';
import { useProducts } from '../hooks/useProducts';

// 5. Utils and constants
import { notifySuccess } from '@/utils';
import { API_ROUTES } from '@/lib/constants';

// 6. Types
import type { ColumnConfig } from '@/components/ui/GenericTable';
```

### API Usage Pattern

Always use centralized API constants:

```typescript
// ❌ BAD: Hardcoded endpoints
const response = await makeGetRequest('products');
const product = await makeGetRequest(`products/${id}`);

// ✅ GOOD: Using constants
import { API_ROUTES } from '@/lib/constants';

const response = await makeGetRequest(API_ROUTES.PRODUCTS.BASE);
const product = await makeGetRequest(API_ROUTES.PRODUCTS.BY_ID(id));
```

### Service Layer Pattern

Keep services clean and focused:

```typescript
// productService.ts
import { makeGetRequest, makePostRequest } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { Product, ProductsResponse } from '../types/product.types';

export const productService = {
  getProducts: async (params) => {
    const response = await makeGetRequestWithParams<ProductsResponse>(
      API_ROUTES.PRODUCTS.BASE,
      params
    );
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await makeGetRequest<Product>(
      API_ROUTES.PRODUCTS.BY_ID(id)
    );
    return response.data;
  },

  createProduct: async (data: ProductFormData) => {
    const response = await makePostRequest<Product>(
      API_ROUTES.PRODUCTS.BASE,
      data
    );
    return response.data;
  },
};
```

### Component Patterns

#### Page Components
```typescript
// ProductListPage.tsx
import React from 'react';
import { GenericTable, FiltersBar } from '@/components';
import { usePagination, useSearch } from '@/hooks';
import { useProducts } from '../hooks/useProducts';

export default function ProductListPage() {
  const { page, rowsPerPage, setPage } = usePagination();
  const { search, setSearch } = useSearch();
  const { data, isLoading } = useProducts({ page, search });

  return (
    <div>
      <FiltersBar onSearch={setSearch} />
      <GenericTable 
        data={data?.products} 
        loading={isLoading}
        pagination={{ page, rowsPerPage, onPageChange: setPage }}
      />
    </div>
  );
}
```

#### Custom Hooks
```typescript
// useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { notifyError } from '@/utils';

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    onError: (error) => {
      notifyError('Failed to fetch products');
      console.error(error);
    },
  });
};
```

### Type Safety

Always define types for your data:

```typescript
// product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
```

## 🤖 AI-Friendly Principles

### 1. **Predictable Structure**
- Follow consistent naming patterns
- Use standard folder organization
- AI can easily find related files

### 2. **Clear Separation**
- Each file has one responsibility
- AI can understand context quickly
- Easy to generate or modify specific parts

### 3. **Comprehensive Types**
- TypeScript interfaces everywhere
- AI can infer data structures
- Type-safe code generation

### 4. **Documented Patterns**
- Standard patterns documented
- AI can follow established conventions
- Consistent code generation

### 5. **Barrel Exports**
```typescript
// components/index.ts
export * from './ui';
export * from './forms';

// hooks/index.ts
export { usePagination } from './usePagination';
export { useSearch } from './useSearch';
```
- AI can suggest correct import paths
- Simplified imports for developers

## 📝 Adding New Features

### Step-by-Step Guide

1. **Create feature folder structure**
```bash
mkdir -p src/features/new-feature/{pages,components,hooks,services,types,validation}
```

2. **Define types first**
```typescript
// src/features/new-feature/types/newFeature.types.ts
export interface NewFeature {
  id: string;
  name: string;
  // ... other fields
}
```

3. **Add API endpoints to constants**
```typescript
// src/lib/constants/apiRoutes.ts
export const API_ROUTES = {
  // ... existing routes
  NEW_FEATURE: {
    BASE: 'new-feature',
    BY_ID: (id: string) => `new-feature/${id}`,
  },
};
```

4. **Create service**
```typescript
// src/features/new-feature/services/newFeatureService.ts
import { makeGetRequest } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

export const newFeatureService = {
  getAll: async () => {
    const response = await makeGetRequest(API_ROUTES.NEW_FEATURE.BASE);
    return response.data;
  },
};
```

5. **Create custom hook (optional)**
```typescript
// src/features/new-feature/hooks/useNewFeature.ts
import { useQuery } from '@tanstack/react-query';
import { newFeatureService } from '../services/newFeatureService';

export const useNewFeature = () => {
  return useQuery({
    queryKey: ['newFeature'],
    queryFn: newFeatureService.getAll,
  });
};
```

6. **Create page component**
```typescript
// src/features/new-feature/pages/NewFeatureListPage.tsx
import { useNewFeature } from '../hooks/useNewFeature';

export default function NewFeatureListPage() {
  const { data, isLoading } = useNewFeature();
  
  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

7. **Add route**
```typescript
// src/App.tsx
const NewFeatureListPage = lazy(() => import('@/features/new-feature/pages/NewFeatureListPage'));

// ... in routes
<Route path="/new-feature" element={<NewFeatureListPage />} />
```

8. **Export from feature (optional)**
```typescript
// src/features/new-feature/index.ts
export { default as NewFeatureListPage } from './pages/NewFeatureListPage';
export { useNewFeature } from './hooks/useNewFeature';
export type { NewFeature } from './types/newFeature.types';
```

## 🚀 Common Patterns

### Data Fetching with React Query
```typescript
// In a hook
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', params],
  queryFn: () => service.getResource(params),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const mutation = useMutation({
  mutationFn: service.createResource,
  onSuccess: (data) => {
    notifySuccess('Created successfully');
    queryClient.invalidateQueries(['resource']);
  },
  onError: (error) => {
    notifyError('Failed to create');
  },
});
```

### Form Handling with Formik
```typescript
import { Formik, Form, Field } from 'formik';
import { productSchema } from '../validation/productSchema';

<Formik
  initialValues={initialValues}
  validationSchema={productSchema}
  onSubmit={handleSubmit}
>
  {({ errors, touched }) => (
    <Form>
      <Field name="name" />
      {errors.name && touched.name && <span>{errors.name}</span>}
    </Form>
  )}
</Formik>
```

### Toast Notifications
```typescript
import { notifySuccess, notifyError, notifyInfo } from '@/utils';

// Success
notifySuccess('Product created successfully');

// Error
notifyError('Failed to delete product');

// Info
notifyInfo('Processing your request');
```

## 📚 Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing
- **React Query** - Data fetching & caching
- **Axios** - HTTP client
- **Formik** - Form management
- **Yup** - Validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Vite** - Build tool

## 🎓 Learning Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Formik Guide](https://formik.org/docs/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Remember**: Consistency is key. Follow these patterns, and your codebase will be maintainable, scalable, and AI-friendly! 🚀
