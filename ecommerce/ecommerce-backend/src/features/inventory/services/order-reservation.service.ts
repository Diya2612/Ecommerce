import { db } from '../../../database';
import { logger } from '../../../utils';
import {
  createAdjustment,
  getInventoryStockLevel,
  updateInventoryCommittedQuantity,
  getOrderItemsByOrderId,
  updateInventoryForFulfillment,
  updateInventoryForSale,
  updateInventoryForReturn,
} from '../shared/queries';
import type { StockItemRequest, StockValidationResult } from '../shared/interface';

/** Validates stock availability for a list of products/variants. */
export async function validateStockAvailability(
  items: StockItemRequest[],
): Promise<StockValidationResult[]> {
  const results: StockValidationResult[] = [];

  for (const item of items) {
    const stock = await getInventoryStockLevel(item.product_id, item.variant_id);

    if (!stock) {
      results.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        available: false,
        message: `Product is currently unavailable (no inventory record)`,
        current_stock: 0,
        requested_quantity: item.quantity,
      });
      continue;
    }

    // Add back any quantity already reserved for this user (e.g. cart reservations)
    // so the user's own reservation doesn't count against them at checkout.
    const availableToSell =
      stock.available_quantity - stock.committed_quantity + (item.reserved_quantity || 0);
    const isAvailable = availableToSell >= item.quantity;
    const productName = stock.variant_option
      ? `${stock.product_title} (${stock.variant_option})`
      : stock.product_title;

    results.push({
      product_id: item.product_id,
      variant_id: item.variant_id,
      available: isAvailable,
      message: isAvailable
        ? undefined
        : `Insufficient stock for ${productName}. Requested: ${item.quantity}, Available: ${availableToSell}`,
      current_stock: availableToSell,
      requested_quantity: item.quantity,
    });
  }

  return results;
}

/** Increments committed_quantity for confirmed orders (does not affect available_quantity). */
export async function reserveStockForOrder(
  items: StockItemRequest[],
  orderId: string,
  userId: string,
  skipValidation: boolean = false,
  tx: any = db,
) {
  const execute = async (trx: any) => {
    if (!skipValidation) {
      const validations = await validateStockAvailability(items);
      const failures = validations.filter((v) => !v.available);
      if (failures.length > 0) {
        throw new Error(`Insufficient stock: ${failures.map((f) => f.message).join('; ')}`);
      }
    }

    for (const item of items) {
      // Only increases committed_quantity, available_quantity stays unchanged until payment
      await updateInventoryCommittedQuantity(item.product_id, item.variant_id, item.quantity, trx);
    }
  };

  return tx === db ? db.transaction(execute) : execute(tx);
}

/**
 * Finalizes order fulfillment when order is shipped.
 * Only updates total_fulfilled counter - available_quantity was already deducted when payment was confirmed.
 * Note: Sale recording (committed -> sold + available decrease) happens when payment is confirmed.
 */
export async function fulfillOrderInventory(
  orderId: string,
  userId: string,
  allowNegative: boolean = false,
) {
  return db.transaction(async (tx) => {
    // 1. Get Order Items
    const items = await getOrderItemsByOrderId(orderId, tx);

    if (!items.length) return;

    for (const item of items) {
      if (!item.product_id) continue;

      // 2. Update Inventory: increase total_fulfilled (available_quantity was already deducted when payment confirmed)
      const updated = await updateInventoryForFulfillment(
        item.product_id,
        item.variant_id,
        item.quantity,
        userId,
        allowNegative,
        tx,
      );

      if (!updated) {
        logger.error(`Fulfillment failure: ${item.product_name} in order ${orderId}`);
        continue;
      }

      await createAdjustment(
        {
          inventory_id: updated.id,
          adjustment_type: 'decrease',
          quantity_change: item.quantity,
          quantity_before: updated.total_fulfilled - item.quantity,
          quantity_after: updated.total_fulfilled,
          reason: 'Order Shipment',
          reference_number: orderId,
          notes: `Order shipped - ${item.quantity} unit(s) marked as fulfilled`,
          adjusted_by: userId,
        },
        tx,
      );
    }
  });
}

/**
 * Records a sale when payment is confirmed.
 * Decreases both available_quantity and committed_quantity, increases total_sold.
 */
export async function recordSaleForOrder(orderId: string, userId: string | null, tx: any = db) {
  const execute = async (trx: any) => {
    logger.info(`Recording sale for order ${orderId}`);

    // 1. Get Order Items
    const items = await getOrderItemsByOrderId(orderId, trx);

    if (!items.length) return;

    for (const item of items) {
      if (!item.product_id) continue;

      // 2. Update Inventory: decrease both available_quantity and committed_quantity, increase total_sold
      const updated = await updateInventoryForSale(
        item.product_id,
        item.variant_id,
        item.quantity,
        userId,
        trx,
      );

      if (!updated) {
        logger.error(`Sale recording failure: ${item.product_name} in order ${orderId}`);
        continue;
      }

      // 3. Create audit log for the sale (skip if automated system operation)
      if (userId) {
        await createAdjustment(
          {
            inventory_id: updated.id,
            adjustment_type: 'decrease',
            quantity_change: item.quantity,
            quantity_before: updated.available_quantity + item.quantity,
            quantity_after: updated.available_quantity,
            reason: 'Sale Recorded',
            reference_number: orderId,
            notes: `Payment confirmed - ${item.quantity} reduced from available stock and committed, added to total_sold`,
            adjusted_by: userId,
          },
          trx,
        );
      } else {
        logger.debug(`Skipping adjustment log for automated sale recording (order ${orderId})`);
      }
    }

    logger.info(`Sale recorded successfully for order ${orderId}`);
  };

  return tx === db ? db.transaction(execute) : execute(tx);
}

/** Releases committed stock for cancelled orders (decrements committed_quantity only). */
export async function releaseReservation(orderId: string, userId: string, tx: any = db) {
  const execute = async (trx: any) => {
    logger.info(`Releasing reservation for order ${orderId}`);

    const orderItemsData = await getOrderItemsByOrderId(orderId, trx);

    if (!orderItemsData.length) return;

    for (const item of orderItemsData) {
      // Decreases committed_quantity (negative change), available_quantity unchanged
      await updateInventoryCommittedQuantity(item.product_id, item.variant_id, -item.quantity, trx);
    }
  };

  return tx === db ? db.transaction(execute) : execute(tx);
}

/** Restocks items from returned orders and logs adjustments. */
export async function processOrderReturn(orderId: string, userId: string) {
  return db.transaction(async (tx) => {
    const items = await getOrderItemsByOrderId(orderId, tx);

    for (const item of items) {
      if (!item.product_id) continue;

      const updated = await updateInventoryForReturn(
        item.product_id,
        item.variant_id,
        item.quantity,
        userId,
        tx,
      );
      if (!updated) continue;

      await createAdjustment(
        {
          inventory_id: updated.id,
          adjustment_type: 'increase',
          quantity_change: item.quantity,
          quantity_before: updated.available_quantity - item.quantity,
          quantity_after: updated.available_quantity,
          reason: 'Order Return',
          reference_number: orderId,
          notes: 'Restock from return',
          adjusted_by: userId,
        },
        tx,
      );
    }
  });
}
