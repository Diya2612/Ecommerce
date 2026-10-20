# Admin Feature

## Overview

Manages admin/staff user profiles and organizational structure. Creates a polymorphic link between a base user account and their administrative privileges/metadata.

## Structure

```
admin/
├── index.ts              # Route class & exports
├── apis/                 # HTTP endpoints
│   ├── get-all-admins.ts
│   ├── get-admin-by-id.ts
│   ├── create-admin.ts
│   ├── update-admin.ts
│   └── delete-admin.ts
├── services/             # Business logic layer
│   └── admin.service.ts
└── shared/               # Schemas, types & validation
    ├── admin-profiles.schema.ts
    ├── interface.ts
    ├── queries.ts
    ├── validation.ts
    └── index.ts
```

## API Routes

All routes are mounted under `/api/admins`

- `GET /admins` - List all active admins (supports pagination & filtering)
- `POST /admins` - Create new admin profile for a user
- `GET /admins/:id` - Get specific admin profile by user ID or profile ID
- `PATCH /admins/:id` - Update admin profile (department, title, status)
- `DELETE /admins/:id` - Soft-delete admin profile

---

## Endpoints Data Formats

### 1. Create/Update/Get Admin

**Endpoints:** `POST /`, `PATCH /:id`, `GET /:id`

#### Success Response (200/201)

```json
{
  "success": true,
  "message": "Admin retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "tags": ["admin", "senior"],
    "profile": {
      "employee_number": "EMP-001",
      "department": "Engineering",
      "job_title": "Senior Administrator",
      "is_active": true
    }
  }
}
```

### 2. Get All Admins

**Endpoint:** `GET /`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "phone": "+1234567890",
        "tags": ["admin", "senior"],
        "profile": {
          "employee_number": "EMP-001",
          "department": "Engineering",
          "job_title": "Senior Administrator",
          "is_active": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

#### Common Error Responses

| Status | Error        | Description                        |
| ------ | ------------ | ---------------------------------- |
| `400`  | Bad Request  | Invalid schema or request body     |
| `401`  | Unauthorized | Missing or invalid auth token      |
| `403`  | Forbidden    | Missing required RBAC permissions  |
| `404`  | Not Found    | Admin profile not found            |
| `409`  | Conflict     | User/Email already exists          |

---

## Features

- One admin profile per user (`user_id` unique constraint)
- Soft-delete operations — records are marked `is_deleted` rather than removed
- Role-Based Access Control (RBAC) integration for all endpoints
- Department and Employee ID tracking
- Active/Inactive status toggling (`is_active`)

## Schema (`admin_profiles`)

- `user_id`: Link to core user account
- `employee_number`: Unique company employee ID
- `department`: Organizational unit (Sales, Support, Finance, etc.)
- `job_title`: Specific role designation
- `is_active`: Boolean status flag
- `is_deleted`: Soft-delete flag

## Dependencies

- **User Feature**: Base identity and authentication
- **RBAC Feature**: Permission and role enforcement
- **Auth Feature**: Session management
