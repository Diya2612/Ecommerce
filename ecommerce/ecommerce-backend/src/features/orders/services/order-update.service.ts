/**
 * Order Update Service
 * Handles order updates including tracking, fulfillment, and full order modifications
 */

import { db } from '../../../database';
import { logger } from '../../../utils';
import { orderStatusService } from './order-status.service';

class OrderUpdateService {
  /**
   * Update full order details including items
   *
   * @param orderNumberOrId - Order ID or order number
   * @param updateData - Order update data with optional items
   * @param userId - User performing the update
   * @returns Updated order
   */
  async updateFullOrder(orderNumberOrId: string, updateData: any, userId: string) {
    const { findOrderById, findOrderByNumber, updateOrder } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { validateStockAvailability } =
      await import('../../inventory/services/order-reservation.service');
    const { orderItems } = await import('../shared/order-items.schema');
    const { eq } = await import('drizzle-orm');

    // 1. Find Order
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderNumberOrId,
    );
    const existingOrder = isUuid
      ? await findOrderById(orderNumberOrId)
      : await findOrderByNumber(orderNumberOrId);

    if (!existingOrder) {
      throw new HttpException(404, 'Order not found');
    }

    const orderId = existingOrder.id;

    // 2. Perform Update Transaction
    await db.transaction(async (tx) => {
      // Update Order Fields
      const orderUpdateData: any = {
        updated_at: new Date(),
        updated_by: userId,
      };

      // Address handling
      if (updateData.shipping_address_id !== undefined) {
        orderUpdateData.shipping_address_id = updateData.shipping_address_id || null;
      }
      if (updateData.billing_address_id !== undefined) {
        orderUpdateData.billing_address_id = updateData.billing_address_id || null;
      }

      // Customer handling
      if (updateData.user_id !== undefined) orderUpdateData.user_id = updateData.user_id || null;

      if (updateData.payment_method) orderUpdateData.payment_method = updateData.payment_method;
      if (updateData.customer_note !== undefined)
        orderUpdateData.customer_note = updateData.customer_note;
      if (updateData.admin_comment !== undefined)
        orderUpdateData.admin_comment = updateData.admin_comment;

      if (updateData.order_status) orderUpdateData.order_status = updateData.order_status;
      if (updateData.payment_status) orderUpdateData.payment_status = updateData.payment_status;
      if (updateData.fulfillment_status)
        orderUpdateData.fulfillment_status = updateData.fulfillment_status;

      // Pricing Overrides
      if (updateData.subtotal) orderUpdateData.subtotal = String(updateData.subtotal);
      if (updateData.discount_total)
        orderUpdateData.discount_amount = String(updateData.discount_total);
      if (updateData.shipping_total)
        orderUpdateData.shipping_amount = String(updateData.shipping_total);
      if (updateData.tax_amount) orderUpdateData.tax_amount = String(updateData.tax_amount);
      if (updateData.total_amount) orderUpdateData.total_amount = String(updateData.total_amount);

      // Order-level Discount Updates
      if (updateData.discount_type) orderUpdateData.discount_type = updateData.discount_type;
      if (updateData.discount_value !== undefined)
        orderUpdateData.discount_value = String(updateData.discount_value);
      if (updateData.discount_reason !== undefined)
        orderUpdateData.discount_reason = updateData.discount_reason || null;

      // Tax components
      if (updateData.cgst_amount) orderUpdateData.cgst = String(updateData.cgst_amount);
      if (updateData.sgst_amount) orderUpdateData.sgst = String(updateData.sgst_amount);
      if (updateData.igst_amount) orderUpdateData.igst = String(updateData.igst_amount);
      if (updateData.cod_charges)
        orderUpdateData.partial_cod_charges = String(updateData.cod_charges);
      if (updateData.advance_paid_amount)
        orderUpdateData.advance_paid_amount = String(updateData.advance_paid_amount);

      // Metadata
      if (updateData.is_draft !== undefined) orderUpdateData.is_draft = updateData.is_draft;
      if (updateData.currency) orderUpdateData.currency = updateData.currency;
      if (updateData.tags) orderUpdateData.tags = updateData.tags;

      await updateOrder(orderId, orderUpdateData, tx);

      // 3. Update Items (If provided)
      if (updateData.items) {
        // Validate stock availability
        const stockItems = updateData.items
          .filter((item: any) => item.product_id)
          .map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            variant_id: item.variant_id || null,
          }));

        if (stockItems.length > 0) {
          const stockValidation = await validateStockAvailability(stockItems);
          const insufficientStock = stockValidation.filter((v) => !v.available);

          if (insufficientStock.length > 0) {
            const messages = insufficientStock.map((v) => v.message).join('; ');
            throw new HttpException(400, `Insufficient stock: ${messages}`);
          }
        }

        // Delete existing items
        await tx.delete(orderItems).where(eq(orderItems.order_id, orderId));

        // Insert new items
        if (updateData.items.length > 0) {
          const newItems = updateData.items.map((item: any) => ({
            order_id: orderId,
            product_id: item.product_id || null,
            sku: item.sku || 'UNKNOWN',
            product_name: item.product_name || 'Unknown Product',
            product_image: item.product_image,
            cost_price: String(item.cost_price),
            quantity: item.quantity,
            line_total: String(item.line_total),
            variant_id: item.variant_id || null,
            discount_type: item.discount_percentage
              ? 'percentage'
              : item.discount_amount
                ? 'fixed'
                : '',
            discount_value: item.discount_percentage
              ? String(item.discount_percentage)
              : item.discount_amount
                ? String(item.discount_amount)
                : '0',
            discount_reason: item.discount_reason || null,
          }));

          await tx.insert(orderItems).values(newItems);

          // Recalculate total quantity
          const totalQty = updateData.items.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          );
          await updateOrder(orderId, { total_quantity: totalQty }, tx);
        }
      }
    });

    // Return Updated Order
    const updatedOrder = await findOrderById(orderId);
    if (!updatedOrder) {
      throw new HttpException(500, 'Failed to fetch updated order');
    }

    logger.info('[Update Full Order] Order updated successfully', {
      orderId,
      orderNumber: updatedOrder.order_number,
    });
    return updatedOrder;
  }

  /**
   * Update order tracking information
   *
   * @param orderId - Order ID
   * @param trackingData - Tracking data (tracking_number, carrier, etc.)
   * @param userId - User ID performing the update
   * @returns Updated order
   */
  async updateTracking(
    orderId: string,
    trackingData: {
      tracking_number: string;
      shipping_method?: string;
      shipping_option?: string;
      carrier?: string;
      notes?: string;
    },
    userId: string,
  ) {
    const { findOrderById, updateOrder } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { eventPublisher } = await import('../../queue/services/event-publisher.service');
    const { TEMPLATE_CODES } = await import('../../notifications/shared/constants');

    // Check if order exists
    const existingOrder = await findOrderById(orderId);
    if (!existingOrder) {
      throw new HttpException(404, 'Order not found');
    }

    // Prepare update data
    const updateData: any = {
      order_tracking: trackingData.tracking_number,
      updated_at: new Date(),
      updated_by: userId,
    };

    if (trackingData.shipping_method) {
      updateData.shipping_method = trackingData.shipping_method;
    }

    if (trackingData.shipping_option) {
      updateData.shipping_option = trackingData.shipping_option;
    }

    // Update admin comment with carrier info if provided
    if (trackingData.carrier || trackingData.notes) {
      const existingComment = existingOrder.admin_comment || '';
      const timestamp = new Date().toISOString();
      let noteText = 'Tracking info added';

      if (trackingData.carrier) {
        noteText += ` - Carrier: ${trackingData.carrier}`;
      }

      if (trackingData.notes) {
        noteText += ` - ${trackingData.notes}`;
      }

      updateData.admin_comment = `${existingComment}\n[${timestamp}] ${noteText}`.trim();
    }

    // Update the order
    const updatedOrder = await updateOrder(orderId, updateData);
    if (!updatedOrder) {
      throw new HttpException(500, 'Failed to update order');
    }

    logger.info(`Tracking info updated for order ${orderId}`);

    // Send tracking notification to customer (non-blocking)
    const userIdToNotify = updatedOrder.user_id;
    if (userIdToNotify) {
      setImmediate(async () => {
        try {
          await eventPublisher.publishNotification({
            userId: userIdToNotify,
            templateCode: TEMPLATE_CODES.ORDER_TRACKING_UPDATED,
            variables: {
              orderNumber: updatedOrder.order_number,
              trackingNumber: trackingData.tracking_number,
              carrier: trackingData.carrier || 'Standard Carrier',
              shippingMethod: updatedOrder.shipping_method || 'Standard Shipping',
            },
            options: {
              priority: 'normal',
              actionUrl: `/profile/orders/${updatedOrder.id}`,
              actionText: 'Track Order',
            },
          });
          logger.info(
            `[UpdateTracking] Tracking notification queued for order ${updatedOrder.order_number}`,
          );
        } catch (error) {
          logger.error(`[UpdateTracking] Failed to queue tracking notification:`, error);
        }
      });
    }

    return updatedOrder;
  }

  /**
   * Update order fulfillment status
   *
   * @param orderId - Order ID
   * @param fulfillmentData - Fulfillment data
   * @param userId - User ID performing the update
   * @returns Updated order
   */
  async updateFulfillmentStatus(
    orderId: string,
    fulfillmentData: {
      fulfillment_status: 'unfulfilled' | 'fulfilled' | 'returned' | 'cancelled';
      fulfillment_date?: string;
      delivery_date?: string;
      tracking_number?: string;
      notes?: string;
    },
    userId: string,
  ) {
    const { findOrderById, updateOrderStatus } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { fulfillOrderInventory } = await import('../../inventory/services');
    const { eventPublisher } = await import('../../queue/services/event-publisher.service');
    const { TEMPLATE_CODES } = await import('../../notifications/shared/constants');

    // Check if order exists
    const existingOrder = await findOrderById(orderId);
    if (!existingOrder) {
      throw new HttpException(404, 'Order not found');
    }

    // Prepare update data
    const updateData: any = {
      fulfillment_status: fulfillmentData.fulfillment_status,
      updated_at: new Date(),
      updated_by: userId,
    };

    // Set fulfillment_date if status is fulfilled
    if (fulfillmentData.fulfillment_status === 'fulfilled' && !existingOrder.fulfillment_date) {
      updateData.fulfillment_date = fulfillmentData.fulfillment_date
        ? new Date(fulfillmentData.fulfillment_date)
        : new Date();
    }

    // Set delivery_date if provided
    if (fulfillmentData.delivery_date) {
      updateData.delivery_date = new Date(fulfillmentData.delivery_date);
    }

    // Update tracking number if provided
    if (fulfillmentData.tracking_number) {
      updateData.order_tracking = fulfillmentData.tracking_number;
    }

    // Update admin comment if notes provided
    if (fulfillmentData.notes) {
      const existingComment = existingOrder.admin_comment || '';
      const timestamp = new Date().toISOString();
      updateData.admin_comment =
        `${existingComment}\n[${timestamp}] Fulfillment update: ${fulfillmentData.notes}`.trim();
    }

    // Update the order using status service
    await orderStatusService.updateFulfillmentStatus(
      orderId,
      fulfillmentData.fulfillment_status as any,
    );

    // Update additional fields if needed
    if (Object.keys(updateData).length > 3) {
      await updateOrderStatus(orderId, fulfillmentData.fulfillment_status, userId);
    }

    const updatedOrder = await findOrderById(orderId);
    if (!updatedOrder) {
      throw new HttpException(404, 'Order not found after update');
    }

    logger.info(`Fulfillment status updated for order ${orderId}`, {
      old_status: existingOrder.fulfillment_status,
      new_status: updatedOrder.fulfillment_status,
    });

    // Trigger inventory adjustment if status changed to fulfilled
    if (
      fulfillmentData.fulfillment_status === 'fulfilled' &&
      existingOrder.fulfillment_status !== 'fulfilled'
    ) {
      try {
        // Allow negative stock (Admin Override)
        await fulfillOrderInventory(orderId, userId, true);
        logger.info(`Stock deducted for fulfilled order ${orderId}`);
      } catch (error) {
        logger.error(`Failed to deduct inventory for order ${orderId}:`, error);
      }
    }

    // Send fulfillment notification to customer (non-blocking)
    const userIdToNotify = updatedOrder.user_id;
    if (userIdToNotify && fulfillmentData.fulfillment_status !== existingOrder.fulfillment_status) {
      setImmediate(async () => {
        try {
          await eventPublisher.publishNotification({
            userId: userIdToNotify,
            templateCode: TEMPLATE_CODES.ORDER_FULFILLMENT_UPDATED,
            variables: {
              orderNumber: updatedOrder.order_number,
              fulfillmentStatus: fulfillmentData.fulfillment_status,
              trackingNumber:
                fulfillmentData.tracking_number || updatedOrder.order_tracking || 'Not available',
              deliveryDate: fulfillmentData.delivery_date || 'Pending',
            },
            options: {
              priority: 'normal',
              actionUrl: `/profile/orders/${updatedOrder.id}`,
              actionText: 'View Order',
            },
          });
          logger.info(
            `[UpdateFulfillment] Fulfillment notification queued for order ${updatedOrder.order_number}`,
          );
        } catch (error) {
          logger.error(`[UpdateFulfillment] Failed to queue fulfillment notification:`, error);
        }
      });
    }

    return updatedOrder;
  }
}

export const orderUpdateService = new OrderUpdateService();
