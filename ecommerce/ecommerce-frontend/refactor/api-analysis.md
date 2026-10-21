# API Calls Analysis Report

> **Generated:** January 13, 2026  
> **Codebase:** anant-enterprises-frontend (Next.js App Router)

---

## Executive Summary

This document catalogs all API calls in the frontend codebase, grouped by feature, with usage type classification and refactor priority recommendations.

### Key Findings

| Metric | Count |
|--------|-------|
| Total API Endpoints | 42 |
| Client-Side Services | 6 |
| Server-Only Data Fetchers | 8 |
| Duplicate Logic Areas | 3 |
| High Priority Refactors | 5 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │   SERVER COMPONENTS  │     │   CLIENT COMPONENTS  │           │
│  │   (RSC / Route)      │     │   ('use client')     │           │
│  └──────────┬──────────┘     └──────────┬──────────┘           │
│             │                           │                       │
│             ▼                           ▼                       │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │ server-api-client   │     │    api-client.ts    │           │
│  │ + Data Layer fetch  │     │ + Service Layer     │           │
│  └──────────┬──────────┘     └──────────┬──────────┘           │
│             │                           │                       │
│             └───────────┬───────────────┘                       │
│                         ▼                                       │
│              ┌─────────────────────┐                           │
│              │   BACKEND API       │                           │
│              │   (localhost:8000)  │                           │
│              └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Clients

### 1. Client-Side API Client
**File:** `src/lib/api-client.ts`

| Property | Value |
|----------|-------|
| Usage Type | **Client-Safe** |
| Auth Method | Supabase Browser Session |
| Auto-Retry | Yes (401 token refresh) |
| Response Unwrap | `{ data: ... }` → unwrapped |

### 2. Server-Side API Client
**File:** `src/lib/server-api-client.ts`

| Property | Value |
|----------|-------|
| Usage Type | **Server-Only** |
| Auth Method | Server-side Supabase Session |
| Caching | Next.js ISR with tags |
| Functions | `serverFetch<T>`, `serverFetchPaginated<T>` |

---

## API Calls by Feature

### 🔐 Authentication Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/auth/auth.service.ts` | `/auth/password-reset/request` | POST | Client-Safe | No | Low |
| `src/services/auth/auth.service.ts` | `/auth/password-reset/confirm` | POST | Client-Safe | No | Low |
| `src/services/auth/auth.service.ts` | `/auth/refresh-token` | POST | Client-Safe | No | Low |
| `src/services/auth/auth.service.ts` | `/auth/sync-user` | POST | Client-Safe | Yes | Medium |
| `src/app/auth/callback/route.ts` | `/auth/sync-user` | POST | Server-Only | Yes | **High** |
| `src/proxy.ts` | `/auth/sync-user` | POST | Server-Only | Yes | **High** |

> [!WARNING]
> **Duplicate Logic Detected:** `/auth/sync-user` is called from 3 different places with identical logic. Should be consolidated into a single utility.

---

### 📦 Product Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/product/product.service.ts` | `/products` | GET | Client-Safe | No | Low |
| `src/services/product/product.service.ts` | `/products/{id}` | GET | Client-Safe | No | Low |
| `src/services/product/product.service.ts` | `/products/slug/{slug}` | GET | Client-Safe | No | Low |
| `src/services/product/product.service.ts` | `/products/{id}/similar` | GET | Client-Safe | No | Medium |
| `src/services/product/product.service.ts` | `/products/search` | GET | Client-Safe | No | Low |
| `src/lib/data/product/getRelatedProducts.ts` | `/products/{id}/related` | GET | Server-Only | No | Medium |
| `src/lib/data/product/getProductReviews.ts` | `/products/{id}/reviews` | GET | Server-Only | No | Low |
| `src/lib/data/product/getProductBundles.ts` | `/products/{id}/bundles` | GET | Server-Only | No | Low |
| `src/lib/data/product/getCategoryProducts.ts` | `/categories/{id}/products` | GET | Server-Only | No | Low |
| `src/lib/data/product/getBrandProducts.ts` | `/brands/{id}/products` | GET | Server-Only | No | Low |
| `src/lib/data/collection/getFilterOptions.ts` | `/products/filters` | GET | Server-Only | No | Low |

> [!NOTE]
> **Overlap Detected:** `/products/{id}/similar` (client) and `/products/{id}/related` (server) may serve the same purpose. Verify with backend and consolidate.

---

### 🛒 Cart Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/cart/cart.service.ts` | `/cart` | GET | Client-Safe | Hybrid* | Low |
| `src/services/cart/cart.service.ts` | `/cart/items` | POST | Client-Safe | Hybrid* | Low |
| `src/services/cart/cart.service.ts` | `/cart/items/{id}` | PUT | Client-Safe | Hybrid* | Low |
| `src/services/cart/cart.service.ts` | `/cart/items/{id}` | DELETE | Client-Safe | Hybrid* | Low |
| `src/services/cart/cart.service.ts` | `/cart` | DELETE | Client-Safe | Hybrid* | Low |
| `src/services/cart/cart.service.ts` | `/cart/merge` | POST | Client-Safe | Yes | Medium |

> *Hybrid: Uses `Authorization` header for authenticated users OR `x-session-id` for guests

---

### 🏷️ Discount Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/discount/discount.service.ts` | `/cart/discount` | POST | Client-Safe | Hybrid* | Low |
| `src/services/discount/discount.service.ts` | `/cart/discount` | DELETE | Client-Safe | Hybrid* | Low |
| `src/services/discount/discount.service.ts` | `/cart/discount/{code}` | DELETE | Client-Safe | Hybrid* | Low |

> [!WARNING]
> **Duplicate Logic Detected:** `getDiscountHeaders()` in discount.service.ts duplicates `getCartHeaders()` in cart.service.ts

---

### 📋 Order Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/order/order.service.ts` | `/orders` | POST | Client-Safe | Yes | Low |
| `src/services/order/order.service.ts` | `/orders` | GET | Client-Safe | Yes | Low |
| `src/services/order/order.service.ts` | `/orders/{id}` | GET | Client-Safe | Yes | Low |
| `src/services/order/order.service.ts` | `/orders/{id}/cancel` | POST | Client-Safe | Yes | Low |

---

### 💳 Payment Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/order/order.service.ts` | `/payments/create-order` | POST | Client-Safe | Yes | Low |
| `src/services/order/order.service.ts` | `/payments/verify` | POST | Client-Safe | Yes | Low |
| `src/services/order/order.service.ts` | `/payments/retry` | POST | Client-Safe | Yes | Low |

---

### 👤 User/Profile Feature

| File Path | Endpoint | Method | Usage Type | Auth | Priority |
|-----------|----------|--------|------------|------|----------|
| `src/services/user/user.service.ts` | `/users/me` | GET | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}` | PATCH | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}/addresses` | GET | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}/addresses` | POST | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}/addresses/{addressId}` | PUT | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}/addresses/{addressId}` | DELETE | Client-Safe | Yes | Low |
| `src/services/user/user.service.ts` | `/users/{id}/addresses/{addressId}/default` | PATCH | Client-Safe | Yes | Low |

---

## React Query Hooks (Client State)

| Hook File | Service Used | Features |
|-----------|--------------|----------|
| `src/hooks/useCart.ts` | `CartService` | Optimistic updates, cache invalidation |
| `src/hooks/queries/useAddresses.ts` | `UserService` | CRUD mutations with toast |
| `src/hooks/queries/orders/useOrders.ts` | `OrderService` | List + detail queries, payment mutations |
| `src/hooks/useRazorpay.ts` | `OrderService` | Payment flow orchestration |

---

## Identified Duplications

### 1. Auth Sync (High Priority)

```
Locations:
├── src/services/auth/auth.service.ts     → AuthService.syncUser()
├── src/app/auth/callback/route.ts        → Direct fetch
└── src/proxy.ts                          → syncUserToBackend()
```

**Recommendation:** Create a shared `syncUserToBackend` utility in `src/lib/utils/auth-utils.ts` and import it in all locations.

---

### 2. Cart Headers Construction (Medium Priority)

```
Locations:
├── src/services/cart/cart.service.ts     → getCartHeaders()
└── src/services/discount/discount.service.ts → getDiscountHeaders()
```

**Recommendation:** Extract to `src/lib/utils/cart-headers.ts` and share.

---

### 3. Product Similar vs Related (Low Priority)

```
Locations:
├── src/services/product/product.service.ts   → /products/{id}/similar
└── src/lib/data/product/getRelatedProducts.ts → /products/{id}/related
```

**Recommendation:** Verify if these are different endpoints. If same, consolidate to server-only version for better caching.

---

## Usage Type Legend

| Type | Description | Where Used |
|------|-------------|------------|
| **Server-Only** | Uses `server-api-client.ts` or direct fetch with `next: { revalidate }`. Only in RSC or Route Handlers. | Data layer, API routes |
| **Client-Safe** | Uses `api-client.ts` with browser Supabase session. Can be used in `'use client'` components. | Services, React Query hooks |
| **Shared** | Could be used in both contexts but currently only used in one. | N/A (none currently) |
| **Hybrid** | Supports both authenticated (JWT) and guest (session ID) modes | Cart, Discount services |

---

## Refactor Priority Summary

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| 🔴 High | Consolidate auth sync logic | Reduces bugs, single source of truth | Low |
| 🔴 High | Extract cart headers utility | DRY principle, maintainability | Low |
| 🟡 Medium | Review similar vs related APIs | API simplification | Medium |
| 🟡 Medium | Add TypeScript strict mode to services | Type safety | Medium |
| 🟢 Low | Add error boundary for API failures | UX improvement | Low |

---

## File Reference Table (Complete)

| File Path | API Endpoint(s) | Usage Type | Priority |
|-----------|----------------|------------|----------|
| `src/lib/api-client.ts` | Core client wrapper | Client-Safe | - |
| `src/lib/server-api-client.ts` | Core server wrapper | Server-Only | - |
| `src/services/auth/auth.service.ts` | 4 endpoints | Client-Safe | Medium |
| `src/services/cart/cart.service.ts` | 6 endpoints | Client-Safe | Low |
| `src/services/discount/discount.service.ts` | 3 endpoints | Client-Safe | Medium |
| `src/services/order/order.service.ts` | 7 endpoints | Client-Safe | Low |
| `src/services/product/product.service.ts` | 5 endpoints | Client-Safe | Low |
| `src/services/user/user.service.ts` | 7 endpoints | Client-Safe | Low |
| `src/lib/data/product/getRelatedProducts.ts` | 1 endpoint | Server-Only | Medium |
| `src/lib/data/product/getProductReviews.ts` | 1 endpoint | Server-Only | Low |
| `src/lib/data/product/getProductBundles.ts` | 1 endpoint | Server-Only | Low |
| `src/lib/data/product/getCategoryProducts.ts` | 1 endpoint | Server-Only | Low |
| `src/lib/data/product/getBrandProducts.ts` | 1 endpoint | Server-Only | Low |
| `src/lib/data/collection/getFilterOptions.ts` | 1 endpoint | Server-Only | Low |
| `src/app/auth/callback/route.ts` | 1 endpoint | Server-Only | **High** |
| `src/proxy.ts` | 1 endpoint | Server-Only | **High** |
| `src/hooks/useCart.ts` | Uses CartService | Shared Hook | Low |
| `src/hooks/useRazorpay.ts` | Uses OrderService | Shared Hook | Low |
| `src/hooks/queries/useAddresses.ts` | Uses UserService | Shared Hook | Low |
| `src/hooks/queries/orders/useOrders.ts` | Uses OrderService | Shared Hook | Low |

---

## Next Steps

1. **Immediate:** Consolidate the 3 auth sync implementations
2. **Short-term:** Extract shared cart headers utility
3. **Medium-term:** Review and potentially merge similar/related product endpoints
4. **Long-term:** Consider moving more endpoints to server-only for better caching

---

*Report generated by analyzing the codebase structure and API patterns.*
