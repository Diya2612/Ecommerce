import {
  makeGetRequestWithParams,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest
} from "@/lib/api";
import { API_ROUTES } from '@/lib/constants';
import type {
  GiftCard,
  GiftCardFormData,
  GiftCardApiResponse,
  GiftCardQueryParams,
  GiftCardStats
} from "../types/giftcard.types";

export const giftCardService = {
  // Get gift cards with filters
  getGiftCards: async (params: GiftCardQueryParams): Promise<GiftCardApiResponse> => {
    const response = await makeGetRequestWithParams<GiftCardApiResponse>(
      API_ROUTES.GIFT_CARDS.BASE,
      params
    );
    return response.data;
  },

  // Get single gift card
  getGiftCardById: async (id: string): Promise<GiftCard> => {
    const response = await makeGetRequest<{ data: GiftCard }>(
      `${API_ROUTES.GIFT_CARDS.BASE}/${id}`
    );
    return response.data.data;
  },

  // Create new gift card
  createGiftCard: async (giftCardData: GiftCardFormData): Promise<GiftCard> => {
    const response = await makePostRequest<{ data: GiftCard }>(
      API_ROUTES.GIFT_CARDS.BASE,
      giftCardData
    );
    return response.data.data;
  },

  // Update gift card
  updateGiftCard: async (id: string, giftCardData: Partial<GiftCardFormData>): Promise<GiftCard> => {
    const response = await makePutRequest<{ data: GiftCard }>(
      `${API_ROUTES.GIFT_CARDS.BASE}/${id}`,
      giftCardData
    );
    return response.data.data;
  },

  // Delete gift card
  deleteGiftCard: async (id: string): Promise<void> => {
    await makeDeleteRequest(`${API_ROUTES.GIFT_CARDS.BASE}/${id}`);
  },

  // Disable gift card
  disableGiftCard: async (id: string): Promise<GiftCard> => {
    const response = await makePutRequest<{ data: GiftCard }, {}>(
      `${API_ROUTES.GIFT_CARDS.BASE}/${id}/disable`,
      {}
    );
    return (response.data as { data: GiftCard }).data;
  },

  // Enable gift card
  enableGiftCard: async (id: string): Promise<GiftCard> => {
    const response = await makePutRequest<{ data: GiftCard }, {}>(
      `${API_ROUTES.GIFT_CARDS.BASE}/${id}/enable`,
      {}
    );
    return (response.data as { data: GiftCard }).data;
  },

  // Redeem gift card
  redeemGiftCard: async (code: string, amount: number, orderId?: string) => {
    const response = await makePostRequest(
      API_ROUTES.GIFT_CARDS.REDEEM,
      { code, amount, order_id: orderId }
    );
    return (response.data as { data: any }).data;
  },

  // Check gift card balance
  checkBalance: async (code: string) => {
    const response = await makePostRequest(
      API_ROUTES.GIFT_CARDS.BALANCE,
      { code }
    );
    return (response.data as { data: any }).data;
  },

  // Get gift card statistics
  getGiftCardStats: async (): Promise<GiftCardStats> => {
    const response = await makeGetRequest<{ data: GiftCardStats }>(
      API_ROUTES.GIFT_CARDS.STATS
    );
    return (response.data as { data: GiftCardStats }).data;
  },

  // Bulk create gift cards
  bulkCreateGiftCards: async (data: { count: number; value: number; prefix?: string }) => {
    const response = await makePostRequest(
      API_ROUTES.GIFT_CARDS.BULK_CREATE,
      data
    );
    return (response.data as { data: any }).data;
  },

  // Export gift cards
  exportGiftCards: async (params: GiftCardQueryParams) => {
    const response = await makeGetRequestWithParams(
      API_ROUTES.GIFT_CARDS.EXPORT,
      params
    );
    return response.data;
  }
};