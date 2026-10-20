import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Client Configuration
 * 
 * Centralized configuration for data fetching and caching.
 * 
 * Default Options:
 * - Retry failed requests once
 * - Don't refetch on window focus
 * - Cache data for 5 minutes
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
