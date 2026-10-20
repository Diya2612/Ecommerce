/**
 * Orders API Type Definitions
 * 
 * TypeScript types matching backend order API responses
 */

// Backend order item structure
export interface OrderApiItem {
    id: string;
    order_number: string;
    order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed' | 'partially_refunded';
    payment_method?: string;
    fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';
    total_amount: string;
    total_quantity: number;
    channel: 'web' | 'app' | 'pos' | 'marketplace' | 'other';
    created_at: string;
    updated_at?: string;
    user_id?: string;
    customer_email?: string;
    customer_name?: string;
    items_count?: number;

    // Pricing Fields from DB Schema
    subtotal: string;
    discount_amount: string;
    discount_type?: 'percent' | 'amount' | 'none';
    discount_value?: string;
    discount_reason?: string;
    shipping_amount: string;
    tax_amount: string;
    cgst: string;
    sgst: string;
    igst: string;
    delivery_price: string;
    
    // Address & details
    shipping_address?: any;
    billing_address?: any;
    customer_note?: string;
    admin_comment?: string;
}

// Paginated list response
export interface OrdersListResponse {
    success: boolean;
    data: {
        orders: OrderApiItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    message: string;
}

// Order details response (richer with items)
export interface OrderDetailsResponse {
    success: boolean;
    data: OrderApiItem & {
        items?: Array<{
            id: string;
            product_id?: string;
            product_name: string;
            product_image?: string;
            sku?: string;
            quantity: number;
            cost_price: string;
            line_total: string;
        }>;
        customer?: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
        shipping_address?: any;
        billing_address?: any;
    };
    message: string;
}

// Draft orders response
export interface DraftOrdersResponse {
    success: boolean;
    data: {
        drafts: Array<OrderApiItem & {
            items_preview?: Array<{
                id: string;
                product_name: string;
                quantity: number;
                line_total: string;
            }>;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    message: string;
}

// Metrics response
export interface OrderMetricsResponse {
    success: boolean;
    data: {
        total_orders: number;
        active_orders: number;
        fulfilled_orders: number;
        cancelled_orders: number;
        total_revenue: string;
        pending_revenue: string;
        paid_revenue?: string;
        avg_order_value: string;
        fulfillment_rate: string;
    };
    message: string;
}

// Request types
export interface OrdersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    payment_status?: string;
    fulfillment_status?: string;
    amount_ranges?: string;
    item_ranges?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    user_id?: string;
}

export interface UpdateOrderStatusRequest {
    order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed' | 'partially_refunded';
    fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';
    order_tracking?: string;
    admin_comment?: string;
}

export interface UpdateFulfillmentRequest {
    fulfillment_status: "Fulfilled" | "Pending" | "Partial" | "Cancelled";
    notes?: string;
}

export interface UpdatePaymentRequest {
    payment_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'refunded' | 'failed' | 'partially_refunded';
    paid_at?: string;
    transaction_id?: string;
    payment_ref?: string;
    advance_paid_amount?: string;
    notes?: string;
}

export interface UpdateTrackingRequest {
    tracking_number: string;
    shipping_method?: string;
    shipping_option?: string;
    carrier?: string;
    notes?: string;
}

export interface ConfirmDraftRequest {
    send_confirmation_email?: boolean;
    notes?: string;
}
