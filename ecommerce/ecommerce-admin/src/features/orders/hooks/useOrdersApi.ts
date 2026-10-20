/**
 * Custom React Query hooks for Orders feature
 *
 * Provides hooks for fetching and mutating order data via backend APIs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifySuccess, notifyError } from "@/utils";
import { orderService } from "../services/orderService";
import { mapApiToOrder } from "../services/orderService";
import type { OrderFormData } from "../types";
import type {
  OrdersQueryParams,
  UpdateFulfillmentRequest,
  UpdatePaymentRequest,
  UpdateTrackingRequest,
  UpdateOrderStatusRequest,
} from "../services/ordersApi.types";

// ============================================
// Query Keys for Cache Management
// ============================================

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrdersQueryParams) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  drafts: () => [...orderKeys.all, "drafts"] as const,
  draftsList: (filters: OrdersQueryParams) =>
    [...orderKeys.drafts(), filters] as const,
  metrics: () => [...orderKeys.all, "metrics"] as const,
};

// ============================================
// Query Hooks (Data Fetching)
// ============================================

/**
 * Fetch orders list with filters and pagination
 */
export const useOrders = (filters: OrdersQueryParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const response = await orderService.getOrders(filters);
      // Service returns { success, data: { orders, pagination }, message }
      // The orders are in response.data.orders
      return {
        data: {
          orders: (response.data?.orders || []).map(mapApiToOrder),
          pagination: response.data?.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch single order details by ID
 */
export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await orderService.getOrderById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Fetch draft orders list
 */
export const useDraftOrders = (filters: OrdersQueryParams = {}) => {
  return useQuery({
    queryKey: orderKeys.draftsList(filters),
    queryFn: async () => {
      const response = await orderService.getDraftOrders(filters);
      // Transform draft orders to frontend format
      return {
        data: {
          drafts: response.data.drafts.map(mapApiToOrder),
          pagination: response.data.pagination,
        },
      };
    },
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch order metrics/statistics
 */
export const useOrderMetrics = () => {
  return useQuery({
    queryKey: orderKeys.metrics(),
    queryFn: async () => {
      const response = await orderService.getOrderMetrics();
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
 * Update order fulfillment status
 */
export const useUpdateFulfillment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFulfillmentRequest;
    }) => orderService.updateFulfillmentStatus(id, data),
    onSuccess: (_, variables) => {
      notifySuccess("Fulfillment status updated successfully");
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to update fulfillment status",
      );
    },
  });
};

/**
 * Update order payment status
 */
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      orderService.updatePaymentStatus(id, data),
    onSuccess: (_, variables) => {
      notifySuccess("Payment status updated successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to update payment status",
      );
    },
  });
};

/**
 * Update order tracking information
 */
export const useUpdateTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrackingRequest }) =>
      orderService.updateTracking(id, data),
    onSuccess: (_, variables) => {
      notifySuccess("Tracking information added successfully");
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to add tracking information",
      );
    },
  });
};

/**
 * Confirm draft order (convert to active order)
 */
export const useConfirmDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sendEmail }: { id: string; sendEmail?: boolean }) =>
      orderService.confirmDraftOrder(id, {
        send_confirmation_email: sendEmail,
      }),
    onSuccess: () => {
      notifySuccess("Draft order confirmed successfully");
      // Invalidate drafts list and main orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to confirm draft order",
      );
    },
  });
};

/**
 * Update order status (draft/confirmed/paid)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderStatusRequest;
    }) => orderService.updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      notifySuccess("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message ||
        "Failed to update order status",
      );
    },
  });
};

/**
 * Delete/cancel order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      notifySuccess("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to delete order",
      );
    },
  });
};

/**
 * Create a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderFormData) => orderService.createOrder(data),
    onSuccess: () => {
      notifySuccess("Order created successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to create order",
      );
    },
  });
};

/**
 * Update an existing order
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrderFormData> }) =>
      orderService.updateOrder(id, data),
    onSuccess: (_, variables) => {
      notifySuccess("Order updated successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to update order",
      );
    },
  });
};

// ============================================
// Phase 3 - Enhanced Order Hooks
// ============================================

/**
 * Duplicate an existing order
 */
export const useDuplicateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.duplicateOrder(id),
    onSuccess: () => {
      notifySuccess("Order duplicated successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to duplicate order"
      );
    },
  });
};

/**
 * Bulk delete orders
 */
export const useBulkDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderIds: string[]) => orderService.bulkDeleteOrders(orderIds),
    onSuccess: (response, orderIds) => {
      const deletedCount = response.data?.deleted_count || orderIds.length;
      notifySuccess(`Delete(${deletedCount}) items successfully`);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: orderKeys.metrics() });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to delete orders"
      );
    },
  });
};

/**
 * Search products for order creation
 */
export const useProductSearch = (params: { query?: string; check_stock?: boolean } = {}) => {
  return useQuery({
    queryKey: ['products-search', params],
    queryFn: async () => {
      if (!params.query || params.query.length < 2) return { products: [] };
      const response = await orderService.searchProducts(params);
      return response;
    },
    enabled: !!params.query && params.query.length >= 2,
    staleTime: 60 * 1000,
  });
};

/**
 * Get all order tags
 */
export const useOrderTags = () => {
  return useQuery({
    queryKey: ['order-tags'],
    queryFn: async () => {
      const response = await orderService.getOrderTags();
      return response;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Create a new order tag
 */
export const useCreateOrderTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      orderService.createOrderTag(data),
    onSuccess: () => {
      notifySuccess("Tag created successfully");
      queryClient.invalidateQueries({ queryKey: ['order-tags'] });
    },
    onError: (error: any) => {
      notifyError(
        error?.response?.data?.error?.message || "Failed to create tag"
      );
    },
  });
};

/**
 * Create payment order
 */
export const useCreatePaymentOrderMutation = () => {
  return useMutation({
    mutationFn: (data: { orderId: string, paymentMethod: string }) =>
      orderService.createPaymentOrder(data),
    onError: (error: Error) => {
      console.error("Payment Order Creation Failed:", error);
      // notifyError handled in component or hook
    },
  });
};

/**
 * Verify payment
 */
export const useVerifyPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => orderService.verifyPayment(data),
    onSuccess: () => {
      // Invalidate relevant queries to refresh order status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.details() });
      notifySuccess('Payment verified successfully!');
    },
    onError: (error: Error) => {
      notifyError(error?.message || 'Payment verification failed');
    },
  });
};
