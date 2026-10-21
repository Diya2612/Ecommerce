/**
 * Get User AMC Plans
 * 
 * Server-side data fetcher for user AMC (Annual Maintenance Contract) plans.
 * Uses React cache() for request deduplication within a render.
 * 
 * NOTE: Backend AMC API is not yet implemented.
 * Returns empty array until backend is ready.
 */

import { cache } from 'react';
import { getCurrentUserId } from './getCurrentUserId';
// import { serverApi } from '@/api/server';
// import { CACHE_TAGS } from '@/lib/cache/tags';
import { AMCPlan } from './types';

/**
 * Fetches the authenticated user's AMC plans
 * 
 * TODO: Implement when backend AMC API is available at:
 * GET /api/users/:userId/amc-plans
 * 
 * Currently returns empty array as backend API is not implemented.
 */
export const getUserAMCPlans = cache(async (): Promise<AMCPlan[]> => {
    // Get the authenticated user's public.users ID
    await getCurrentUserId(); // Call to ensure user is authenticated

    // TODO: Uncomment when backend AMC API is available
    // const userId = await getCurrentUserId();


    // TODO: Uncomment when backend AMC API is available
    // const amcPlans = await serverFetch<AMCPlan[]>(
    //     `/users/${user.id}/amc-plans`,
    //     {
    //         revalidate: 3600, // 1 hour (AMC data is very static)
    //         tags: [CACHE_TAGS.USER_AMC],
    //     }
    // );
    // return amcPlans;

    // Return empty array until backend API is available
    return [];
});
