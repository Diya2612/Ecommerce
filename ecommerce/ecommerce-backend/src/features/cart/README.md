# Cart Feature

## Overview

The Cart feature manages the entire lifecycle of shopping carts for both authenticated users and anonymous guests (using session IDs). It provides an intricate architecture containing validation, dynamic calculations, discount applications, and a complete merging strategy for when a guest logs into their account.

## Structure

```
cart/
├── index.ts                            # Route class & main exports
├── apis/                               # HTTP endpoints (Thin Controllers)
│   ├── get-cart.ts                     # Get user/guest cart
│   ├── add-to-cart.ts                  # Add product to cart
│   ├── update-cart-item.ts             # Update quantity
│   ├── remove-cart-item.ts             # Remove specific item
│   ├── clear-cart.ts                   # Empty entire cart
│   ├── apply-discount.ts               # Apply coupon/promo code
│   ├── remove-discount.ts              # Remove applied discount
│   ├── validate-cart.ts                # Validate stock/prices before checkout
│   └── merge-cart.ts                   # Merge guest cart to user cart
├── config/                             # Configuration files
│   └── constants.ts
├── jobs/                               # Background workers
│   └── cart-cleanup.job.ts             # Routine to clear old abandoned carts
├── services/                           # Business logic layer
│   ├── cart-core.service.ts            # Base cart CRUD operations
│   ├── cart-item.service.ts            # Cart item specific actions
│   ├── cart-calculation.service.ts     # Totals, taxes, and subtotal math
│   ├── cart-validation.service.ts      # Price & inventory validation logic
│   ├── cart-merge.service.ts           # Logic for converging session carts
│   ├── cart-orchestrator.service.ts    # High-level aggregator service
│   └── index.ts                        # Shared exports
├── shared/                             # Schemas, types & validation
│   ├── carts.schema.ts                 # Drizzle schemas for Cart
│   ├── cart-items.schema.ts            # Drizzle schemas for Cart Items
│   ├── interface.ts                    # TypeScript definitions
│   ├── validation.ts                   # Zod parsing rules
│   ├── queries.ts                      # Repository queries
│   └── index.ts                        # Shared exports
└── utils/                              # Helper functions
    └── cart-helpers.ts
```

## API Routes

All endpoints are mounted under `/api/cart`. Most accept the `x-session-id` header for guest cart management.

- `GET /cart` - Retrieve the current cart with full details
- `POST /cart/items` - Add a new item to cart
- `PUT /cart/items/:id` - Update quantity of an item
- `DELETE /cart/items/:id` - Remove an item
- `DELETE /cart` - Clear all items
- `POST /cart/discount` - Apply a discount code
- `DELETE /cart/discount/:code` - Remove a specific discount
- `POST /cart/validate` - Manually validate cart items against live inventory and prices
- `POST /cart/merge` - Merge a guest `x-session-id` cart into the user's logged-in cart

## Authentication Requirements

| Endpoint                    | Authentication | Authorization                    |
| --------------------------- | -------------- | -------------------------------- |
| `GET /`                     | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `POST /items`               | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `PUT /items/:id`            | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `DELETE /items/:id`         | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `DELETE /cart`              | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `POST /discount`            | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `DELETE /discount/:code`    | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `POST /validate`            | ⚠️ Optional    | Uses JWT or `x-session-id`       |
| `POST /merge`               | ✅ Required    | Must have a valid User Session   |

---

## Endpoints Data Formats

### 1. Get Cart Details

**Endpoint:** `GET /api/cart`

Retrieves the current cart and automatically validates items against live stock and prices.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "currency": "INR",
    "subtotal": "5000.00",
    "discount_total": "500.00",
    "shipping_total": "0.00",
    "tax_total": "810.00",
    "grand_total": "5310.00",
    "applied_discount_codes": ["SUMMER10"],
    "applied_giftcard_codes": [],
    "applied_discounts": [
      {
        "code": "SUMMER10",
        "type": "percentage",
        "title": "10% Off Summer Bonanza",
        "value": "10",
        "savings": "500.00"
      }
    ],
    "itemCount": 2,
    "totalQuantity": 3,
    "hasStockIssues": false,
    "hasPriceChanges": false,
    "hasUnmergedGuestCart": false,
    "items": [
      {
        "id": "item-req-123",
        "product_id": "prod-456",
        "variant_id": null,
        "quantity": 2,
        "cost_price": "2000.00",
        "final_price": "2500.00",
        "discount_amount": "0.00",
        "line_subtotal": "5000.00",
        "line_total": "5000.00",
        "product_name": "Wireless Headphones",
        "product_image_url": "https://example.com/headphones.jpg",
        "product_sku": "WH-001",
        "inStock": true,
        "availableStock": 45,
        "priceChanged": false,
        "currentPrice": "2500.00",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Add To Cart

**Endpoint:** `POST /api/cart/items`

#### Request Body

```json
{
  "product_id": "prod-456",
  "variant_id": "var-789", // Optional
  "quantity": 1
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart": {
      "id": "cart-123",
      "grand_total": "2500.00"
      // ... stripped details ...
    },
    "items": [
      {
         // ... New cart item schema ...
      }
    ],
    "itemCount": 1
  }
}
```

### 3. Merge Guest Cart

**Endpoint:** `POST /api/cart/merge`

Moves all items from an unauthenticated `x-session-id` into the user's active, authenticated cart. Used predominantly right after login.

#### Request Body

```json
{
  "session_id": "guest-xyz-123"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Cart merged successfully",
  "data": {
    "merged": true,
    "cart_id": "user-cart-uuid",
    "itemCount": 5,
    "itemsMerged": 2,
    "totalItems": 5,
    "message": ""
  }
}
```

#### Common Error Responses

| Status | Error        | Description                              |
| ------ | ------------ | ---------------------------------------- |
| `400`  | Bad Request  | Invalid item quantities, product unlisted|
| `401`  | Unauthorized | Auth required (to merge carts specifically)|
| `404`  | Not Found    | Cart, Product, or Variant does not exist |

---

## Features

- **Guest Sessions**: Support for anonymous sessions via `x-session-id` mapping.
- **Cart Merge Strategies**: When guests login, their products in the guest cart automatically merge into their user cart. Overlapping products merge quantities while evaluating global limits.
- **Micro-Services Orchestration**: Uses split structural services (`core`, `item`, `merge`, `validation`, `calculation`) to prevent monolithic spaghetti code around checkout logic.
- **Live Price/Stock Evaluation**: Uses `cart-validation.service` to flag if a price in a saved cart changed compared to the active product table, preventing incorrect checkouts.
- **Background Jobs**: Incorporates a Cron job to automatically flush ancient abandoned guest carts to free database space.

## Dependencies

- **Product Feature**: Integrates with live product tables directly to evaluate real-time pricing and stock data.
- **User Feature**: Relies on robust UUID mapping for registered user baskets versus session baskets.
