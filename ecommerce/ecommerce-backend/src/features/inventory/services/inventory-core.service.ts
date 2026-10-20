import { db } from '../../../database';
import { logger, HttpException } from '../../../utils';
import type { InventoryListParams, UpdateInventoryDto } from '../shared/interface';
import {
  findInventoryByProduct,
  findInventoryByVariant,
  findInventoryByIdWithDetails,
  createInventory,
  updateInventoryById,
  findInventoryList,
  countInventory,
  createAdjustment,
} from '../shared/queries';
import { resolveValidUserId, getStatusFromQuantity } from './inventory-helpers.service';

/** Transforms a raw inventory query row into a clean API response shape. */
function transformInventoryItem(item: any) {
  return {
    id: item.id,
    product_id: item.product_id,
    location_id: item.location_id,
    product_name: item.product_name,
    sku: item.sku,
    available_quantity: item.available_quantity,
    reserved_quantity: item.reserved_quantity,
    incoming_quantity: item.incoming_quantity || 0,
    incoming_po_reference: item.incoming_po_reference || undefined,
    incoming_eta: item.incoming_eta || undefined,
    condition: item.condition,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    type: item.type as 'Base' | 'Variant',
    thumbnail: item.thumbnail || undefined,
  };
}

/** Retrieves a paginated list of inventory items with product context. */
export async function getInventoryList(params: InventoryListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const [rawItems, total] = await Promise.all([findInventoryList(params), countInventory(params)]);

  const items = rawItems.map(transformInventoryItem);

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`[Inventory] Fetched ${items.length} items, Total: ${total}`);
    if (items.length > 0) {
      logger.debug(`[Inventory] Sample item:`, {
        id: items[0].id,
        type: items[0].type,
        product_name: items[0].product_name,
      });
    }
  }

  return { items, total, page, limit };
}

/** Retrieves detailed inventory data for a specific entry. */
export async function getInventoryById(id: string) {
  const item = await findInventoryByIdWithDetails(id);
  if (!item) return undefined;

  return {
    id: item.id,
    product_id: item.variant_id || item.product_id,
    location_id: item.location, // Using location string as location_id
    product_name: item.variant_id
      ? `${item.product_title} - ${item.variant_option_name}: ${item.variant_option_value}`
      : item.product_title,
    sku: item.variant_sku || item.product_sku,
    available_quantity: item.available_quantity,
    reserved_quantity: item.committed_quantity, // Map committed to reserved for frontend
    incoming_quantity: 0, // Not in schema
    incoming_po_reference: undefined, // Not in schema
    incoming_eta: undefined, // Not in schema
    condition: item.condition,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    type: item.variant_id ? ('Variant' as const) : ('Base' as const),
    thumbnail: item.product_thumbnail || undefined,
  };
}

/** Updates non-quantity inventory fields like location or condition. */
export async function updateInventory(id: string, data: UpdateInventoryDto, updatedBy: string) {
  const validUserId = await resolveValidUserId(updatedBy);
  const updates: Parameters<typeof updateInventoryById>[1] = {
    ...data,
    updated_by: validUserId || undefined,
  };

  return updateInventoryById(id, updates);
}

/** Registers a new inventory record for a product/variant. */
export async function createInventoryForProduct(
  productId: string,
  initialQuantity: number = 0,
  createdBy?: string,
  location: string = 'Nashik',
  variantId?: string,
) {
  return db.transaction(async (tx) => {
    const existing = variantId
      ? await findInventoryByVariant(variantId, tx)
      : await findInventoryByProduct(productId, tx);

    if (existing.length > 0) {
      logger.info(`[Inventory] Skipping duplicate creation for product ${productId} ${variantId}`);
      return existing[0];
    }

    const validUserId = createdBy ? await resolveValidUserId(createdBy) : null;
    const created = await createInventory(
      {
        product_id: variantId ? undefined : productId,
        variant_id: variantId || undefined,
        location,
        available_quantity: initialQuantity,
        status: getStatusFromQuantity(initialQuantity),
        condition: 'sellable',
        updated_by: validUserId || undefined,
      },
      tx,
    );

    if (validUserId) {
      await createAdjustment(
        {
          inventory_id: created.id,
          adjustment_type: 'correction',
          quantity_change: initialQuantity,
          reason: 'Initial inventory creation',
          quantity_before: 0,
          quantity_after: initialQuantity,
          adjusted_by: validUserId,
          notes: 'System generated initial record',
        },
        tx,
      );
    }

    return created;
  });
}

/** Asserts existence of an inventory record or throws 404. */
export async function requireInventoryExists(id: string) {
  const inventory = await getInventoryById(id);
  if (!inventory) throw new HttpException(404, 'Inventory item not found');
  return inventory;
}
