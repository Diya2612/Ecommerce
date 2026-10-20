/**
 * Dashboard Service
 * 
 * API integration for dashboard statistics
 */

import { makeGetRequest } from '@/lib/api';

export interface DashboardStats {
    // Counts
    totalCustomers: number;
    totalProducts: number;
    totalBlogs: number;
    totalTiers: number;
    totalTags: number;
    pendingInvitations: number;

    // This month's stats
    customersThisMonth: number;

    // Recent products
    recentProducts: Array<{
        id: string;
        title: string;
        sku: string;
        status: string;
        sellingPrice: string;
        primaryImageUrl: string | null;
        createdAt: string;
    }>;

    recentCustomers: Array<{
        id: string;
        name: string;
        email: string;
        profileImageUrl: string | null;
        createdAt: string;
    }>;

    // Recent activity (audit logs)
    recentActivity: Array<{
        id: number;
        action: string;
        resourceType: string;
        resourceId: string | null;
        userEmail: string | null;
        timestamp: string;
    }>;

    // Order statistics
    orderStats: {
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        processingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
    };

    // Breakdown stats
    tagsByType: Array<{
        type: string;
        count: number;
    }>;

    tiersByLevel: Array<{
        level: number;
        count: number;
    }>;
}

export const dashboardService = {
    /**
     * Get dashboard statistics
     * GET /api/dashboard/stats
     */
    getStats: async (): Promise<DashboardStats> => {
        const response = await makeGetRequest<{ data: DashboardStats }>('/dashboard/stats');
        return response.data.data;
    },
};
