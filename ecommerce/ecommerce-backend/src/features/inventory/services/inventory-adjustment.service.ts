import { db } from '../../../database';
import type { AdjustInventoryDto, InventoryHistoryItem } from '../shared/interface';
import {
  findInventoryById,
  adjustQuantitiesWithStatus,
  findAdjustmentHistory,
  findAdjustmentHistoryByProduct,
  countAdjustmentsByProduct,
  createAdjustment,
} from '../shared/queries';
import { resolveValidUserId } from './inventory-helpers.service';

/**
 * Modifies inventory quantities and records an audit entry.
 * Prevents negative stock unless explicitly allowed.
 */
export async function adjustInventory(
  id: string,
  data: AdjustInventoryDto,
  adjustedBy: string,
  allowNegative: boolean = false,
) {
  const validUserId = await resolveValidUserId(adjustedBy);
  if (!validUserId) throw new Error('Invalid user for audit logging.');

  return db.transaction(async (tx) => {
    const current = await findInventoryById(id, tx);
    if (!current) throw new Error('Inventory record not found');

    const quantityBefore = current.available_quantity;
    const quantityAfter = quantityBefore + data.quantity_change;

    if (quantityAfter < 0 && !allowNegative) {
      throw new Error(`Insufficient stock for adjustment (Available: ${quantityBefore})`);
    }

    const adjustmentType =
      data.quantity_change > 0 ? 'increase' : data.quantity_change < 0 ? 'decrease' : 'correction';

    const updated =
      data.quantity_change !== 0
        ? await adjustQuantitiesWithStatus(id, data.quantity_change, 0, tx)
        : current;

    if (!updated) throw new Error('Failed to update inventory');

    const adjustment = await createAdjustment(
      {
        inventory_id: id,
        adjustment_type: adjustmentType,
        quantity_change: data.quantity_change,
        quantity_before: quantityBefore,
        quantity_after: updated.available_quantity,
        reason: data.reason,
        reference_number: data.reference_number,
        notes: data.notes,
        adjusted_by: validUserId,
      },
      tx,
    );

    return { inventory: updated, adjustment };
  });
}

/** Retrieves adjustment history for a specific inventory entry. */
export async function getInventoryHistory(inventoryId: string, limit: number = 50) {
  const history = await findAdjustmentHistory(inventoryId, limit);
  return history as InventoryHistoryItem[];
}

/** Retrieves paginated adjustment history filtered by product. */
export async function getInventoryHistoryByProductId(
  productId: string,
  page: number = 1,
  limit: number = 20,
) {
  const [items, total] = await Promise.all([
    findAdjustmentHistoryByProduct(productId, page, limit),
    countAdjustmentsByProduct(productId),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
