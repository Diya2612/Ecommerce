# Payments Feature

## Overview

The Payments feature is the dedicated authorization and settlement gateway for the platform. Specifically designed around Razorpay integration, it manages the entire transaction lifecycle—from generating secure client-side order IDs to idempotently processing incoming webhooks. It natively handles standard payments, Cash on Delivery (COD) workflows, robust automated retry loops, and administrative refund operations.

## Structure

```
payments/
├── index.ts
├── apis/
│   ├── admin-create-payment-order.ts
│   ├── admin-verify-payment.ts
│   ├── create-payment-order.ts
│   ├── get-admin-payment-history.ts
│   ├── get-payment-key.ts
│   ├── initiate-refund.ts
│   ├── payment-history.ts
│   ├── payment-status.ts
│   ├── retry-payment.ts
│   ├── verify-payment.ts
│   └── webhook-handler.ts
├── services/
│   ├── payment-lock.service.ts
│   ├── payment.service.ts
│   └── razorpay.service.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── payment-transactions.schema.ts
    ├── queries.ts
    ├── validation.ts
    └── webhook-logs.schema.ts
```

## API Routes

All user routes are mounted under `/api/payments`. Operational and support endpoints are secured under `/api/admin/payments`. Webhooks are publicly exposed but rigidly shielded via cryptographic signature validation.

### Endpoints

**User Checkout Endpoints**
- `GET /key` - Retrieve the public Razorpay API key for frontend injection
- `POST /order` - Initialize a Razorpay `order_id` map or register a COD request
- `POST /verify` - Finalize the payment actively captured by the frontend client
- `POST /retry` - Generate a fresh `order_id` specifically for a previously failed transaction
- `GET /status` - Query the aggregated timeline state of a specific order
- `GET /history` - List all generic transaction payloads for the user

**Admin Endpoints & System Hooks**
- `POST /admin/order` - Generate a direct payment link internally
- `POST /admin/verify` - Manually force verification (bypassing Client & Webhook)
- `GET /admin/history` - Comprehensive table of all system transactions
- `POST /admin/refund` - Trigger partial or full monetary returns and adjust database models
- `POST /webhook` - Publicly exposed listener for Razorpay server-to-server updates

## Authentication Requirements

| Action                            | Endpoint                  | Authorization                       |
| --------------------------------- | ------------------------- | ----------------------------------- |
| Generate Checkout Orders, Verify  | `POST /order/verify/retry`| Authenticated User (Owner Only)     |
| Fetch Payment Status              | `GET /status/history`     | Authenticated User (Owner Only)     |
| View Platform History             | `GET /admin/history`      | `payments:read` / Admin             |
| Issue Refunds, Force Verify       | `POST /admin/*`           | `payments:update` / Admin           |
| Cryptographic Webhook             | `POST /webhook`           | Valid Razorpay `x-razorpay-signature`|

---

## Endpoints Data Formats

### 1. Initialize Payment Order (User Checkout Flow)

**Endpoint:** `POST /api/payments/order`

Receives an internal database `order_id` (created by the `Orders` module) and delegates an actual monetary request mapped via Razorpay.

#### Request Body

```json
{
  "order_id": "uuid-checkout-order-1234",
  "payment_method": "razorpay" 
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_Pi88Xw81xXyabc",
    "razorpay_key_id": "rzp_test_YourKey123",
    "amount": 129900, 
    "currency": "INR",
    "order_id": "uuid-checkout-order-1234",
    "order_number": "ORD-2024-001234",
    "theme": { "color": "#0066FF" }
  }
}
```
*(Note: `amount` is returned in the smallest currency subunit, e.g., paise for INR)*

### 2. Verify Client Payment (User Checkout Flow)

**Endpoint:** `POST /api/payments/verify`

The frontend intercepts the Razorpay successful callback and securely passes the exact cryptographic strings back to the backend.

#### Request Body

```json
{
  "order_id": "uuid-checkout-order-1234",
  "razorpay_order_id": "order_Pi88Xw81xXyabc",
  "razorpay_payment_id": "pay_Pj99Zz92xXzfed",
  "razorpay_signature": "a3b...crypto...hash"
}
```

### 3. Initiate Refund (Admin workflow)

**Endpoint:** `POST /api/admin/payments/refund`

Triggers external portal reversals safely without requiring admins to log into Razorpay directly.

#### Request Body

```json
{
  "order_id": "uuid-checkout-order-1234",
  "amount": 500,
  "reason": "Customer requested partial return",
  "refund_speed": "optimum"
}
```

---

## Features

- **Concurrency Locks**: High traffic poses identical charge collision risks during checkouts. The `payment-lock.service.ts` uses internal Redis/DB mutex logic (`PaymentLockService.withLock(order_id)`) ensuring an order cannot be processed by the Webhook trigger and Client trigger simultaneously.
- **Idempotency Webhooks**: The `webhook-handler` actively populates the `payment_webhook_logs` audit table. Every raw Razorpay `payment.captured` POST is logged with a unique `event_id` hash ensuring the backend *never* blindly applies duplicate updates regardless of network retry spikes.
- **Micro-Service Orchestration**:
  - `payment.service.ts`: Central logical orchestrator mapping inputs/outputs.
  - `razorpay.service.ts`: Low-level physical wrapper around the `razorpay-node` SDK. Allows easily swapping or abstracting gateways in the future.
- **Automated Dependency Actions**: Actively updates the standalone `Orders` database records mapping `payment_status` arrays, and automatically fires the queue to physically generate PDF compliance PDFs (`publishGenerateInvoice`) once payments fully conclude.

## Dependencies

- **Orders Feature**: Operates completely entirely downstream of the Orders system, resolving ONLY `total_amount` values already calculated server-side previously. 
- **Invoices**: Lazily delegates physical taxation receipt documents upon verified authorization stages.
- **Discount Models**: Listens and actively records explicit `discount_usage` mutations to restrict finite coupon redemptions explicitly when payments lock.
