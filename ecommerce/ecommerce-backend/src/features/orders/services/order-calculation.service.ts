/**
 * Order Calculation Service
 * Handles all order pricing, discounts, taxes, and financial calculations
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../../database';
import { discounts } from '../../discount/shared/discount.schema';
import { discountCodes } from '../../discount/shared/discount-codes.schema';
import { logger } from '../../../utils';
import { calculateGST } from '../../../utils/helpers/tax-calculator';

// Interfaces defined in shared/interface.ts — imported for class usage and re-exported for backward compatibility
import type {
  OrderItemInput,
  OrderPricingInput,
  OrderPricing,
  GSTCalculation,
} from '../shared/interface';
export type { OrderItemInput, OrderPricingInput, OrderPricing, GSTCalculation };

class OrderCalculationService {
  /**
   * Calculate comprehensive order pricing including items, discounts, shipping, and taxes
   *
   * This is the central pricing calculation method that:
   * 1. Calculates item subtotals and discounts
   * 2. Applies order-level discount codes
   * 3. Adds shipping costs
   * 4. Calculates GST (CGST/SGST or IGST)
   * 5. Returns complete pricing breakdown
   *
   * @param input - Order pricing input containing items, discounts, and location
   * @param input.items - Array of order items with quantities and prices
   * @param input.discount_code - Optional discount code to apply
   * @param input.shipping_amount - Shipping cost (default: 0)
   * @param input.delivery_price - Delivery price override
   * @param input.shipping_state - Shipping location for tax calculation
   * @param input.billing_state - Billing location for tax calculation
   *
   * @returns Promise resolving to complete pricing breakdown
   * @throws {HttpException} If discount code is invalid or expired
   *
   * @example
   * const pricing = await orderCalculationService.calculateOrderPricing({
   *   items: [
   *     { product_id: 'abc', quantity: 2, unit_price: 100, product_name: 'Widget', product_sku: 'W-001', cost_price: 50 }
   *   ],
   *   discount_code: 'SAVE10',
   *   shipping_amount: 50,
   *   shipping_state: 'MH',
   *   billing_state: 'MH',
   * });
   * // Returns: { subtotal: 200, discount_total: 20, tax_amount: 41.40, total_amount: 271.40, ... }
   */
  async calculateOrderPricing(input: OrderPricingInput): Promise<OrderPricing> {
    // Calculate item-level pricing
    const processedItems = input.items.map((item) => {
      const lineSubtotal = item.quantity * item.unit_price;

      // Calculate discount
      let discountAmount = item.discount_amount || 0;
      if (item.discount_percentage && item.discount_percentage > 0) {
        discountAmount = (lineSubtotal * item.discount_percentage) / 100;
      }

      const lineAfterDiscount = lineSubtotal - discountAmount;

      // No tax calculation
      const lineTotal = lineAfterDiscount;

      return {
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
        discount_amount: discountAmount,
        discount_percentage: item.discount_percentage || 0,
        tax_amount: 0,
        tax_percentage: 0,
        line_subtotal: lineSubtotal,
        line_total: lineTotal,
      };
    });

    // Calculate subtotal (sum of all line subtotals)
    const subtotal = processedItems.reduce((sum, item) => sum + item.line_subtotal, 0);

    // Calculate total quantity
    const totalQuantity = input.items.reduce((sum, item) => sum + item.quantity, 0);

    // Apply order-level discount code
    let orderLevelDiscount = 0;
    if (input.discount_code) {
      orderLevelDiscount = await this.calculateDiscountAmount(input.discount_code, subtotal);
    }

    const discountTotal = orderLevelDiscount;
    const subtotalAfterDiscounts = subtotal - discountTotal;

    // Calculate shipping
    const shippingAmount = input.shipping_amount || 0;
    const deliveryPrice = input.delivery_price || shippingAmount;

    // Calculate final total (no tax)
    const totalAmount = subtotalAfterDiscounts + shippingAmount;

    return {
      subtotal,
      discount_total: discountTotal,
      shipping_amount: shippingAmount,
      delivery_price: deliveryPrice,
      tax_amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
      items: processedItems,
    };
  }

  /**
   * Calculate discount amount from discount code
   *
   * Validates discount code and calculates applicable discount amount based on:
   * - Discount type (percentage or fixed amount)
   * - Validity period (starts_at, ends_at)
   * - Minimum requirements (min_amount, min_quantity)
   * - Maximum discount limit
   * - Active status
   *
   * @param discountCodeStr - Discount code to validate and apply
   * @param subtotal - Order subtotal before discount
   * @returns Promise resolving to discount amount (0 if invalid/expired)
   *
   * @example
   * const discount = await orderCalculationService.calculateDiscountAmount('SAVE10', 1000);
   * // Returns: 100 (if SAVE10 is 10% off)
   */
  async calculateDiscountAmount(discountCodeStr: string, subtotal: number): Promise<number> {
    try {
      // Look up the discount code
      const [discountCode] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.code, discountCodeStr));

      if (!discountCode) {
        logger.warn('Discount code not found', { discountCodeStr });
        return 0;
      }

      // Get the associated discount campaign
      const [discount] = await db
        .select()
        .from(discounts)
        .where(and(eq(discounts.id, discountCode.discount_id), eq(discounts.status, 'active')));

      if (!discount) {
        logger.warn('Discount campaign not found or inactive', { discountCodeStr });
        return 0;
      }

      // Check validity dates
      const now = new Date();
      if (discount.starts_at && new Date(discount.starts_at) > now) {
        logger.warn('Discount not yet valid', { discountCodeStr });
        return 0;
      }
      if (discount.ends_at && new Date(discount.ends_at) < now) {
        logger.warn('Discount expired', { discountCodeStr });
        return 0;
      }

      // Check minimum requirement
      if (
        discount.min_requirement_type === 'min_amount' &&
        discount.min_requirement_value &&
        subtotal < parseFloat(discount.min_requirement_value)
      ) {
        logger.warn('Minimum purchase not met for discount', {
          discountCodeStr,
          subtotal,
          minimum: discount.min_requirement_value,
        });
        return 0;
      }

      // Calculate discount based on type
      let discountAmount = 0;
      if (discount.type === 'percentage' && discount.value) {
        discountAmount = (subtotal * parseFloat(discount.value)) / 100;
      } else if (discount.type === 'fixed_amount' && discount.value) {
        discountAmount = parseFloat(discount.value);
      }

      // Apply max discount limit if exists
      if (
        discount.max_discount_amount &&
        discountAmount > parseFloat(discount.max_discount_amount)
      ) {
        discountAmount = parseFloat(discount.max_discount_amount);
      }

      logger.info('Discount calculated', { discountCodeStr, discountAmount });
      return discountAmount;
    } catch (error) {
      logger.error('Error calculating discount', {
        discountCodeStr,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Calculate GST (Goods and Services Tax) for Indian orders.
   *
   * Delegates to the global `calculateGST` utility from `src/utils/tax-calculator.ts`.
   *
   * Tax calculation logic:
   * - **Intra-state** (same state): CGST (9%) + SGST (9%) = 18% total
   * - **Inter-state** (different states): IGST (18%)
   *
   * @param subtotal - Order subtotal before tax
   * @param shippingState - Destination state code (e.g., "MH", "DL")
   * @param billingState - Billing state code
   * @returns Tax breakdown object with CGST, SGST, IGST, and total tax amount
   *
   * @example
   * // Intra-state (Maharashtra to Maharashtra)
   * const tax = orderCalculationService.calculateGST(1000, 'MH', 'MH');
   * // Returns: { cgst: 90, sgst: 90, igst: 0, taxAmount: 180 }
   *
   * @example
   * // Inter-state (Maharashtra to Delhi)
   * const tax = orderCalculationService.calculateGST(1000, 'DL', 'MH');
   * // Returns: { cgst: 0, sgst: 0, igst: 180, taxAmount: 180 }
   */
  calculateGST(subtotal: number, shippingState: string, billingState: string): GSTCalculation {
    // Delegate to the global tax utility (exclusive tax, default 18% GST rate)
    return calculateGST(subtotal, billingState, shippingState);
  }

  /**
   * Calculate item line total including discounts and taxes
   *
   * @param quantity - Item quantity
   * @param unitPrice - Price per unit
   * @param discountPercentage - Discount percentage (0-100)
   * @param taxPercentage - Tax percentage (default: 18)
   * @returns Line total amount
   */
  calculateItemLineTotal(
    quantity: number,
    unitPrice: number,
    discountPercentage: number = 0,
    taxPercentage: number = 18,
  ): number {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxPercentage) / 100;
    return afterDiscount + taxAmount;
  }

  /**
   * Calculate profit margin for an order or item
   *
   * @param sellingPrice - Final selling price (after discounts)
   * @param costPrice - Cost price
   * @returns Profit amount and profit margin percentage
   */
  calculateProfit(sellingPrice: number, costPrice: number): { profit: number; margin: number } {
    const profit = sellingPrice - costPrice;
    const margin = costPrice > 0 ? (profit / costPrice) * 100 : 0;
    return { profit, margin };
  }
}

export const orderCalculationService = new OrderCalculationService();
