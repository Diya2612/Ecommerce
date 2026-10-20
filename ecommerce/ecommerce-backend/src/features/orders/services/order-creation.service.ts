/**
 * Order Creation Service
 * Handles order creation from cart and direct admin orders
 */

import { db } from '../../../database';
import { logger } from '../../../utils';
import { orderCalculationService } from './order-calculation.service';
import { orderValidationService } from './order-validation.service';
import { orderNotificationService } from './order-notification.service';
import { orderConversionService } from './order-conversion.service';
import { sql } from 'drizzle-orm';

class OrderCreationService {
  /**
   * Generate a unique, sequential order number for the current year
   *
   * Format: `ORD-YY-NNNNNN` where:
   * - YY = Last 2 digits of current year
   * - NNNNNN = Zero-padded sequential number (resets yearly)
   *
   * @returns Promise resolving to unique order number (e.g., "ORD-24-000123")
   *
   * @example
   * const orderNumber = await orderCreationService.generateOrderNumber();
   * // Returns: "ORD-26-000001" (first order of 2026)
   */
  async generateOrderNumber(): Promise<string> {
    const { orders } = await import('../shared/orders.schema');

    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Count orders created this year
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(sql`${orders.order_number} LIKE ${`ORD-${currentYear}-%`}`);

    const nextNumber = (countResult?.count || 0) + 1;
    const orderNumber = `ORD-${currentYear}-${String(nextNumber).padStart(6, '0')}`;

    logger.info('Generated order number', { orderNumber });
    return orderNumber;
  }

  /**
   * Create order from user's cart
   *
   * @param orderData - Order creation data from cart
   * @param userId - User ID creating the order
   * @param sessionId - Session ID for guest cart fallback
   * @returns Created order with details
   */
  async createOrderFromCart(
    orderData: {
      shipping_address_id?: string;
      billing_address_id?: string;
      payment_method: string;
      customer_note?: string;
    },
    userId: string,
    sessionId: string | null,
  ) {
    const {
      findActiveCartByUserId,
      getCartItems,
      findAddressById,
      findUserById,
      createOrder,
      createOrderItems,
      markCartAsConverted,
      markWishlistItemsAsPurchased,
    } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { extendCartReservation } = await import('../../inventory/services');
    const { carts } = await import('../../cart/shared/carts.schema');
    const { wishlists } = await import('../../wishlist/shared/wishlist.schema');
    const { eq } = await import('drizzle-orm');

    // Find user's active cart
    let cart = await findActiveCartByUserId(userId);

    // FALLBACK: Check for unmerged guest cart
    if (!cart && sessionId) {
      const guestCart = await findActiveCartByUserId(sessionId);
      if (guestCart) {
        // Auto-assign guest cart to user
        await db
          .update(carts)
          .set({ user_id: userId, updated_at: new Date() })
          .where(eq(carts.id, guestCart.id));
        cart = { ...guestCart, user_id: userId };
      }
    }

    if (!cart) {
      throw new HttpException(400, 'No active cart found');
    }

    // Get cart items
    const items = await getCartItems(cart.id);
    if (items.length === 0) {
      throw new HttpException(400, 'Cart is empty');
    }

    // Extend cart reservations
    try {
      await extendCartReservation(cart.id, 60);
    } catch (error) {
      logger.warn('[Create Order From Cart] Failed to extend cart reservations:', error);
    }

    // Validate stock — include reserved_quantity so the user's own cart
    // reservations (which already incremented committed_quantity) are not
    // double-counted against them.
    const stockItems = items
      .filter((item): item is typeof item & { product_id: string } => !!item.product_id)
      .map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        reserved_quantity: item.reservation_id ? item.quantity : 0,
      }));

    if (stockItems.length > 0) {
      await orderValidationService.validateAndWarnStock(stockItems, false);
    }

    // Extract cart data
    const cartData = await orderConversionService.extractCartData(cart.id);

    // Fetch addresses
    const shippingAddress = orderData.shipping_address_id
      ? await findAddressById(orderData.shipping_address_id)
      : null;
    const billingAddressId = orderData.billing_address_id || orderData.shipping_address_id;
    const billingAddress = billingAddressId ? await findAddressById(billingAddressId) : null;

    if (!shippingAddress || !billingAddress) {
      throw new HttpException(400, 'Shipping and billing addresses are required');
    }

    // Calculate pricing
    const pricing = await orderCalculationService.calculateOrderPricing({
      items: cartData.items,
      discount_code: cartData.discount_code,
      shipping_amount: 0,
      shipping_state: shippingAddress.state_province || 'MH',
      billing_state: billingAddress.state_province || 'MH',
    });

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await db.transaction(async (tx) => {
      // Create order
      const newOrder = await createOrder(
        {
          order_number: orderNumber,
          user_id: userId,
          cart_id: cart.id,
          shipping_address_id: orderData.shipping_address_id || null,
          billing_address_id: billingAddressId || null,
          order_status: 'pending',
          is_draft: false,
          payment_method: orderData.payment_method,
          payment_status: 'pending',
          currency: cart.currency,
          subtotal: pricing.subtotal.toFixed(2),
          discount_amount: pricing.discount_total.toFixed(2),
          discount_code: cartData.discount_code || null,
          shipping_amount: pricing.shipping_amount.toFixed(2),
          cgst: pricing.cgst.toFixed(2),
          sgst: pricing.sgst.toFixed(2),
          igst: pricing.igst.toFixed(2),
          tax_amount: pricing.tax_amount.toFixed(2),
          total_amount: pricing.total_amount.toFixed(2),
          total_quantity: pricing.total_quantity,
          customer_note: orderData.customer_note,
          created_by: userId,
          updated_by: userId,
        },
        tx,
      );

      // Create order items
      const orderItemsData = items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        sku: item.product_sku,
        product_name: item.product_name || 'Unknown Product',
        product_image: item.product_image_url,
        cost_price: item.final_price,
        quantity: item.quantity,
        line_total: item.line_total,
      }));

      await createOrderItems(orderItemsData, tx);

      // Mark cart as converted (skip for Razorpay - wait for payment verification)
      if (orderData.payment_method !== 'razorpay') {
        await markCartAsConverted(cart.id, newOrder.id, tx);
      }

      return newOrder;
    });

    // Update wishlist items
    if (items.some((item) => item.product_id)) {
      try {
        const [wishlist] = await db
          .select({ id: wishlists.id })
          .from(wishlists)
          .where(eq(wishlists.user_id, userId))
          .limit(1);

        if (wishlist) {
          const productIds = items
            .map((item) => item.product_id)
            .filter((id): id is string => !!id);
          await markWishlistItemsAsPurchased(wishlist.id, productIds);
        }
      } catch (error) {
        logger.warn('Failed to update wishlist items:', error);
      }
    }

    // Queue notifications asynchronously
    setImmediate(async () => {
      const customer = await findUserById(userId);

      await orderNotificationService.queueCustomerOrderNotification(
        userId,
        order.id,
        order.order_number,
        order.total_amount,
        order.currency || 'INR',
      );

      await orderNotificationService.queueAdminOrderNotification(
        order.id,
        order.order_number,
        customer?.first_name || 'Customer',
        order.total_amount,
      );
    });

    logger.info('[Create Order From Cart] Order created successfully', {
      orderId: order.id,
      orderNumber: order.order_number,
    });
    return order;
  }

  /**
   * Create direct order with custom items (admin only)
   *
   * @param orderData - Direct order creation data
   * @param adminId - Admin user ID creating the order
   * @returns Created order with details
   */
  async createDirectOrder(orderData: any, adminId: string) {
    const { reserveStockForOrder } = await import('../../inventory/services');
    const { createOrder, createOrderItems } = await import('../shared/queries');
    const { users } = await import('../../user/shared/user.schema');
    const { eq } = await import('drizzle-orm');

    const targetUserId = orderData.user_id || null;

    // 1. Validate Stock (STRICT: block overselling)
    const stockItems = orderData.items
      .filter((item: any) => item.product_id)
      .map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variant_id: item.variant_id,
      }));

    if (stockItems.length > 0) {
      await orderValidationService.validateAndWarnStock(stockItems, false);
    }

    // 2. Calculate pricing SERVER-SIDE
    const pricing = await orderCalculationService.calculateOrderPricing({
      items: orderData.items.map((item: any) => ({
        product_id: item.product_id || null,
        product_name: item.product_name,
        product_sku: item.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.cost_price || item.unit_price,
        discount_percentage: item.discount_percentage,
        discount_amount: item.discount_amount,
        tax_percentage: item.tax_percentage,
      })),
      discount_code: orderData.discount_code,
      shipping_amount: orderData.shipping_amount || 0,
      delivery_price: orderData.delivery_price || orderData.shipping_amount || 0,
      shipping_state: orderData.shipping_state,
      billing_state: orderData.billing_state,
    });

    const orderNumber = await this.generateOrderNumber();

    // 3. Create Order & Items
    const order = await db.transaction(async (tx) => {
      // Reserve stock (STRICT: No overselling allowed)
      if (stockItems.length > 0) {
        await reserveStockForOrder(stockItems, orderNumber, targetUserId || 'GUEST', false);
      }

      // Insert Order with SERVER-CALCULATED pricing
      const newOrder = await createOrder(
        {
          order_number: orderNumber,
          user_id: targetUserId,
          shipping_address_id: orderData.shipping_address_id || null,
          billing_address_id: orderData.billing_address_id || orderData.shipping_address_id || null,
          order_status: 'pending',
          is_draft: orderData.is_draft,
          payment_method: orderData.payment_method,
          payment_status: 'pending',
          currency: orderData.currency,

          subtotal: pricing.subtotal.toFixed(2),
          discount_amount: pricing.discount_total.toFixed(2),
          discount_type: (orderData.discount_type || 'none') as any,
          discount_value: orderData.discount_value ? String(orderData.discount_value) : '0',
          discount_reason: orderData.discount_reason || null,
          cgst: pricing.cgst.toFixed(2),
          sgst: pricing.sgst.toFixed(2),
          igst: pricing.igst.toFixed(2),
          shipping_amount: pricing.shipping_amount.toFixed(2),
          delivery_price: pricing.delivery_price.toFixed(2),
          tax_amount: pricing.tax_amount.toFixed(2),
          total_amount: pricing.total_amount.toFixed(2),
          total_quantity: pricing.total_quantity,
          advance_paid_amount: orderData.advance_paid_amount?.toFixed(2) || '0',

          customer_note: orderData.customer_note,
          admin_comment: orderData.admin_comment,
          tags: orderData.tags as any,

          created_by: adminId,
          updated_by: adminId,
        } as any,
        tx,
      );

      // Insert Items with calculated pricing
      const orderItemsData = orderData.items.map((item: any, index: number) => ({
        order_id: newOrder.id,
        product_id: item.product_id || null,
        sku: item.sku || `CUSTOM-${Date.now()}-${index}`,
        product_name: item.product_name,
        product_image: item.product_image,
        cost_price: (item.cost_price || item.unit_price).toFixed(2),
        quantity: item.quantity,
        line_total: pricing.items[index].line_total.toFixed(2),
        variant_id: item.variant_id,
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

      await createOrderItems(orderItemsData, tx);

      return newOrder;
    });

    // Queue notifications AFTER response is sent (non-blocking)
    setImmediate(async () => {
      // 1. Notify customer if order is for a specific user
      if (targetUserId) {
        await orderNotificationService.queueCustomerOrderNotification(
          targetUserId,
          order.id,
          order.order_number,
          order.total_amount,
          order.currency || 'INR',
        );
      }

      // 2. Notify all admins about new order
      let customerName = 'Guest';
      if (targetUserId) {
        const [customer] = await db
          .select({ name: users.first_name })
          .from(users)
          .where(eq(users.id, targetUserId))
          .limit(1);
        customerName = customer?.name || 'Guest';
      }

      await orderNotificationService.queueAdminOrderNotification(
        order.id,
        order.order_number,
        customerName,
        order.total_amount,
      );
    });

    logger.info('[Create Direct Order] Order created successfully', {
      orderId: order.id,
      orderNumber: order.order_number,
    });
    return order;
  }
}

export const orderCreationService = new OrderCreationService();
