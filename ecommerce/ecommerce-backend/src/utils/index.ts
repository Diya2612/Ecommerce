/**
 * Central Utilities Index
 * The single point of export for all standard application utility modules.
 */

// NOTE: audit-utils is NOT exported here to avoid circular dependency
// audit-utils imports from features/audit, which imports from utils
// Import audit-utils directly: import { ... } from './utils/audit/audit-utils'

// Auth utilities (encryption only - JWT/password moved to Supabase Auth)
export * from './auth/encryption';

// Database utilities
export * from './database/cache';
export * from './database/dbUrl';
export * from './database/redis';
export * from './database/search-utils';

// Email utilities
export * from './email/emailConfig';
export * from './email/email.service';

// Helper utilities
export { HttpException } from './helpers/httpException';
export * from './helpers/responseFormatter';
export * from './helpers/asyncHandler';
export * from './helpers/omitFields';
export * from './helpers/tax-calculator';
export * from './helpers/number-to-words';
export * from './helpers/id-generators';
export * from './helpers/file-hash';
export * from './helpers/phone';
export * from './uuid/uuid-generator';

// Logging utilities
export * from './logging/logger';

// Configuration utilities
export * from './config/load-env';
export * from './config/validate-env';

// Supabase utilities
export * from './supabase/client';
export * from './supabase/storage';

// System utilities
export * from './system/shutdown';

// Validation utilities
export * from './validation/common-schemas';
