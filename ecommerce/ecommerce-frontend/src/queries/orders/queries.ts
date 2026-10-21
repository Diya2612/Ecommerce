/**
 * Order Query Functions
 *
 * Pure async functions for order operations.
 * All order operations require authentication.
 */

import { api } from "@/api";
import { getCartSessionId } from "@/queries/cart";
import type {
  Order,
  CreateOrderData,
  OrderSummaryResponse,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  InvoiceData,
} from "./types";

// ============================================================================
// Order Queries
// ============================================================================

/**
 * Get all orders for current user
 */
export async function getOrders(): Promise<Order[]> {
  const response = await api<Order[] | { orders: Order[] }>("/orders", {
    auth: true,
  });

  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }
  return response.orders || [];
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  console.log("[getOrderById] Fetching order:", orderId);

  try {
    const response = await api<Order | { order: Order }>(`/orders/${orderId}`, {
      auth: true,
    });

    console.log("[getOrderById] Response received:", response);

    if ("order" in response) {
      console.log("[getOrderById] Response has order key, extracting...");
      return response.order;
    }

    console.log("[getOrderById] Returning response as Order");
    return response as Order;
  } catch (error) {
    console.error("[getOrderById] Error:", error);
    throw error;
  }
}

// ============================================================================
// Order Mutations
// ============================================================================

/**
 * Create a new order from cart
 */
export async function createOrder(
  data: CreateOrderData,
): Promise<OrderSummaryResponse> {
  const sessionId = getCartSessionId();

  return api<OrderSummaryResponse>("/orders", {
    method: "POST",
    body: data,
    auth: true,
    sessionId,
  });
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<Order> {
  return api<Order>(`/orders/${orderId}/cancel`, {
    method: "POST",
    body: { reason },
    auth: true,
  });
}

// ============================================================================
// Payment Operations
// ============================================================================

/**
 * Create a payment order (Razorpay or COD)
 */
export async function createPaymentOrder(
  orderId: string,
  paymentMethod: "razorpay" | "cod",
): Promise<CreatePaymentOrderResponse> {
  return api<CreatePaymentOrderResponse>("/payments/create-order", {
    method: "POST",
    body: { order_id: orderId, payment_method: paymentMethod },
    auth: true,
  });
}

/**
 * Verify Razorpay payment
 */
export async function verifyPayment(
  data: VerifyPaymentRequest,
): Promise<VerifyPaymentResponse> {
  return api<VerifyPaymentResponse>("/payments/verify", {
    method: "POST",
    body: data,
    auth: true,
  });
}

/**
 * Retry a failed payment
 */
export async function retryPayment(
  orderId: string,
): Promise<CreatePaymentOrderResponse> {
  return api<CreatePaymentOrderResponse>("/payments/retry", {
    method: "POST",
    body: { order_id: orderId },
    auth: true,
  });
}

// ============================================================================
// Invoice Operations
// ============================================================================

/**
 * Get latest invoice for order
 */
export async function getLatestInvoice(orderId: string): Promise<InvoiceData> {
  return api<InvoiceData>(`/orders/${orderId}/invoices/latest`, {
    auth: true,
  });
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(versionId: string): Promise<Blob> {
  return api<Blob>(`/invoices/${versionId}/download`, {
    auth: true,
    responseType: "blob",
  });
}
