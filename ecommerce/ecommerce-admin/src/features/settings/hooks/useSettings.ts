import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settingsService";
import type {
  Role
} from "../types/settings.types";
import { notifySuccess, notifyError } from "@/utils";

// Query keys
export const settingsKeys = {
  all: ["settings"] as const,
  roles: () => [...settingsKeys.all, "roles"] as const,
  permissions: () => [...settingsKeys.all, "permissions"] as const,
  sections: () => [...settingsKeys.all, "sections"] as const,
  store: () => [...settingsKeys.all, "store"] as const,
  payments: () => [...settingsKeys.all, "payments"] as const,
  shipping: () => [...settingsKeys.all, "shipping"] as const,
  taxes: () => [...settingsKeys.all, "taxes"] as const,
};

// Roles hooks
export const useRoles = () => {
  return useQuery({
    queryKey: settingsKeys.roles(),
    queryFn: settingsService.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
      notifySuccess("Role created successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to create role");
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      settingsService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
      notifySuccess("Role updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update role");
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
      notifySuccess("Role deleted successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to delete role");
    },
  });
};

// Permissions hooks
export const usePermissions = () => {
  return useQuery({
    queryKey: settingsKeys.permissions(),
    queryFn: settingsService.getPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Settings sections hooks
export const useSettingsSections = () => {
  return useQuery({
    queryKey: settingsKeys.sections(),
    queryFn: settingsService.getSettingsSections,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Store settings hooks
export const useStoreSettings = () => {
  return useQuery({
    queryKey: settingsKeys.store(),
    queryFn: settingsService.getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateStoreSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.store() });
      notifySuccess("Store settings updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update store settings");
    },
  });
};

// Payment settings hooks
export const usePaymentSettings = () => {
  return useQuery({
    queryKey: settingsKeys.payments(),
    queryFn: settingsService.getPaymentSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updatePaymentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.payments() });
      notifySuccess("Payment settings updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update payment settings");
    },
  });
};

// Shipping settings hooks
export const useShippingSettings = () => {
  return useQuery({
    queryKey: settingsKeys.shipping(),
    queryFn: settingsService.getShippingSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateShippingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateShippingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.shipping() });
      notifySuccess("Shipping settings updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update shipping settings");
    },
  });
};

// Tax settings hooks
export const useTaxSettings = () => {
  return useQuery({
    queryKey: settingsKeys.taxes(),
    queryFn: settingsService.getTaxSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateTaxSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateTaxSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxes() });
      notifySuccess("Tax settings updated successfully");
    },
    onError: (error: any) => {
      notifyError(error.message || "Failed to update tax settings");
    },
  });
};