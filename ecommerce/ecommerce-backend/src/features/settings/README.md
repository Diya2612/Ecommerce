# Settings Feature

## Overview

The Settings feature serves as the global configuration container for multi-regional e-commerce mechanics. It defines the foundational data structures for multi-currency pricing formats, compound tax rules, and international country/region shipping definitions. 

*(Note: Currently, this module operates purely as a schema definition layer. Administrative CRUD API endpoints for managing these settings via a UI are planned but not yet implemented in `index.ts`. Backend systems and testing pipelines interact with these tables directly via `drizzle-orm`).*

## Structure

```
settings/
├── index.ts
└── shared/
    ├── currencies.schema.ts
    ├── interface.ts
    └── tax-rules.schema.ts
```

## Core Configuration Schemas

The module is divided functionally into currency abstractions and geographical tax abstraction.

### 1. Currencies (`currencies.schema.ts`)
Handles multi-currency configuration for international sales.
- **Base Routing**: Supports exactly one `is_base_currency` to ground all exchange rate calculations.
- **Dynamic Valuation**: Includes both `exchange_rate` (for real-time API syncs) and `manual_exchange_rate` (for administrative hard-overrides).
- **Core Columns**: `code` (ISO 4217), `symbol`, `is_active`.

### 2. Tax Rules (`tax-rules.schema.ts`)
A highly complex schema allowing Administrators to configure tax slabs based on geographic location and product types. Supports date-effective tax periods.
- **Geographic Targeting**: Rules can be bound globally per ISO Country (`country_code`), regionally (`region_code` like 'CA' or 'TX'), or specifically via wildcard postal code patterns (`postal_code_pattern`).
- **Product Filtering**: Slabs apply conditionally via the `applies_to` enum (e.g., `physical_goods`, `digital_goods`, `shipping`).
- **Calculation Type**: Supports both `inclusive` (built into the catalog MSRP) and `exclusive` (added line-item at checkout).
- **Tax Stacking**: The `is_compound` boolean and `priority` integer allow multiple discrete taxes (like GST + Regional VAT) to aggregate intelligently during the Orders calculation phase.

### 3. Geographical References (`tax-rules.schema.ts`)
Static system reference tables used primarily for Address validation and filtering in the Cart and Order domains.
- **Countries**: Stores ISO 3166 codes, base currency expectations, and critical booleans locking physical logistics (`is_shipping_enabled`, `is_billing_enabled`, `requires_state`).
- **Regions (States/Provinces)**: Child nodes of Countries (e.g., US states) acting as physical boundaries for specific `Tax Rules` overrides.

## Feature Interdependencies

While this module has no active routing pipeline, it inherently underpins the logic of almost every monetary transaction processing module:
- **Orders & Checkouts**: Order creation pipelines actively query the `tax_rules` tables to dynamically mutate the final checkout payload before passing the total to the Payments gateway.
- **Invoices**: Tax lines pulled from `settings` configurations are physically rendered sequentially onto generated PDF receipts.
- **Users**: Address books validate payload `country_code` and `region_code` inputs strictly against the geographic tables defined here.
