/**
 * User API Service
 * Handles user-related API calls
 */

import { makeGetRequest, makePutRequest } from '@/lib/api/baseApi';
import { logger } from '@/utils/logger';

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  user_type: string;
  role: string;
  status: 'active' | 'inactive';
  firstName: string;
  lastName: string;
  memberSince: string;
  lastLogin: string;
  timezone?: string;
  preferredLanguage?: string;
  dateTimeFormat?: string;
  profileImageUrl?: string | null;
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User> => {
  const response = await makeGetRequest('/users/me');

  // API response is wrapped: { success, message, data: {user} }
  const apiResponse = response.data as any;
  const user = apiResponse.data; // The actual user is inside the 'data' property

  logger.debug('User data from API:', user);

  // Correctly map first and last name from backend fields if available
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  // Fallback to splitting display name if needed, or default
  const fullName = `${firstName} ${lastName}`.trim() || user.name || 'User';

  // Map backend response to frontend User type
  const mappedUser = {
    id: user.id,
    name: fullName,
    email: user.email || '',
    phone_number: user.phone_number,
    user_type: user.user_type || 'user',
    role: user.user_type || 'user',
    status: (user.is_deleted ? 'inactive' : 'active') as 'active' | 'inactive',
    firstName: firstName || 'User',
    lastName: lastName,
    memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }) : 'Unknown',
    lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) : 'Unknown',
    timezone: user.timezone,
    preferredLanguage: user.preferred_language,
    dateTimeFormat: user.date_time_format,
    profileImageUrl: user.profile_image_url || null,
  };

  logger.debug('Mapped user:', mappedUser);
  return mappedUser;
};

// Update user
export const updateUser = async (
  userId: string,
  updates: Partial<User> & { phoneNumber?: string; name?: string; first_name?: string; last_name?: string; }
): Promise<User> => {
  // Map frontend User type to backend schema
  const payload: any = {};

  // Handle name fields correctly
  // Support both snake_case (from direct API usage) and camelCase (mapped User type)
  if (updates.first_name !== undefined) payload.first_name = updates.first_name;
  else if (updates.firstName !== undefined) payload.first_name = updates.firstName;

  if (updates.last_name !== undefined) payload.last_name = updates.last_name;
  else if (updates.lastName !== undefined) payload.last_name = updates.lastName;

  // If we only have name, try to split it (legacy fallback)
  if (!payload.first_name && updates.name) {
    const parts = updates.name.split(' ');
    payload.first_name = parts[0];
    payload.last_name = parts.slice(1).join(' ');
  }

  // Handle email
  if (updates.email) payload.email = updates.email;

  // Handle phone - check both camelCase and snake_case
  if (updates.phoneNumber !== undefined) {
    payload.phone_number = updates.phoneNumber;
  } else if (updates.phone_number !== undefined) {
    payload.phone_number = updates.phone_number;
  }

  // Handle timezone and language - map to snake_case
  if ((updates as any).timezone !== undefined) {
    payload.timezone = (updates as any).timezone;
  }
  if ((updates as any).preferredLanguage !== undefined) {
    payload.preferred_language = (updates as any).preferredLanguage;
  }
  if ((updates as any).dateTimeFormat !== undefined) {
    payload.date_time_format = (updates as any).dateTimeFormat;
  }

  // Handle profile image URL (support both camelCase and snake_case)
  if ((updates as any).profileImageUrl !== undefined) {
    payload.profile_image_url = (updates as any).profileImageUrl;
  } else if ((updates as any).profile_image_url !== undefined) {
    payload.profile_image_url = (updates as any).profile_image_url;
  }

  logger.debug('Updating user with payload:', payload);

  const response = await makePutRequest(`/users/${userId}`, payload);

  // API response is wrapped: { success, message, data: {user} }
  const apiResponse = response.data as any;
  const user = apiResponse.data;

  logger.debug('Update response:', user);

  // Re-map response
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || user.name || 'User';

  return {
    id: user.id,
    name: fullName,
    email: user.email,
    phone_number: user.phone_number,
    user_type: user.user_type,
    role: user.user_type,
    status: (user.is_deleted ? 'inactive' : 'active') as 'active' | 'inactive',
    firstName: firstName || 'User',
    lastName: lastName,
    memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }) : 'Unknown',
    lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) : 'Unknown',
    profileImageUrl: user.profile_image_url || null,
  };
};
