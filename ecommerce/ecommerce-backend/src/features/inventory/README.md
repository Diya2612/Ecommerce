# Inventory Feature

## Overview

The Inventory feature is the backbone of stock management across the storefront. It strictly separates **available stock** from **committed stock**, providing a robust engine for temporary cart holds, order reservations, and immutable audit logging for manual warehouse adjustments.

## Structure

```
inventory/
├── index.ts                      # Route exports & class registration
├── apis/                         # HTTP endpoints
│   ├── get-all-inventory.ts      # Admin: List current stock levels
│   ├── get-inventory-by-id.ts    # Admin: View specific stock instance
│   ├── update-inventory.ts       # Admin: Update conditions/locations
│   ├── adjust-inventory.ts       # Admin: Add/Remove quantity (Audited)
│   ├── backfill-inventory.ts     # Admin: Generate missing records
│   ├── get-inventory-history.ts  # Admin: Retrieve global adjustment logs
│   ├── get-inventory-history-by-product.ts # Admin: Logs for specific item
│   └── get-available-stock.ts    # Public: Quick storefront quantity check
├── services/                     # Business Logic
│   ├── inventory-core.service.ts # Core CRUD functionality
│   ├── inventory-stock.service.ts# High-performance read aggregations
│   ├── inventory-adjustment.service.ts # Audit-logged quantity modification
│   ├── inventory-helpers.service.ts    # Utility validations & formatting
│   ├── cart-reservation.service.ts     # Temporary TTL checkout stock holds
│   └── order-reservation.service.ts    # Hard locks for paid orders
└── shared/                       # Models & validation
    ├── inventory.schema.ts       # Core table (available / committed qty)
    ├── inventory-adjustments.schema.ts # Immutable chronological audit log
    ├── interface.ts              # Canonical DTO types
    ├── validation.ts             # Zod input schemas
    ├── queries/                  # Drizzle query fragments
    └── index.ts                  
```

## API Routes

All routes are mounted under `/api/inventory`. Due to the critical nature of stock levels, almost all endpoints require strict **Administrative access**.

### Endpoints

- `GET /` - List paginated inventory with filtering (condition, status, location)
- `GET /:id` - Retrieve a specific inventory unit
- `PUT /:id` - Update metadata (e.g. marking `condition` as `damaged`)
- `POST /:id/adjust` - Modify quantities (Requires a logged reason)
- `POST /backfill` - Create `inventory` rows for products lacking them
- `GET /history` - Paginated global log of all adjustments
- `GET /history/product/:productId` - Filtered adjustment log
- `GET /availability/:productId` - Lightweight check for active frontend catalogs

## Authentication Requirements

| Endpoint                               | Authentication | Authorization                       |
| -------------------------------------- | -------------- | ----------------------------------- |
| `GET /availability/:id`                | ❌ Optional    | None (Public Storefront)            |
| `GET /`, `GET /:id`, `GET /history`    | ✅ Required    | `inventory:read` permission         |
| `PUT /:id`, `POST /backfill`           | ✅ Required    | `inventory:update` permission       |
| `POST /:id/adjust`                     | ✅ Required    | `inventory:update` / `write-offs`   |

---

## Endpoints Data Formats

### 1. Adjust Inventory (Admin Audit Log)

**Endpoint:** `POST /api/inventory/:id/adjust`

Changes the current physically available stock. Since direct modifications to the active count are blocked by architecture, all changes must pass through this endpoint to generate a trackable `inventory_adjustments` row.

#### Request Body

```json
{
  "quantity_change": -5,
  "reason": "Found damaged during warehouse sweep",
  "reference_number": "WH-SWEEP-098",
  "notes": "Bottom box was crushed"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Inventory adjusted successfully",
  "data": {
    "inventory": {
      "id": "inv-1234",
      "available_quantity": 45,
      "committed_quantity": 0,
      "status": "in_stock"
    },
    "adjustment": {
      "id": "adj-5678",
      "inventory_id": "inv-1234",
      "adjustment_type": "write-off",
      "quantity_change": -5,
      "quantity_before": 50,
      "quantity_after": 45,
      "reason": "Found damaged during warehouse sweep",
      "adjusted_by": "admin-uuid",
      "adjusted_at": "2024-03-01T10:30:00.000Z"
    }
  }
}
```

### 2. Get Available Stock (Storefront)

**Endpoint:** `GET /api/inventory/availability/:productId`

Provides a high-speed payload calculating exactly what is safe to sell. The formula is inherently `available_quantity - committed_quantity`.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Stock availability retrieved",
  "data": {
    "productId": "prod-1234",
    "availableStock": 45,
    "committedStock": 5,
    "totalStock": 50,
    "inStock": true
  }
}
```

---

## Features

- **Storefront Cart Reservations**: The `cart-reservation.service.ts` allows the frontend to temporarily "lock" inventory items for `30 minutes` during the checkout flow by moving them into the `committed_quantity` column. A background chron job successfully refunds expired locks back to `available_quantity`.
- **Order Hard Locks**: The `order-reservation.service.ts` converts temporary cart holds into permanent deductions the moment a payment succeeds, transferring the quantities out of tracking to prevent double-selling.
- **Immutable Adjustments Log**: The `inventory_adjustments` table guarantees that any physical addition (`increase`), deduction (`decrease`), or mistake mapping (`correction`) records a mandatory `quantity_before` and `quantity_after` snapshot connected explicitly to the acting administrator.
- **Variant Splitting**: Fully supports split inventory architectures where a `product_id` contains generic stock OR a `variant_id` contains highly specific (e.g., Red / Large) stock caps.

## Dependencies

- **Product Feature**: The `inventory` table explicitly relies on cascading `FOREIGN KEY` constraints mapped to the `products` and `product_variants` tables.
- **User Feature**: Relies on `users.id` tracking to map internal employee/admin actions on the `adjusted_by` column.
- **Cart/Checkout Feature**: The `cart-reservation.service.ts` explicitly expects `cartItemId` payloads to stamp TTL locks directly onto dynamic frontend sessions.
