import type { Order, OrderTag } from "./domain.types";

// ==================== API Query Params ====================

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  salesChannel?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ==================== API Response Types ====================

export interface OrdersApiResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Product Search API Types ====================

export interface ProductSearchParams {
  query?: string;
  limit?: number;
  check_stock?: boolean;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
}

// ==================== Order Tag API Types ====================

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface CreateTagResponse {
  tag: OrderTag;
}

export interface OrderTagsResponse {
  tags: OrderTag[];
}

// ==================== Bulk Operations API Types ====================

export interface BulkDeleteRequest {
  order_ids: string[];
}

export interface BulkDeleteResponse {
  deleted_count: number;
  order_ids: string[];
}

// ==================== Duplicate Order API Types ====================

export interface DuplicateOrderResponse {
  order: Order; // Uses same structure as Order type
}

// ==================== Email Template API Types ====================

export interface EmailTemplatesResponse {
  templates: {
    id: string;
    name: string;
    subject: string;
    category: string;
  }[];
}

// ==================== Constants ====================

// Delivery Partner Options
export const DELIVERY_PARTNERS = [
  "BlueDart",
  "Delhivery",
  "DTDC",
  "FedEx",
  "DHL",
  "India Post",
  "Ecom Express",
  "Shadowfax",
  "XpressBees",
] as const;

// Sales Channel Options
export const SALES_CHANNELS = [
  { value: "website", label: "Website" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "retail", label: "Retail Store" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

// Currency Options
export const CURRENCIES = [
  { value: "INR", label: "₹ INR", symbol: "₹" },
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
] as const;

// Payment Method Options
export const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "prepaid", label: "Prepaid" },
  { value: "partial", label: "Partial Payment" },
  { value: "credit", label: "Credit" },
] as const;

// Tax Type Options
export const TAX_TYPES = [
  { value: "cgst_sgst", label: "CGST + SGST (Intra-State)" },
  { value: "igst", label: "IGST (Inter-State)" },
  { value: "none", label: "No Tax (International)" },
] as const;