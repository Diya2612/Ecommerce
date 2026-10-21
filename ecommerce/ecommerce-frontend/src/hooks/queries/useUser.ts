"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  updateProfile,
  changePassword as changePasswordQuery,
  userKeys,
} from "@/queries";
import type { UpdateProfileData, UserProfile } from "@/queries/users";
import { toast } from "sonner";

// ============================================================================
// Profile Query Hook
// ============================================================================

/**
 * Hook for fetching current user profile.
 * Client-side only.
 */
export function useProfile() {
  const query = useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {

      try {
        const user = await getCurrentUser();

        return user;
      } catch (error) {
        console.error("[useProfile] Error:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Profile Mutation Hook
// ============================================================================

/**
 * Hook for updating user profile.
 */
export function useUser() {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      console.error("Profile update failed:", error);
      toast.error(error?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword?: string;
      newPassword: string;
    }) => changePasswordQuery(newPassword, currentPassword),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success("Password updated successfully");
    },
    onError: (error: any) => {
      console.error("Change password failed:", error);
      toast.error(error?.message || "Failed to change password");
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    error: updateProfileMutation.error,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
