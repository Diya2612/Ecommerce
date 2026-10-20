/**
 * useOrderDetail Hook
 *
 * Fetches and manages single order details with update capabilities
 */

import { useParams } from "react-router-dom";
import {
  useOrderDetail as useOrderDetailApi,
  useUpdateFulfillment,
  useUpdatePayment,
  useUpdateTracking,
} from "./useOrdersApi";
import { mapApiToOrder } from "../services/orderService";
import type { Order } from "../types";

export function useOrderDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch order details
  const { data: orderResponse, isLoading, isError } = useOrderDetailApi(id!);

  // Mutations
  const updateFulfillment = useUpdateFulfillment();
  const updatePayment = useUpdatePayment();
  const updateTracking = useUpdateTracking();

  // Map API response to order
  const order: Order | null = orderResponse ? mapApiToOrder(orderResponse) : null;

  const currencySymbol = order?.currency === "USD" ? "$" : "₹";

  // Helper to get status badge variant and label
  const getStatusBadge = (
    status: string,
    type: "order" | "fulfillment" | "payment",
  ): { variant: string; label: string } => {
    if (type === "order") {
      switch (status) {
        case "draft":
          return { variant: "secondary", label: "Draft" };
        case "confirmed":
          return { variant: "default", label: "Confirmed" };
        case "paid":
          return { variant: "emerald", label: "Paid" };
        default:
          return { variant: "secondary", label: status };
      }
    }

    if (type === "fulfillment") {
      switch (status) {
        case "Fulfilled":
          return { variant: "emerald", label: "Fulfilled" };
        case "Partial":
          return { variant: "default", label: "Partial" };
        case "Pending":
          return { variant: "secondary", label: "Pending" };
        case "Cancelled":
          return { variant: "destructive", label: "Cancelled" };
        default:
          return { variant: "secondary", label: status };
      }
    }

    if (type === "payment") {
      switch (status) {
        case "Paid":
          return { variant: "emerald", label: "Paid" };
        case "Pending":
          return { variant: "secondary", label: "Pending" };
        case "Overdue":
          return { variant: "destructive", label: "Overdue" };
        case "Partially Paid":
          return { variant: "default", label: "Partially Paid" };
        default:
          return { variant: "secondary", label: status };
      }
    }

    return { variant: "secondary", label: status };
  };

  // Update functions
  const handleUpdateFulfillment = (
    fulfillment_status: string,
    notes?: string,
  ) => {
    if (!id) return;
    updateFulfillment.mutate({
      id,
      data: {
        fulfillment_status: fulfillment_status as any,
        notes,
      },
    });
  };

  const handleUpdatePayment = (payment_status: string, notes?: string) => {
    if (!id) return;
    updatePayment.mutate({
      id,
      data: {
        payment_status: payment_status as any,
        notes,
      },
    });
  };

  const handleUpdateTracking = (tracking_number: string, carrier?: string) => {
    if (!id) return;
    updateTracking.mutate({
      id,
      data: {
        tracking_number,
        carrier,
      },
    });
  };

  return {
    order,
    isLoading: isLoading && !order, // Only show loading if we don't have order data
    isError: isError && !order, // Only show error if we don't have order data (fallback successful)
    currencySymbol,
    getStatusBadge,
    updateFulfillment: handleUpdateFulfillment,
    updatePayment: handleUpdatePayment,
    updateTracking: handleUpdateTracking,
    isUpdating:
      updateFulfillment.isPending ||
      updatePayment.isPending ||
      updateTracking.isPending,
  };
}


