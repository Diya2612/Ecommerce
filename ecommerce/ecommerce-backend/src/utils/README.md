# Utils Directory

This directory contains reusable utility functions, helpers, and configurations used across the entire backend application. All utilities are exported through the central `index.ts` barrel file for convenient importing, except where circular dependencies explicitly prevent it.

## Directory Structure

- **`audit/`**: Audit logging utilities. Note: Imported directly (e.g., `import { ... } from '@/utils/audit/audit-utils'`) to avoid circular dependencies with `features/audit`.
- **`auth/`**: Authentication utilities such as encryption helpers. (JWT and password functions are handled by Supabase Auth).
- **`config/`**: Environment variable loading and validation utilities (`load-env`, `validate-env`).
- **`database/`**: Database-related utilities including database URL formatting, Redis connection, caching mechanisms, and search utility functions.
- **`email/`**: Email configuration and mailing services (`emailConfig`, `email.service`).
- **`helpers/`**: General purpose helper functions including `HttpException`, response formatting, field omission, tax calculation, number-to-words conversion, and custom ID generators.
- **`import-export/`**: Utilities for handling data import and export (e.g., CSV or Excel formatting).
- **`logging/`**: Central application logger (`logger`).
- **`supabase/`**: Supabase client initialization and storage utility functions.
- **`system/`**: System-level utilities, such as graceful shutdown handlers.
- **`uuid/`**: UUID generation utilities.
- **`validation/`**: Common and reusable validation schemas.

## Usage

Most utilities can and should be imported directly from the central `utils` index:

```typescript
import { logger, HttpException, responseFormatter } from '@/utils';
// or
import { supabase } from '../../utils';
```

## Adding New Utilities

When adding a new utility:
1. Place it in the appropriate subdirectory (or create a new one if it represents a distinct domain).
2. Export it from the central `src/utils/index.ts` file.
3. Keep utility functions pure, isolated, and free of domain-specific business logic whenever possible.
