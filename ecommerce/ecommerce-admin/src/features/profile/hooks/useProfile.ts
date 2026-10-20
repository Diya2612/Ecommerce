import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UserProfile,
  SecuritySettings,
  NotificationPreferences,
  AppearanceSettings,
  ActiveSession,
  LoginHistory,
  ConnectedAccount
} from "../types";
import {
  mockConnectedAccounts
} from "../data/mockProfileData";
import { profileApi } from "../services/profileApi";
import { getCurrentUser, updateUser } from "@/services/userService";
import { logout } from "@/utils/auth";
import { toast } from "sonner";

// Default settings fallback
const defaultNotificationPreferences: NotificationPreferences = {
  inAppNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  systemAlerts: true,
  securityEvents: true,
  userActivity: false,
  eventUpdates: true,
  financialUpdates: true,
  frequency: "real-time",
};

const defaultSecuritySettings: SecuritySettings = {
  passwordLastChanged: "Not available",
  twoFactorEnabled: false,
  twoFactorMethod: undefined,
  lastVerified: undefined,
};

const defaultAppearanceSettings: AppearanceSettings = {
  theme: "light",
  density: "comfortable",
  defaultLandingPage: "Dashboard",
  rowsPerPage: 25,
  rememberFilters: true,
};

export default function useProfile() {
  const queryClient = useQueryClient();
  const [connectedAccounts] = useState<ConnectedAccount[]>(mockConnectedAccounts);

  // Fetch current user data - NO mock fallback
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Client-Side Persistence States

  // 1. Theme
  const [localTheme, setLocalTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // 2. Rows Per Page
  const [localRowsPerPage, setLocalRowsPerPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rowsPerPage');
      return stored ? parseInt(stored) : 25;
    }
    return 25;
  });

  // 3. Remember Filters
  const [localRememberFilters, setLocalRememberFilters] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rememberFilters');
      return stored !== 'false'; // Default to true if not present or 'true'
    }
    return true;
  });

  // Apply theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = localTheme;
    if (localTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      effectiveTheme = systemTheme;
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', localTheme);
  }, [localTheme]);

  // Fetch backend appearance settings (for other fields)
  const {
    data: backendAppearanceData = defaultAppearanceSettings,
    isLoading: settingsLoading
  } = useQuery({
    queryKey: ['profileSettings'],
    queryFn: profileApi.getProfileSettings,
    enabled: !!profile,
    placeholderData: defaultAppearanceSettings,
  });

  // Merge backend data with local overrides
  // We cast localTheme to the specific union type to fix TS error
  const appearanceSettings: AppearanceSettings = {
    ...defaultAppearanceSettings,
    ...backendAppearanceData,
    theme: localTheme as "light" | "dark" | "system",
    rowsPerPage: localRowsPerPage,
    rememberFilters: localRememberFilters,
  };

  // Fetch notification preferences
  const {
    data: notificationData,
    isLoading: notificationsLoading
  } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: profileApi.getNotificationPreferences,
    enabled: !!profile,
  });

  const notificationPreferences: NotificationPreferences = {
    ...defaultNotificationPreferences,
    ...notificationData,
  };

  // Fetch security settings (includes sessions and login history)
  const {
    data: securityData,
    isLoading: securityLoading
  } = useQuery({
    queryKey: ['securitySettings'],
    queryFn: profileApi.getSecuritySettings,
    enabled: !!profile,
  });

  const securitySettings: SecuritySettings = {
    ...defaultSecuritySettings,
    ...securityData,
  };

  const activeSessions: ActiveSession[] = securityData?.activeSessions || [];
  const loginHistory: LoginHistory[] = securityData?.loginHistory || [];

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!profile?.id) {
        throw new Error('No user profile loaded');
      }
      return await updateUser(profile.id, updates);
    },
    onSuccess: async (data) => {
      console.log('Profile updated successfully:', data);
      // Invalidate and wait for refetch to complete
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    },
  });

  // Notification preferences mutation
  const notificationMutation = useMutation({
    mutationFn: profileApi.updateNotificationPreferences,
    onSuccess: (data) => {
      console.log('Notification preferences updated:', data);
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      queryClient.setQueryData(['notificationPreferences'], data);
    },
    onError: (error) => {
      console.error('Failed to update notification preferences:', error);
    },
  });

  const updateProfile = async (updates: Partial<UserProfile>) => {
    return await profileMutation.mutateAsync(updates);
  };

  const appearanceMutation = useMutation({
    mutationFn: profileApi.updateProfileSettings,
    onSuccess: (data) => {
      console.log('Appearance settings updated:', data);
      queryClient.setQueryData(['profileSettings'], data);
    },
    onError: (error) => {
      console.error('Failed to update appearance settings:', error);
      toast.error('Failed to save appearance settings');
    }
  });

  // Update appearance settings
  const updateAppearanceSettings = (settings: AppearanceSettings) => {
    // 1. Theme
    if (settings.theme) {
      setLocalTheme(settings.theme);
      // localStorage update handled by useEffect
    }

    // 2. Rows Per Page
    if (settings.rowsPerPage) {
      setLocalRowsPerPage(settings.rowsPerPage);
      localStorage.setItem('rowsPerPage', settings.rowsPerPage.toString());
    }

    // 3. Remember Filters
    if (settings.rememberFilters !== undefined) {
      setLocalRememberFilters(settings.rememberFilters);
      localStorage.setItem('rememberFilters', String(settings.rememberFilters));
    }

    // Attempt to save to backend
    appearanceMutation.mutate({
      ...backendAppearanceData,
      theme: settings.theme || localTheme as "light" | "dark" | "system",
      rowsPerPage: settings.rowsPerPage || localRowsPerPage,
      rememberFilters: settings.rememberFilters !== undefined ? settings.rememberFilters : localRememberFilters,
      timezone: settings.timezone || backendAppearanceData.timezone,
      preferredLanguage: settings.preferredLanguage || backendAppearanceData.preferredLanguage,
      dateTimeFormat: settings.dateTimeFormat || backendAppearanceData.dateTimeFormat,
    });

    console.log('Appearance updated (local + backend attempt):', settings);
  };

  const updateSecuritySettings = (updates: Partial<SecuritySettings>) => {
    console.log("Security settings update not yet implemented:", updates);
  };

  const updateNotificationPreferences = (preferences: NotificationPreferences) => {
    notificationMutation.mutate(preferences);
  };

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => { console.log('Password changed'); },
    onError: (error) => { console.error('Failed to change password:', error); },
  });

  // MFA Mutations
  const enrollMfaMutation = useMutation({ mutationFn: profileApi.enrollMfa });

  const verifyMfaMutation = useMutation({
    mutationFn: ({ factorId, code }: { factorId: string; code: string }) => profileApi.verifyMfa(factorId, code),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['securitySettings'] }); }
  });

  const disableMfaMutation = useMutation({
    mutationFn: profileApi.disableMfa,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['securitySettings'] }); }
  });

  const logoutSessionMutation = useMutation({
    mutationFn: ({ scope, sessionId }: { scope: 'current' | 'all' | 'others' | 'single', sessionId?: string }) =>
      profileApi.logoutSession(scope, sessionId),
    onSuccess: (_data, variables) => {
      // Only clear auth and redirect for current/all scopes
      if (variables.scope === 'all' || variables.scope === 'current') {
        // Clear local auth state
        logout();
        // Clear all query cache
        queryClient.clear();
        // Redirect to login
        window.location.href = '/login';
      } else {
        // For 'single' or 'others' scope, just refresh sessions list
        queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
        toast.success('Session logged out successfully');
      }
    },
    onError: (error: any) => {
      console.error('Failed to logout session:', error);
      toast.error(error?.message || 'Failed to logout session. Please try again.');
    }
  });

  const changePassword = async (data: any) => { return changePasswordMutation.mutateAsync(data); };

  /**
   * Log out from ALL sessions across ALL devices.
   * Routes through the backend so Redis sessions are also cleaned up.
   */
  const logoutAllSessions = async () => {
    // Use the backend scope:'all' which cleans Redis AND calls Supabase admin signOut
    return logoutSessionMutation.mutateAsync({ scope: 'all' });
  };

  const logoutSession = async (sessionId: string) => {
    if (sessionId === 'current-session') {
      // Fallback when Redis is empty — just log out current token
      return logoutSessionMutation.mutateAsync({ scope: 'current' });
    }
    // Use 'single' scope to logout ONE specific session by its Redis token hash
    return logoutSessionMutation.mutateAsync({ scope: 'single', sessionId });
  };
  const enrollMfa = async () => { return enrollMfaMutation.mutateAsync(); };
  const verifyMfa = async (factorId: string, code: string) => { return verifyMfaMutation.mutateAsync({ factorId, code }); };
  const disableMfa = async (factorId: string) => { return disableMfaMutation.mutateAsync(factorId); };

  const isLoading = profileLoading || settingsLoading || notificationsLoading || securityLoading;

  if (profileError) { console.error('Failed to load profile:', profileError); }

  return {
    profile: profile || null,
    securitySettings,
    notificationPreferences,
    appearanceSettings,
    activeSessions,
    loginHistory,
    connectedAccounts,
    updateProfile,
    updateSecuritySettings,
    updateNotificationPreferences,
    updateAppearanceSettings,
    changePassword,
    logoutAllSessions,
    logoutSession,
    enrollMfa,
    verifyMfa,
    disableMfa,
    isLoading,
    error: profileError,
  };
}
