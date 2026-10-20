/**
 * Common Validation Schemas
 * Standardized Zod schemas for shared API inputs (UUIDs, pagination, decimals, common formats).
 */

import { z } from 'zod';

// ============================================
// UUID VALIDATION
// ============================================

/**
 * Strict UUID string standard validation.
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Optional string UUID validation.
 */
export const optionalUuidSchema = z.string().uuid('Invalid UUID format').optional();

/**
 * Nullable string UUID validation.
 */
export const nullableUuidSchema = z.string().uuid('Invalid UUID format').nullable();

// ============================================
// PAGINATION
// ============================================

/**
 * Standard query pagination schema (page/limit).
 * Defaults: page=1, limit=20 (Max: 100).
 */
export const paginationSchema = z.object({
  page: z.preprocess(
    (val) => (val ? Number(val) : 1),
    z.number().int().min(1, 'Page must be at least 1'),
  ),
  limit: z.preprocess(
    (val) => (val ? Number(val) : 20),
    z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must not exceed 100'),
  ),
});

/**
 * Extended query pagination schema supporting explicit offsets.
 */
export const offsetPaginationSchema = paginationSchema.extend({
  offset: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().int().min(0, 'Offset must be non-negative'),
  ),
});

// ============================================
// SEARCH & FILTERING
// ============================================

/**
 * Standard list searching and sorting query schema.
 */
export const searchSchema = z.object({
  q: z.string().max(200, 'Search query too long').optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
});

/**
 * Combined list query schema (Search + Sort + Pagination).
 */
export const searchWithPaginationSchema = searchSchema.merge(paginationSchema);

// ============================================
// DECIMAL / MONEY VALIDATION
// ============================================

/**
 * Validates a monetary or decimal value string (e.g., "10.99").
 * Enforces non-negative values and max 2 decimal places.
 */
export const decimalSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal with up to 2 decimal places')
  .refine((val) => parseFloat(val) >= 0, 'Must be a non-negative value');

/**
 * Strictly positive decimal string validation (>0).
 */
export const positiveDecimalSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal with up to 2 decimal places')
  .refine((val) => parseFloat(val) > 0, 'Must be a positive value greater than 0');

/**
 * Optional decimal string validation.
 */
export const optionalDecimalSchema = decimalSchema.optional();

/**
 * Nullable decimal string validation.
 */
export const nullableDecimalSchema = decimalSchema.nullable();

/**
 * Percentage string validation (range: 0-100, max 2 decimals).
 */
export const percentageSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid percentage with up to 2 decimal places')
  .refine(
    (val) => parseFloat(val) >= 0 && parseFloat(val) <= 100,
    'Percentage must be between 0 and 100',
  );

// ============================================
// DATE VALIDATION
// ============================================

/**
 * Validates standard ISO 8601 datetime strings.
 */
export const dateStringSchema = z.string().datetime('Must be a valid ISO 8601 date string');

/**
 * Validates chronological correctness between start and end date parameters.
 */
export const dateRangeSchema = z
  .object({
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['end_date'],
    },
  );

// ============================================
// ARRAY VALIDATION
// ============================================

/**
 * Standardized maximum bounds for application list limits.
 */
export const ARRAY_LIMITS = {
  TAGS: 50,
  ITEMS: 100,
  IDS: 1000,
  IMAGES: 20,
  ATTACHMENTS: 10,
} as const;

/**
 * Validates a non-empty array of UUID strings with an upper limit.
 * @param maxLength Upper items limit (defaults to ARRAY_LIMITS.IDS)
 */
export const uuidArraySchema = (maxLength: number = ARRAY_LIMITS.IDS) =>
  z
    .array(uuidSchema)
    .max(maxLength, `Maximum ${maxLength} items allowed`)
    .min(1, 'At least one item is required');

/**
 * Validates an optional array of UUID strings with an upper limit.
 */
export const optionalUuidArraySchema = (maxLength: number = ARRAY_LIMITS.IDS) =>
  z.array(uuidSchema).max(maxLength, `Maximum ${maxLength} items allowed`).optional();

/**
 * Validates an array of generic strings, enforcing bounds on array size and per-item length.
 * @param maxItems Items limit
 * @param maxItemLength Per-string length limit
 */
export const stringArraySchema = (maxItems: number = 50, maxItemLength: number = 100) =>
  z
    .array(z.string().max(maxItemLength, `Each item must be at most ${maxItemLength} characters`))
    .max(maxItems, `Maximum ${maxItems} items allowed`);

// ============================================
// JSONB SIZE VALIDATION
// ============================================

/**
 * Standardized constants for approximate JSON payload bounds tracking.
 */
export const JSONB_LIMITS = {
  SMALL: 1024, // 1KB - for simple metadata
  MEDIUM: 10240, // 10KB - for customization data
  LARGE: 102400, // 100KB - for complex documents
} as const;

/**
 * Restricts the serialized size of a raw JSON/object payload snippet.
 * @param maxSize Size threshold in bytes
 */
export const jsonbSizeValidator = (maxSize: number = JSONB_LIMITS.MEDIUM) =>
  z.any().refine(
    (val) => {
      const size = JSON.stringify(val).length;
      return size <= maxSize;
    },
    {
      message: `Data too large (max ${maxSize} bytes)`,
    },
  );

// ============================================
// EMAIL & CONTACT VALIDATION
// ============================================

/**
 * Validates basic email formatting and length constraints.
 */
export const emailSchema = z.string().email('Invalid email format').max(255, 'Email too long');

/**
 * Validates common international phone number structures.
 */
export const phoneSchema = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format',
  )
  .max(20, 'Phone number too long');

/**
 * Optional phone number schema.
 */
export const optionalPhoneSchema = phoneSchema.optional();

// ============================================
// TEXT VALIDATION
// ============================================

/**
 * Standard non-empty short text value (max 255 chars).
 */
export const shortTextSchema = z.string().min(1, 'Required').max(255, 'Maximum 255 characters');

/**
 * Standard medium text value (max 1000 chars).
 */
export const mediumTextSchema = z.string().max(1000, 'Maximum 1000 characters');

/**
 * Standard long text value (max 10000 chars).
 */
export const longTextSchema = z.string().max(10000, 'Maximum 10000 characters');

/**
 * Validates strictly formatted URL slug strings (lowercase alphanumeric and hyphens).
 */
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens',
  )
  .min(1, 'Slug is required')
  .max(255, 'Slug too long');

// ============================================
// NUMERIC VALIDATION
// ============================================

/**
 * Validates strictly positive integers (>0).
 */
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

/**
 * Validates non-negative integers (>=0).
 */
export const nonNegativeIntSchema = z
  .number()
  .int('Must be an integer')
  .nonnegative('Must be non-negative');

/**
 * Standardized general bounded quantity schema (1 - 10,000).
 */
export const quantitySchema = z
  .number()
  .int('Quantity must be an integer')
  .min(1, 'Quantity must be at least 1')
  .max(10000, 'Quantity too large');

/**
 * Standard 5-star rating schema restriction (1 - 5).
 */
export const ratingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

// ============================================
// BOOLEAN VALIDATION
// ============================================

/**
 * Coerces varied logical string inputs ("true", "1", "yes") into a strict boolean.
 */
export const stringBooleanSchema = z.string().transform((val) => {
  const lower = val.toLowerCase();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no') return false;
  throw new Error('Invalid boolean value');
});

// ============================================
// STATUS VALIDATION
// ============================================

/**
 * Active/inactive standardized enumeration.
 */
export const statusSchema = z.enum(['active', 'inactive']);

/**
 * Coerces soft deletion flag (defaults to false).
 */
export const isDeletedSchema = stringBooleanSchema.optional().transform((val) => val ?? false);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parses and validates a CSV query string ("id1,id2") into an array of strictly valid UUIDs.
 * @param maxItems Array item cutoff limit
 */
export const commaSeparatedUuidsSchema = (maxItems: number = 100) =>
  z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(uuidSchema).max(maxItems, `Maximum ${maxItems} items allowed`));

/**
 * Parses a CSV query string into a simple array of strings.
 */
export const commaSeparatedStringsSchema = (maxItems: number = 50) =>
  z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(z.string()).max(maxItems, `Maximum ${maxItems} items allowed`));

// ============================================
// EXPORT TYPES
// ============================================

export type Pagination = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
