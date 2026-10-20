# Invoice Feature

## Overview

The Invoice feature acts as the overarching financial document generation system. It strictly binds to the `orders` table and uses immutable versioning (`invoice_versions.schema.ts`) to ensure that if an order changes post-purchase, the original invoice snapshot remains intact for compliance. It includes a native PDF generation engine utilizing `pdfkit` to build complex India-compliant (CGST/SGST/IGST) tax documents dynamically.

## Structure

```
invoice/
├── index.ts                      # Route exports & class registration
├── config/
│   └── invoice.config.ts         # Static templates and company details
├── apis/                         # HTTP endpoints
│   ├── get-order-invoice.ts      # Auth: Fetch latest invoice (or lazy generate)
│   ├── get-invoices-for-order.ts # Admin: List all versions for a specific order
│   ├── generate-invoice.ts       # Admin: Force an immutable new version
│   ├── download-invoice.ts       # Auth: Download generated PDF endpoint
│   └── resend-invoice-email.ts   # Admin: Resend PDF explicitly
├── services/                     # Business Logic
│   ├── invoice.service.ts        # Orchestrates schema writes and queries
│   ├── invoice-calculator.service.ts # Performs math scaling for partial refunds
│   └── pdf-generator.service.ts  # Draws the physical layout using PDFKit
└── shared/                       # Models & validation
    ├── invoice.schema.ts         # Primary tracking row (draft/generated statuses)
    ├── invoice-versions.schema.ts# Immutable snapshots (Customer/Tax/Addresses at time of T1)
    ├── invoice-line-items.schema.ts # Immutable array of purchasing subsets
    ├── interface.ts              # Canonical DTO types
    ├── queries.ts                # Drizzle join fragments
    ├── validation.ts             # Zod input schemas
    └── index.ts                  
```

## API Routes

All routes are mounted under `/api/invoices`. 

### Endpoints

- `GET /orders/:id/invoices/latest` - Fetch the most recent generated invoice details.
- `GET /orders/:id/invoices` - List historical instances and corrections. (Admin)
- `POST /orders/:id/invoices` - Generate a new iteration (e.g. `REFUND`) (Admin)
- `GET /:id/download` - Buffer stream serving the raw PDF file.
- `POST /:id/resend` - Triggers email pipeline dispatch for copies. (Admin)

## Authentication Requirements

| Endpoint                               | Authentication | Authorization                       |
| -------------------------------------- | -------------- | ----------------------------------- |
| `GET /orders/:id/invoices/latest`      | ✅ Required    | Must be Order Owner or Admin        |
| `GET /:id/download`                    | ✅ Required    | Must be Order Owner or Admin        |
| `GET /orders/:id/invoices`             | ✅ Required    | `admin:system` permission           |
| `POST /orders/:id/invoices`            | ✅ Required    | `admin:system` permission           |
| `POST /:id/resend`                     | ✅ Required    | `admin:system` permission           |

---

## Endpoints Data Formats

### 1. Fetch Latest Invoice (With Lazy Generation)

**Endpoint:** `GET /api/invoices/orders/:id/invoices/latest`

Retrieves the currently active invoice snapshot. If the order is marked `paid` but no invoice exists physically yet, the engine will intercept the `404` and trigger lazy generation instantly.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Invoice retrieved successfully",
  "data": {
    "id": "uuid-1234",
    "order_id": "order-5678",
    "invoice_number": "INV-2024-001",
    "latest_version": 1,
    "status": "generated",
    "version": {
      "version_number": 1,
      "grand_total": "118.00",
      "subtotal": "100.00",
      "tax_amount": "18.00",
      "cgst": "9.00",
      "sgst": "9.00",
      "igst": "0.00",
      "pdf_url": "https://storage.example.com/inv-2024-001.pdf",
      "reason": "INITIAL"
    }
  }
}
```

### 2. Force Generate New Version (Admin)

**Endpoint:** `POST /api/invoices/orders/:id/invoices`

If an order is manually corrected (e.g., partial refund applied), Admins can trigger a new version generation. The old invoice remains logged but is superseded by `version_number: 2`.

#### Request Body

```json
{
  "force": true
}
```

---

## Features

- **Native PDF Layout Engine**: The `pdf-generator.service.ts` utilizes the low-level `PDFKit` canvas tools to build enterprise-grade PDFs drawing explicit geometric boxes, lines, and custom fonts statically without needing a frontend headless browser. 
- **Immutable Snapshots**: E-commerce accounting legally compliance states that an invoice generated in Jan must match January's prices and tax structures. The `invoice_versions` table explicitly traps data (`customer_name`, `billing_address`, `cgst`, `sgst`) ensuring they never update even if the global user changes their name later.
- **Complex Indian Tax Logic (GST)**: Dynamically checks `billing_address.state_province` against `shipping_address.state_province` alongside the centralized configuration file to split general 18% taxes dynamically into intra-state (`CGST` + `SGST`) vs inter-state (`IGST`) columns.

## Dependencies

- **Orders Feature**: This complete module explicitly hinges on querying `orders.schema.ts`.
- **User Feature**: Relies on reading `users` context to apply email locations during layout rendering.
