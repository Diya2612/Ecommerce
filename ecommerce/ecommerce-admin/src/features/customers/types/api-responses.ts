/**
 * API Response Types for Customer Feature
 * 
 * These types define the exact structure of API responses.
 * They help ensure type safety when calling backend APIs.
 */

export interface ApiUser {
  id: string;
  display_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  display_name?: string;
  email: string;
  phone_number: string;
  user_type: 'individual' | 'business';
  email_verified_at?: string;
  phone_verified_at?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  profile_image_url?: string;
  date_of_birth?: string;
  gender?: string;
  languages?: string[];
  preferred_language?: string;
  secondary_email?: string;
  secondary_phone_number?: string;
  tags?: string[];
  total_orders?: number;
  total_spent?: number;
  addresses?: ApiAddress[];
  details?: ApiUserDetails;
  metadata?: Record<string, unknown>;
}

export interface ApiAddress {
  id: string;
  user_id: string;
  address_label?: string;
  recipient_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
  is_default_billing?: boolean;
  is_default_shipping?: boolean;
  delivery_instructions?: string;
}

export interface ApiUserDetails {
  account_status?: 'active' | 'inactive';
  business_type?: string;
  company_legal_name?: string;
  tax_id?: string;
  segment?: string;
  notes?: string;
  gender?: string;
  date_of_birth?: string;
  risk_profile?: string;
  loyalty_enrolled?: boolean;
  loyalty_tier?: string;
  loyalty_points?: number;
  loyalty_enrollment_date?: string;
  subscription_plan?: string;
  subscription_status?: string;
  billing_cycle?: string;
  subscription_start_date?: string;
  auto_renew?: boolean;
  credit_limit?: number;
  payment_terms?: string;
}

export interface ApiCustomersListResponse {
  users: ApiUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiSingleCustomerResponse {
  data: ApiUser;
}

export interface ApiCustomerActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ApiCustomerActivityResponse {
  activities: ApiCustomerActivity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
