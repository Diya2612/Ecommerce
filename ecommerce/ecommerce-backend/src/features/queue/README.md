# Queue System Feature

## Overview

The Queue feature implements a robust, background job processing system utilizing **BullMQ** and **Redis**. Rather than blocking the main HTTP thread during complex operations (e.g., generating PDFs, dispatching emails, syncing inventory), the backend delegates these asynchronous tasks into isolated Publisher/Consumer queues for highly scalable, durable execution.

## Structure

```
queue/
├── index.ts
├── apis/
│   ├── clear-queue.ts
│   ├── get-queue-jobs.ts
│   ├── get-queue-status.ts
│   ├── get-queues.ts
│   └── retry-failed-jobs.ts
├── jobs/
│   └── index.ts
├── services/
│   ├── event-publisher.service.ts
│   ├── queue.service.ts
│   └── workers/
│       ├── discount.worker.ts
│       ├── index.ts
│       ├── inventory.worker.ts
│       ├── invoice.worker.ts
│       ├── notification.worker.ts
│       ├── order.worker.ts
│       └── payment.worker.ts
└── shared/
    ├── config.ts
    ├── interface.ts
    └── types.ts
```

## API Routes

All APIs here are strict administrative tooling mounted under `/api/admin/queue`. Since queueing happens internally via services, no user-facing endpoints exist for this module.

### Endpoints (Admin Only)

- `GET /` - Retrieve the names and aggregate metadata of all active Redis queues
- `GET /:queueName/status` - View health metrics (Waiting, Active, Failed, Completed) for a specific queue
- `GET /:queueName/jobs` - Paginate through specific jobs within a queue's history
- `POST /:queueName/retry` - Forcefully re-run all jobs marked as `failed` in a specific queue
- `POST /:queueName/clear` - Destructively purge the entire queue memory (Useful for stuck loops)

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| Monitor Queues, View Jobs         | `GET /admin/queue/*`    | `admin:system` permission           |
| Purge Memory, Retry Jobs          | `POST /admin/queue/*`   | `admin:system` permission           |

---

## Architecture & Implementation

The system follows a strict Producer-Consumer pattern utilizing BullMQ instances.

### 1. The Producer (`EventPublisherService`)
Whenever a module completes an action (like `Payments` verifying a transaction), it does not directly call the `Invoice` PDF generator. Instead, it invokes the central `EventPublisherService`:

```typescript
// Payment Service
await eventPublisher.publishGenerateInvoice({
  orderId: dbOrder.id,
  reason: 'INITIAL',
});
```
This wrapper structures the payload and immediately injects it into the respective Redis Queue list, instantly freeing the HTTP thread to return `200 OK` to the user.

### 2. The Queue Manager (`QueueService`)
Governs the physical connection states to the Redis cluster. It exposes internal configurations indicating concurrency constraints (how many jobs can run at once per node) and retry strategies (e.g., exponential backoff if an email API fails).

### 3. The Consumers (`services/workers/`)
Dedicated worker scripts constantly poll the Redis Queues. When a job drops into the `invoice` queue, the `invoice.worker.ts` picks it up, physically runs the PDF generation logic, and marks the job as `Completed`.

---

## Active Event Domains

The backend actively monitors and distributes events through the following grouped domains:

### Queue: `orders`
- `ORDER_CREATED`: Triggers initial setup and generic confirmation routing.
- `ORDER_PAID`: Confirms payment and triggers status evolutions.
- `ORDER_SHIPPED` / `ORDER_CANCELLED`: Triggers teardown or fulfillment tracking.

### Queue: `payments`
- `PAYMENT_AUTHORIZED`: Authorized via the gateway.
- `PAYMENT_REFUNDED`: Reversal verified successfully.

### Queue: `inventory`
- `INVENTORY_RESERVED`: Temporarily pulls stock out of circulation.
- `INVENTORY_RELEASED`: Restores stock into circulation (abandoned carts).
- `LOW_STOCK_ALERT`: Triggers warnings to administrators.

### Queue: `notifications`
- `send-notification`: Main engine mapping generic payloads to the templating engine for Omni-Channel dispatch.
- `batch-notification`: Identical dispatch but maps across an array of user IDs.

### Queue: `invoices`
- `generate-invoice`: The heavy PDF generation engine compiling the `PDFKit` document and uploading it to cloud storage.

### Queue: `discounts`
- `record-usage`: Async increments of usage counters to prevent transactional slowdowns during high-traffic checkouts.

---

## Deployment & Scaling

For maximum throughput, the Worker processing layer can be decoupled from the primary HTTP API Servers.

1. Set `QUEUE_WORKERS_ENABLED=false` on the web-facing API server instances in `.env` to prevent them from picking up heavy background jobs.
2. Deploy a distinct NodeJS pod explicitly running the workers (using `QUEUE_WORKERS_ENABLED=true`) connected to the same Redis cluster. This ensures CPU-heavy tasks like `generate-invoice` do not throttle User API latency.
