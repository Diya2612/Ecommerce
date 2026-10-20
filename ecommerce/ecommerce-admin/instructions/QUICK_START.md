# Quick Start Guide - New Architecture

## 🚀 Development Server

```bash
npm run dev
```

## 📁 Finding Your Way Around

### Need to edit a page?
```
features/[feature-name]/pages/
```

### Need to add API calls?
```
features/[feature-name]/services/[feature]Service.ts
```

### Need reusable components?
```
shared/components/ui/
```

### Need custom hooks?
```
shared/hooks/
```

## 🎯 Common Tasks

### Adding a New Page to Existing Feature

1. Create page file:
```tsx
// features/products/pages/ProductDetailPage.tsx
import React from "react";

const ProductDetailPage: React.FC = () => {
  return <div>Product Detail</div>;
};

export default ProductDetailPage;
```

2. Export from feature:
```tsx
// features/products/pages/index.ts
export { default as ProductDetailPage } from "./ProductDetailPage";
```

3. Add route in `App.tsx`:
```tsx
const ProductDetailPage = lazy(() => import("@/features/products/pages/ProductDetailPage"));

// Add route
<Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
```

### Creating a New Feature

```bash
# Create folders
src/features/new-feature/
├── pages/
├── components/
├── hooks/
├── services/
├── types/
└── validation/
```

### Using React Query for Data Fetching

```tsx
// 1. Create service
export const productService = {
  getProducts: async (params) => {
    const response = await makeGetRequestWithParams("products", params);
    return response.data;
  },
};

// 2. Create hook
export const useProducts = (params) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
  });
};

// 3. Use in component
const { data, isLoading, error } = useProducts({ page: 1, limit: 10 });
```

### Using Shared Hooks

```tsx
import { usePagination, useSearch, useDateRange } from "@/shared/hooks";

const MyPage = () => {
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
  const { search, setSearch } = useSearch();
  const { dateRange, setDateRange } = useDateRange();
  
  // Use in your component
};
```

### Importing Shared Components

```tsx
import {
  GenericTable,
  FiltersBar,
  MetricsGrid,
  DateRangePicker,
  ActionButtons
} from "@/shared/components";
```

## 🔍 Import Path Reference

| Old Path | New Path |
|----------|----------|
| `"../components/Button"` | `"@/shared/components"` |
| `"../utils/api"` | `"@/shared/services/baseApi"` |
| `"../utils/auth"` | `"@/features/auth/services/authService"` |
| `"./Layout"` | `"@/layouts/Layout"` |

## 📦 Project Structure

```
src/
├── features/          # Feature modules
│   └── products/
│       ├── pages/     # Product pages
│       ├── services/  # API calls
│       ├── hooks/     # React Query hooks
│       └── types/     # TypeScript types
├── shared/            # Reusable code
│   ├── components/    # UI components
│   ├── hooks/         # Custom hooks
│   ├── services/      # Base API
│   └── utils/         # Utilities
├── layouts/           # Layout components
└── config/            # Configuration
```

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Production build
npm run preview         # Preview production build

# Type checking
npx tsc --noEmit        # Check types without building
```

## 💡 Tips

1. **Use absolute imports**: `@/` instead of relative paths
2. **Keep features isolated**: Don't import from other features
3. **Use React Query**: For all data fetching
4. **Create custom hooks**: Extract reusable logic
5. **TypeScript types**: Define in feature's `types/` folder

## 📚 Key Files

- `App.tsx` - Routes and lazy loading
- `main.tsx` - App entry, React Query provider
- `FOLDER_STRUCTURE.md` - Detailed architecture guide
