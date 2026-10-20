import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { giftCardService } from "../services/giftCardService";
import type {
  GiftCardFormData,
  GiftCardQueryParams
} from "../types/giftcard.types";
import { notifySuccess, notifyError } from "@/utils";

// Query keys
export const giftCardKeys = {
  all: ["gift-cards"] as const,
  lists: () => [...giftCardKeys.all, "list"] as const,
  list: (params: GiftCardQueryParams) => [...giftCardKeys.lists(), params] as const,
  details: () => [...giftCardKeys.all, "detail"] as const,
  detail: (id: string) => [...giftCardKeys.details(), id] as const,
  stats: () => [...giftCardKeys.all, "stats"] as const,
  balance: (code: string) => [...giftCardKeys.all, "balance", code] as const,
};

// Get gift cards list with filters
export const useGiftCards = (params: GiftCardQueryParams) => {
  return useQuery({
    queryKey: giftCardKeys.list(params),
    queryFn: () => giftCardService.getGiftCards(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single gift card
export const useGiftCard = (id: string) => {
  return useQuery({
    queryKey: giftCardKeys.detail(id),
    queryFn: () => giftCardService.getGiftCardById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create gift card
export const useCreateGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: giftCardService.createGiftCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: giftCardKeys.stats() });
      notifySuccess("Gift card created successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to create gift card");
    },
  });
};

// Update gift card
export const useUpdateGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCardFormData> }) =>
      giftCardService.updateGiftCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.all });
      notifySuccess("Gift card updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update gift card");
    },
  });
};

// Delete gift card
export const useDeleteGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: giftCardService.deleteGiftCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: giftCardKeys.stats() });
      notifySuccess("Gift card deleted successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to delete gift card");
    },
  });
};

// Disable gift card
export const useDisableGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: giftCardService.disableGiftCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.all });
      notifySuccess("Gift card disabled successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to disable gift card");
    },
  });
};

// Enable gift card
export const useEnableGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: giftCardService.enableGiftCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.all });
      notifySuccess("Gift card enabled successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to enable gift card");
    },
  });
};

// Redeem gift card
export const useRedeemGiftCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, amount, orderId }: { code: string; amount: number; orderId?: string }) =>
      giftCardService.redeemGiftCard(code, amount, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.all });
      notifySuccess("Gift card redeemed successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to redeem gift card");
    },
  });
};

// Check gift card balance
export const useCheckGiftCardBalance = () => {
  return useMutation({
    mutationFn: giftCardService.checkBalance,
  });
};

// Get gift card statistics
export const useGiftCardStats = () => {
  return useQuery({
    queryKey: giftCardKeys.stats(),
    queryFn: giftCardService.getGiftCardStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Bulk create gift cards
export const useBulkCreateGiftCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: giftCardService.bulkCreateGiftCards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: giftCardKeys.stats() });
      notifySuccess("Gift cards created successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to create gift cards");
    },
  });
};