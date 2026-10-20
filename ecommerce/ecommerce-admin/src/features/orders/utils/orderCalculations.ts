import type { OrderItem, OrderPricing, Address } from "../types";

/**
 * Calculate total for a single order item including discount
 */
export function calculateItemTotal(item: OrderItem): {
  subtotal: number;
  discount: number;
  total: number;
} {
  // Defensive guards against undefined/null values
  const costPrice = item.costPrice ?? 0;
  const quantity = item.quantity ?? 0;
  const discountValue = item.discountValue ?? 0;

  const subtotal = costPrice * quantity;

  let discount = 0;
  if (item.discountType === "percentage") {
    discount = (subtotal * discountValue) / 100;
  } else if (item.discountType === "fixed") {
    discount = discountValue * quantity;
  }

  const total = subtotal - discount;

  return { subtotal, discount, total };
}

/**
 * Calculate total for all items
 */
export function calculateItemsSubtotal(items: OrderItem[]): {
  subtotal: number;
  discounts: number;
  totalAfterDiscounts: number;
} {
  let subtotal = 0;
  let discounts = 0;

  items.forEach((item) => {
    const itemCalc = calculateItemTotal(item);
    subtotal += itemCalc.subtotal;
    discounts += itemCalc.discount;
  });

  const totalAfterDiscounts = subtotal - discounts;

  return { subtotal, discounts, totalAfterDiscounts };
}

/**
 * Calculate order-level discount
 */
export function calculateOrderDiscount(
  amount: number,
  discountType: "" | "percentage" | "fixed",
  discountValue: number,
): number {
  if (discountType === "percentage") {
    return (amount * discountValue) / 100;
  } else if (discountType === "fixed") {
    return discountValue;
  }
  return 0;
}

/**
 * Auto-detect tax type based on shipping and billing addresses
 * Returns 'cgst_sgst' for intra-state, 'igst' for inter-state, 'none' for international
 */
export function detectTaxType(
  shippingAddress: Address | null,
  billingAddress: Address | null,
  isInternational: boolean,
): "cgst_sgst" | "igst" | "none" {
  if (isInternational || !shippingAddress || !billingAddress) {
    return "none";
  }

  // Same state = intra-state = CGST + SGST
  // Different state = inter-state = IGST
  // return shippingAddress.state === billingAddress.state ? "cgst_sgst" : "igst";

  // Tax disabled as per client request (No GST)
  return "none";
}

/**
 * Calculate GST (CGST + SGST or IGST)
 */
export function calculateGST(
  taxableAmount: number,
  taxType: "cgst_sgst" | "igst" | "none",
  cgstRate: number = 9,
  sgstRate: number = 9,
  igstRate: number = 18,
): {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
} {
  if (taxType === "none") {
    return { cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
  }

  if (taxType === "cgst_sgst") {
    const cgst = (taxableAmount * cgstRate) / 100;
    const sgst = (taxableAmount * sgstRate) / 100;
    return {
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: 0,
      totalTax: parseFloat((cgst + sgst).toFixed(2)),
    };
  }

  // IGST
  const igst = (taxableAmount * igstRate) / 100;
  return {
    cgst: 0,
    sgst: 0,
    igst: parseFloat(igst.toFixed(2)),
    totalTax: parseFloat(igst.toFixed(2)),
  };
}

/**
 * Calculate complete order pricing
 */
export function calculateOrderPricing(
  items: OrderItem[],
  orderDiscountType: "" | "percentage" | "fixed",
  orderDiscountValue: number,
  taxType: "cgst_sgst" | "igst" | "none",
  cgstRate: number,
  sgstRate: number,
  igstRate: number,
  shippingCharge: number,
  codCharge: number,
  giftCardAmount: number,
  advancePaid: number,
): OrderPricing {
  // Calculate items total
  const itemsCalc = calculateItemsSubtotal(items);

  // Calculate order-level discount
  const orderDiscount = calculateOrderDiscount(
    itemsCalc.totalAfterDiscounts,
    orderDiscountType,
    orderDiscountValue,
  );

  // Taxable amount (after all discounts)
  const taxableAmount = itemsCalc.totalAfterDiscounts - orderDiscount;

  // Calculate GST
  const gst = calculateGST(
    taxableAmount,
    taxType,
    cgstRate,
    sgstRate,
    igstRate,
  );

  // Calculate grand total
  const grandTotal =
    taxableAmount + gst.totalTax + shippingCharge + codCharge - giftCardAmount;

  // Calculate balance due
  const balanceDue = grandTotal - advancePaid;

  return {
    subtotal: parseFloat(itemsCalc.subtotal.toFixed(2)),
    productDiscountsTotal: parseFloat(itemsCalc.discounts.toFixed(2)),
    orderDiscount: parseFloat(orderDiscount.toFixed(2)),
    orderDiscountType,
    orderDiscountValue,

    taxType,
    cgst: gst.cgst,
    cgstRate,
    sgst: gst.sgst,
    sgstRate,
    igst: gst.igst,
    igstRate,

    shippingCharge,
    codCharge,
    giftCardCode: "", // This is set separately
    giftCardAmount,

    grandTotal: parseFloat(grandTotal.toFixed(2)),
    advancePaid,
    balanceDue: parseFloat(balanceDue.toFixed(2)),
  };
}

/**
 * Format currency based on currency code
 */
export function formatCurrency(
  amount: number,
  currency: "INR" | "USD" | "EUR",
): string {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
  };

  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbols[currency]}${formatted}`;
}

/**
 * Calculate discount percentage from amounts
 */
export function calculateDiscountPercentage(
  originalAmount: number,
  discountedAmount: number,
): number {
  if (originalAmount === 0) return 0;
  return parseFloat(
    (((originalAmount - discountedAmount) / originalAmount) * 100).toFixed(2),
  );
}
