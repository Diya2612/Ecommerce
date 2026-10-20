import type {
  OrderItem,
  Address,
  OrderPricing,
  Customer,
  AbandonedOrder,
  EmailTemplate,
} from "./domain.types";

// ==================== Form Data Types ====================

// Order Form Data (for create/edit)
export interface OrderFormData {
  // Order Basics
  orderNumber: string;
  orderDate: string;
  orderStatus: "draft" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "returned";
  salesChannel: "website" | "amazon" | "flipkart" | "retail" | "whatsapp";
  currency: "INR" | "USD" | "EUR";
  amazonOrderRef: string;
  isDraftOrder: boolean;
  isInternational: boolean;

  // Customer & Addresses
  customer: Customer | null;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  billingSameAsShipping: boolean;

  // Order Items
  items: OrderItem[];

  // Pricing
  pricing: OrderPricing;

  // Fulfillment
  fulfillmentStatus: "unfulfilled" | "fulfilled" | "returned" | "cancelled";
  deliveryPartners: string[];
  trackingNumber: string;

  // Payment
  paymentStatus: "pending" | "paid" | "refunded" | "failed" | "partially_refunded";
  paymentMethod: "cod" | "prepaid" | "partial" | "credit";

  // Notes & Tags
  customerNote: string;
  adminComment: string;
  orderTags: string[];

  // System Fields
  createdBy: string;
  createdOn: string;
  lastModified: string;
  modifiedBy: string;
}

// Empty default order form data
export const emptyOrderFormData: OrderFormData = {
  orderNumber: "",
  orderDate: new Date().toISOString().split("T")[0],
  orderStatus: "draft",
  salesChannel: "website",
  currency: "INR",
  amazonOrderRef: "",
  isDraftOrder: true,
  isInternational: false,

  customer: null,
  shippingAddress: null,
  billingAddress: null,
  billingSameAsShipping: true,

  items: [],

  pricing: {
    subtotal: 0,
    productDiscountsTotal: 0,
    orderDiscount: 0,
    orderDiscountType: "",
    orderDiscountValue: 0,

    taxType: "cgst_sgst",
    cgst: 0,
    cgstRate: 9,
    sgst: 0,
    sgstRate: 9,
    igst: 0,
    igstRate: 18,

    shippingCharge: 0,
    codCharge: 0,
    giftCardCode: "",
    giftCardAmount: 0,
    roundingAdjustment: 0,

    grandTotal: 0,
    advancePaid: 0,
    balanceDue: 0,
  },

  fulfillmentStatus: "unfulfilled",
  deliveryPartners: [],
  trackingNumber: "",

  paymentStatus: "pending",
  paymentMethod: "prepaid",

  customerNote: "",
  adminComment: "",
  orderTags: [],

  createdBy: "Admin",
  createdOn: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  modifiedBy: "Admin",
};

// ==================== Component Props Interfaces ====================

export interface ProductItemSelectorProps {
  onAddItem: (item: OrderItem) => void;
  selectedProductIds: string[];
}

export interface PricingCalculatorProps {
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  isInternational: boolean;
  currency: string;
  orderDiscount: { type: "" | "percentage" | "fixed"; value: number };
  onOrderDiscountChange: (
    type: "" | "percentage" | "fixed",
    value: number,
  ) => void;
  shippingCharge: number;
  onShippingChargeChange: (value: number) => void;
  codCharge: number;
  onCodChargeChange: (value: number) => void;
  paymentMethod: string;
  giftCard: { code: string; amount: number };
  onGiftCardChange: (code: string, amount: number) => void;
  advancePaid: number;
  onAdvancePaidChange: (value: number) => void;
  taxRates: { cgst: number; sgst: number; igst: number };
  onTaxRatesChange: (rates: {
    cgst: number;
    sgst: number;
    igst: number;
  }) => void;
  onPricingUpdate: (pricing: OrderPricing) => void;
}

export interface OrderSummaryCardProps {
  currency: string;
  subtotal: number;
  productDiscountsTotal: number;
  orderDiscountAmount: number;
  orderDiscountType: "" | "percentage" | "fixed";
  orderDiscountValue: number;
  tax: number;
  shipping: number;
  rounding: number;
  grandTotal: number;
  isLocked?: boolean;
  onOpenDiscountModal: () => void;
  onRemoveDiscount: () => void;
  onShippingChange: (value: number) => void;
  onRoundingChange: (value: number) => void;
}

export interface OrderItemsTableProps {
  items: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onApplyDiscount?: (
    itemIds: string[],
    discountType: "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => void;
  currency?: string;
  /** Live stock map from polling: product_id -> effective_stock (available - reserved) */
  stockMap?: Map<string, number>;
}

export interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
  variant?: "dialog" | "embedded";
}

export interface AddressSelectorProps {
  customer: Customer | null;
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  addressType: "shipping" | "billing";
}

export interface AbandonedCartDetailsDrawerProps {
  cart: AbandonedOrder;
  onClose: () => void;
  onSendEmail: () => void;
}

export interface AbandonedOrdersTableProps {
  orders: AbandonedOrder[];
  selectedCarts: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectCart: (id: string, checked: boolean) => void;
  onViewCart: (cart: AbandonedOrder) => void;
  onSendEmail: (ids: string[]) => void;
  page: number;
  totalPages: number;
  total: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
}

export interface AbandonedCartEmailModalProps {
  onClose: () => void;
  onConfirm: (templateId: string) => void;
  selectedCount: number;
  templates: EmailTemplate[];
}

export interface AbandonedOrdersFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  valueFilter: string;
  setValueFilter: (value: string) => void;
  onFilterChange: () => void;
}

// ==================== Order Detail Component Props ====================

export interface OrderSummarySidebarProps {
  order: OrderFormData;
}

export interface OrderNotesProps {
  notes: string;
}

export interface OrderItemListProps {
  items: OrderItem[];
}

export interface OrderHeaderProps {
  orderId: string;
  status: string;
  createdAt: string;
}

export interface OrderCustomerInfoProps {
  customer: Customer;
}

export interface OrderAddressInfoProps {
  address: Address;
}

// ==================== Modal Props ====================

export interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProducts: (products: any[]) => void;
}

// ==================== Form Section Props ====================

export interface OrderItemsSectionProps {
  items: OrderItem[];
  onAddItem: (item: OrderItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onApplyDiscount?: (
    itemIds: string[],
    discountType: "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => void;
  currency: string;
}

export interface PricingSectionProps {
  pricing: OrderPricing;
  onPricingChange: (
    field: keyof OrderPricing,
    value: OrderPricing[keyof OrderPricing],
  ) => void;
  currency: string;
  isInternational: boolean;
}

export interface NotesTagsSectionProps {
  customerNote: string;
  onCustomerNoteChange: (value: string) => void;
  adminComment: string;
  onAdminCommentChange: (value: string) => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
}

export interface OrderBasicsSectionProps {
  salesChannel: "website" | "amazon" | "flipkart" | "retail" | "whatsapp";
  setSalesChannel: (value: string) => void;
  currency: "INR" | "USD" | "EUR";
  setCurrency: (value: string) => void;
  amazonOrderRef: string;
  setAmazonOrderRef: (value: string) => void;
  isDraftOrder: boolean;
  setIsDraftOrder: (value: boolean) => void;
  isInternational: boolean;
  setIsInternational: (value: boolean) => void;
}

export interface CustomerAddressSectionProps {
  customer: Customer | null;
  onCustomerChange: (customer: Customer) => void;
  shippingAddress: Address | null;
  onShippingAddressChange: (address: Address) => void;
  billingAddress: Address | null;
  onBillingAddressChange: (address: Address) => void;
  sameAsShipping: boolean;
  onSameAsShippingChange: (value: boolean) => void;
  errors?: {
    customer?: string;
    shippingAddress?: string;
    billingAddress?: string;
  };
}