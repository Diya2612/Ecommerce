# Orders Feature

## Overview

The Orders feature is the core transactional engine of the e-commerce platform. It handles the complete lifecycle of purchases, supporting both customer-facing cart checkouts and administrative direct order creations. It orchestrates complex integrations between inventory reservations, payment statuses, dynamic tax calculations, and automated multi-recipient notifications.

## Structure

```
orders/
├── index.ts
├── apis/
│   ├── cancel-order.ts
│   ├── confirm-draft-order.ts
│   ├── create-order-direct.ts
│   ├── create-order-from-cart.ts
│   ├── delete-orders.ts
│   ├── duplicate-order.ts
│   ├── get-admin-order-by-id.ts
│   ├── get-admin-orders.ts
│   ├── get-draft-orders.ts
│   ├── get-order-by-id.ts
│   ├── get-order-metrics.ts
│   ├── get-orders.ts
│   ├── get-stock-batch.ts
│   ├── get-user-orders.ts
│   ├── search-products.ts
│   ├── update-fulfillment-status.ts
│   ├── update-order-status.ts
│   ├── update-order.ts
│   ├── update-payment-status.ts
│   └── update-tracking.ts
├── services/
│   ├── index.ts
│   ├── order-calculation.service.ts
│   ├── order-conversion.service.ts
│   ├── order-creation.service.ts
│   ├── order-management.service.ts
│   ├── order-notification.service.ts
│   ├── order-payment.service.ts
│   ├── order-status.service.ts
│   ├── order-update.service.ts
│   ├── order-validation.service.ts
│   └── order.service.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── order-items.schema.ts
    ├── orders.relations.ts
    ├── orders.schema.ts
    ├── queries.ts
    ├── utils.ts
    └── validation.ts
```

## API Routes

All routes are mounted under `/api/orders` (for user-facing operations) or `/api/admin/orders` (for administrative control). Strict isolation prevents users from mutating pricing or fulfillment state.

### Endpoints

**User Endpoints (`/api/orders`)**
- `POST /` - Convert an active cart into a confirmed Order
- `GET /` - List paginated orders belonging strictly to the accessing user
- `GET /:id` - Retrieve specific order details (restricted to owner)
- `POST /:id/cancel` - Cancel an active order before fulfillment

**Admin Endpoints (`/api/admin/orders`)**
- `POST /direct` - Bypass cart and manually generate a confirmed order
- `POST /draft` - Create an unpaid quote/draft
- `POST /:id/confirm` - Convert a draft into a confirmed order (triggers inventory locks)
- `POST /:id/duplicate` - Rapidly clone an existing order's line items
- `GET /` - List all system orders (Paginated, Filtered)
- `GET /drafts` - Filter specifically for draft-status orders
- `GET /metrics` - Retrieve top-level sales heuristics for dashboard displays
- `GET /:id` - Comprehensive lookup including backend-only metadata
- `PUT /:id` - Modify an existing order (triggers re-calculations)
- `PUT /:id/status` - Update global lifecycle (`pending`, `processing`, `cancelled`)
- `PUT /:id/payment` - Update gateway status (`paid`, `failed`, `refunded`)
- `PUT /:id/fulfillment` - Update warehouse status (`fulfilled`, `returned`)
- `PUT /:id/tracking` - Inject AWB tracking codes and trigger customer emails
- `DELETE /` - Bulk delete archaic orders
- `GET /stock-batch` - Utility calculating warehouse stock requirements
- `GET /search-products` - Utility to autocompleting products for direct-order creation

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| Checkout, View Own Orders         | `GET /`, `POST /`       | Authenticated User (Owner Only)     |
| View All Orders, Metrics          | `GET /admin/orders/*`   | `orders:read` permission            |
| Create Direct Orders, Drafts      | `POST /admin/orders/*`  | `orders:create` permission          |
| Modify Status, Tracking, Payment  | `PUT /admin/orders/*`   | `orders:update` permission          |
| Order Deletion                    | `DELETE /admin/orders`  | `orders:delete` permission          |

---

## Endpoints Data Formats

### 1. Create Order From Cart (User Checkout Flow)

**Endpoint:** `POST /api/orders`

Automatically loads the user's current session cart, recalculates all prices Server-Side, and creates the formal `order`.

#### Request Body

```json
{
  "shipping_address_id": "uuid-address-1111",
  "billing_address_id": "uuid-address-2222",
  "shipping_method": "express",
  "notes": "Please leave at front door"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "order_id": "uuid-order-1234",
    "order_number": "ORD-2024-001234",
    "total_amount": "1299.00",
    "status": "pending"
  }
}
```

### 2. Create Direct Order (Admin Workflow)

**Endpoint:** `POST /api/admin/orders/direct`

Allows Admins to forcefully build a purchase for telephone/B2B users. The Admin passes only product and quantity variables; the server autonomously handles the definitive price calculation map to prevent tampering.

#### Request Body

```json
{
  "user_id": "uuid-customer-5678",
  "items": [
    {
      "product_id": "uuid-product-9999",
      "quantity": 2
    }
  ],
  "shipping_address": {
    "recipient_name": "Jane Corporate",
    "address_line1": "123 Business Rd.",
    "city": "Mumbai",
    "state_province": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  },
  "billing_address": {
    "recipient_name": "Jane Corporate",
    "address_line1": "123 Business Rd.",
    "city": "Mumbai",
    "state_province": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  },
  "status": "confirmed",
  "payment_status": "paid"
}
```

### 3. Update Order Lifecycle

Various discrete endpoints ensure clear audit logs when modifying the operational stages of the package. 

**Update Tracking Definition:** `PUT /api/admin/orders/:id/tracking`

```json
{
  "tracking_number": "AWB-777888999",
  "tracking_url": "https://carrier.com/track/AWB-777888999",
  "carrier": "BlueDart"
}
```
*(Automatically triggers the `ORDER_TRACKING_UPDATED` notification blueprint to the customer).*

---

## Features

- **Server-Side Pricing Engine**: The `order-calculation.service.ts` mandates that no pricing is read from the client payload. All subtotals, complex CGST/IGST assignments, and shipping weights are calculated freshly from the `products` table upon submission to securely intercept spoofing. 
- **Inventory Orchestration**: Tightly coupled with the `Inventory` feature. If a `draft` order is confirmed, or a cart is converted, the engine safely increments `committed_quantity` counts to prevent duplicate checkout collisions. Calling `update-fulfillment-status.ts` subsequently transfers that temporary hold permanently out of the warehouse.
- **Micro-Service Segmentation**: Built upon 11 specific service routers. (e.g., `order-conversion` for cart logic, `order-notification` purely handling lifecycle event dispatches, `order-payment` for gateway hook adjustments).
- **Asynchronous Event Publishing**: Status updates naturally spawn non-blocking notification dispatches without slowing down the HTTP thread. (Modifying tracking emails the user, paying triggers a new Invoice creation, etc.)

## Dependencies

- **Cart Feature**: The primary User checkout mechanism requires fetching and destroying active sessions inside the `cart` architecture.
- **Inventory System**: Relegates all physical stock-lock operations downward to `inventory` helpers. 
- **Notifications Core**: Broadcasts all internal webhooks for transactional messaging (`ORDER_CREATED`, `ORDER_DELIVERED`).
- **Invoice Feature**: Payment completions lazily invoke the Invoice engine to lock immutable PDF snapshot iterations of the sale parameters.
