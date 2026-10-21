/**
 * Server-side API Client
 * 
 * Use this for React Server Components, Route Handlers, and Server Actions.
 * This file imports from 'next/headers' so it CANNOT be imported in client components.
 * 
 * @example
 * ```ts
 * // In a Server Component
 * import { serverApi } from '@/api/server';
 * const profile = await serverApi<UserProfile>('/users/me', { auth: true });
 * ```
 */

import 'server-only';
import { api } from './client';
import type { ApiRequestOptions } from './types';

/**
 * Server-side API wrapper for React Server Components
 * 
 * Gets auth token from cookies and passes it to the api function.
 * Only use this in Server Components, Route Handlers, or Server Actions.
 */
export async function serverApi<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    // If auth is needed, get token from server Supabase
    if (options.auth) {
        const { getSession } = await import('@/lib/supabase/server');
        const session = await getSession();

        if (session?.access_token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${session.access_token}`,
            };
        }
    }

    // Call the main api function with auth already injected via headers
    return api<T>(endpoint, { ...options, auth: false });
}

// Convenience methods for serverApi
serverApi.get = <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    serverApi<T>(endpoint, { ...options, method: 'GET' });

serverApi.post = <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    serverApi<T>(endpoint, { ...options, method: 'POST', body });
