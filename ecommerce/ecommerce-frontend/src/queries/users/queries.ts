/**
 * User Query Functions
 *
 * Pure async functions for user/profile operations.
 * All operations require authentication.
 */

import { api } from "@/api";
import type {
  UserProfile,
  UserAddress,
  UpdateProfileData,
  AddressData,
} from "./types";

// ============================================================================
// Internal: User ID Cache
// ============================================================================

let cachedUserId: string | null = null;

/**
 * Get current user ID (cached after first call)
 */
async function getCurrentUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const profile = await getCurrentUser();
  cachedUserId = profile.id;
  return profile.id;
}

/**
 * Clear user cache (call on logout)
 */
export function clearUserCache(): void {
  cachedUserId = null;
}

// ============================================================================
// Profile Queries
// ============================================================================

/**
 * Get current user profile
 */
/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const user = await api<any>("/users/me", { auth: true });

  // Map backend response to frontend UserProfile
  // Ensure we handle both direct fields and legacy mapped fields
  const mappedUser: UserProfile = {
    ...user,
    // Computed fields
    name: user.display_name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.email),

    // Explicit mapping for legacy fields
    phone: user.phone_number,
    avatar: user.profile_image_url,
    createdAt: user.created_at,
    updatedAt: user.updated_at,

    // Ensure relations are passed
    details: user.details,
    addresses: user.addresses || [],
    profileType: user.profileType || (user.details ? 'individual' : 'none'),
  };

  cachedUserId = mappedUser.id;
  return mappedUser;
}

/**
 * Update current user profile
 */
export async function updateProfile(
  data: UpdateProfileData,
): Promise<UserProfile> {
  // Map frontend update data (partial camelCase) to backend expected payload (snake_case)
  // Backend expects: first_name, last_name, etc.

  // Split name if first_name is not provided but name is
  let firstName = data.first_name || data.name?.split(' ')[0];
  let lastName = data.last_name || (data.first_name ? undefined : (data.name && data.name.includes(' ') ? data.name.substring(data.name.indexOf(' ') + 1) : undefined));

  const payload: any = {
    first_name: firstName,
    last_name: lastName,
    display_name: data.display_name,
    phone_number: data.phone_number,
    secondary_email: data.secondary_email,
    secondary_phone_number: data.secondary_phone_number,
    profile_image_url: data.profile_image_url,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    preferred_language: data.preferred_language,
    preferred_currency: data.preferred_currency,
    timezone: data.timezone,
  };

  // Remove undefined keys
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const response = await api<any>(`/users/me`, {
    method: "PUT",
    body: payload,
    auth: true,
  });

  // Remap response to UserProfile
  const mappedUser: UserProfile = {
    ...response,
    name: response.display_name || (response.first_name && response.last_name ? `${response.first_name} ${response.last_name}` : response.first_name || response.email),
    phone: response.phone_number,
    avatar: response.profile_image_url,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    details: response.details,
    addresses: response.addresses || [],
    profileType: response.profileType || (response.details ? 'individual' : 'none'),
  };

  return mappedUser;
}

// ============================================================================
// Address Queries
// ============================================================================

/**
 * Get all addresses for current user
 */
export async function getAddresses(): Promise<UserAddress[]> {
  const userId = (await getCurrentUserId().catch(() => "me")) || "me";

  return api<UserAddress[]>(`/users/${userId}/addresses`, {
    auth: true,
  });
}

/**
 * Create a new address
 */
export async function createAddress(data: AddressData): Promise<UserAddress> {
  const userId = (await getCurrentUserId().catch(() => "me")) || "me";
  const payload = {
    ...data,
    address_type: (data.type || "home").toLowerCase(),
    address_name: data.type === "Other" ? "Other" : "",
    isDefaultShipping: data.isDefault ?? false,
    isDefaultBilling: data.isDefault ?? false,
  };

  return api<UserAddress>(`/users/${userId}/addresses`, {
    method: "POST",
    body: payload,
    auth: true,
  });
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string,
  data: Partial<AddressData>,
): Promise<UserAddress> {
  const userId = (await getCurrentUserId().catch(() => "me")) || "me";
  const payload = {
    ...data,
    ...(data.type ? { address_type: data.type.toLowerCase(), address_name: data.type === "Other" ? "Other" : "" } : {}),
    ...(data.isDefault !== undefined ? { isDefaultShipping: data.isDefault, isDefaultBilling: data.isDefault } : {}),
  };

  return api<UserAddress>(`/users/${userId}/addresses/${addressId}`, {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const userId = (await getCurrentUserId().catch(() => "me")) || "me";

  await api<void>(`/users/${userId}/addresses/${addressId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const userId = (await getCurrentUserId().catch(() => "me")) || "me";

  await api<{ id: string; isDefault: boolean }>(
    `/users/${userId}/addresses/${addressId}/default`,
    {
      method: "PATCH",
      body: {},
      auth: true,
    },
  );
}

// ============================================================================
// Profile Security
// ============================================================================

/**
 * Change current user's password.
 * When user has a password (email/password auth), currentPassword is required.
 * When user has no password (OAuth / set password), currentPassword can be omitted.
 */
export async function changePassword(
  newPassword: string,
  currentPassword?: string,
): Promise<void> {
  const body: { newPassword: string; currentPassword?: string } = {
    newPassword,
  };
  if (currentPassword !== undefined && currentPassword !== "") {
    body.currentPassword = currentPassword;
  }
  await api<void>("/profile/change-password", {
    method: "PUT",
    body,
    auth: true,
  });
}
