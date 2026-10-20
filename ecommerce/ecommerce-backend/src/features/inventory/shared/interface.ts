/**
 * Inventory Interfaces
 * Domain types and API request/response shapes for inventory management.
 */

import { Inventory } from './inventory.schema';
import { omitFields } from '../../../utils';
import type { NewInventory } from './inventory.schema';
import type { InventoryAdjustment, NewInventoryAdjustment } from './inventory-adjustments.schema';

export type { Inventory, NewInventory, InventoryAdjustment, NewInventoryAdjustment };

/** Sanitized inventory record for public API exposure. */
export type SanitizedInventory = Omit<
  Inventory,
  'deleted_by' | 'deleted_at' | 'created_by' | 'updated_by'
>;

/** Sanitized inventory adjustment audit record. */
export type SanitizedInventoryAdjustment = InventoryAdjustment;

/** Sanitized inventory with product details. */
export type SanitizedInventoryWithProduct = Omit<InventoryWithProduct, 'updated_by'>;

/** Parameters for filtering inventory lists. */
export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  status?: string;
  location?: string;
  category?: string;
  quickFilter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

/** Standard paginated response for inventory lists. */
export interface InventoryListResponse {
  items: InventoryWithProduct[];
  total: number;
  page: number;
  limit: number;
}

/** Inventory record augmented with product/variant metadata. */
export interface InventoryWithProduct {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  thumbnail?: string;
  category?: string;
  brand?: string;
  available_quantity: number;
  committed_quantity: number;
  location: string;
  condition: 'sellable' | 'damaged' | 'quarantined' | 'expired';
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  total_sold?: number;
  total_fulfilled?: number;
  last_stock_movement_at?: Date;
  last_sale_at?: Date;
  updated_by?: string;
  updated_by_name?: string;
  created_at: Date;
  updated_at: Date;
  type?: 'Base' | 'Variant';
}

/** Input for adjusting stock levels. */
export interface AdjustInventoryDto {
  quantity_change: number;
  reason: string;
  reference_number?: string;
  notes?: string;
}

/** Input for updating inventory metadata. */
export interface UpdateInventoryDto {
  condition?: 'sellable' | 'damaged' | 'quarantined' | 'expired';
  location?: string;
}

/** Representation of an inventory adjustment event. */
export interface InventoryHistoryItem {
  id: string;
  adjustment_type: 'increase' | 'decrease' | 'correction' | 'write-off';
  quantity_change: number;
  reason: string;
  reference_number?: string;
  quantity_before: number;
  quantity_after: number;
  adjusted_by: string;
  adjusted_by_name?: string;
  adjusted_at: Date;
  notes?: string;
  target_name?: string;
  variant_sku?: string | null;
}

/** Result of a stock validation check. */
// ============================================
// Order-Inventory Integration Types
// ============================================

export interface StockItemRequest {
  product_id: string;
  quantity: number;
  variant_id?: string | null;
  /** Quantity already reserved for this user (e.g. from cart). Added back to available-to-sell during validation. */
  reserved_quantity?: number;
}

export interface StockValidationResult {
  product_id: string;
  variant_id?: string | null;
  available: boolean;
  message?: string;
  current_stock: number;
  requested_quantity: number;
}

export const sanitizeInventory = (inventory: Inventory): SanitizedInventory =>
  omitFields(inventory, ['deleted_by', 'deleted_at', 'created_by', 'updated_by']);

export const sanitizeInventories = (inventories: Inventory[]): SanitizedInventory[] =>
  inventories.map(sanitizeInventory);

export const sanitizeInventoryWithProduct = (
  inventory: InventoryWithProduct,
): SanitizedInventoryWithProduct => omitFields(inventory, ['updated_by']);

export const sanitizeInventoriesWithProduct = (
  inventories: InventoryWithProduct[],
): SanitizedInventoryWithProduct[] => inventories.map(sanitizeInventoryWithProduct);

// API Response Shapes
export interface IInventoryResponse extends InventoryWithProduct {
  variant_id?: string | null;
}

export interface IInventoryListResponse {
  items: IInventoryResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface IInventoryHistoryResponse extends InventoryHistoryItem {
  inventory_id: string;
}

export interface IInventoryHistoryListResponse {
  items: IInventoryHistoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAvailableStockResponse {
  productId: string;
  availableStock: number;
  committedStock: number;
  totalStock: number;
  inStock: boolean;
}

export interface IAdjustmentResultResponse {
  inventory: IInventoryResponse;
  adjustment: IInventoryHistoryResponse;
}

export type IStockValidationResponse = StockValidationResult;

export interface IBackfillResultResponse {
  created: number;
  products?: Array<{ id: string; name: string; sku: string }>;
  message?: string;
}
