# Wishlist Feature

## Overview

The Wishlist feature provides the backend architecture for the e-commerce "save-for-later" capabilities. It allows the platform to store curated lists of products mapped to specific users, tracking chronological additions, and bridging directly to the Cart module for seamless checkout conversions.

> **⚠️ Architectural Note (Version 2.0):**
> This module was recently refactored to be **Admin-Only** at the API layer. All direct user-facing routes (e.g., `POST /api/wishlist/items`) have been removed. This API now exists strictly for administrative overrides, customer support tooling, and server-side integrations.

## Structure

```
wishlist/
├── index.ts
├── apis/
│   ├── add-to-wishlist.ts
│   ├── get-wishlist.ts
│   ├── move-to-cart.ts
│   └── remove-from-wishlist.ts
├── services/
│   ├── index.ts
│   └── wishlist.service.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── queries.ts
    ├── validation.ts
    ├── wishlist-items.schema.ts
    └── wishlist.schema.ts
```

## API Routes

Because this feature operates as an administrative support tool, all endpoints actively target a specific `/:userId` in the path, rather than relying implicitly on the authenticated user's JWT token.

### Endpoints (Admin Only)

**Core Operations**
- `GET /:userId/wishlist` - Retrieves the targeted user's complete wishlist, enriched with real-time `selling_price`, `availableStock`, and aggregated `reviews`.
- `POST /:userId/wishlist/:productId` - Forces a specific product into the targeted user's wishlist. Optionally accepts an internal `notes` string.
- `DELETE /:userId/wishlist/:productId` - Forcibly removes a saved item from the targeted user's wishlist.

**Cross-Feature Conversions**
- `POST /:userId/wishlist/:productId/move-to-cart` - Seamlessly bridges the Wishlist to the `cart` feature. It checks active stock limitations, pushes the item into the targeted user's active Cart session, and natively accepts a `remove_from_wishlist` boolean to clean up the saved item simultaneously.

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| View User's Wishlist              | `GET /*`                | Admin (`users:read`)                |
| Modify Wishlist or Move to Cart   | `POST /*`, `DELETE /*`  | Admin (`users:write`)               |

*Note: There are currently **zero** public or standard-user authenticated routes in this module.*

---

## Architecture & Implementation

### 1. Two-Tiered Schema Logic
The storage mechanism utilizes a standard e-commerce header-line-item split:
- **`wishlists.schema.ts`**: The header table. A user can only possess one active wishlist. If a user does not have a wishlist, the backend automatically generates this header row upon the very first `POST` to add an item.
- **`wishlist-items.schema.ts`**: The line items. Maps the `wishlist_id` to the `product_id`. It includes rich chronological tracking such as `added_at`, `added_to_cart_at` (for conversion metrics), and `purchased_at`.

### 2. Real-Time Drizzle Enrichment
The `get-wishlist.ts` endpoint does not simply return static cached data. Products rapidly change pricing and stock over time. The module utilizes complex subqueries stored in `shared/queries.ts` to enrich the response dynamically:
1. `getProductStockSubquery()` - Calculates exact remaining inventory on the fly.
2. `getProductRatingSubquery()` - Aggregates the latest 1-5 star ratings from the Reviews schema.

### 3. The Move-To-Cart Pipeline
The heaviest logic resides in `move-to-cart.ts`. When triggered, the backend initiates a transaction:
1. Validates the physical Product still exists (`is_deleted = false`).
2. Confirms adequate internal Inventory stock exists to fulfill the requested `quantity`.
3. Interacts with the `cart` feature's service layer to append the line item.
4. Optionally triggers the `remove-from-wishlist.ts` logic to delete the saved item.
