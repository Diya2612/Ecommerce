/**
 * Order Management Service
 * Handles order lifecycle operations like confirmation, duplication, and deletion
 */

import { db } from '../../../database';
import { logger } from '../../../utils';

class OrderManagementService {
  /**
   * Confirm draft order and reserve inventory
   *
   * @param orderId - Draft order ID
   * @param confirmData - Confirmation data
   * @param userId - User ID performing the confirmation
   * @returns Confirmed order with items
   */
  async confirmDraftOrder(
    orderId: string,
    confirmData: {
      send_confirmation_email?: boolean;
      notes?: string;
    },
    userId: string,
  ) {
    const { findOrderById, getOrderItems, updateOrder } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { reserveStockForOrder } = await import('../../inventory/services');
    const { eventPublisher } = await import('../../queue/services/event-publisher.service');
    const { TEMPLATE_CODES } = await import('../../notifications/shared/constants');

    logger.info(`Converting draft order ${orderId} to confirmed order`);

    return await db.transaction(async (tx) => {
      // Get the draft order
      const draftOrder = await findOrderById(orderId, false, tx);

      if (!draftOrder) {
        throw new HttpException(404, 'Draft order not found');
      }

      if (!draftOrder.is_draft) {
        throw new HttpException(400, 'Order is not a draft');
      }

      // Get order items to reserve inventory
      const items = await getOrderItems(orderId, tx);

      if (items.length === 0) {
        throw new HttpException(400, 'Cannot confirm order without items');
      }

      // Reserve inventory for each item
      const stockItems = items
        .filter((item): item is typeof item & { product_id: string } => item.product_id !== null)
        .map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        }));

      try {
        await reserveStockForOrder(
          stockItems,
          draftOrder.order_number,
          draftOrder.user_id || 'GUEST',
          false,
        );
        logger.info(`[ConfirmDraft] Inventory reserved for order ${draftOrder.order_number}`);
      } catch (error: any) {
        logger.error(`[ConfirmDraft] Failed to reserve inventory:`, error);
        throw new HttpException(
          400,
          `Cannot confirm order: ${error.message || 'Insufficient stock'}`,
        );
      }

      // Prepare update data
      const updateData: any = {
        is_draft: false,
        order_status: 'confirmed',
        updated_by: userId,
      };

      // Add confirmation note to admin comment
      if (confirmData.notes) {
        const existingComment = draftOrder.admin_comment || '';
        const timestamp = new Date().toISOString();
        updateData.admin_comment =
          `${existingComment}\n[${timestamp}] Draft confirmed: ${confirmData.notes}`.trim();
      }

      // Update the order
      const confirmedOrder = await updateOrder(orderId, updateData, tx);

      if (!confirmedOrder) {
        throw new HttpException(500, 'Failed to update order');
      }

      logger.info(
        `Draft order ${orderId} converted to confirmed order ${confirmedOrder.order_number}`,
      );

      // Send confirmation email if requested (non-blocking)
      let emailSent = false;
      if (confirmData.send_confirmation_email && confirmedOrder.user_id) {
        const userIdToNotify = confirmedOrder.user_id;
        setImmediate(async () => {
          try {
            await eventPublisher.publishNotification({
              userId: userIdToNotify,
              templateCode: TEMPLATE_CODES.ORDER_CONFIRMED,
              variables: {
                orderNumber: confirmedOrder.order_number,
                totalAmount: confirmedOrder.total_amount,
                currency: confirmedOrder.currency || 'INR',
                orderStatus: confirmedOrder.order_status,
              },
              options: {
                priority: 'high',
                actionUrl: `/profile/orders/${confirmedOrder.id}`,
                actionText: 'View Order',
              },
            });
            logger.info(
              `[ConfirmDraft] Confirmation email queued for order ${confirmedOrder.order_number}`,
            );
          } catch (error) {
            logger.error(`[ConfirmDraft] Failed to queue confirmation email:`, error);
          }
        });
        emailSent = true;
      }

      return {
        ...confirmedOrder,
        items,
        inventory_reserved: true,
        email_sent: emailSent,
      };
    });
  }

  /**
   * Duplicate an existing order
   *
   * @param orderId - Order ID to duplicate
   * @param userId - User ID performing the duplication
   * @returns Duplicated order
   */
  async duplicateOrder(orderId: string, userId: string) {
    const { findOrderById, getOrderItems } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { orderCreationService } = await import('./order-creation.service');
    const { orders } = await import('../shared/orders.schema');
    const { orderItems } = await import('../shared/order-items.schema');

    // Get original order
    const originalOrder = await findOrderById(orderId);

    if (!originalOrder) {
      throw new HttpException(404, 'Order not found');
    }

    // Get order items
    const originalItems = await getOrderItems(orderId);

    const result = await db.transaction(async (tx) => {
      // Generate new order number
      const newOrderNumber = await orderCreationService.generateOrderNumber();

      // Create duplicate order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          user_id: originalOrder.user_id,
          order_number: newOrderNumber,

          // Set as draft
          order_status: 'pending',
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          is_draft: true,

          // Copy address IDs
          shipping_address_id: originalOrder.shipping_address_id,
          billing_address_id: originalOrder.billing_address_id,

          // Copy pricing
          subtotal: originalOrder.subtotal,
          discount_id: originalOrder.discount_id,
          discount_code_id: originalOrder.discount_code_id,
          discount_type: originalOrder.discount_type,
          discount_value: originalOrder.discount_value,
          discount_amount: originalOrder.discount_amount,
          discount_code: originalOrder.discount_code,
          shipping_amount: originalOrder.shipping_amount,
          shipping_method: originalOrder.shipping_method,
          shipping_option: originalOrder.shipping_option,
          delivery_price: originalOrder.delivery_price,
          tax_rule_id: originalOrder.tax_rule_id,
          tax_amount: originalOrder.tax_amount,
          cgst: originalOrder.cgst,
          sgst: originalOrder.sgst,
          igst: originalOrder.igst,
          total_amount: originalOrder.total_amount,
          total_quantity: originalOrder.total_quantity,

          // Copy metadata
          payment_method: originalOrder.payment_method,
          customer_note: originalOrder.customer_note,
          admin_comment: originalOrder.admin_comment,
          tags: originalOrder.tags,
          order_tracking: originalOrder.order_tracking,
          currency: originalOrder.currency,

          created_by: userId,
          updated_by: userId,
        })
        .returning();

      // Duplicate order items
      for (const item of originalItems) {
        await tx.insert(orderItems).values({
          order_id: newOrder.id,
          product_id: item.product_id,
          sku: item.sku,
          product_name: item.product_name,
          product_image: item.product_image,
          cost_price: item.cost_price,
          quantity: item.quantity,
          line_total: item.line_total,
        });
      }

      return newOrder;
    });

    logger.info('Order duplicated successfully', {
      originalOrderId: orderId,
      newOrderId: result.id,
      newOrderNumber: result.order_number,
      userId,
    });

    return result;
  }

  /**
   * Soft delete orders (bulk or single)
   *
   * @param orderIds - Array of order IDs to delete
   * @param userId - User ID performing the deletion
   * @returns Deleted orders
   */
  async deleteOrders(orderIds: string[], userId: string) {
    const { findOrderById, softDeleteOrders } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');

    // Validate orders before deletion
    for (const orderId of orderIds) {
      const order = await findOrderById(orderId, false);

      if (!order) {
        throw new HttpException(404, `Order ${orderId} not found`);
      }

      // Business rule validations
      if (order.payment_status === 'paid' || order.payment_status === 'refunded') {
        throw new HttpException(400, `Cannot delete paid order ${order.order_number}`);
      }

      if (order.order_status === 'delivered') {
        throw new HttpException(400, `Cannot delete delivered order ${order.order_number}`);
      }

      if (order.fulfillment_status === 'fulfilled') {
        throw new HttpException(400, `Cannot delete fulfilled order ${order.order_number}`);
      }
    }

    // Perform soft delete
    const deletedOrders = await softDeleteOrders(orderIds, userId);

    logger.info('Orders soft deleted', {
      deletedCount: deletedOrders.length,
      orderIds,
      userId,
    });

    return deletedOrders;
  }
}

export const orderManagementService = new OrderManagementService();
