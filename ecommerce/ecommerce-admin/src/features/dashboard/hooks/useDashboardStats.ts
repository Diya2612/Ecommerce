/**
 * useDashboardStats Hook
 * 
 * React Query hook for fetching and caching dashboard statistics
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStats } from '../services/dashboardService';

export function useDashboardStats() {
    return useQuery<DashboardStats, Error>({
        queryKey: ['dashboardStats'],
        queryFn: dashboardService.getStats,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refresh every 60 seconds
    });
}
