// Core business domain types for orders feature

export interface Customer {
  id: string;
  customerId?: string; // Display ID (e.g., CUST-001)
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  type: "B2B" | "B2C";
}

// Alias for backward compatibility with old code
export type SelectedCustomer = Customer;

export type SalesChannel = Order['salesChannel'];

export interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  productId: string | null; // Null for custom/ad-hoc items
  productName: string;
  productSku: string;
  productImage: string;
  quantity: number;
  costPrice: number;
  discountType: "" | "percentage" | "fixed";
  discountValue: number;
  discountReason?: string; // Reason for applying discount
  availableStock: number;
  variantId?: string;
  variantLabel?: string;
  isCustom?: boolean; // True if this is a custom/ad-hoc item
}

export interface OrderPricing {
  subtotal: number;
  productDiscountsTotal: number;
  orderDiscount: number;
  orderDiscountType: "" | "percentage" | "fixed";
  orderDiscountValue: number;
  orderDiscountReason?: string; // Reason for order-level discount

  // Tax (GST)
  taxType: "cgst_sgst" | "igst" | "none";
  cgst: number;
  cgstRate: number;
  sgst: number;
  sgstRate: number;
  igst: number;
  igstRate: number;

  // Additional Charges
  shippingCharge: number;
  codCharge: number;
  giftCardCode: string;
  giftCardAmount: number;
  roundingAdjustment?: number;

  // Payment
  paymentMethod?: string;

  // Totals
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
}

// Order List View Model
export interface Order {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: "draft" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "returned";

  customer: Customer;

  items: OrderItem[];
  itemsCount?: number;

  grandTotal: number;
  currency: "INR" | "USD" | "EUR";

  fulfillmentStatus: "unfulfilled" | "fulfilled" | "returned" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "failed" | "partially_refunded";

  salesChannel: "website" | "amazon" | "flipkart" | "retail" | "whatsapp";
  deliveryPartners: string[];
  deliveryPrice: number;
  returnAmount: number;
  discountAmount: number;

  // Address info (for detail view)
  shippingAddress?: Address | null;
  billingAddress?: Address | null;

  // Notes (for detail view)
  customerNote?: string;
  adminComment?: string;

  // Additional fields for complete order details
  amazonOrderRef?: string;
  trackingNumber?: string;
  orderTags?: string[];

  // Pricing details (optional, for detailed view)
  pricing?: OrderPricing;

  // System fields
  createdBy: string;
  createdOn: string;
  lastModified: string;
  modifiedBy: string;
}

// Abandoned Order Domain Types
export interface AbandonedOrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type RecoveryStatus = 'not-contacted' | 'email-sent' | 'recovered';

export interface AbandonedOrder {
  id: string;
  cartId: string;
  customerName: string;
  email: string;
  phone: string;
  products: AbandonedOrderProduct[];
  cartValue: number;
  abandonedAt: string;
  lastActivity: string;
  recoveryStatus: RecoveryStatus;
  channel: 'web' | 'app';
  emailSentAt?: string;
}

// Draft Order Domain Types
export interface DraftOrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface DraftOrder {
  orderNumber: string;
  orderDate: string;
  paymentStatus: 'Pending' | 'Awaiting' | 'Unpaid';
  items: DraftOrderItem[];
  channel: string;
}

// Order Tag Domain Type
export interface OrderTag {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

// Email Template Domain Type
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview?: string;
  category?: string;
}