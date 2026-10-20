/**
 * Order Service (Facade)
 * Unified interface for order operations
 * Delegates to specialized services for focused responsibilities
 *
 * @deprecated Direct usage discouraged. Use specialized services instead:
 * - orderCreationService: Order creation (cart/direct)
 * - orderPaymentService: Payment operations
 * - orderUpdateService: Order updates (tracking, fulfillment, etc.)
 * - orderManagementService: Lifecycle operations (confirm, duplicate, delete)
 */

// Import specialized services
import { orderCalculationService } from './order-calculation.service';
import { orderValidationService } from './order-validation.service';
import { orderNotificationService } from './order-notification.service';
import { orderStatusService } from './order-status.service';
import { orderConversionService } from './order-conversion.service';
import { orderCreationService } from './order-creation.service';
import { orderPaymentService } from './order-payment.service';
import { orderUpdateService } from './order-update.service';
import { orderManagementService } from './order-management.service';

// Re-export types from specialized services for backward compatibility
export type { OrderItemInput, OrderPricingInput, OrderPricing } from './order-calculation.service';

export type { ValidationResult } from './order-validation.service';

/**
 * OrderService - Facade pattern
 *
 * This service acts as a unified interface for backward compatibility.
 * All implementations now delegate to specialized services.
 *
 * For new code, use the specialized services directly:
 * - orderCreationService
 * - orderPaymentService
 * - orderUpdateService
 * - orderManagementService
 */
class OrderService {
  /**
   * Generate a unique, sequential order number for the current year
   *
   * @deprecated Use orderCreationService.generateOrderNumber() directly
   */
  async generateOrderNumber(): Promise<string> {
    return orderCreationService.generateOrderNumber();
  }

  /**
   * Calculate comprehensive order pricing (delegates to calculation service)
   *
   * @deprecated Use orderCalculationService.calculateOrderPricing() directly
   */
  async calculateOrderPricing(input: any) {
    return orderCalculationService.calculateOrderPricing(input);
  }

  /**
   * Calculate GST (delegates to calculation service)
   *
   * @deprecated Use orderCalculationService.calculateGST() directly
   */
  calculateGST(subtotal: number, shippingState: string, billingState: string) {
    return orderCalculationService.calculateGST(subtotal, shippingState, billingState);
  }

  /**
   * Validate order data (delegates to validation service)
   *
   * @deprecated Use orderValidationService.validateOrder() directly
   */
  validateOrder(orderData: any) {
    return orderValidationService.validateOrder(orderData);
  }

  /**
   * Get specialized services for direct use
   *
   * Provides access to all specialized order services:
   * - creation: Order creation (cart/direct)
   * - payment: Payment operations (Razorpay integration)
   * - update: Order updates (tracking, fulfillment)
   * - management: Lifecycle operations (confirm, duplicate, delete)
   * - calculation: Pricing, discounts, taxes
   * - validation: Data validation, stock checks
   * - notification: Email and push notifications
   * - status: Status management and transitions
   * - conversion: Cart-to-order, draft confirmations
   */
  get services() {
    return {
      creation: orderCreationService,
      payment: orderPaymentService,
      update: orderUpdateService,
      management: orderManagementService,
      calculation: orderCalculationService,
      validation: orderValidationService,
      notification: orderNotificationService,
      status: orderStatusService,
      conversion: orderConversionService,
    };
  }

  /**
   * Update full order details including items
   *
   * @deprecated Use orderUpdateService.updateFullOrder() directly
   */
  async updateFullOrder(orderNumberOrId: string, updateData: any, userId: string) {
    return orderUpdateService.updateFullOrder(orderNumberOrId, updateData, userId);
  }

  /**
   * Create order from user's cart
   *
   * @deprecated Use orderCreationService.createOrderFromCart() directly
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
    return orderCreationService.createOrderFromCart(orderData, userId, sessionId);
  }

  /**
   * Create direct order with custom items (admin only)
   *
   * @deprecated Use orderCreationService.createDirectOrder() directly
   */
  async createDirectOrder(orderData: any, adminId: string) {
    return orderCreationService.createDirectOrder(orderData, adminId);
  }

  /**
   * Update order tracking information
   *
   * @deprecated Use orderUpdateService.updateTracking() directly
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
    return orderUpdateService.updateTracking(orderId, trackingData, userId);
  }

  /**
   * Update order fulfillment status
   *
   * @deprecated Use orderUpdateService.updateFulfillmentStatus() directly
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
    return orderUpdateService.updateFulfillmentStatus(orderId, fulfillmentData, userId);
  }

  /**
   * Update order payment status
   *
   * @deprecated Use orderPaymentService.updatePaymentStatus() directly
   */
  async updatePaymentStatus(
    orderId: string,
    paymentData: {
      payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
      paid_at?: string;
      transaction_id?: string;
      payment_ref?: string;
      notes?: string;
    },
    userId: string,
  ) {
    return orderPaymentService.updatePaymentStatus(orderId, paymentData, userId);
  }

  /**
   * Confirm draft order and reserve inventory
   *
   * @deprecated Use orderManagementService.confirmDraftOrder() directly
   */
  async confirmDraftOrder(
    orderId: string,
    confirmData: {
      send_confirmation_email?: boolean;
      notes?: string;
    },
    userId: string,
  ) {
    return orderManagementService.confirmDraftOrder(orderId, confirmData, userId);
  }

  /**
   * Duplicate an existing order
   *
   * @deprecated Use orderManagementService.duplicateOrder() directly
   */
  async duplicateOrder(orderId: string, userId: string) {
    return orderManagementService.duplicateOrder(orderId, userId);
  }

  /**
   * Soft delete orders (bulk or single)
   *
   * @deprecated Use orderManagementService.deleteOrders() directly
   */
  async deleteOrders(orderIds: string[], userId: string) {
    return orderManagementService.deleteOrders(orderIds, userId);
  }
}

export const orderService = new OrderService();
