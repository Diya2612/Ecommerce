import type { Customer, CustomerFormData, Address } from '../types/customer.types';
import { extractLocalPhoneNumber } from './phoneUtils';

export type AccountStatus = 'Active' | 'Inactive';

export function mapAccountStatus(status?: string): AccountStatus {
  if (status === 'active') return 'Active';
  return 'Inactive';
}

export function mapCustomerType(userType?: string, businessType?: string): 'Distributor' | 'Retail' | 'Wholesale' {
  if (userType === 'business') {
    return (businessType as 'Distributor' | 'Wholesale') || 'Wholesale';
  }
  return 'Retail';
}

function getDefaultAddress(addresses: any[]): any {
  return addresses.find((a: any) => a.is_default) || addresses[0] || {};
}

export function mapApiUserToCustomer(user: any): Customer {
  const addresses = user.addresses || [];
  const defaultAddr = getDefaultAddress(addresses);

  return {
    id: user.id || '',
    customerId: user.display_id || '',
    firstName: user.first_name || 'Unknown',
    lastName: user.last_name || '',
    displayName: user.display_name,
    email: user.email || '',
    phone: user.phone_number || 'N/A',
    type: mapCustomerType(user.user_type, user.details?.business_type),
    segment: user.details?.segment || 'Regular',
    status: mapAccountStatus(user.details?.account_status),
    total_orders: user.total_orders || 0,
    total_spent: user.total_spent || 0,
    gstin: user.details?.tax_id,
    created_at: user.created_at,
    gender: user.gender || user.details?.gender || '-',
    dateOfBirth: user.date_of_birth || user.details?.date_of_birth,
    isEmailVerified: !!user.email_verified_at,
    isPhoneVerified: !!user.phone_verified_at,
    city: defaultAddr.city || '-',
    state: defaultAddr.state || defaultAddr.state_province || '-',
    country: defaultAddr.country || '-',
    lastLogin: user.last_sign_in_at || user.updated_at,
    tags: user.tags || [],
  };
}

export function mapApiUserToCustomerFormData(data: any): CustomerFormData {
  const details = data.details || {};
  const addresses = data.addresses || [];

  return {
    customerId: data.display_id || '',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    displayName: data.display_name || '',
    email: data.email || '',
    emailType: data.email_type || 'personal',
    phone: extractLocalPhoneNumber(data.phone_number) || '',
    phoneType: data.phone_type || 'mobile',
    secondaryEmail: data.secondary_email || '',
    secondaryEmailType: data.secondary_email_type || 'work',
    secondaryPhone: extractLocalPhoneNumber(data.secondary_phone_number) || '',
    secondaryPhoneType: data.secondary_phone_type || 'work',
    customerType: mapCustomerType(data.user_type, details.business_type),
    status: mapAccountStatus(details.account_status),
    gstNumber: details.tax_id || '',
    companyName: details.company_legal_name || '',
    sameAsShipping: false,
    profileImage: data.profile_image_url || null,

    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    language: data.languages || (data.preferred_language ? [data.preferred_language] : []),
    internalTags: data.tags || [],
    internalNotes: details.notes || '',
    segment: details.segment ? [details.segment] : [],

    riskProfile: details.risk_profile || 'low',
    loyaltyEnrolled: details.loyalty_enrolled || false,
    loyaltyTier: details.loyalty_tier || '',
    loyaltyPoints: Number(details.loyalty_points || 0),
    loyaltyEnrollmentDate: details.loyalty_enrollment_date || undefined,

    subscriptionPlan: details.subscription_plan || '',
    subscriptionStatus: details.subscription_status || undefined,
    billingCycle: details.billing_cycle || undefined,
    subscriptionStartDate: details.subscription_start_date || undefined,
    autoRenew: details.auto_renew || false,

    addresses: addresses.map((addr: any) => mapApiAddressToFormAddress(addr)),

    creditLimit: Number(details.credit_limit || 0),
    paymentTerms: details.payment_terms || '',
    notes: details.notes || '',
    tags: data.tags || [],
    alternatePhone: '',
    panNumber: '',

    emailVerified: data.email_verified || false,
    secondaryEmailVerified: data.secondary_email_verified || false,
    phoneVerified: data.phone_verified || false,
    gdprStatus: data.metadata?.gdpr_status,
    privacyPolicyVersion: data.metadata?.privacy_policy_version,
    marketingConsentDate: data.metadata?.marketing_consent_date,

    lastLoginDate: data.metadata?.last_login_date,
    lastLoginIP: data.metadata?.last_login_ip,
    lastLogoutDate: data.metadata?.last_logout_date,
    failedLoginAttempts: data.metadata?.failed_login_attempts || 0,
    accountLockedUntil: data.metadata?.account_locked_until,
    metadata: data.metadata || {},
  };
}

export function mapApiAddressToFormAddress(addr: any): Address {
  return {
    id: addr.id,
    name: addr.recipient_name || '',
    country: addr.country || 'India',
    state: addr.state_province || '',
    city: addr.city || '',
    postalCode: addr.postal_code || '',
    addressLine1: addr.address_line1 || '',
    addressLine2: addr.address_line2 || '',
    landmark: addr.delivery_instructions || '',
    location: addr.city ? `${addr.city}, ${addr.state_province || ''}` : '',
    addressType: mapAddressType(addr.address_label),
    isDefaultBilling: addr.is_default_billing || false,
    isDefaultShipping: addr.is_default_shipping || false,
  };
}

export function mapAddressType(label?: string): 'home' | 'office' | 'other' {
  if (label === 'home') return 'home';
  if (label === 'office') return 'office';
  return 'other';
}

export function mapFormAddressToApiAddress(addr: Address, customerName: string, primaryPhone: string): {
  type: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  deliveryInstructions?: string;
} {
  return {
    type: mapFormAddressTypeToApi(addr.addressType),
    name: addr.name || customerName || 'Customer',
    phone: primaryPhone || 'N/A',
    addressLine1: addr.streetAddress1 || 'Address',
    addressLine2: addr.streetAddress2 || undefined,
    city: addr.city || 'City',
    state: addr.state || 'State',
    pincode: addr.pincode || '000000',
    country: addr.country || 'India',
    isDefault: addr.isDefaultBilling || addr.isDefaultShipping || false,
    isDefaultBilling: addr.isDefaultBilling,
    isDefaultShipping: addr.isDefaultShipping,
    deliveryInstructions: addr.landmark,
  };
}

function mapFormAddressTypeToApi(type?: string): 'Home' | 'Office' | 'Other' {
  if (!type) return 'Home';
  const lower = type.toLowerCase();
  if (lower === 'home') return 'Home';
  if (lower === 'office') return 'Office';
  return 'Other';
}

export function mapCustomerFormDataToApi(data: Partial<CustomerFormData>): Record<string, any> {
  const mapped: Record<string, any> = {};

  if (data.firstName !== undefined) mapped.first_name = data.firstName;
  if (data.lastName !== undefined) mapped.last_name = data.lastName;
  if (data.displayName !== undefined) mapped.display_name = data.displayName;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.emailType !== undefined) mapped.email_type = data.emailType;
  if (data.phone !== undefined) mapped.phone_number = extractLocalPhoneNumber(data.phone);
  if (data.phoneType !== undefined) mapped.phone_type = data.phoneType;
  if (data.secondaryEmail !== undefined) mapped.secondary_email = data.secondaryEmail;
  if (data.secondaryEmailType !== undefined) mapped.secondary_email_type = data.secondaryEmailType;
  if (data.secondaryPhone !== undefined) mapped.secondary_phone_number = extractLocalPhoneNumber(data.secondaryPhone);
  if (data.secondaryPhoneType !== undefined) mapped.secondary_phone_type = data.secondaryPhoneType;
  if (data.secondaryEmailVerified !== undefined) mapped.secondary_email_verified = data.secondaryEmailVerified;
  if (data.profileImage !== undefined) mapped.profile_image_url = data.profileImage;
  if (data.dateOfBirth !== undefined) mapped.date_of_birth = data.dateOfBirth;
  if (data.gender !== undefined) mapped.gender = data.gender;
  if (data.language !== undefined) {
    mapped.preferred_language = data.language[0] || 'en';
    mapped.languages = data.language;
  }
  if (data.tags !== undefined) mapped.tags = data.tags;
  if (data.metadata !== undefined) mapped.metadata = data.metadata;
  if (data.segment !== undefined) mapped.segments = data.segment;
  if (data.notes !== undefined) mapped.notes = data.notes;
  if (data.status !== undefined) mapped.account_status = data.status.toLowerCase();
  if (data.emailSubscribed !== undefined) mapped.marketing_opt_in = data.emailSubscribed;
  if (data.riskProfile !== undefined) mapped.risk_profile = data.riskProfile;
  if (data.loyaltyEnrolled !== undefined) mapped.loyalty_enrolled = data.loyaltyEnrolled;
  if (data.loyaltyTier !== undefined) mapped.loyalty_tier = data.loyaltyTier;
  if (data.loyaltyPoints !== undefined) mapped.loyalty_points = data.loyaltyPoints;
  if (data.loyaltyEnrollmentDate !== undefined) mapped.loyalty_enrollment_date = data.loyaltyEnrollmentDate;
  if (data.subscriptionPlan !== undefined) mapped.subscription_plan = data.subscriptionPlan;
  if (data.subscriptionStatus !== undefined) mapped.subscription_status = data.subscriptionStatus;
  if (data.billingCycle !== undefined) mapped.billing_cycle = data.billingCycle;
  if (data.subscriptionStartDate !== undefined) mapped.subscription_start_date = data.subscriptionStartDate;
  if (data.autoRenew !== undefined) mapped.auto_renew = data.autoRenew;

  return mapped;
}
