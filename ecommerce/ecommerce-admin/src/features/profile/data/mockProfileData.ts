import type { UserProfile, ActiveSession, LoginHistory, ConnectedAccount } from "../types";

export const mockUserProfile: UserProfile = {
  id: "user-123",
  firstName: "Admin",
  lastName: "User",
  email: "admin@visaplatform.com",
  phoneNumber: "+1 (555) 123-4567",
  timezone: "Eastern Time (ET)",
  preferredLanguage: "English (US)",
  dateTimeFormat: "MM/DD/YYYY",
  memberSince: "December 15, 2024",
  lastLogin: "Today at 9:45 AM from Chrome on Windows",
  role: "Super Admin",
  status: "active",
};

export const mockActiveSessions: ActiveSession[] = [
  {
    id: "session-1",
    device: "Chrome on Windows",
    location: "Toronto, Canada",
    lastActive: "5 mins ago (Current Session)",
    isCurrent: true,
  },
  {
    id: "session-2",
    device: "Safari on iPhone",
    location: "Toronto, Canada", 
    lastActive: "2 hours ago",
    isCurrent: false,
  },
];

export const mockLoginHistory: LoginHistory[] = [
  {
    timestamp: "Jan 3, 2026 at 9:45 AM",
    ipLocation: "Toronto, Canada (142.250.xxx.xx)",
    status: "success",
  },
  {
    timestamp: "Jan 2, 2026 at 5:30 PM",
    ipLocation: "Toronto, Canada (142.250.xxx.xx)",
    status: "success",
  },
  {
    timestamp: "Jan 2, 2026 at 9:15 AM",
    ipLocation: "Toronto, Canada (142.250.xxx.xx)",
    status: "success",
  },
  {
    timestamp: "Jan 1, 2026 at 11:00 AM",
    ipLocation: "New York, USA (172.217.xxx.xx)",
    status: "failed",
  },
  {
    timestamp: "Dec 30, 2025 at 10:30 AM",
    ipLocation: "Toronto, Canada (142.250.xxx.xx)",
    status: "success",
  },
];

export const mockConnectedAccounts: ConnectedAccount[] = [
  {
    id: "google",
    provider: "google",
    email: "admin@visaplatform.com",
    connected: false,
  },
  {
    id: "microsoft",
    provider: "microsoft",
    email: "admin@visaplatform.com",
    connected: false,
  },
  {
    id: "org-sso",
    provider: "github", // Using github as placeholder for org SSO
    email: "admin@visaplatform.com",
    connected: true,
    protectedByOrg: true,
  },
];