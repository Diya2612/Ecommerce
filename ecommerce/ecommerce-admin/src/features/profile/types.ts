export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  timezone?: string;
  preferredLanguage?: string;
  dateTimeFormat?: string;
  memberSince: string;
  lastLogin: string;
  role: string;
  status: "active" | "inactive";
}

export interface SecuritySettings {
  passwordLastChanged: string;
  twoFactorEnabled: boolean;
  twoFactorId?: string;
  twoFactorMethod?: string;
  lastVerified?: string;
  activeSessions?: ActiveSession[];
  loginHistory?: LoginHistory[];
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistory {
  timestamp: string;
  ipLocation: string;
  status: "success" | "failed";
}

export interface NotificationPreferences {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemAlerts: boolean;
  securityEvents: boolean;
  userActivity: boolean;
  eventUpdates: boolean;
  financialUpdates: boolean;
  frequency: "real-time" | "daily" | "weekly";
}

export interface ConnectedAccount {
  id: string;
  provider: "google" | "microsoft" | "github";
  email: string;
  connected: boolean;
  protectedByOrg?: boolean;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  defaultLandingPage: string;
  rowsPerPage: number;
  rememberFilters: boolean;
  timezone?: string;
  preferredLanguage?: string;
  dateTimeFormat?: string;
}

export interface ProfileFormData extends UserProfile {
  securitySettings: SecuritySettings;
  notificationPreferences: NotificationPreferences;
  appearanceSettings: AppearanceSettings;
}