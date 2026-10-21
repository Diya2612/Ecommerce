import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * getQueryClient
 * 
 * Returns a request-scoped QueryClient instance on the server,
 * and a singleton instance on the client.
 * 
 * Next.js request deduplication (cache) ensures only one client is created per request
 * during Server Component rendering.
 */
const getQueryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            // With SSR, we usually want to set some default staleCo to
            // avoid refetching immediately on the client
            staleTime: 60 * 1000,
        },
    },
}));

export default getQueryClient;
