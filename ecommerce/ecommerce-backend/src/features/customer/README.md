# Customer Feature

## Overview

The Customer feature acts as a B2C extension of the core User platform. It pairs the base identity from the `users` table with specialized B2C fields residing in the `customer_profiles` table to track marketing preferences, behavior segments, loyalty points, store credit, and risk factors independently from core user logic.

## Structure

```
customer/
├── index.ts                      # Route exports & class registration
├── apis/                         # HTTP endpoints
│   ├── get-all-customers.ts      # Admin: Paginated customer list + search
│   ├── get-customer-by-id.ts     # Admin: Get rich customer profile + addresses
│   ├── create-customer.ts        # Admin: Create identity + profile combined
│   ├── update-customer.ts        # Admin: Apply partial updates
│   ├── delete-customer.ts        # Admin: Soft delete identity + profile
│   ├── bulk-delete-customers.ts  # Admin: Pass array to delete multiple
│   ├── get-customer-metrics.ts   # Admin: Analytics (New, Active, etc)
│   ├── get-customer-activity.ts  # Admin: Retrieve order/cart history
│   ├── get-user-tags.ts          # Admin: Retrieve unique segmentation tags
│   ├── import-customers.ts       # Admin: Ingest CSV array into profiles
│   └── export-customers.ts       # Admin: Export profiles to CSV
├── services/                     # Business Logic
│   ├── customer.service.ts       # Core logic, linking user+profile
│   ├── customer-cache.service.ts # Redis caching logic for profiles
│   ├── customer-export.service.ts# Format/parsing for bulk export
│   └── customer-import.service.ts# UPSERT/parsing logic for bulk import
└── shared/                       # Models & validation
    ├── customer-profiles.schema.ts
    ├── interface.ts
    ├── queries.ts                # Drizzle queries (joins on `users`)
    ├── validation.ts             # Zod input schemas
    └── index.ts                  # Shared exports
```

## API Routes

All routes are prefixed with `/api/customers` and **strictly require Administrative access**.

### Endpoints

- `GET /` - List all customers with pagination, status, and tag filtering
- `GET /metrics` - Retrieve top-level customer dashboard stats
- `GET /tags` - List distinct segmentation tags currently in use
- `GET /:id` - Get customer by ID (Includes `addresses` and `users` join)
- `GET /:id/activity` - Get recent history (Orders, Reviews, Wishlists)
- `POST /` - Create a new customer identity and profile simultaneously
- `PUT /:id` - Update customer attributes
- `DELETE /:id` - Soft delete a customer
- `POST /bulk-delete` - Bulk soft-delete
- `POST /import` - Upload and process CSV/JSON files to create/update
- `POST /export` - Download customer slice based on filters

## Authentication Requirements

| Endpoint                    | Authentication | Authorization                  |
| --------------------------- | -------------- | ------------------------------ |
| `GET /`                     | ✅ Required    | `users:read` permission        |
| `GET /:id`                  | ✅ Required    | `users:read` permission        |
| `GET /metrics`, `GET /tags` | ✅ Required    | `users:read` permission        |
| `GET /:id/activity`         | ✅ Required    | `users:read` permission        |
| `POST /`, `PUT /:id`        | ✅ Required    | `users:update` permission      |
| `DELETE` / `POST /bulk-del` | ✅ Required    | `users:delete` permission      |
| `POST /import`, `/export`   | ✅ Required    | `users:update` / `users:read`  |

---

## Endpoints Data Formats

### 1. Get All Customers (Paginated & Filtered)

**Endpoint:** `GET /api/customers`

#### Query Parameters

- `page`: default 1
- `limit`: default 20
- `search`: string (checks name/email/phone)
- `status`: 'active' | 'inactive'
- `tags`: comma separated keys
- `sort`: 'newest', 'oldest', etc.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "users": [
      {
        "id": "uuid-1234",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.dee@example.com",
        "phone_number": "+1234567890",
        "status": "active",
        "created_at": "2024-01-15T10:30:00.000Z",
        "customer_profile": {
          "segments": ["vip", "regular"],
          "account_status": "active",
          "marketing_opt_in": true,
          "loyalty_points": 500,
          "risk_profile": "low"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 2. Create Customer

**Endpoint:** `POST /api/customers`

#### Request Body

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+1987654321",
  "gender": "female",
  "segments": ["new"],
  "marketing_opt_in": true,
  "notes": "Met at Summer Expo"
}
```

### 3. Import Customers

**Endpoint:** `POST /api/customers/import`

Expects an array of structured JSON mappings translated from CSV files by the frontend.

#### Request Body

```json
{
  "mode": "upsert",
  "data": [
    {
      "first_name": "Michael",
      "last_name": "Scott",
      "email": "michael.s@dundermifflin.com",
      "segments": ["vip"]
    }
  ]
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 1,
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

## Features

- **Decoupled Architecture**: Strictly isolates CRM features (loyalty, segments, store credits) in `customer_profiles` while reading/joining foundational credentials from the core `users` entity table. 
- **Bulk Import/Export Pipelines**: `customer-import.service` supports full UPSERT functionality via email matching, including loose parsing logic for dates (`DD/MM/YYYY` vs `YYYY-MM-DD`) mapped from CSVs.
- **Unified Activity Timeline**: `get-customer-activity.ts` acts as an orchestrator, pulling recent orders, placed reviews, and cart histories together into a single sequential timeline payload for the Admin dashboard.
- **Cache Invalidation Lifecycle**: Mutating individual customers automatically bursts and resets localized Redis strings (e.g., `customer:{id}` structure) to distribute read performance in heavy admin panels.

## Dependencies

- **User Feature**: Relies on `users.schema.ts` for identity foundation and base auth capabilities.
- **Address Feature**: Reads attached location data inside the comprehensive `/customer/:id` view payload.
- **Order/Cart/Review**: `queries.ts` makes light cross-feature queries to produce the Timeline activity. 
- **RBAC Feature**: Heavily utilizes `requirePermission('users:edit')` standard middleware.
