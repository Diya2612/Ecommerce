# Tickets Feature

## Overview

The Tickets feature is designed as an internal Customer Relationship Management (CRM) module mapping closely to industry standards like Zendesk or Freshdesk. It provides the architectural schema for managing customer support workflows, including SLA (Service Level Agreement) tracking, agent assignment, and multi-channel conversation threading.

> **⚠️ Implementation Status (Jan 2026):**
> This module is currently operating purely as a blueprint schema definition layer. It is officially marked as `UNUSED` and commented out within the active Drizzle ORM exports. Administrative CRUD API endpoints and physical database migrations for this feature are pending future platform updates.

## Structure

```
tickets/
├── index.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── ticket-messages.schema.ts
    └── tickets.schema.ts
```

## Core Configuration Schemas

The module is divided structurally into the overarching Support Case metadata and the underlying chronological Message Thread.

### 1. Support Case Metadata (`tickets.schema.ts`)
The primary entity representing a discrete customer issue. 
- **Relationships**: A ticket natively links to a specific `customer_id` and can optionally bind directly to an `order_id` for immediate transaction context. It also links to an internal staff member via `assigned_to`.
- **Classification**: Tracks the urgency via `priority` (`low`, `medium`, `high`, `urgent`) and the workflow state via `status` (`open`, `pending`, `waiting_customer`, `resolved`, `closed`).
- **SLA Tracking**: Includes strict, queryable timestamps critical for enterprise support metrics: `first_response_at` and `resolved_at`.
- **CSAT (Customer Satisfaction)**: Natively supports extracting 1-5 star ratings and textual feedback (`satisfaction_rating`) once the workflow reaches the `resolved` phase.
- **Omni-Channel Flags**: Tracks where the ticket originated (`email`, `chat`, `whatsapp`, `phone`, `system`).

### 2. Conversation Thread (`ticket-messages.schema.ts`)
A specialized log acting as the chronological "chat window" for the overarching ticket.
- **Polymorphic Sender Identity**: The `sender_type` enum cleanly separates actors (`customer`, `agent`, `system`).
- **Rich Media**: Supports a JSONB `attachments` array allowing image or document uploads (e.g., screenshots of a defect).
- **Internal Staff Notes**: Utilizes an `is_internal` boolean flag. If `true`, the message represents a private backend note visible only to other agents mapping the case, physically hiding the content from the customer-facing frontend.

## Reactivating the Module

If the CRM features are needed for active development, administrators must complete the following steps to bring the module online:
1. Navigate to `src/database/drizzle.ts`.
2. Uncomment the `tickets` and `ticketMessages` schema exports.
3. Run the standard `npm run db:push` command to physically construct the tables in the PostgreSQL layer.
4. Implement the controller logic inside `tickets/index.ts`.
