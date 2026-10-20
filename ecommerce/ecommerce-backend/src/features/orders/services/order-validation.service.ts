/**
 * Order Validation Service
 * Handles order data validation, stock validation, and data transformation
 */

import { validateStockAvailability } from '../../inventory/services';
import { HttpException, logger } from '../../../utils';

// Interfaces defined in shared/interface.ts — imported for class usage and re-exported for backward compatibility
import type {
  ValidationResult,
  OrderItemForValidation,
  OrderDataForValidation,
  OrderItemForMapping,
} from '../shared/interface';
export type {
  ValidationResult,
  OrderItemForValidation,
  OrderDataForValidation,
  OrderItemForMapping,
};

class OrderValidationService {
  /**
   * Validate order data before processing to ensure data integrity
   *
   * Validates:
   * - At least one item present
   * - All items have valid quantities (> 0)
   * - All items have valid prices (>= 0)
   * - Customer information present (user_id or billing_email)
   * - Shipping and billing addresses present
   * - Total amount is positive
   *
   * @param orderData - Order data to validate
   * @returns Validation result with isValid flag and array of error messages
   *
   * @example
   * const result = orderValidationService.validateOrder({ items: [] });
   * // Returns: { isValid: false, errors: ['Order must have at least one item'] }
   *
   * @example
   * const result = orderValidationService.validateOrder({
   *   items: [{ quantity: 2, unit_price: 100 }],
   *   user_id: 'user-123',
   *   shipping_address_line1: '123 Main St',
   *   billing_address_line1: '123 Main St',
   *   total_amount: 236
   * });
   * // Returns: { isValid: true, errors: [] }
   */
  validateOrder(orderData: OrderDataForValidation): ValidationResult {
    const errors: string[] = [];

    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      errors.push('Order must have at least one item');
    } else {
      // Validate each item
      orderData.items.forEach((item, index) => {
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item at index ${index} has invalid quantity`);
        }
        if (item.unit_price !== undefined && item.unit_price < 0) {
          errors.push(`Item at index ${index} has invalid price`);
        }
      });
    }

    // Validate customer
    if (!orderData.user_id && !orderData.billing_email) {
      errors.push('Order must have a customer (user_id) or billing email');
    }

    // Validate addresses
    if (!orderData.shipping_address_line1) {
      errors.push('Shipping address is required');
    }

    if (!orderData.billing_address_line1) {
      errors.push('Billing address is required');
    }

    // Validate amounts
    if (orderData.total_amount !== undefined && orderData.total_amount <= 0) {
      errors.push('Order total must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate stock availability for order items and handle appropriately
   *
   * Checks if sufficient stock exists for all items in the order.
   * Behavior depends on `allowOverselling` parameter:
   * - If `true`: Logs warning but allows order to proceed (admin override)
   * - If `false`: Throws HttpException preventing order creation (user orders)
   *
   * @param items - Array of items to validate with product IDs and quantities
   * @param allowOverselling - Whether to allow order with insufficient stock
   * @throws {HttpException} 400 if stock insufficient and overselling not allowed
   *
   * @example
   * // User order - strict validation
   * await orderValidationService.validateAndWarnStock(
   *   [{ product_id: 'prod-123', quantity: 5 }],
   *   false  // Will throw if insufficient stock
   * );
   *
   * @example
   * // Admin order - allow overselling
   * await orderValidationService.validateAndWarnStock(
   *   [{ product_id: 'prod-123', quantity: 100 }],
   *   true  // Will log warning but proceed
   * );
   */
  async validateAndWarnStock(
    items: OrderItemForValidation[],
    allowOverselling: boolean,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const validations = await validateStockAvailability(items);
    const failures = validations.filter((v) => !v.available);

    if (failures.length > 0) {
      const errorMessages = failures.map((f) => f.message).join('; ');

      if (allowOverselling) {
        logger.warn(`Order proceeding with insufficient stock: ${errorMessages}`);
      } else {
        throw new HttpException(400, `Insufficient stock: ${errorMessages}`);
      }
    }
  }

  /**
   * Validate item quantities are positive integers
   *
   * @param items - Items to validate
   * @returns Validation result
   */
  validateItemQuantities(items: Array<{ quantity: number }>): ValidationResult {
    const errors: string[] = [];

    items.forEach((item, index) => {
      if (!Number.isInteger(item.quantity)) {
        errors.push(`Item at index ${index} has non-integer quantity`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item at index ${index} has invalid quantity: ${item.quantity}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order status transition is allowed
   *
   * @param currentStatus - Current order status
   * @param newStatus - New order status to transition to
   * @returns Validation result
   */
  validateStatusTransition(currentStatus: string, newStatus: string): ValidationResult {
    const errors: string[] = [];

    // Define allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned'],
      cancelled: [], // Cannot transition from cancelled
      returned: [], // Cannot transition from returned
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform order items from request format to database format
   *
   * Maps order item data to the structure required for `order_items` table insertion.
   * Handles default values for missing fields and type conversions.
   *
   * @param orderId - Order ID to associate items with
   * @param items - Array of order items from request/cart
   * @returns Array of items formatted for database insertion
   *
   * @example
   * const dbItems = orderValidationService.mapOrderItems('order-uuid', [
   *   {
   *     product_id: 'prod-123',
   *     sku: 'WIDGET-001',
   *     product_name: 'Premium Widget',
   *     quantity: 2,
   *     cost_price: 50,
   *     line_total: 200
   *   }
   * ]);
   * // Returns: [{ order_id: 'order-uuid', product_id: 'prod-123', sku: 'WIDGET-001', ... }]
   */
  mapOrderItems(orderId: string, items: OrderItemForMapping[]) {
    return items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      sku: item.sku || 'UNKNOWN',
      product_name: item.product_name || 'Unknown Product',
      product_image: item.product_image || null,
      cost_price: String(item.cost_price),
      quantity: item.quantity,
      line_total: String(item.line_total),
    }));
  }

  /**
   * Validate email format
   *
   * @param email - Email to validate
   * @returns True if valid email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Indian format)
   *
   * @param phone - Phone number to validate
   * @returns True if valid phone format
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Validate pincode (Indian format)
   *
   * @param pincode - Pincode to validate
   * @returns True if valid pincode format
   */
  validatePincode(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
}

export const orderValidationService = new OrderValidationService();
