/**
 * Get User Profile
 *
 * Server-side data fetcher for user profile information.
 * Uses React cache() for request deduplication within a render.
 */

import { cache } from "react";
import { serverApi } from "@/api/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { UserProfile } from "./types";

/**
 * Backend user response shape
 * (matches IUser from backend interface.ts, minus sensitive fields)
 */
interface BackendUserResponse {
  id: string;
  auth_id?: string;
  user_type: "individual" | "business";

  // Backend now returns these:
  first_name: string;
  last_name: string;
  middle_name?: string | null;

  display_name?: string | null;
  email: string;
  phone_number?: string;
  phone_country_code?: string;
  phone_verified: boolean;
  profile_image_url?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  preferred_language: string;
  preferred_currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  hasPassword?: boolean;
}

/**
 * Fetches the authenticated user's profile
 *
 * - Server-side only, called from Server Components
 * - Uses React cache() for deduplication
 * - Throws error if user not authenticated or API fails
 */
export const getUserProfile = cache(async (): Promise<UserProfile> => {
  // Use /users/me endpoint which returns current user based on JWT token
  // This avoids ID mismatch between Supabase auth ID and public.users ID
  const data = await serverApi<BackendUserResponse>(`/users/me`, {
    auth: true,
    revalidate: 60, // 1 minute
    tags: [CACHE_TAGS.PROFILE],
  });



  // Map backend fields to frontend UserProfile
  return {
    id: data.id, // Ensure ID is mapped
    // Correctly map snake_case backend fields to frontend types
    first_name: data.first_name,
    last_name: data.last_name,

    // Computed Name: Display Name > First + Last > First > Email
    name: data.display_name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.email),

    display_name: data.display_name,
    email: data.email,
    phone: data.phone_number
      ? `${data.phone_country_code || ""}${data.phone_number}`.trim()
      : "",
    dob: data.date_of_birth,
    gender: data.gender,
    hasPassword: data.hasPassword,
    avatar: data.profile_image_url,
    profile_image_url: data.profile_image_url,
  };
});
