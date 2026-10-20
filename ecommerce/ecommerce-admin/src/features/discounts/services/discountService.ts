import {
  makeGetRequestWithParams,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest
} from "@/lib/api";
import { API_ROUTES } from '@/lib/constants';
import type {
  Discount,
  DiscountFormData,
  DiscountApiResponse,
  DiscountQueryParams,
  DiscountStats
} from "../types/discount.types";

export const discountService = {
  // Get discounts with filters
  getDiscounts: async (params: DiscountQueryParams): Promise<DiscountApiResponse> => {
    const response = await makeGetRequestWithParams<DiscountApiResponse>(
      API_ROUTES.DISCOUNTS.BASE,
      params
    );
    return response.data;
  },

  // Get single discount
  getDiscountById: async (id: string): Promise<Discount> => {
    const response = await makeGetRequest<{ data: Discount }>(
      `${API_ROUTES.DISCOUNTS.BASE}/${id}`
    );
    return response.data.data;
  },

  // Create new discount
  createDiscount: async (discountData: DiscountFormData): Promise<Discount> => {
    const response = await makePostRequest<{ data: Discount }>(
      API_ROUTES.DISCOUNTS.BASE,
      discountData
    );
    return response.data.data;
  },

  // Update discount
  updateDiscount: async (id: string, discountData: Partial<DiscountFormData>): Promise<Discount> => {
    const response = await makePutRequest<{ data: Discount }>(
      `${API_ROUTES.DISCOUNTS.BASE}/${id}`,
      discountData
    );
    return response.data.data;
  },

  // Delete discount
  deleteDiscount: async (id: string): Promise<void> => {
    await makeDeleteRequest(`${API_ROUTES.DISCOUNTS.BASE}/${id}`);
  },

  // Toggle discount status
  toggleDiscountStatus: async (id: string): Promise<Discount> => {
    const response = await makePutRequest<{ data: Discount }>(
      `${API_ROUTES.DISCOUNTS.BASE}/${id}/toggle`,
      {}
    );
    return response.data.data;
  },

  // Duplicate discount
  duplicateDiscount: async (id: string): Promise<Discount> => {
    const response = await makePostRequest<{ data: Discount }>(
      `${API_ROUTES.DISCOUNTS.BASE}/${id}/duplicate`,
      {}
    );
    return response.data.data;
  },

  // Validate discount code
  validateDiscountCode: async (code: string): Promise<{ valid: boolean; discount?: Discount }> => {
    const response = await makePostRequest<{ valid: boolean; discount?: Discount }>(
      API_ROUTES.DISCOUNTS.VALIDATE,
      { code }
    );
    return response.data;
  },

  // Get discount usage statistics
  getDiscountStats: async (id: string): Promise<DiscountStats> => {
    const response = await makeGetRequest<{ data: DiscountStats }>(
      `${API_ROUTES.DISCOUNTS.BASE}/${id}/stats`
    );
    return response.data.data;
  }
};