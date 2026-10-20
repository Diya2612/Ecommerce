/**
 * Abandoned Carts React Query Hooks
 *
 * Provides hooks for fetching and mutating abandoned cart data via backend APIs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifySuccess, notifyError } from "@/utils";
import { orderService } from "../services/orderService";
import { mapApiToAbandonedOrder } from "../services/orderService";
import type {
  AbandonedCartsQueryParams,
} from "../services/abandonedCartsApi.types";

// ============================================
// Query Keys for Cache Management
// ============================================

export const abandonedCartKeys = {
  all: ["abandoned-carts"] as const,
  lists: () => [...abandonedCartKeys.all, "list"] as const,
  list: (filters: AbandonedCartsQueryParams) =>
    [...abandonedCartKeys.lists(), filters] as const,
  details: () => [...abandonedCartKeys.all, "detail"] as const,
  detail: (id: string) => [...abandonedCartKeys.details(), id] as const,
  metrics: () => [...abandonedCartKeys.all, "metrics"] as const,
};

// ============================================
// Query Hooks (Data Fetching)
// ============================================

/**
 * Fetch abandoned carts list with filters and pagination
 */
export const useAbandonedCartsApi = (
  filters: AbandonedCartsQueryParams = {},
) => {
  return useQuery({
    queryKey: abandonedCartKeys.list(filters),
    queryFn: async () => {
      const response = await orderService.getAbandonedCarts(filters);
      return {
        carts: (response.data?.carts || []).map(mapApiToAbandonedOrder),
        pagination: response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch single abandoned cart details by ID
 */
export const useAbandonedCartDetail = (id: string) => {
  return useQuery({
    queryKey: abandonedCartKeys.detail(id),
    queryFn: async () => {
      const response = await orderService.getAbandonedCartById(id);
      return mapApiToAbandonedOrder(response.data);
    },
    enabled: !!id,
  });
};

/**
 * Fetch abandoned carts metrics
 */
export const useAbandonedCartsMetrics = () => {
  return useQuery({
    queryKey: abandonedCartKeys.metrics(),
    queryFn: async () => {
      const response = await orderService.getAbandonedCartsMetrics();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

// ============================================
// Mutation Hooks (Data Updates)
// ============================================

/**
 * Send recovery email to a single cart
 */
/**
 * Send recovery email (single or bulk)
 */
export const useSendRecoveryEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { cart_id?: string; cart_ids?: string[]; template_id?: string }) =>
      orderService.sendRecoveryEmail(data),
    onSuccess: (response) => {
      notifySuccess(response.message || "Recovery emails sent successfully");
      queryClient.invalidateQueries({ queryKey: abandonedCartKeys.lists() });
      queryClient.invalidateQueries({ queryKey: abandonedCartKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to send recovery emails",
      );
    },
  });
};

/**
 * Fetch available email templates
 */
export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const response = await orderService.getEmailTemplates();
      return response.templates;
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};
