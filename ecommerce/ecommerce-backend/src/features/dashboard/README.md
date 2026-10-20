# Dashboard Feature

## Overview

The Dashboard feature acts as a centralized administrative reporting engine. It orchestrates massive parallel queries across nearly every backend module to provide a real-time snapshot of the database, serving the main storefront administration panel.

## Structure

```
dashboard/
├── index.ts              # Route generation and exports
└── apis/                 # HTTP endpoints
    └── get-stats.ts      # Main aggregation endpoint
```

## API Routes

All endpoints are mounted under `/api/dashboard`.

- `GET /stats` - Retrieve an aggregated payload of all core database metrics

## Authentication Requirements

| Endpoint     | Authentication | Authorization                   |
| ------------ | -------------- | ------------------------------- |
| `GET /stats` | ✅ Required    | Admin User (Standard JWT rules) |

---

## Endpoints Data Formats

### 1. Get Administrative Statistics

**Endpoint:** `GET /api/dashboard/stats`

Performs a `Promise.all` execution of over 18 distinct Drizzle queries across multiple tables (Users, Products, Orders, Blogs, Tiers, Tags, Audit Logs) to build a unified statistical payload. 

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalCustomers": 1250,
    "totalProducts": 450,
    "totalBlogs": 24,
    "totalTiers": 4,
    "totalTags": 58,
    "pendingInvitations": 2,
    "customersThisMonth": 45,
    "recentProducts": [
      {
        "id": "prod-123",
        "title": "Summer Collection T-Shirt",
        "sku": "TSH-SUM-001",
        "status": "active",
        "sellingPrice": "29.99",
        "primaryImageUrl": "https://example.com/image.jpg",
        "createdAt": "2024-03-01T10:30:00.000Z"
      }
    ],
    "recentCustomers": [
      {
        "id": "user-456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profileImageUrl": null,
        "createdAt": "2024-03-01T11:45:00.000Z"
      }
    ],
    "recentActivity": [
      {
        "id": 1042,
        "action": "CREATE",
        "resourceType": "PRODUCT",
        "resourceId": "prod-123",
        "userEmail": "admin@store.com",
        "created_at": "2024-03-01T10:30:05.000Z"
      }
    ],
    "orderStats": {
      "totalOrders": 3450,
      "pendingOrders": 12,
      "confirmedOrders": 45,
      "processingOrders": 89,
      "shippedOrders": 120,
      "deliveredOrders": 3100,
      "cancelledOrders": 84
    },
    "tagsByType": [
      {
        "type": "product",
        "count": 42
      },
      {
        "type": "blog",
        "count": 16
      }
    ],
    "tiersByLevel": [
      {
        "level": 1,
        "count": 800
      },
      {
        "level": 2,
        "count": 450
      }
    ]
  }
}
```

#### Error Responses

| Status | Error        | Description                               |
| ------ | ------------ | ----------------------------------------- |
| `401`  | Unauthorized | Missing or invalid Authentication token   |

---

## Features

- **Massive Parallel Execution**: Utilizes `Promise.all` across 19 separate database calls mapping to 8 unique tables concurrently, drastically reducing the round-trip latency to the SQL server.
- **Drizzle Metric Aggregations**: Features native `count(*)::int` cast aggregations alongside standard active/inactive boolean filters directly within the query.

## Dependencies

Because the Dashboard acts as an aggregator, it strictly depends on the Drizzle schema shapes exported by almost every other feature:

- `users` (User Feature)
- `products` (Product Feature)
- `blogs` (Blog Feature)
- `tags` (Tags Feature)
- `tiers` (Tiers Feature)
- `invitations` (Admin Invite Feature)
- `orders` (Orders Feature)
- `auditLogs` (Audit Feature)
