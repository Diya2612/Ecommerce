import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest
} from "@/lib/api";
import { API_ROUTES } from '@/lib/constants';
import type {
  Role,
  Permission,
  SettingsGroup
} from "../types/settings.types";

export const settingsService = {
  // Roles management
  getRoles: async (): Promise<Role[]> => {
    const response = await makeGetRequest<{ data: Role[] }>(
      API_ROUTES.SETTINGS.ROLES
    );
    return response.data.data;
  },

  createRole: async (roleData: Omit<Role, 'id' | 'created_at'>): Promise<Role> => {
    const response = await makePostRequest<{ data: Role }>(
      API_ROUTES.SETTINGS.ROLES,
      roleData
    );
    return response.data.data;
  },

  updateRole: async (id: string, roleData: Partial<Role>): Promise<Role> => {
    const response = await makePutRequest<{ data: Role }>(
      `${API_ROUTES.SETTINGS.ROLES}/${id}`,
      roleData
    );
    return response.data.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await makeDeleteRequest(`${API_ROUTES.SETTINGS.ROLES}/${id}`);
  },

  // Permissions management
  getPermissions: async (): Promise<Permission[]> => {
    const response = await makeGetRequest<{ data: Permission[] }>(
      API_ROUTES.SETTINGS.PERMISSIONS
    );
    return response.data.data;
  },

  // Settings sections
  getSettingsSections: async (): Promise<SettingsGroup[]> => {
    const response = await makeGetRequest<{ data: SettingsGroup[] }>(
      API_ROUTES.SETTINGS.SECTIONS
    );
    return response.data.data;
  },

  // Store settings
  getStoreSettings: async () => {
    const response = await makeGetRequest(
      API_ROUTES.SETTINGS.STORE
    );
    return (response.data as { data: any }).data;
  },

  updateStoreSettings: async (settings: any) => {
    const response = await makePutRequest(
      API_ROUTES.SETTINGS.STORE,
      settings
    );
    return (response.data as { data: any }).data;
  },

  // Payment settings
  getPaymentSettings: async () => {
    const response = await makeGetRequest(
      API_ROUTES.SETTINGS.PAYMENTS
    );
    return (response.data as { data: any }).data;
  },

  updatePaymentSettings: async (settings: any) => {
    const response = await makePutRequest(
      API_ROUTES.SETTINGS.PAYMENTS,
      settings
    );
    return (response.data as { data: any }).data;
  },

  // Shipping settings
  getShippingSettings: async () => {
    const response = await makeGetRequest(
      API_ROUTES.SETTINGS.SHIPPING
    );
    return (response.data as { data: any }).data;
  },

  updateShippingSettings: async (settings: any) => {
    const response = await makePutRequest(
      API_ROUTES.SETTINGS.SHIPPING,
      settings
    );
    return (response.data as { data: any }).data;
  },

  // Tax settings
  getTaxSettings: async () => {
    const response = await makeGetRequest(
      API_ROUTES.SETTINGS.TAXES
    );
    return (response.data as { data: any }).data;
  },

  updateTaxSettings: async (settings: any) => {
    const response = await makePutRequest(
      API_ROUTES.SETTINGS.TAXES,
      settings
    );
    return (response.data as { data: any }).data;
  }
};