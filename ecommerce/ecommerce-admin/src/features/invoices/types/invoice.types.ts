export type InvoiceStatus = "draft" | "generated" | "sent" | "cancelled";
export type InvoiceReason = "INITIAL" | "CORRECTION" | "REFUND";

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  latest_version: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface InvoiceVersion {
  id: string;
  invoice_id: string;
  version_number: number;
  customer_name: string;
  customer_email: string;
  customer_gstin?: string | null;
  billing_address: string;
  shipping_address: string;
  place_of_supply: string;

  // Totals
  subtotal: string; // decimal from DB comes as string
  discount: string;
  shipping: string;
  tax_amount: string;
  grand_total: string;

  // GST
  cgst: string;
  sgst: string;
  igst: string;
  tax_type: "cgst_sgst" | "igst" | "none";

  // Files
  pdf_url?: string | null;
  pdf_path?: string | null;
  pdf_generated_at?: string | null;

  reason: InvoiceReason;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_version_id: string;
  product_name: string;
  sku: string;
  hsn_code?: string;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  line_total: string;
}

export interface InvoiceResponse extends Invoice {
  version: InvoiceVersion;
  lineItems?: InvoiceLineItem[];
}

// For the Admin List View response (which matches the above structure in practice)
export type InvoiceListItem = InvoiceResponse;
