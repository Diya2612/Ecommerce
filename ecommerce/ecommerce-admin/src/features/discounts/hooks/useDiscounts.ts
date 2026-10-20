import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discountService } from "../services/discountService";
import type {
  DiscountFormData,
  DiscountQueryParams
} from "../types/discount.types";
import { notifySuccess, notifyError } from "@/utils";

// Query keys
export const discountKeys = {
  all: ["discounts"] as const,
  lists: () => [...discountKeys.all, "list"] as const,
  list: (params: DiscountQueryParams) => [...discountKeys.lists(), params] as const,
  details: () => [...discountKeys.all, "detail"] as const,
  detail: (id: string) => [...discountKeys.details(), id] as const,
  stats: (id: string) => [...discountKeys.all, "stats", id] as const,
};

// Get discounts list with filters
export const useDiscounts = (params: DiscountQueryParams) => {
  return useQuery({
    queryKey: discountKeys.list(params),
    queryFn: () => discountService.getDiscounts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single discount
export const useDiscount = (id: string) => {
  return useQuery({
    queryKey: discountKeys.detail(id),
    queryFn: () => discountService.getDiscountById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create discount
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discountService.createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      notifySuccess("Discount created successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to create discount");
    },
  });
};

// Update discount
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DiscountFormData> }) =>
      discountService.updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.all });
      notifySuccess("Discount updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update discount");
    },
  });
};

// Delete discount
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discountService.deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      notifySuccess("Discount deleted successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to delete discount");
    },
  });
};

// Toggle discount status
export const useToggleDiscountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discountService.toggleDiscountStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.all });
      notifySuccess("Discount status updated");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update discount status");
    },
  });
};

// Duplicate discount
export const useDuplicateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discountService.duplicateDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      notifySuccess("Discount duplicated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to duplicate discount");
    },
  });
};

// Validate discount code
export const useValidateDiscountCode = () => {
  return useMutation({
    mutationFn: discountService.validateDiscountCode,
  });
};

// Get discount statistics
export const useDiscountStats = (id: string) => {
  return useQuery({
    queryKey: discountKeys.stats(id),
    queryFn: () => discountService.getDiscountStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};