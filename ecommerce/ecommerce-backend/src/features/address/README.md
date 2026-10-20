# Address Feature

## Overview

Address management feature that handles user shipping and billing addresses. Supports multiple addresses per user with independent default tracking for shipping and billing.

## Structure

```
address/
├── index.ts              # Route class & exports
├── apis/                 # HTTP endpoints
│   ├── get-addresses.ts
│   ├── create-address.ts
│   ├── update-address.ts
│   ├── delete-address.ts
│   └── set-default-address.ts
├── services/             # Business logic
│   └── address.service.ts
└── shared/               # Schemas, types & validation
    ├── addresses.schema.ts
    ├── interface.ts
    ├── queries.ts
    ├── validation.ts
    └── index.ts
```

## API Routes

All routes are nested under user resources: `/api/addresses/:userId/addresses`

- `GET /addresses/:userId/addresses` - Get all addresses for a user (`:userId` can be `me`)
- `POST /addresses/:userId/addresses` - Create new address
- `PUT /addresses/:userId/addresses/:id` - Update address
- `PATCH /addresses/:userId/addresses/:id/default` - Set default address (`?type=shipping|billing|both`)
- `DELETE /addresses/:userId/addresses/:id` - Soft-delete address

---

## Endpoints Data Formats

### 1. Create/Update Address

**Endpoints:** `POST /`, `PUT /:id`

#### Success Response (201/200 OK)

```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address_type": "home",
    "address_name": null,
    "name": "Jane Smith",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "isDefaultShipping": true,
    "isDefaultBilling": false,
    "deliveryInstructions": "Leave at front desk"
  }
}
```

### 2. Get All User Addresses

**Endpoint:** `GET /`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "address_type": "home",
      "address_name": null,
      "name": "Jane Smith",
      "phone": "+1234567890",
      "addressLine": "123 Main St, Apt 4B",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "isDefaultShipping": true,
      "isDefaultBilling": false,
      "deliveryInstructions": "Leave at front desk"
    }
  ]
}
```

#### Common Error Responses

| Status | Error        | Description                             |
| ------ | ------------ | --------------------------------------- |
| `400`  | Bad Request  | Invalid schema or request body          |
| `401`  | Unauthorized | Missing or invalid auth token           |
| `403`  | Forbidden    | Not the owner or missing admin perm     |
| `404`  | Not Found    | Address or User not found               |

---

## Features

- Multiple addresses per user
- Independent default flags for shipping and billing
- `me` alias supported in GET (resolves to authenticated user)
- Soft-delete — records are never physically removed
- International address support (`country_code`, `latitude`, `longitude`, `tax_id`)
- DB-enforced uniqueness for default shipping/billing via partial unique indexes
- Validation middleware via Zod with cross-field rules

## Address Types

- **home**: Residential address (default)
- **office**: Work address
- **other**: Custom label — `address_name` field required

## Dependencies

- **User Feature**: `user_id` FK references `users.id`
- **Orders Feature**: Used for order shipping/billing addresses
- **Middlewares**: `requireAuth`, `requireOwnerOrPermission`, `validationMiddleware`
