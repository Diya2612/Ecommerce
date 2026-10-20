# Configuration Structure

## Overview
All configuration has been consolidated into `src/lib/config/` to eliminate redundancy and improve maintainability.

## Configuration Files

### Environment Configuration
**File**: `lib/config/env.ts`
- Manages environment variables with type safety
- Provides validation and fallback values
- Used by HTTP client and services

```typescript
import { ENV } from "@/lib/config";
// Access: ENV.API_BASE_URL
```

### React Query Configuration
**File**: `lib/config/queryClient.ts`
- Configures React Query client
- Sets default options for queries and mutations
- Imported in `main.tsx`

```typescript
import { queryClient } from "@/lib/config";
```

### Navigation Configuration
**Files**: `lib/config/navigation.ts`, `lib/config/navigation.types.ts`
- Defines navigation menu structure
- References route constants from `lib/constants/routes.ts`
- Separates navigation metadata from route definitions

```typescript
import { NAV_ITEMS } from "@/lib/config";
import type { NavItem, NavSubItem } from "@/lib/config";
```

## Design Principles

### 1. Single Source of Truth
- Routes are defined once in `lib/constants/routes.ts`
- Navigation items reference these route constants
- No duplication of path strings

### 2. Separation of Concerns
- **Constants** (`lib/constants/`): Route paths and API endpoints
- **Configuration** (`lib/config/`): App settings and setup
- Navigation metadata (icons, labels, permissions) separate from routes

### 3. Type Safety
- All navigation types exported from `lib/config/navigation.types.ts`
- Environment variables validated with TypeScript
- Strong typing prevents runtime errors

## Usage Examples

### Accessing Environment Variables
```typescript
import { ENV } from "@/lib/config";

const apiUrl = ENV.API_BASE_URL;
const isDev = ENV.IS_DEVELOPMENT;
```

### Using Navigation Items
```typescript
import { NAV_ITEMS } from "@/lib/config";
import type { NavItem } from "@/lib/config";

// Render navigation
NAV_ITEMS.map(item => (
  <NavLink to={item.path}>{item.label}</NavLink>
))
```

### Query Client
```typescript
import { queryClient } from "@/lib/config";

// Already configured in main.tsx
// Just use React Query hooks in components
```

## Benefits

1. **No Redundancy**: Single configuration location
2. **Better Imports**: `@/lib/config` instead of multiple paths
3. **Scalability**: Easy to add new config files
4. **Maintainability**: Changes in one place
5. **Type Safety**: Strong TypeScript support
