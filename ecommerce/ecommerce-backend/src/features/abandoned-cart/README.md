# Abandoned Cart Feature

## Overview

The Abandoned Cart feature allows administrators to view, track, and recover carts that customers have left without completing their purchase. It provides metrics on abandoned carts, detailed views of individual carts, and the ability to send recovery emails using pre-defined templates.

## Structure

```
abandoned-cart/
├── index.ts                      # Feature exports and routes
├── apis/                         # HTTP endpoints
│   ├── get-abandoned-carts.ts
│   ├── get-abandoned-cart-details.ts
│   ├── get-abandoned-cart-metrics.ts
│   ├── get-email-templates.ts
│   └── send-abandoned-cart-emails.ts
└── shared/                       # Shared resources
    ├── queries.ts                # Database query logic
    └── validation.ts             # Zod validation schemas
```

## API Routes

All routes are mounted under `/api/admin/abandoned-carts`

- `GET /admin/abandoned-carts` - List abandoned carts with filters and pagination
- `GET /admin/abandoned-carts/:cartId` - Get full details of a specific abandoned cart
- `GET /admin/abandoned-carts/metrics` - Get overall abandoned cart statistics
- `GET /admin/abandoned-carts/email-templates` - Get active email templates for recovery
- `POST /admin/abandoned-carts/send-email` - Send recovery emails to specific carts

## Authentication Requirements

| Endpoint                                | Authentication | Authorization          |
| --------------------------------------- | -------------- | ---------------------- |
| `GET /`                                 | ✅ Required    | Admin (`orders:read`)  |
| `GET /:cartId`                          | ✅ Required    | Admin (`orders:read`)  |
| `GET /metrics`                          | ✅ Required    | Admin (`orders:read`)  |
| `GET /email-templates`                  | ✅ Required    | Admin (`orders:read`)  |
| `POST /send-email`                      | ✅ Required    | Admin (`orders:write`) |

---

## Endpoints Data Formats

### 1. Get All Abandoned Carts

**Endpoint:** `GET /api/admin/abandoned-carts`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Abandoned carts retrieved successfully",
  "data": {
    "carts": [
      {
        "cart_id": "cart-123",
        "customer_info": {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "+1234567890"
        },
        "cart_value": "150.00",
        "abandoned_at": "2024-01-15T10:30:00.000Z",
        "last_activity": "2 hours ago",
        "last_activity_at": "2024-01-15T10:30:00.000Z",
        "recovery_status": "not-contacted",
        "recovery_email_sent_at": null
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "count": 1,
      "total": 5
    }
  }
}
```

### 2. Get Cart Details

**Endpoint:** `GET /api/admin/abandoned-carts/:cartId`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Abandoned cart details retrieved successfully",
  "data": {
    "cart_id": "cart-123",
    "customer": {
      "user_id": "user-456",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "addresses": []
    },
    "pricing": {
      "currency": "USD",
      "subtotal": "140.00",
      "discount_total": "0.00",
      "shipping_total": "10.00",
      "tax_total": "0.00",
      "grand_total": "150.00"
    },
    "items": [
      {
        "id": "item-789",
        "product_id": "prod-1",
        "product_name": "Wireless Mouse",
        "product_image_url": "https://example.com/mouse.jpg",
        "product_sku": "SKU-WM",
        "quantity": 1,
        "cost_price": "20.00",
        "final_price": "140.00",
        "discount_amount": "0.00",
        "line_subtotal": "140.00",
        "line_total": "140.00"
      }
    ],
    "applied_codes": {
      "discount_codes": [],
      "giftcard_codes": []
    },
    "status": {
      "cart_status": "abandoned",
      "recovery_status": "not-contacted"
    },
    "timeline": {
      "created_at": "2024-01-15T09:30:00.000Z",
      "last_activity_at": "2024-01-15T10:30:00.000Z",
      "abandoned_at": "2024-01-15T10:30:00.000Z",
      "recovery_email_sent_at": null
    }
  }
}
```

### 3. Send Recovery Emails

**Endpoint:** `POST /api/admin/abandoned-carts/send-email`

#### Request Body
```json
{
  "cart_ids": ["cart-123", "cart-124"],
  "template_id": "abandoned-cart-template"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully sent 2 emails",
  "data": {
    "total": 2,
    "sent": 2,
    "failed": 0,
    "results": [
      {
        "cart_id": "cart-123",
        "status": "success"
      },
      {
        "cart_id": "cart-124",
        "status": "success"
      }
    ]
  }
}
```

### 4. Get Metrics

**Endpoint:** `GET /api/admin/abandoned-carts/metrics`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Abandoned cart metrics retrieved successfully",
  "data": {
    "total_carts": 150,
    "potential_revenue": "4500.00",
    "emails_sent": 45,
    "recovered_count": 12,
    "recovery_rate": "8.00"
  }
}
```

#### Common Error Responses

| Status | Error        | Description                              |
| ------ | ------------ | ---------------------------------------- |
| `400`  | Bad Request  | Invalid schema or missing template id    |
| `401`  | Unauthorized | Missing or invalid auth token            |
| `403`  | Forbidden    | Missing `orders:read` or `orders:write`  |
| `404`  | Not Found    | Cart id, templates, or emails not found  |

---

## Features

- **Relative Last Activity**: Calculates and displays human-readable "time ago" string (`last_activity`)
- **Customer Resolution**: Falls back to Session ID `Guest (xyz...)` if name and email are missing
- **Dynamic Email Rendering**: Automatically replaces template variables like `{{customer_name}}`, `{{cart_value}}`, and `{{cart_url}}` when sending emails.
- **Recovery Tracking**: Automatically tracks if a cart went from `abandoned` -> `email-sent` -> `recovered` (converted).
- **Graceful Failover**: Uses centralized query layer (`shared/queries`) instead of embedding business logic inside API controllers.

## Dependencies

- **Orders Feature**: Relies on cart structures (`cart_id`) from regular cart actions and utilizes `orders:read/write` permissions.
- **Notifications Feature**: Leverages the `deliveryService.deliverNotification()` method to physically handle email delivery.
- **Templates Table**: Requires Notification Templates categorized under `abandoned-cart`.
