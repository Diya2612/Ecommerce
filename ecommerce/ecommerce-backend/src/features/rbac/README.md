# Role-Based Access Control (RBAC) Feature

## Overview

The RBAC feature handles global authorization across the Backend API. Operating downstream of the primary authentication layer (Supabase Auth), it provides a robust, granular, and heavily-cached permissions system that maps users to `roles`, and `roles` to specific `permissions`. It determines exactly what authenticated users are allowed to interact with.

## Structure

```
rbac/
├── index.ts
├── apis/
│   ├── bulk-permissions.ts
│   ├── create-permission.ts
│   ├── create-role.ts
│   ├── delete-role.ts
│   ├── get-permissions.ts
│   ├── get-roles.ts
│   ├── role-permissions.ts
│   ├── update-role.ts
│   └── user-roles.ts
├── services/
│   ├── rbac-cache.service.ts
│   └── rbac.service.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── permissions.schema.ts
    ├── queries.ts
    ├── role-permissions.schema.ts
    ├── roles.schema.ts
    ├── user-roles.schema.ts
    └── validation.ts
```

## API Routes

All routes are mounted under `/api/admin/rbac`. This entire module is strictly reserved for Superadmins configuring the organizational access tree.

### Endpoints (Admin Only)

**Roles Management**
- `POST /roles` - Create a new grouping (e.g., `inventory_manager`)
- `GET /roles` - List all system roles
- `PUT /roles/:id` - Rename or update role metadata
- `DELETE /roles/:id` - Destroy a role (fails if `is_system_role` is true)

**Permissions Management**
- `POST /permissions` - Create a new atomic rule (e.g., `products:delete`)
- `GET /permissions` - List all available system rules
- `POST /permissions/bulk` - Rapidly seed multiple atomic rules identically

**Mappings**
- `GET /roles/:id/permissions` - View rules attached to a role
- `POST /roles/:id/permissions` - Attach/detach rules from a role
- `GET /users/:userId/roles` - View roles attached to a physical User
- `POST /users/:userId/roles` - Assign/revoke overarching roles to a User

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| View Roles & Permissions          | `GET /admin/rbac/*`     | `rbac:read` permission              |
| Create Roles, Map Users           | `POST /admin/rbac/*`    | `rbac:manage` permission            |
| Update/Destroy Roles              | `PUT/DELETE`            | `rbac:manage` permission            |

---

## Endpoints Data Formats

### 1. Create Role & Permission Mapping

**Endpoint:** `POST /api/admin/rbac/roles`

Generates the overarching container and immediately binds atomic rules to it.

#### Request Body

```json
{
  "name": "Warehouse Staff",
  "description": "Can only manage inventory and view orders",
  "permissions": [
    "uuid-permission-inventory-manage",
    "uuid-permission-orders-read"
  ]
}
```

### 2. Map User to Roles

**Endpoint:** `POST /api/admin/rbac/users/:userId/roles`

Grants the physical user access to the platform by mapping them to containers.

#### Request Body

```json
{
  "role_ids": [
    "uuid-role-warehouse-staff",
    "uuid-role-blog-editor"
  ]
}
```

---

## Architecture & Implementation

### 1. Database Schema
The foundation splits across 4 distinct interconnected tables:
- **Roles (`roles.schema.ts`)**: Defines groupings (`admin`, `user`). Core roles are flagged `is_system_role` to prevent accidental deletion.
- **Permissions (`permissions.schema.ts`)**: Atomic access scopes formatted as `resource:action` (e.g., `users:read`, `products:delete`).
- **User Mappings (`user-roles.schema.ts`)**: Joins UUIDs to Roles.
- **Role Mappings (`role-permissions.schema.ts`)**: Joins Roles to Permissions.

### 2. Redis Caching (`rbac-cache.service.ts`)
Because permission checks happen on almost every authenticated POST/PUT request, hitting PostgreSQL for every single endpoint is a massive operational bottleneck. 

1. **Active Hit**: The Cache Service loads a user's *flattened array of permissions* natively into Redis.
2. **Invalidation**: Whenever an Admin changes a role mapping or a permission through the API, the corresponding user cache is torn down (`invalidateUser`), guaranteeing fresh data on their very next network request.

### 3. Middleware Enforcers
The core enforcer is the `requirePermission` guard within `src/middlewares/permission.middleware.ts`. 

```typescript
// Endpoints can stack permissions to require a specific scope
router.get('/products', 
  requireAuth, 
  requirePermission('products:read'), 
  handler
);

// Endpoints can require an array of multiple permissions
router.post('/products', 
  requireAuth, 
  requirePermission(['products:create', 'categories:manage']), 
  handler
);
```
*(Note: `requirePermission` physically relies on `req.userId` existing. It must ALWAYS be chained after `requireAuth`).*

### 4. Specialized Guards
- **Superadmin Logic**: The caching engine understands a global wildcard `*` string. If a user possesses `*` (automatically seeded for developers), the service instantly validates all subsequent permission checks locally.
- **Owner-or-Admin Guard**: The unique `requireOwnerOrPermission` middleware intelligently lets users manipulate their *own* records (like fetching their own Orders), but falls back to requiring `orders:manage` if the User ID trying to fetch the order does not match the database owner UUID.
