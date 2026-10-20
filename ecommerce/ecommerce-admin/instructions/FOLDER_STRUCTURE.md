# Anant Enterprises Admin Panel - Folder Structure

## Overview
This project follows a **feature-based architecture** with clear separation of concerns for scalability, maintainability, and AI-tool friendliness.

## Directory Structure

```
src/
├── features/              # Feature modules (domain-driven)
│   ├── products/         # Product management feature
│   │   ├── pages/        # ProductListPage, ProductDetailPage, etc.
│   │   ├── components/   # Product-specific components
│   │   ├── hooks/        # useProducts, useProductFilters, etc.
│   │   ├── services/     # productService.ts - API calls
│   │   ├── types/        # product.types.ts - TypeScript interfaces
│   │   └── validation/   # Product validation schemas
│   ├── orders/           # Order management feature
│   ├── customers/        # Customer management feature
│   ├── auth/             # Authentication feature
│   ├── blogs/            # Blog management feature
│   └── dashboard/        # Dashboard feature
│
├── components/           # Reusable UI components
│   ├── ui/              # Generic UI components (tables, filters, buttons, etc.)
│   └── forms/           # Form components (FormikForm, etc.)
│
├── hooks/               # Reusable custom hooks
│   ├── usePagination.ts
│   ├── useSearch.ts
│   ├── useFilters.ts
│   ├── useDateRange.ts
│   └── use-mobile.ts
│
├── lib/                 # Core infrastructure & configuration
│   ├── api/            # API client and base methods
│   │   ├── httpClient.ts    # Axios instance configuration
│   │   ├── baseApi.ts       # Generic API methods (GET, POST, PUT, DELETE)
│   │   └── index.ts         # Barrel export
│   ├── constants/      # Application constants
│   │   ├── apiRoutes.ts     # Centralized API endpoint definitions
│   │   └── index.ts
│   ├── validation/     # Validation schemas and helpers
│   │   ├── createSchema.ts  # Schema helper function
│   │   ├── schemas.ts       # Global validation schemas
│   │   └── index.ts
│   └── utils.ts        # Core utility: cn (className merger)
│
├── utils/               # Utility functions
│   ├── toast.ts        # Toast notification helpers
│   ├── cn.ts           # className utility (tw-merge + clsx)
│   ├── fileUtils.ts    # File conversion utilities
│   └── menuConfig.ts   # Menu configuration (consider moving to config/)
│
├── layouts/             # Layout components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Top header
│   └── ProtectedRoute.tsx
│
├── config/             # App configuration
│   ├── queryClient.ts  # React Query configuration
│   └── menuConfig.ts   # Navigation menu config
│
├── assets/             # Static assets (images, fonts, etc.)
├── App.tsx             # Root component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Key Principles

### 1. Feature-Based Organization
- Each feature is self-contained with its own pages, components, hooks, services, and types
- Features can be developed, tested, and maintained independently
- Easy to locate all code related to a specific feature

### 2. Flat Page Structure
- Pages within each feature are in a flat structure (not nested folders)
- Example: `ProductListPage.tsx`, `ProductDetailPage.tsx`, `ProductAddPage.tsx`
- Simpler navigation and imports

### 3. Reusable Components
- Components used by 2+ features go in `components/`
- Feature-specific components stay within the feature folder
- Clear separation between generic and domain-specific UI
- All components exported through barrel files for clean imports

### 4. Custom Hooks
- Reusable state logic extracted into custom hooks
- `hooks/` for cross-feature hooks
- `features/[feature]/hooks/` for feature-specific hooks

### 5. Service Layer & API Constants
- All API calls encapsulated in service files
- `lib/api/` contains HTTP client and generic methods
- `lib/constants/apiRoutes.ts` stores all API endpoint definitions
- `features/[feature]/services/` for feature-specific API calls
- Use API_ROUTES constants instead of hardcoding endpoints
- Easier to test, mock, and modify

### 6. React Query Integration
- Centralized data fetching and caching
- Configured in `config/queryClient.ts`
- Used in feature hooks for API state management

### 7. Path Aliases
- `@/` alias points to `src/` directory
- Clean imports:
  - `import { Button } from "@/components"`
  - `import { makeGetRequest } from "@/lib/api"`
  - `import { API_ROUTES } from "@/lib/constants"`
  - `import { usePagination } from "@/hooks"`
  - `import { notifySuccess } from "@/utils"`
- Configured in `tsconfig.app.json` and `vite.config.ts`

### 8. Code Splitting
- Lazy loading for route-level components
- Reduces initial bundle size
- Improves performance


## Adding New Features

1. Create feature folder: `src/features/[feature-name]/`
2. Add subdirectories: `pages/`, `components/`, `hooks/`, `services/`, `types/`, `validation/`
3. Create pages with flat structure
4. Add feature-specific components
5. Create service file for API calls
6. Define TypeScript types
7. Create custom hooks if needed
8. Add routes in `App.tsx` with lazy loading
9. Export from feature `index.ts` for clean imports

## Best Practices

- **Single Responsibility**: Each file should have one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into shared hooks/utilities
- **Type Safety**: Use TypeScript interfaces for all data structures
- **Consistent Naming**: Use descriptive, consistent names (e.g., `ProductListPage`, `useProducts`)
- **Small Components**: Keep components focused and composable
- **Service Layer**: Never call APIs directly from components, use services
- **Error Handling**: Handle errors gracefully with try-catch and user feedback

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Build for Production**: `npm run build`
3. **Preview Production Build**: `npm run preview`

## Technology Stack

- **React 18** with TypeScript
- **React Router** for routing
- **React Query** (@tanstack/react-query) for data fetching
- **Axios** for HTTP requests
- **Formik** for form management
- **Yup** for validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** as build tool
