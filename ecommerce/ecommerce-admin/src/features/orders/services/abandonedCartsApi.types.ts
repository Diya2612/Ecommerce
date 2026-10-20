/**
 * Abandoned Carts API Type Definitions
 *
 * TypeScript types matching backend abandoned carts API responses
 */

// Backend abandoned cart item structure (from carts table)
// Backend abandoned cart item structure (from carts table)
export interface AbandonedCartApiItem {
  cart_id: string; // Backend sends cart_id
  customer_info: {
    name: string;
    email: string;
    phone: string | null;
  };
  cart_value: string; // Backend sends cart_value
  cart_status?: "active" | "abandoned" | "converted" | "expired";
  source?: "web" | "app" | "pos" | "other"; // Optional in list?
  channel: "web" | "app"; // User JSON showed 'channel'
  abandoned_at: string;
  last_activity_at: string;
  last_activity: string; // Backend sends formatted string
  recovery_status: "not-contacted" | "email-sent" | "recovered";
  recovery_email_sent_at?: string | null;
  items_count: number;
  items: AbandonedCartItemApi[];
}

export interface AbandonedCartItemApi {
  id: string;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  final_price: string;
  line_total: string;
}

// Paginated list response
export interface AbandonedCartsListResponse {
  success: boolean;
  data: {
    carts: AbandonedCartApiItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

// Single cart details response
export interface AbandonedCartDetailsResponse {
  success: boolean;
  data: AbandonedCartApiItem;
  message: string;
}

// Metrics response
export interface AbandonedCartsMetricsResponse {
  success: boolean;
  data: {
    total_abandoned: number;
    potential_revenue: string;
    emails_sent: number;
    recovered_count: number;
    recovery_rate: string;
  };
  message: string;
}

// Request types
export interface AbandonedCartsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "not-contacted" | "email-sent" | "recovered" | "";
  channel?: "web" | "app" | "";
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SendRecoveryEmailRequest {
  template_id?: string;
  custom_message?: string;
}

export interface BulkSendEmailRequest {
  cart_ids: string[];
  template_id?: string;
}
