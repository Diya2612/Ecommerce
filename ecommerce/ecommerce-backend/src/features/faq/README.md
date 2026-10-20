# FAQ Feature

## Overview

The FAQ (Frequently Asked Questions) feature allows administrators to structurally manage common queries answered across the storefront. It categorizes questions into strict predefined sections (like `shipping`, `returns`, and `orders`), handles visibility statuses, and provides an integrated bulk import/export pipeline for managing dozens of answers simultaneously.

## Structure

```
faq/
├── index.ts                      # Route exports & class registration
├── apis/                         # HTTP endpoints
│   ├── get-faqs.ts               # Public/Admin: Paginated list + search
│   ├── get-faq-by-id.ts          # Public/Admin: Fetch specific entry
│   ├── create-faq.ts             # Admin: Create new question
│   ├── update-faq.ts             # Admin: Update existing
│   ├── delete-faq.ts             # Admin: Soft delete
│   ├── import-faqs.ts            # Admin: Bulk upload from CSV
│   └── export-faqs.ts            # Admin: Download filtered CSV
├── services/                     # Business Logic
│   ├── faq.service.ts            # Core CRUD operations
│   ├── faq-export.service.ts     # Parsing logic for CSV generation
│   └── faq-import.service.ts     # UPSERT mapping logic
└── shared/                       # Models & validation
    ├── faq.schema.ts             # Drizzle table structure
    ├── interface.ts              # Canonical TS response mappings
    ├── queries.ts                # Filtering search strings
    ├── validation.ts             # Zod input schemas
    └── index.ts
```

## API Routes

All routes are mounted under `/api/faqs`. Modifying routes require **Administrative access**, while fetching acts contextually based on the user's Token.

### Endpoints

- `GET /` - Retrieve a paginated list of FAQs (Admins see inactive, users see only active)
- `GET /:id` - Retrieve a specific FAQ
- `POST /` - Create a new FAQ entry
- `PUT /:id` - Edit a specific FAQ
- `DELETE /:id` - Soft-delete an FAQ
- `POST /import` - Bulk create/update from an array via an uploaded CSV map
- `POST /export` - Extract entries down to a CSV string

## Authentication Requirements

| Endpoint                               | Authentication | Authorization                    |
| -------------------------------------- | -------------- | -------------------------------- |
| `GET /`, `GET /:id`                    | ❌ Optional    | None (Admins see inactive items) |
| `POST /`, `PUT /:id`, `DELETE /:id`    | ✅ Required    | `faqs:create/update/delete`      |
| `POST /import`, `POST /export`         | ✅ Required    | `faqs:create` & `faqs:read`      |

---

## Endpoints Data Formats

### 1. Get FAQs

**Endpoint:** `GET /api/faqs`

Returns paginated FAQs. Note: Unauthorized requests inherently mutate the incoming `status` filter to only return `active` questions to the client.

#### Query Parameters

- `page`: default 1
- `limit`: default 10
- `search`: string (checks `question` / `answer` bodies)
- `section`: Enum (`general`, `account`, `orders`, `payments`, `shipping`, `returns`, `products`, `policies`)
- `status`: `all` | `active` | `inactive` (Admins only)

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "FAQs retrieved successfully",
  "data": {
    "faqs": [
      {
        "id": "uuid-1234",
        "question": "How do I return a product?",
        "answer": "You can return a product within 30 days of purchase.",
        "section": "returns",
        "position": 1,
        "status": true,
        "created_at": "2024-03-01T10:30:00.000Z",
        "updated_at": "2024-03-05T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

### 2. Create FAQ (Admin)

**Endpoint:** `POST /api/faqs`

#### Request Body

```json
{
  "question": "Do you ship internationally?",
  "answer": "Yes, we ship to over 100 countries globally.",
  "section": "shipping",
  "position": 0,
  "status": true
}
```

### 3. Import FAQs (Admin)

**Endpoint:** `POST /api/faqs/import`

Allows the `Admin` portal to mass inject pre-written FAQs mapped from a CSV file upload.

#### Request Body

```json
{
  "mode": "upsert",
  "data": [
    {
      "question": "Can I cancel my order?",
      "answer": "Yes, within the first 2 hours.",
      "section": "orders"
    }
  ]
}
```

---

## Features

- **Categorized Sections**: Enforces an 8-type `sectionIdx` enum boundary (`general`, `account`, `orders`, `payments`, `shipping`, `returns`, `products`, `policies`) to easily map different frontend pages to different lists.
- **Contextual Access Fetching**: `get-faqs.ts` uses the `userHasPermission` wrapper internally. Unauthenticated storefront visitors fetching FAQs are strictly returned only `active` FAQs, while authorized Admins receive `inactive` drafts included.
- **Bulk UPSERT Mode**: The `/import` endpoint handles a `mode` flag (`create` | `update` | `upsert`). When passed as `upsert` and an `id` is matched inside the generic upload array, it modifies the original; otherwise, it creates entirely new records in a single batch.

## Dependencies

- **User Feature**: Relies on `users.schema.ts` explicitly connecting the `created_by` and `updated_by` trace logs back to an administrator's internal identity. 
- **RBAC Feature**: Heavily dictates the contextual behaviors within the single `get-faqs` route determining whether the client represents a dashboard or a storefront user.
