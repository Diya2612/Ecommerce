/**
 * Profile API Service
 * Handles all API calls for profile management
 */

import { makeGetRequest, makePutRequest, makePostRequest, makeDeleteRequest } from '@/lib/api/baseApi';
import type {
  NotificationPreferences,
  AppearanceSettings,
  SecuritySettings
} from '../types';

const API_BASE = '/profile';

// Profile Settings
export const getProfileSettings = async (): Promise<AppearanceSettings> => {
  const response = await makeGetRequest(`${API_BASE}/settings`);

  // API response is wrapped: { success, message, data: {settings} }
  const apiResponse = response.data as any;
  const data = apiResponse.data || apiResponse; // Handle both wrapped and unwrapped

  console.log('Profile settings from API:', data);

  // Map backend response to frontend type
  return {
    theme: data.theme || 'light',
    density: data.density || 'comfortable',
    defaultLandingPage: data.default_landing_page || 'Dashboard',
    rowsPerPage: data.rows_per_page || 25,
    rememberFilters: data.remember_filters ?? true,
    // Additional fields
    timezone: data.timezone,
    preferredLanguage: data.preferred_language,
    dateTimeFormat: data.date_time_format,
  };
};

export const updateProfileSettings = async (
  settings: Partial<AppearanceSettings>
): Promise<AppearanceSettings> => {
  // Map frontend type to backend schema
  const payload = {
    theme: settings.theme,
    density: settings.density,
    default_landing_page: settings.defaultLandingPage,
    rows_per_page: settings.rowsPerPage,
    remember_filters: settings.rememberFilters,
    timezone: settings.timezone,
    preferred_language: settings.preferredLanguage,
    date_time_format: settings.dateTimeFormat,
  };

  console.log('Updating profile settings with:', payload);

  const response = await makePutRequest(`${API_BASE}/settings`, payload);

  // API response is wrapped: { success, message, data: {settings} }
  const apiResponse = response.data as any;
  const data = apiResponse.data || apiResponse;

  console.log('Updated profile settings:', data);

  return {
    theme: data.theme,
    density: data.density,
    defaultLandingPage: data.default_landing_page,
    rowsPerPage: data.rows_per_page,
    rememberFilters: data.remember_filters,
    timezone: data.timezone,
    preferredLanguage: data.preferred_language,
    dateTimeFormat: data.date_time_format,
  };
};

// Notification Preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await makeGetRequest(`${API_BASE}/notifications`);
  const data = response.data as any;

  // Map backend response to frontend type
  return {
    inAppNotifications: data.push_notifications ?? true,
    emailNotifications: data.email_notifications ?? true,
    smsNotifications: data.sms_notifications ?? false,
    systemAlerts: data.security_alerts ?? true,
    securityEvents: data.security_alerts ?? true,
    userActivity: data.order_updates ?? false,
    eventUpdates: data.product_updates ?? true,
    financialUpdates: data.order_updates ?? true,
    frequency: 'real-time', // Not stored in backend yet
  };
};

export const updateNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<NotificationPreferences> => {
  // Map frontend type to backend schema
  const payload = {
    email_notifications: preferences.emailNotifications,
    sms_notifications: preferences.smsNotifications,
    push_notifications: preferences.inAppNotifications,
    order_updates: preferences.financialUpdates,
    product_updates: preferences.eventUpdates,
    inventory_alerts: preferences.systemAlerts,
    marketing_emails: false, // Default
    security_alerts: preferences.securityEvents,
  };

  const response = await makePutRequest(`${API_BASE}/notifications`, payload);
  const data = response.data as any;

  return {
    inAppNotifications: data.push_notifications,
    emailNotifications: data.email_notifications,
    smsNotifications: data.sms_notifications,
    systemAlerts: data.security_alerts,
    securityEvents: data.security_alerts,
    userActivity: data.order_updates,
    eventUpdates: data.product_updates,
    financialUpdates: data.order_updates,
    frequency: 'real-time',
  };
};

// Security Settings
export const getSecuritySettings = async (): Promise<SecuritySettings> => {
  const response = await makeGetRequest(`${API_BASE}/security`);
  const apiResponse = response.data as any;
  const data = apiResponse.data || apiResponse;

  return {
    passwordLastChanged: data.passwordLastChanged || 'Not available',
    twoFactorEnabled: data.twoFactorEnabled || false,
    twoFactorId: data.twoFactorId,
    twoFactorMethod: data.twoFactorMethod,
    lastVerified: data.lastVerified,
    activeSessions: data.activeSessions || [],
    loginHistory: data.loginHistory || [],
  };
};

export const changePassword = async (data: any): Promise<void> => {
  await makePutRequest(`${API_BASE}/change-password`, data);
};

// MFA Methods
export const enrollMfa = async (): Promise<{ id: string; type: string; secret: string; qr_code: string; uri: string }> => {
  const response = await makePostRequest(`${API_BASE}/mfa/enroll`, {});
  const apiResponse = response.data as any;
  return apiResponse.data || apiResponse;
};

export const verifyMfa = async (factorId: string, code: string): Promise<any> => {
  const response = await makePostRequest(`${API_BASE}/mfa/verify`, { factorId, code });
  return response.data;
};

export const disableMfa = async (factorId: string): Promise<void> => {
  await makeDeleteRequest(`${API_BASE}/mfa/${factorId}`);
};

// Session Methods
export const logoutSession = async (scope: 'current' | 'all' | 'others' | 'single' = 'current', sessionId?: string): Promise<void> => {
  await makePostRequest(`${API_BASE}/sessions/logout`, { scope, sessionId });
};

export const profileApi = {
  getProfileSettings,
  updateProfileSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  getSecuritySettings,
  changePassword,
  enrollMfa,
  verifyMfa,
  disableMfa,
  logoutSession,
};

