/**
 * Inventory Validation Schemas
 * Zod schemas for query parameters and request bodies.
 */

import { z } from 'zod';
import { uuidSchema } from '../../../utils';

/** Query parameters for listing inventory. */
export const inventoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  condition: z.enum(['sellable', 'damaged', 'quarantined', 'expired']).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  quickFilter: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  _rid: z.string().optional(),
});

/** Query parameters for inventory history. */
export const inventoryHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** Query parameters for inventory history filtered by product. */
export const inventoryHistoryByProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Request body for adjusting stock levels. */
export const adjustInventorySchema = z.object({
  quantity_change: z
    .number()
    .int()
    .refine((val) => val !== 0, {
      message: 'Quantity change cannot be zero',
    }),
  reason: z.string().min(1).max(500),
  reference_number: z.string().max(100).optional(),
  notes: z.string().optional(),
});

/** Request body for updating inventory metadata. */
export const updateInventorySchema = z
  .object({
    condition: z.enum(['sellable', 'damaged', 'quarantined', 'expired']).optional(),
    location: z.string().max(255).optional(),
    incoming_quantity: z.number().int().min(0).optional(),
    incoming_po_reference: z.string().max(100).optional(),
    incoming_eta: z.string().datetime().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/** Request body for backfilling inventory records. */
export const backfillInventorySchema = z.object({
  dryRun: z.boolean().default(false),
  forceRecreate: z.boolean().default(false),
});

/** URL parameters for inventory ID. */
export const inventoryIdParamSchema = z.object({
  id: uuidSchema,
});

/** URL parameters for product ID. */
export const productIdParamSchema = z.object({
  productId: uuidSchema,
});

export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;
export type InventoryHistoryQuery = z.infer<typeof inventoryHistoryQuerySchema>;
export type InventoryHistoryByProductQuery = z.infer<typeof inventoryHistoryByProductQuerySchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type BackfillInventoryInput = z.infer<typeof backfillInventorySchema>;
export type InventoryIdParam = z.infer<typeof inventoryIdParamSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
