import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  timezone: z.string().default("Eastern Time (ET)"),
  preferredLanguage: z.string().default("English (US)"),
  dateTimeFormat: z.string().default("MM/DD/YYYY"),
  memberSince: z.string(),
  lastLogin: z.string(),
  role: z.string().default("Super Admin"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const securitySettingsSchema = z.object({
  passwordLastChanged: z.string(),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorMethod: z.string().optional(),
  lastVerified: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  inAppNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  systemAlerts: z.boolean().default(true),
  securityEvents: z.boolean().default(true),
  userActivity: z.boolean().default(false),
  eventUpdates: z.boolean().default(true),
  financialUpdates: z.boolean().default(true),
  frequency: z.enum(["real-time", "daily", "weekly"]).default("real-time"),
});

export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  defaultLandingPage: z.string().default("Dashboard"),
  rowsPerPage: z.number().default(25),
  rememberFilters: z.boolean().default(true),
});

export const profileFormSchema = z.object({
  profile: userProfileSchema,
  securitySettings: securitySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
  appearanceSettings: appearanceSettingsSchema,
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
export type AppearanceSettingsFormData = z.infer<typeof appearanceSettingsSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;