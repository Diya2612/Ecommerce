/**
 * Invoice Interfaces
 * Domain types and API request/response shapes for invoice management.
 */

import type { Invoice, InvoiceVersion, InvoiceLineItem } from '.';

export interface InvoiceResponse {
  invoice: Invoice;
  invoiceVersion: InvoiceVersion;
  lineItems: InvoiceLineItem[];
}

export interface GenerateInvoiceRequest {
  order_id: string;
}

export interface InvoiceDownloadResponse {
  invoice_number: string;
  file_name: string;
  content_type: string;
  content_length: number;
  data: Buffer;
}
