export type OrderChannel = 'web' | 'app' | 'pos' | 'marketplace' | 'other';

export type PaymentStatus =
    | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'refunded'
    | 'failed'
    | 'partially_refunded';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type FulfillmentStatus =
    | 'unfulfilled'
    | 'partial'
    | 'fulfilled'
    | 'returned'
    | 'cancelled';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    sku: string | null;
    product_name: string;
    product_image: string | null;
    cost_price: string; // decimal string
    quantity: number;
    line_total: string; // decimal string
}

export interface OrderAddress {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface Order {
    id: string;
    order_number: string;
    user_id: string | null;
    created_at: string;

    // Status
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    fulfillment_status: FulfillmentStatus;

    // Amounts (all decimal strings from backend)
    subtotal: string;
    discount_amount: string;
    shipping_amount: string;
    tax_amount: string;
    total_amount: string;

    // Details
    total_quantity: number;
    payment_method: string | null;
    shipping_address_id: string | null;
    billing_address_id: string | null;

    // Expanded Data
    shipping_address?: OrderAddress;
    billing_address?: OrderAddress;

    // Items (often included in response)
    items?: OrderItem[];
}

export interface CreateOrderData {
    shipping_address_id: string;
    billing_address_id?: string;
    payment_method: string;
    customer_note?: string;
}

export interface OrderSummaryResponse {
    order_id: string;
    order_number: string;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    total_amount: string;
    total_quantity: number;
    items_count: number;
    created_at: string;
    discount_amount?: string; // Optional - may not always be present
}
