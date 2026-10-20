# Tiers Feature

## Overview

The Tiers feature provides a hierarchical categorization system used throughout the platform (commonly representing Product Categories, Customer Loyalty Levels, or distinct access groupings). Similar to the Tags system, it tracks global `usage_count` statistics for dynamic ranking, but differs by introducing rigorous Parent-Child (`level`) nesting constraints to build complex multi-level taxonomy trees.

## Structure

```
tiers/
├── index.ts
├── apis/
│   ├── bulk-delete-tiers.ts
│   ├── create-tier.ts
│   ├── delete-tier.ts
│   ├── export-tiers.ts
│   ├── get-tier-by-id.ts
│   ├── get-tier-hierarchy.ts
│   ├── get-tiers.ts
│   ├── import-tiers.ts
│   └── update-tier.ts
├── services/
│   ├── index.ts
│   ├── tier-cache.service.ts
│   ├── tier-export.service.ts
│   ├── tier-import.service.ts
│   ├── tier-structure.service.ts
│   ├── tier-sync.service.ts
│   └── tiers.service.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── queries.ts
    ├── tiers.schema.ts
    └── validation.ts
```

## API Routes

The module splits into administrative CRUD management, hierarchical map building, and specialized background pipelines (Import/Export). 

### Endpoints (Admin Only)

**Core CRUD Operations**
- `POST /` - Create a standalone tier configuration (can specify `parent_id`)
- `GET /` - Flat list of all tiers, typically used for basic table views
- `GET /:id` - Retrieve singular tier details
- `PUT /:id` - Mutate a tier name, parent, or status flag
- `DELETE /:id` - Soft-delete a tier (protecting downstream entities from breaking)
- `POST /bulk-delete` - Accept an array of UUIDs to comprehensively destroy multiple tiers

**Hierarchical Context**
- `GET /hierarchy` - Reconstructs the flat PostgreSQL table into a deeply nested JSON tree grouped by `parent_id` arrays. Used by the Frontend to render cascading category dropdowns.

**ETL Pipelines (Import/Export)**
- `GET /export` - Orchestrates the `tier-export.service.ts` to convert the Postgres `tiers` matrix into a standardized downloadable CSV format.
- `POST /import` - Streams a CSV/JSON payload into `tier-import.service.ts` to bulk-seed thousands of predefined nesting levels at once.

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| Create, Update, Delete            | `POST /`, `PUT`, `DELETE`| Admin (`tiers:create/update/delete`) |
| Bulk Actions & ETL Pipelines      | `POST /import/export`   | Admin (`tiers:manage`)               |
| View Hierarchy & Flat Lists       | `GET /`, `GET /hierarchy`| ❌ Public (No Auth Required)        |

*Note: The primary `GET` routes are intentionally public, enabling unauthenticated frontend applications to construct predictive search dropdowns and navigation mega-menus dynamically.*

---

## Architecture & Implementation

### 1. Hierarchical Nesting Logic
Unlike standard `tags` which are a flat array of strings, `tiers` utilize a `parent_id` self-referencing foreign key within Postgres to build parent-child relations. 
Whenever a tier is created or modified, the `tiers.schema.ts` explicitly tracks the `level` integer. 
- Level `1`: Root/Parent Tier (e.g., `Electronics`)
- Level `2`: Sub-Tier (e.g., `Laptops`, mapped `parent_id` to `Electronics`).

### 2. The Tier-Sync Service
Tier management is heavily automated. While administrators create the structural tiers manually using `POST /api/tiers`, the backend actively relies on the `tier-sync.service.ts` intercepting downstream data mutations.
```
- Product created and assigned to tier "Laptops" → Laptops.usage_count += 1
- Product deleted → Laptops.usage_count -= 1
```

### 3. Tree Reconstruction & Caching
Because converting a massive flat SQL table into a nested JSON tree is an extremely heavy recursive operation, the `tier-structure.service.ts` handles the initial processing phase, but outputs the final computed tree directly into the `tier-cache.service.ts`. 

When the user queries `GET /hierarchy`, the API reads instantly from the Redis Cache without triggering the recursive SQL joins. The cache is automatically flushed whenever an Admin calls `PUT /:id` to restructure a category.

### 4. ETL Separation
The module explicitly separates complex processing streams. The `export-tiers.ts` and `import-tiers.ts` APIs do not block the thread with heavy data loops or parsing arrays. They safely delegate all physical encoding strings inside standard buffers to the isolated `tier-export.service.ts` and `tier-import.service.ts` handlers.
