import { invoiceConfig } from '../config/invoice.config';
import { calculateGST } from '../../../utils/helpers/tax-calculator';
import { NewInvoiceLineItem } from '../shared';

/**
 * Invoice Calculator Service
 * Logic for computing taxes, totals, and mapping line items.
 */
export class InvoiceCalculatorService {
  /** Calculates base totals, GST breakdown, and grand total including shipping. */
  calculateTotals(
    orderItemsResult: { quantity: number; cost_price: string }[],
    billingAddress: { state_province?: string | null } | null,
    shippingAddress: { state_province?: string | null } | null,
    shippingAmountStr: string | null,
  ) {
    let itemsTotal = 0;
    orderItemsResult.forEach((item) => {
      itemsTotal += item.quantity * parseFloat(item.cost_price);
    });

    const { taxableValue, taxAmount, cgst, sgst, igst } = calculateGST(
      itemsTotal,
      billingAddress?.state_province || '',
      shippingAddress?.state_province || '',
      invoiceConfig.tax.rate,
      invoiceConfig.tax.isInclusive,
    );

    const shippingAmount = parseFloat(shippingAmountStr || '0');
    const grandTotal = taxableValue + taxAmount + shippingAmount;

    return {
      taxableValue,
      taxAmount,
      cgst,
      sgst,
      igst,
      shippingAmount,
      grandTotal,
    };
  }

  /** Maps raw order items to the invoice version line item schema. */
  mapOrderItemsToLineItems(
    invoiceVersionId: string,
    orderItemsResult: {
      product_name: string;
      sku?: string | null;
      hsn_code?: string | null;
      quantity: number;
      cost_price: string;
    }[],
    cgst: number,
    sgst: number,
    igst: number,
  ): NewInvoiceLineItem[] {
    return orderItemsResult.map((item) => ({
      id: crypto.randomUUID(),
      invoice_version_id: invoiceVersionId,
      product_name: item.product_name,
      sku: item.sku || '',
      hsn_code: item.hsn_code || '0000',
      quantity: item.quantity,
      unit_price: item.cost_price,
      tax_rate: '18',
      cgst_amount: (cgst / orderItemsResult.length).toString(),
      sgst_amount: (sgst / orderItemsResult.length).toString(),
      igst_amount: (igst / orderItemsResult.length).toString(),
      line_total: (item.quantity * parseFloat(item.cost_price)).toString(),
      created_at: new Date(),
      updated_at: new Date(),
    }));
  }
}

export const invoiceCalculatorService = new InvoiceCalculatorService();
