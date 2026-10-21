/**
 * Get Current User ID
 * 
 * Server-side helper to get the authenticated user's public.users ID.
 * This is used for API calls that require the user ID in the path.
 * 
 * IMPORTANT: This returns the public.users ID, NOT the Supabase auth ID.
 */

import { cache } from 'react';
import { serverApi } from '@/api/server';
import { CACHE_TAGS } from '@/lib/cache/tags';

interface CurrentUserIdResponse {
    id: string;
}

/**
 * Fetches the current authenticated user's public.users ID
 * 
 * - Server-side only
 * - Uses React cache() for deduplication
 * - Returns the user's public.users ID (UUID)
 * - Throws error if user not authenticated
 */
export const getCurrentUserId = cache(async (): Promise<string> => {
    const data = await serverApi<CurrentUserIdResponse>(
        `/users/me`,
        {
            auth: true,
            revalidate: 60, // 1 minute
            tags: [CACHE_TAGS.PROFILE],
        }
    );

    return data.id;
});
