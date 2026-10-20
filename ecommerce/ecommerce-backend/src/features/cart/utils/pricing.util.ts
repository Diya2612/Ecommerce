/**
 * Pricing Utility
 * Centralized logic for cart item pricing calculations.
 */

export interface PricingCalculationResult {
  discountAmount: string;
  lineSubtotal: string;
  lineTotal: string;
}

/**
 * Calculate pricing totals for a cart line item.
 * Returns stringified, 2-decimal formatted totals.
 *
 * NOTE: Both lineSubtotal and lineTotal use sellingPrice (final_price) because:
 * - The sellingPrice is already the discounted price customers pay
 * - For consistency with order calculations
 * - compareAtPrice is stored separately in cost_price for display purposes only
 */
export const calculateItemPricing = (
  sellingPrice: number,
  compareAtPrice: number,
  quantity: number,
): PricingCalculationResult => {
  const effectiveComparePrice = Math.max(compareAtPrice, sellingPrice);
  const perUnitDiscount = effectiveComparePrice - sellingPrice;

  return {
    discountAmount: (perUnitDiscount * quantity).toFixed(2),
    lineSubtotal: (sellingPrice * quantity).toFixed(2), // Fixed: Use sellingPrice for consistency
    lineTotal: (sellingPrice * quantity).toFixed(2),
  };
};
