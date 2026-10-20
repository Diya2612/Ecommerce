# Discount Feature

## Overview

The Discount feature is one of the most comprehensive and complex modules in the backend. It handles the entire lifecycle of promotional campaigns, from simple percentage sales to intricate "Buy X Get Y" logic, free shipping caps, geographical restrictions, target audience segmentation, and bulk code generation. It decouples the raw discount definitions from the calculation engine, ensuring high performance during checkout validations.

## Structure

```
discount/
├── index.ts                      # Route exports & class registration
├── apis/                         # HTTP endpoints
│   ├── get-discounts.ts          # Admin: Paginated list
│   ├── get-discount-by-id.ts     # Admin: Get detailed payload
│   ├── create-discount.ts        # Admin: Create new promotion
│   ├── update-discount.ts        # Admin: Update existing
│   ├── delete-discount.ts        # Admin: Soft delete
│   ├── discount-actions.ts       # Admin: Toggle/Duplicate/Generate bulk codes
│   └── validate-discount.ts      # Public/Cart checkout validation endpoint
├── services/                     # Business Logic
│   ├── discount.service.ts       # Core logic (CRUD & mappings)
│   ├── discount-code.service.ts  # Bulk code generation engine
│   ├── discount-validation.service.ts # High-performance checkout validations
│   ├── discount-calculation.service.ts # Mathematical computation engine
│   └── index.ts
├── jobs/                         # Automated tasks
│   └── discount-status-updater.ts# CRON job transitioning Scheduled -> Active -> Expired
└── shared/                       # Models & validation
    ├── discount.schema.ts        # Primary Campaign structure (Discounts)
    ├── discount-codes.schema.ts  # Junction table for multiple codes per discount
    ├── discount-items.schema.ts  # Junction for specific products/collections targeting
    ├── discount-usage.schema.ts  # Accounting log tracking successful uses
    ├── discount-advanced.schema.ts# Additional tier targeting
    ├── interface.ts              # Canonical TypeScript types
    ├── search-utils.ts           # Filtering utilities
    └── index.ts
```

## API Routes

All routes are mounted under `/api/discounts` and the majority require **Administrative access**, except for validation routing.

### Endpoints

- `GET /` - List all discounts (paginated/filtered)
- `GET /:id` - Get comprehensive discount detail
- `POST /` - Create a new discount
- `PUT /:id` - Update an existing discount
- `DELETE /:id` - Soft delete a discount
- `POST /:id/toggle` - Swap Status (`active` <-> `inactive`)
- `POST /:id/duplicate` - Copy a promotion completely
- `GET /:id/stats` - Retrieve usage aggregations (Top products, usage by date)
- `POST /:id/generate-codes` - Generate bulk unique codes (e.g. `SUMMER-XYZ123`)
- `POST /validate` - **Public/Cart Route**: Validates a code and returns mathematical savings preview.

## Authentication Requirements

| Endpoint                               | Authentication | Authorization                    |
| -------------------------------------- | -------------- | -------------------------------- |
| `GET /`, `GET /:id`                    | ✅ Required    | `discounts:read` permission      |
| `POST /`, `PUT /:id`, `DELETE /:id`    | ✅ Required    | `discounts:create/update/delete` |
| `POST /:id/toggle`, `duplicate`, etc   | ✅ Required    | `discounts:update/create`        |
| `GET /:id/stats`                       | ✅ Required    | `discounts:read`                 |
| `POST /validate`                       | ❌ Optional    | None (Public Checkout Route)     |

---

## Endpoints Data Formats

### 1. Validate Discount (Public / Cart Preview)

**Endpoint:** `POST /api/discounts/validate`

The primary storefront endpoint accessed during checkout. Takes the user's cart state and mathematically computes their total savings.

#### Request Body

```json
{
  "code": "SUMMER50",
  "cart_items": [
    { "id": "prod-1", "price": 100.00, "quantity": 1 }
  ],
  "cart_subtotal": 100.00,
  "shipping_address_country": "US",
  "sales_channel": "online_store"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "valid": true,
  "code": "SUMMER50",
  "discount": {
    "id": "uuid-1234",
    "title": "Summer Blowout",
    "type": "percentage",
    "value": "50.00"
  },
  "calculation": {
    "total_discount": "50.00",
    "applicable_items": ["prod-1"]
  }
}
```

*Note: If invalid, `valid: false` is returned with an `error_code` string specifying why (e.g., `MINIMUM_NOT_MET`, `EXPIRED`, `GEO_RESTRICTED`).*

### 2. Create Discount (Admin)

**Endpoint:** `POST /api/discounts`

#### Setup Example (Buy 2 Get 1 Free Component)

```json
{
  "title": "Buy 2 Shirts Get 1 Free",
  "type": "buy_x_get_y",
  "buy_x_trigger_type": "quantity",
  "buy_x_value": "2",
  "buy_x_same_product": true,
  "get_y_type": "free",
  "get_y_quantity": 1,
  "usage_limit": 100,
  "starts_at": "2024-06-01T00:00:00.000Z",
  "target_audience": "all",
  "geo_restriction": "none",
  "status": "scheduled"
}
```

### 3. Generate Bulk Codes (Admin)

**Endpoint:** `POST /api/discounts/:id/generate-codes`

Allows generating thousands of unique single-use codes tied to a single overarching discount campaign.

#### Request Body

```json
{
  "count": 500,
  "prefix": "WINTER-",
  "length": 8,
  "max_uses_per_customer": 1,
  "usage_limit": 1
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "500 codes generated successfully",
  "data": {
    "codes": ["WINTER-A1B2C3D4", "WINTER-X9Y8Z7Q6"]
  }
}
```

---

## Features

- **Decoupled Architecture**: Separates validation (`discount-validation.service.ts`) from calculation (`discount-calculation.service.ts`), ensuring that cart restrictions (e.g., minimum spend) are verified before mathematical reductions are processed.
- **Advanced Target Types**:
  - `percentage`, `fixed_amount`, `free_shipping` (with shipping cost caps), and `buy_x_get_y`.
- **Intricate Rule Engines**:
  - Allows geo-restricting a promo code purely to users from `"US"` or `"CA"`.
  - Configurable to single-use `once_per_customer` or segmented to explicitly `limit_new_customers`.
- **Scheduled Automated Transitions**: Runs a chron job inside `discount-status-updater.ts` that safely updates campaigns from `scheduled` to `active`, and from `active` to `expired` without manual admin intervention.
- **Data Integrity**: Enforces strict `CHECK` constraints on rows inside `discount.schema.ts` explicitly guaranteeing that ends_at dates are mathematically newer than starts_at dates.

## Dependencies

- **RBAC Feature**: Enforces strict `requirePermission('discounts:create')` requirements for generating mass codes or updating structures.
- **Cart/Checkout Module**: Closely integrates alongside checkout states, accepting array objects mirroring cart lines.
