# Notifications Feature

## Overview

The Notifications feature is a fully refactored, robust, production-ready (v2.0) subsystem. It governs an omni-channel delivery architecture (in-app, email, SMS, push) and orchestrates message rendering via reusable dynamic templates. It maintains granular user preferences (channels, frequency, quiet hours) and tracks all physical delivery attempts via distinct logging mechanisms.

## Structure

```
notifications/
├── index.ts
├── apis/
│   ├── admin-broadcast-notification.ts
│   ├── admin-create-template.ts
│   ├── admin-get-stats.ts
│   ├── admin-get-templates.ts
│   ├── admin-update-template.ts
│   ├── delete-notification.ts
│   ├── get-notification-by-id.ts
│   ├── get-notification-preferences.ts
│   ├── get-unread-count.ts
│   ├── get-user-notifications.ts
│   ├── mark-all-notifications-read.ts
│   ├── mark-notification-read.ts
│   └── update-notification-preferences.ts
├── services/
│   ├── delivery.service.ts
│   ├── index.ts
│   ├── notification-action.service.ts
│   ├── notification-core.service.ts
│   ├── notification-read.service.ts
│   ├── preference.service.ts
│   └── template.service.ts
└── shared/
    ├── constants.ts
    ├── index.ts
    ├── interface.ts
    ├── notification-delivery-logs.schema.ts
    ├── notification-enums.schema.ts
    ├── notification-preferences.schema.ts
    ├── notification-templates.schema.ts
    ├── notifications.schema.ts
    ├── queries.ts
    └── validation.ts
```

## API Routes

All routes are mounted under `/api/notifications`. This module strictly governs both User interactions (reading/marking as read) and Administrative capabilities (broadcasting/template generation).

### Endpoints

**User Endpoints**
- `GET /` - List all notifications for the token owner (paginated)
- `GET /unread-count` - Get unread count specifically
- `GET /preferences` - Retrieve the user's granular preferences
- `PUT /preferences` - Update user preference rules
- `PATCH /read-all` - Mark all notifications as read efficiently
- `GET /:id` - Get a specific notification
- `PATCH /:id/read` - Mark a specific notification as read
- `DELETE /:id` - Soft delete a specific notification

**Admin Endpoints**
- `POST /admin/broadcast` - Dispatch push messages to massive user blocks
- `GET /admin/stats` - Retrieve delivery heuristics and metrics
- `GET /admin/templates` - Fetch dynamic template strings
- `POST /admin/templates` - Create a new formatting template
- `PUT /admin/templates/:code` - Modify an existing template string

## Authentication Requirements

| Endpoint                                       | Authentication | Authorization                       |
| ---------------------------------------------- | -------------- | ----------------------------------- |
| `GET /`, `PATCH /` (User interactions)         | ✅ Required    | Standard authenticated User Token   |
| `GET /preferences`, `PUT /preferences`         | ✅ Required    | Standard authenticated User Token   |
| `POST /admin/broadcast`                        | ✅ Required    | `notifications:create` / Admin      |
| `GET /admin/stats`, `/admin/templates`         | ✅ Required    | `notifications:read` / Admin        |
| `POST /admin/templates`, `PUT /admin/templates`| ✅ Required    | `notifications:update` / Admin      |

---

## Endpoints Data Formats

### 1. Update Notification Preferences (User)

**Endpoint:** `PUT /api/notifications/preferences`

Allows users to granularly control what they listen to, blocking SMS spam while retaining in-app pushes.

#### Request Body

```json
{
  "type": "order_created",
  "preferences": {
    "channel_email": true,
    "channel_sms": false,
    "channel_in_app": true,
    "frequency": "immediate"
  }
}
```

### 2. Create Notification via Template (Internal Core Service)

While not a direct public endpoint payload, the `notification-core.service.ts` heavily leverages this localized DTO structure to mutate physical `{{variable}}` placements dynamically.

#### Internal Payload Example

```json
{
  "userId": "user-uuid",
  "templateCode": "ORDER_CREATED",
  "variables": {
    "userName": "John Doe",
    "orderNumber": "ORD-12345",
    "total": "1299.00",
    "currency": "INR"
  },
  "priority": "high",
  "actionUrl": "/orders/12345",
  "actionText": "View Order"
}
```

### 3. Admin Broadcast

**Endpoint:** `POST /api/notifications/admin/broadcast`

Administratively dispatch a raw message mapping to hundreds of users explicitly.

#### Request Body

```json
{
  "userIds": ["user-1-uuid", "user-2-uuid"],
  "title": "System Maintenance",
  "message": "We will be performing maintenance on Feb 20, 2026",
  "type": "admin_broadcast",
  "priority": "high"
}
```

---

## Features

- **Multi-Channel Delivery Engine**: The `delivery.service.ts` fundamentally handles orchestrating physical pushes to `email`, `sms`, `push`, and `in-app` interfaces via respective external providers.
- **Physical Delivery Logging**: Any message attempting an external dispatch immediately spawns an audit trail footprint within the `notification-delivery-logs` table detailing exactly when the webhook bounced or succeeded.
- **WebSocket Real-Time Engine**: Built natively around socket hooks. If an endpoint triggers a `createFromTemplate`, the core automatically fires live WS pushes without requiring the frontend to poll the `GET /unread-count` endpoint.
- **Dynamic Handlebars Templates**: Resolves localized `{{UserName}}` JSON variables seamlessly merging backend data directly into HTML templates stored securely inside the `notification_templates` architecture.

## Dependencies

- **User Feature**: Extremely tightly coupled to authenticating generic `user_ids` and interpreting WebSocket connections per explicitly attached ID. 
- **Sockets**: Directly invokes centralized socket services outside its domain to trigger live state updates across storefront panels.
