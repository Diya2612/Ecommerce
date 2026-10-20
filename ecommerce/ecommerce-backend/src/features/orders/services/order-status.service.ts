/**
 * Order Status Service
 * Handles order status management, transitions, and workflow validation
 */

import { eq } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { orders } from '../shared/orders.schema';
import { logger } from '../../../utils';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded';

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'returned';

export interface StatusTransitionResult {
  success: boolean;
  previousStatus: string;
  newStatus: string;
  message?: string;
}

class OrderStatusService {
  /**
   * Get valid transitions for a given order status
   *
   * @param currentStatus - Current order status
   * @returns Array of valid next statuses
   */
  getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned', 'refunded'],
      cancelled: [],
      returned: ['refunded'],
      refunded: [],
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Check if status transition is valid
   *
   * @param currentStatus - Current status
   * @param newStatus - Desired new status
   * @returns True if transition is allowed
   */
  isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions = this.getValidTransitions(currentStatus);
    return validTransitions.includes(newStatus);
  }

  /**
   * Update order status with validation
   *
   * @param orderId - Order ID
   * @param newStatus - New status to set
   * @param tx - Optional transaction connection
   * @returns Status transition result
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    tx: Database = db,
  ): Promise<StatusTransitionResult> {
    // Get current order
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return {
        success: false,
        previousStatus: 'unknown',
        newStatus,
        message: 'Order not found',
      };
    }

    const currentStatus = order.order_status as OrderStatus;

    // Validate transition
    if (!this.isValidTransition(currentStatus, newStatus)) {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus,
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Update status
    await tx
      .update(orders)
      .set({
        order_status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(orders.id, orderId));

    logger.info('Order status updated', { orderId, from: currentStatus, to: newStatus });

    return {
      success: true,
      previousStatus: currentStatus,
      newStatus,
      message: 'Status updated successfully',
    };
  }

  /**
   * Update payment status
   *
   * @param orderId - Order ID
   * @param newStatus - New payment status
   * @param tx - Optional transaction connection
   */
  async updatePaymentStatus(
    orderId: string,
    newStatus: PaymentStatus,
    tx: Database = db,
  ): Promise<void> {
    await tx
      .update(orders)
      .set({
        payment_status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(orders.id, orderId));

    logger.info('Payment status updated', { orderId, status: newStatus });
  }

  /**
   * Update fulfillment status
   *
   * @param orderId - Order ID
   * @param newStatus - New fulfillment status
   * @param tx - Optional transaction connection
   */
  async updateFulfillmentStatus(
    orderId: string,
    newStatus: FulfillmentStatus,
    tx: Database = db,
  ): Promise<void> {
    await tx
      .update(orders)
      .set({
        fulfillment_status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(orders.id, orderId));

    logger.info('Fulfillment status updated', { orderId, status: newStatus });
  }

  /**
   * Mark order as paid
   *
   * Updates payment status to 'paid' and may auto-advance order status.
   *
   * @param orderId - Order ID
   * @param paymentMethod - Payment method used
   * @param transactionId - Payment transaction ID
   * @param tx - Optional transaction connection
   */
  async markAsPaid(
    orderId: string,
    paymentMethod?: string,
    transactionId?: string,
    tx: Database = db,
  ): Promise<void> {
    const updateData: any = {
      payment_status: 'paid',
      updated_at: new Date(),
    };

    if (paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    if (transactionId) {
      updateData.razorpay_payment_id = transactionId;
    }

    await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

    logger.info('Order marked as paid', { orderId, paymentMethod, transactionId });
  }

  /**
   * Mark order as cancelled
   *
   * @param orderId - Order ID
   * @param reason - Cancellation reason
   * @param cancelledBy - User ID who cancelled
   * @param tx - Optional transaction connection
   */
  async markAsCancelled(
    orderId: string,
    reason?: string,
    cancelledBy?: string,
    tx: Database = db,
  ): Promise<void> {
    const updateData: any = {
      order_status: 'cancelled',
      updated_at: new Date(),
    };

    if (reason) {
      updateData.cancellation_reason = reason;
    }

    if (cancelledBy) {
      updateData.cancelled_by = cancelledBy;
    }

    await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

    logger.info('Order cancelled', { orderId, reason, cancelledBy });
  }

  /**
   * Mark order as shipped
   *
   * @param orderId - Order ID
   * @param trackingNumber - Shipping tracking number
   * @param carrier - Shipping carrier
   * @param tx - Optional transaction connection
   */
  async markAsShipped(
    orderId: string,
    trackingNumber?: string,
    carrier?: string,
    tx: Database = db,
  ): Promise<void> {
    const updateData: any = {
      order_status: 'shipped',
      fulfillment_status: 'fulfilled',
      updated_at: new Date(),
    };

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    if (carrier) {
      updateData.carrier = carrier;
    }

    await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

    logger.info('Order marked as shipped', { orderId, trackingNumber, carrier });
  }

  /**
   * Get order status history
   *
   * Returns the progression of status changes for an order.
   * Note: This requires an order_history table to be implemented.
   * For now, returns current status only.
   *
   * @param orderId - Order ID
   * @returns Array of status changes
   */
  async getStatusHistory(orderId: string) {
    // This will be implemented when order_history table is added
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return [];
    }

    return [
      {
        status: order.order_status,
        timestamp: order.updated_at,
      },
    ];
  }

  /**
   * Check if order can be cancelled
   *
   * @param orderId - Order ID
   * @returns True if order can be cancelled
   */
  async canBeCancelled(orderId: string): Promise<boolean> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return false;
    }

    const nonCancellableStatuses: OrderStatus[] = ['shipped', 'delivered', 'cancelled', 'refunded'];
    return !nonCancellableStatuses.includes(order.order_status as OrderStatus);
  }

  /**
   * Check if order can be refunded
   *
   * @param orderId - Order ID
   * @returns True if order can be refunded
   */
  async canBeRefunded(orderId: string): Promise<boolean> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return false;
    }

    const refundableStatuses: OrderStatus[] = ['delivered', 'returned'];
    const refundablePaymentStatuses: PaymentStatus[] = ['paid'];

    return (
      refundableStatuses.includes(order.order_status as OrderStatus) &&
      refundablePaymentStatuses.includes(order.payment_status as PaymentStatus)
    );
  }

  /**
   * Update order status with all side effects (inventory, notifications, fulfillment)
   * Comprehensive status update that handles all business logic
   *
   * @param orderId - Order ID
   * @param statusUpdate - Status update data
   * @param userId - User ID performing the update
   * @param options - Additional options (IP, user agent for audit)
   * @returns Updated order
   */
  async updateOrderStatusWithSideEffects(
    orderId: string,
    statusUpdate: {
      order_status?: OrderStatus;
      payment_status?: PaymentStatus;
      fulfillment_status?: FulfillmentStatus;
      order_tracking?: string;
      admin_comment?: string;
    },
    userId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    // Note: Import these at top of file
    const { fulfillOrderInventory, releaseReservation, processOrderReturn, recordSaleForOrder } =
      await import('../../inventory/services');
    const { notificationCoreService } =
      await import('../../notifications/services/notification-core.service');
    const { findOrderById } = await import('../shared/queries');

    // Get order
    const order = await findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate order status transition
    if (statusUpdate.order_status && statusUpdate.order_status !== order.order_status) {
      const isValid = this.isValidTransition(
        order.order_status as OrderStatus,
        statusUpdate.order_status as OrderStatus,
      );

      if (!isValid) {
        const validTransitions = this.getValidTransitions(order.order_status as OrderStatus);
        throw new Error(
          `Cannot change status from "${order.order_status}" to "${statusUpdate.order_status}". ` +
            `Allowed transitions: ${validTransitions.join(', ') || 'None (Terminal State)'}`,
        );
      }

      // Require tracking number for shipped status
      if (statusUpdate.order_status === 'shipped') {
        const hasTracking = statusUpdate.order_tracking || order.order_tracking;
        if (!hasTracking) {
          throw new Error('Tracking number is required when marking an order as Shipped.');
        }
      }
    }

    // Validate payment status
    if (statusUpdate.payment_status && statusUpdate.payment_status !== order.payment_status) {
      if (statusUpdate.payment_status === 'refunded' && order.payment_status !== 'paid') {
        throw new Error('Cannot mark as Refunded if the order was never Paid.');
      }
    }

    // Build update data
    const updates: any = {};

    // Handle order status updates with side effects
    if (statusUpdate.order_status) {
      updates.order_status = statusUpdate.order_status;

      // Auto-update fulfillment status
      if (statusUpdate.order_status === 'delivered') {
        updates.fulfillment_status = 'fulfilled';
        updates.fulfillment_date = new Date();
        if (!order.delivery_date) updates.delivery_date = new Date();
      } else if (statusUpdate.order_status === 'shipped') {
        if (order.fulfillment_status === 'unfulfilled') {
          updates.fulfillment_status = 'fulfilled';
        }
      } else if (statusUpdate.order_status === 'cancelled') {
        updates.fulfillment_status = 'cancelled';

        // Release inventory if not yet shipped
        if (order.fulfillment_status === 'unfulfilled') {
          try {
            await releaseReservation(orderId, userId);
            logger.info(`Inventory reservation released for cancelled order ${order.order_number}`);
          } catch (err) {
            logger.error('Failed to release inventory reservation:', err);
          }
        }
      } else if (statusUpdate.order_status === 'returned') {
        updates.fulfillment_status = 'returned';

        // Restock inventory
        try {
          await processOrderReturn(orderId, userId);
          logger.info(`Inventory restocked for returned order ${order.order_number}`);
        } catch (err) {
          logger.error('Failed to restock inventory on return:', err);
        }
      }
    }

    if (statusUpdate.payment_status) {
      updates.payment_status = statusUpdate.payment_status;
      if (statusUpdate.payment_status === 'paid' && !order.paid_at) {
        updates.paid_at = new Date();
      }
    }

    if (statusUpdate.fulfillment_status) {
      updates.fulfillment_status = statusUpdate.fulfillment_status;
    }

    if (statusUpdate.order_tracking) {
      updates.order_tracking = statusUpdate.order_tracking;
    }

    if (statusUpdate.admin_comment) {
      updates.admin_comment = statusUpdate.admin_comment;
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await db
        .update(orders)
        .set({
          ...updates,
          updated_at: new Date(),
          updated_by: userId,
        })
        .where(eq(orders.id, orderId));
    }


    // Record sale when payment is confirmed (moves from committed to sold)
    if (statusUpdate.payment_status === 'paid' && order.payment_status !== 'paid') {
      try {
        await recordSaleForOrder(orderId, userId);
        logger.info(`Sale recorded for order ${order.order_number} - moved from committed to sold`);
      } catch (error: any) {
        logger.error('Failed to record sale:', error);
      }
    }

    // Fulfill inventory when order is shipped (deduct from available stock)
    if (statusUpdate.order_status === 'shipped' && order.order_status !== 'shipped') {
      try {
        await fulfillOrderInventory(orderId, userId);
        logger.info(`Inventory fulfilled for order ${order.order_number}`);
      } catch (error: any) {
        logger.error('Failed to fulfill inventory:', error);
      }
    }

    // Send notifications
    try {
      if (
        statusUpdate.order_status &&
        statusUpdate.order_status !== order.order_status &&
        order.user_id
      ) {
        if (statusUpdate.order_status === 'shipped') {
          await notificationCoreService.createFromTemplate({
            userId: order.user_id,
            templateCode: 'order_shipped',
            variables: {
              orderId: order.id,
              orderNumber: order.order_number,
              trackingNumber:
                statusUpdate.order_tracking || order.order_tracking || 'Not available',
              customerName: 'Customer',
            },
            actionUrl: `/profile/orders/${order.id}`,
            actionText: 'Track Order',
            priority: 'high',
          });
        } else if (statusUpdate.order_status === 'delivered') {
          await notificationCoreService.createFromTemplate({
            userId: order.user_id,
            templateCode: 'order_delivered',
            variables: {
              orderId: order.id,
              orderNumber: order.order_number,
              customerName: 'Customer',
            },
            actionUrl: `/profile/orders/${order.id}`,
            actionText: 'View Order',
            priority: 'normal',
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send notification for status update', { error, orderId });
    }

    // Return updated order
    return await findOrderById(orderId);
  }
}

export const orderStatusService = new OrderStatusService();
