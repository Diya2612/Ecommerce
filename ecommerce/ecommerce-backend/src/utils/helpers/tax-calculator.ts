/**
 * Tax Calculator Utility
 * Handles GST calculations for invoices and orders.
 */
export interface GSTCalculation {
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  taxableValue: number;
}

/**
 * Calculates Goods and Services Tax (GST).
 * Supports both inclusive and exclusive tax calculations.
 *
 * @param amount The amount to calculate tax on
 * @param billingState Billing state code
 * @param shippingState Shipping state code
 * @param taxRate Percentage rate (e.g., 18 for 18%)
 * @param isInclusive Whether the provided amount already includes tax
 * @returns Breakdown of tax components and taxable value
 */
export const calculateGST = (
  amount: number,
  billingState: string,
  shippingState: string,
  taxRate: number = 18,
  isInclusive: boolean = false,
): GSTCalculation => {
  let taxableValue = 0;
  let taxAmount = 0;

  if (isInclusive) {
    // Amount includes tax: Tax = Amount - (Amount / (1 + Rate/100))
    // Taxable Value = Amount - Tax
    const divisor = 1 + taxRate / 100;
    taxableValue = amount / divisor;
    taxAmount = amount - taxableValue;
  } else {
    // Amount is exclusive of tax: Tax = Amount * Rate/100
    taxableValue = amount;
    taxAmount = (amount * taxRate) / 100;
  }

  // Determine tax components (Intra-state vs Inter-state)
  const isIntraState =
    billingState && shippingState && billingState.toLowerCase() === shippingState.toLowerCase();

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIntraState) {
    cgst = taxAmount / 2;
    sgst = taxAmount / 2;
  } else {
    igst = taxAmount;
  }

  return {
    cgst,
    sgst,
    igst,
    taxAmount,
    taxableValue,
  };
};
