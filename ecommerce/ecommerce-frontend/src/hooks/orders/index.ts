'use client';

/**
 * Order Query & Mutation Hooks
 *
 * TanStack Query hooks for order operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    orderKeys,
    getOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    createPaymentOrder,
    verifyPayment,
    retryPayment,
} from '@/queries/orders';
import { cartKeys } from '@/queries/cart';
import type {
    Order,
    CreateOrderData,
    VerifyPaymentRequest,
} from '@/queries/orders';

// ============================================================================
// Order Query Hooks
// ============================================================================

interface UseOrdersOptions {
    initialData?: Order[];
    enabled?: boolean;
}

/**
 * Fetch all orders for current user
 */
export function useOrders(options: UseOrdersOptions = {}) {
    return useQuery({
        queryKey: orderKeys.lists(),
        queryFn: getOrders,
        initialData: options.initialData,
        enabled: options.enabled ?? true,
    });
}

interface UseOrderOptions {
    initialData?: Order;
    enabled?: boolean;
}

/**
 * Fetch single order by ID
 */
export function useOrder(orderId: string, options: UseOrderOptions = {}) {
    return useQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: () => getOrderById(orderId),
        initialData: options.initialData,
        enabled: (options.enabled ?? true) && !!orderId,
    });
}

// ============================================================================
// Order Mutation Hooks
// ============================================================================

/**
 * Create a new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderData) => createOrder(data),

        onSuccess: () => {
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            // Invalidate cart (should be empty now)
            queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create order');
        },
    });
}

/**
 * Cancel an order
 */
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
            cancelOrder(orderId, reason),

        onSuccess: (data) => {
            // Update the specific order in cache
            queryClient.setQueryData(orderKeys.detail(data.id), data);
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success('Order cancelled');
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to cancel order');
        },
    });
}

// ============================================================================
// Payment Mutation Hooks
// ============================================================================

/**
 * Create payment order (Razorpay or COD)
 */
export function useCreatePaymentOrder() {
    return useMutation({
        mutationFn: ({
            orderId,
            paymentMethod,
        }: {
            orderId: string;
            paymentMethod: 'razorpay' | 'cod';
        }) => createPaymentOrder(orderId, paymentMethod),
    });
}

/**
 * Verify Razorpay payment
 */
export function useVerifyPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: VerifyPaymentRequest) => verifyPayment(data),

        onSuccess: (data) => {
            if (data.order_id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order_id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            }
        },
    });
}

/**
 * Retry a failed payment
 */
export function useRetryPayment() {
    return useMutation({
        mutationFn: (orderId: string) => retryPayment(orderId),
    });
}
