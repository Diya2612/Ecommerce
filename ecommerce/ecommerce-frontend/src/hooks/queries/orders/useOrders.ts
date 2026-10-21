import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getOrders,
    getOrderById,
    createOrder as createOrderFn,
    cancelOrder as cancelOrderFn,
    createPaymentOrder as createPaymentOrderFn,
    verifyPayment as verifyPaymentFn,
} from '@/queries';
import { CreateOrderData, Order } from '@/types/order';
import { toast } from 'sonner';
import { CART_QUERY_KEY } from '@/hooks/useCart';

export const ORDER_KEYS = {
    all: ['orders'] as const,
    lists: () => [...ORDER_KEYS.all, 'list'] as const,
    details: () => [...ORDER_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...ORDER_KEYS.details(), id] as const,
};

export function useOrdersQuery() {
    return useQuery({
        queryKey: ORDER_KEYS.lists(),
        queryFn: getOrders,
    });
}

/**
 * Enhanced orders hook.
 * Client-side only orders fetching with React Query.
 */
export function useOrders() {
    const query = useQuery({
        queryKey: ORDER_KEYS.lists(),
        queryFn: getOrders,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        orders: query.data ?? [],
        loading: query.isLoading,
        error: query.error?.message ?? null,
        refresh: () => query.refetch(),
    };
}

export function useOrderDetailQuery(orderId: string) {
    return useQuery({
        queryKey: ORDER_KEYS.detail(orderId),
        queryFn: () => getOrderById(orderId),
        enabled: !!orderId && typeof window !== 'undefined', // Only run on client
    });
}

export function useCreateOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderData) => createOrderFn(data),
        onSuccess: (data) => {
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            // Invalidate cart as it should be empty now
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            // toast.success('Order created successfully!'); // Usually redirected, so toast might be redundant
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create order');
        },
    });
}

export function useCancelOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
            cancelOrderFn(orderId, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            toast.success('Order cancelled');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to cancel order');
        },
    });
}

// Payment Mutations
export function useCreatePaymentOrderMutation() {
    return useMutation({
        mutationFn: ({ orderId, paymentMethod }: { orderId: string; paymentMethod: 'razorpay' | 'cod' }) =>
            createPaymentOrderFn(orderId, paymentMethod),
    });
}

export function useVerifyPaymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyPaymentFn,
        onSuccess: (data) => {
            if (data.order_id) {
                queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(data.order_id) });
            }
        }
    });
}
