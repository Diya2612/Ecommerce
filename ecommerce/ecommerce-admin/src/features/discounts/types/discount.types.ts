export type DiscountType = 'percentage' | 'fixed' | 'shipping' | 'buy-x';
export type GenType = 'single' | 'bulk' | 'auto';
export type DiscountStatus = 'active' | 'scheduled' | 'expired' | 'inactive';
export type MinPurchaseType = 'none' | 'amount' | 'quantity';
export type TargetAudience = 'all' | 'specific' | 'segments';
export type GeoRestriction = 'none' | 'specific-regions';
export type AppliesTo = 'entire-order' | 'specific-products' | 'specific-collections';
export type BuyXTriggerType = 'quantity' | 'amount';
export type BuyXAppliesTo = 'any' | 'specific-products' | 'specific-collections';
export type GetYType = 'free' | 'percentage' | 'amount' | 'fixed';
export type GetYAppliesTo = 'same' | 'specific-products' | 'specific-collections' | 'cheapest';
export type ShippingScope = 'all' | 'specific-methods' | 'specific-zones';



export interface DiscountApiResponse {
  data: Discount[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export interface DiscountQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export interface DiscountStats {
  redemptions: number;
  total_amount: number;
  orders_count: number;
}

export interface Discount {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "free_shipping";
  value: string;
  status: "active" | "scheduled" | "expired" | "inactive";
  usage_count: number;
  usage_limit: number | null;
  minimum_purchase?: number;
  applies_to?: string;
  product_ids?: string[];
  customer_ids?: string[];
  starts_at: string;
  ends_at: string | null;
  tags: string[];
  admin_comment: string;
  created_at: string;
}

export interface DiscountFormData {
  code: string;
  title: string;
  description: string;
  value: string;
  usageLimit: string;
  usageCount: number;
  status: DiscountStatus;
  startDate: Date | undefined;
  endDate: Date | undefined;
  genType: GenType;
  discountType: DiscountType;

  // New Code Settings
  codeLength: string;

  // Min Purchase
  minPurchaseType: MinPurchaseType;

  // Audience
  targetAudience: TargetAudience;
  selectedCustomers: string[];
  selectedSegments: string[];

  // Geo
  geoRestriction: GeoRestriction;
  selectedCountries: string[];

  // Applies To (Percentage/Fixed)
  appliesTo: AppliesTo;
  selectedProducts: string[];
  selectedCollections: string[];

  // Buy X
  buyXTriggerType: BuyXTriggerType;
  buyXValue: string;
  buyXAppliesTo: BuyXAppliesTo;
  buyXSelectedProducts: string[];
  buyXSelectedCollections: string[];
  buyXSameProduct: boolean;
  buyXRepeat: boolean;

  // Get Y
  getYType: GetYType;
  getYAppliesTo: GetYAppliesTo;
  getYSelectedProducts: string[];
  getYSelectedCollections: string[];
  getYQuantity: string;
  getYValue: string;
  getYMaxRewards: string;

  // Shipping
  shippingScope: ShippingScope;
  shippingSelectedMethods: string[];
  shippingSelectedZones: string[];
  shippingMinAmount: string;
  shippingMinItems: string;
  shippingExcludeProducts: string[];
  shippingExcludeCollections: string[];
  shippingExcludePaymentMethods: string[];
  shippingCap: string;

  // Global Exclusions
  excludeProducts: string[];
  excludeCollections: string[];
  excludePaymentMethods: string[];
  excludeSalesChannels: string[];

  // Usage Limits
  usagePerDay: string;
  usagePerOrder: string;
  limitNewCustomers: boolean;
  limitReturningCustomers: boolean;

  // Settings
  timezone: string;
  tags: string[];
  adminComment: string;
}