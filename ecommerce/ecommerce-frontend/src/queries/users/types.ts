/**
 * User Types (Query Layer)
 */

/**
 * User profile from API
 */
export interface UserProfile {
  id: string;
  email: string;
  // Mapped fields (computed in query layer)
  name: string;

  // Backend direct fields
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  display_name?: string | null;

  email_verified: boolean;
  email_verified_at?: string | null;

  phone_number?: string | null;
  phone_country_code?: string | null;
  phone_verified: boolean;
  phone_verified_at?: string | null;

  secondary_email?: string | null;
  secondary_email_verified?: boolean;
  secondary_phone_number?: string | null;

  profile_image_url?: string | null;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;

  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;

  // Relations
  details?: any; // Customer/Business profile data
  addresses?: UserAddress[];
  profileType?: 'individual' | 'business' | 'none';

  // Legacy / Deprecated fields (kept for compatibility during migration)
  phone?: string;
  avatar?: string;
  user_type?: "individual" | "business";
  hasPassword?: boolean;

  created_at?: string;
  updated_at?: string;

  createdAt?: string; // @deprecated
  updatedAt?: string; // @deprecated
}

/**
 * User address
 */
export interface UserAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  type: "Home" | "Office" | "Other";
}

/**
 * Update profile data
 */
export interface UpdateProfileData {
  first_name?: string;
  name?: string; // @deprecated: use first_name
  last_name?: string;
  display_name?: string;
  phone_number?: string;
  secondary_email?: string;
  secondary_phone_number?: string;
  profile_image_url?: string;
  date_of_birth?: string | Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;
  user_type?: "individual" | "business";
}

/**
 * Create/update address data
 */
export interface AddressData {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
  type?: "Home" | "Office" | "Other";
}
