/**
 * Order validation utilities
 * Consolidates common validation logic used across order components
 */

import type { OrderItem } from '../types';

/**
 * Validate if order can be placed (stock availability check)
 */
export function validateStockAvailability(items: OrderItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  items.forEach((item) => {
    if (item.quantity > item.availableStock) {
      errors.push(
        `${item.productName}: Requested ${item.quantity}, only ${item.availableStock} available`,
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate order items (basic validation)
 */
export function validateOrderItems(items: OrderItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('Order must contain at least one item');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.productName || item.productName.trim() === '') {
      errors.push(`Item ${index + 1}: Product name is required`);
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }

    if (item.costPrice < 0) {
      errors.push(`Item ${index + 1}: Cost price cannot be negative`);
    }

    if (item.discountValue < 0) {
      errors.push(`Item ${index + 1}: Discount value cannot be negative`);
    }

    if (item.discountType === 'percentage' && item.discountValue > 100) {
      errors.push(`Item ${index + 1}: Percentage discount cannot exceed 100%`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate order pricing
 */
export function validateOrderPricing(pricing: {
  subtotal: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (pricing.subtotal < 0) {
    errors.push('Subtotal cannot be negative');
  }

  if (pricing.grandTotal < 0) {
    errors.push('Grand total cannot be negative');
  }

  if (pricing.advancePaid < 0) {
    errors.push('Advance paid cannot be negative');
  }

  if (pricing.balanceDue < 0) {
    errors.push('Balance due cannot be negative');
  }

  // Check if balance calculation is correct
  const expectedBalance = pricing.grandTotal - pricing.advancePaid;
  if (Math.abs(pricing.balanceDue - expectedBalance) > 0.01) {
    errors.push('Balance due calculation is incorrect');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}