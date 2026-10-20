export interface Customer {
  id: string; // Internal UUID
  customerId?: string; // Display ID (CUST-XXX)
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone: string;
  gstin?: string;
  type: "Distributor" | "Retail" | "Wholesale";
  segment?: string; // e.g., VIP, New, Regular
  created_at?: string;
  total_orders?: number;
  total_spent?: number;
  status: 'Active' | 'Inactive' | 'Banned';

  // Extended fields
  gender?: string;
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;

  // Location (from default address)
  city?: string;
  state?: string;
  country?: string;

  // Security/Account
  lastLogin?: string;
  tags?: string[];
}

export interface CreateCustomerPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone_number?: string | null;
  secondary_email?: string | null;
  secondary_phone_number?: string | null;
  tags?: string[] | null;
  profile_image_url?: string | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  preferred_language?: string | null;
  languages?: string[] | null;
  segments?: ('new' | 'regular' | 'vip' | 'at_risk')[] | null;
  notes?: string | null;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {
  email_type?: string | null;
  phone_type?: string | null;
  secondary_email_type?: string | null;
  secondary_phone_type?: string | null;
  email_verified?: boolean;
  secondary_email_verified?: boolean;
  account_status?: 'active' | 'inactive' | null;
  store_credit_balance?: number | string | null;
  marketing_opt_in?: boolean | null;
  sms_opt_in?: boolean | null;
  email_opt_in?: boolean | null;
  whatsapp_opt_in?: boolean | null;
  risk_profile?: string | null;
  loyalty_enrolled?: boolean | null;
  loyalty_tier?: string | null;
  loyalty_points?: number | string | null;
  loyalty_enrollment_date?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  billing_cycle?: string | null;
  subscription_start_date?: string | null;
  auto_renew?: boolean | null;
  metadata?: Record<string, any> | null;
}

export interface Address {
  id?: string;
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string; // or pincode
  pincode?: string;
  country?: string;
  location?: string;
  landmark?: string;
  addressType?: 'home' | 'office' | 'other';
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  isDefault?: boolean;
}

export interface CustomersApiResponse {
  success: boolean;
  data: {
    users: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface CustomerFilters {
  search?: string;
  type?: string;
  status?: string;
  gender?: string;
  tags?: string;
  sort_order?: string;
  orders_status?: string;
  sort?: string;
  from_date?: string;
  to_date?: string;
}

export interface CustomersQueryParams extends CustomerFilters {
  page: number;
  limit: number;
}

// ============================================
// CUSTOMER FORM TYPES
// ============================================

export interface CustomerFormData {
  // Basic Information
  customerId?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  companyName?: string;
  language?: string[];

  // Contact Information
  email: string;
  emailType?: string;
  phone: string;
  phoneType?: string;
  secondaryEmail?: string | null;
  secondaryEmailType?: string;
  secondaryPhone?: string | null;
  secondaryPhoneType?: string;
  secondaryEmailVerified?: boolean;
  profileImage?: File | string | null;
  profileImageFile?: File; // For deferred upload
  alternatePhone?: string;
  gender?: string;
  dateOfBirth?: string;
  // Customer Type & Status
  customerType: 'Distributor' | 'Retail' | 'Wholesale';
  status: 'Active' | 'Inactive' | 'Banned';

  // Business Details
  gstNumber?: string;
  panNumber?: string;

  // Address
  billingAddress?: Address;
  shippingAddress?: Address;
  addresses?: CustomerAddress[]; // All addresses for the customer
  sameAsShipping: boolean;

  // Financial
  creditLimit?: number;
  paymentTerms?: string;

  // Metadata
  notes?: string;
  tags?: string[];

  // Extended Fields for Edit Mode (Optional)
  internalTags?: string[];
  internalNotes?: string;

  // Classification
  segment?: string[];
  groups?: string[];
  riskProfile?: "low" | "medium" | "high";
  accountStatus?: "active" | "suspended" | "blocked";
  creditBalance?: number;

  // Loyalty
  loyaltyEnrolled?: boolean;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  loyaltyEnrollmentDate?: string;

  // Subscription
  subscriptionPlan?: string;
  subscriptionStatus?: "active" | "paused" | "cancelled" | "expired";
  billingCycle?: "monthly" | "quarterly" | "yearly";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  autoRenew?: boolean;

  // Preferences
  marketingPreferences?: string[];
  communicationChannels?: string[];
  emailSubscribed?: boolean;

  // Verification & Compliance
  emailVerified?: boolean;
  phoneVerified?: boolean;
  gdprStatus?: string;
  marketingConsentDate?: string;
  privacyPolicyVersion?: string;

  // Metrics (Read Only)
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  lastOrderDate?: string;

  // Security
  lastLoginDate?: string;
  lastLoginIP?: string;
  lastLogoutDate?: string;
  failedLoginAttempts?: number;
  accountLockedUntil?: string | null;
  metadata?: Record<string, any>;
}

export const emptyCustomerFormData: CustomerFormData = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  customerType: "Retail",
  status: "Active",
  gstNumber: "",
  panNumber: "",
  sameAsShipping: false,
  creditLimit: 0,
  paymentTerms: "",
  notes: "",
  tags: [],
  profileImage: null,
  billingAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    location: "",
    landmark: "",
  },
  shippingAddress: {},
};

// ============================================
// CUSTOMER FORM UI TYPES
// ============================================

export interface CustomerEmail {
  id: string;
  email: string;
  type: "work" | "personal";
  isPrimary: boolean;
  isVerified: boolean;
  showOtp: boolean;
  otpValue: string;
}

export interface CustomerPhone {
  id: string;
  phone: string;
  type: "mobile" | "work";
  isPrimary: boolean;
  isVerified: boolean;
  showOtp: boolean;
  otpValue: string;
}

export interface CustomerAddress {
  id: string;
  name?: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  streetAddress1: string;
  streetAddress2: string;
  landmark: string;
  addressType: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// EDIT CUSTOMER FORM TYPES
// ============================================

export interface EditAddress {
  id: string;
  type: "home" | "office";
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "upi";
  name: string;
  details: string;
  isDefault: boolean;
}

import type { ActivityItem } from '@/components/activity/types';

export interface CustomerActivityResponse {
  activities: ActivityItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface OrderProduct {
  name: string;
  qty: number;
  price: string;
}

export interface Order {
  id: string;
  date: string;
  items: number;
  total: string;
  status: string;
  statusColor: string;
  products: OrderProduct[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface AbandonedCart {
  id: string;
  cartId: string;
  items: string[];
  totalValue: string;
  abandonedOn: string;
  itemCount: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export interface CustomerFormProps {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => void;
  isEditMode?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  customerName?: string;
  customerId?: string;
  onDelete?: () => void;
  orders?: any[]; // Mapped orders for OrderOverviewSection
  payments?: any[];
  ordersPagination?: PaginationState;
  paymentsPagination?: PaginationState;
  onNavigateToOrder?: (orderId: string) => void;
  // Activity timeline props
  activities?: ActivityItem[];
  isActivitiesLoading?: boolean;
  activityFilter?: string;
  onActivityFilterChange?: (filter: string) => void;
}
