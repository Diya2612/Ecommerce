export interface IUserProfile {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  display_name?: string | null;
  email: string;
  phone_number?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ISecuritySettings {
  activeSessions: any[];
  loginHistory: Array<{
    timestamp: Date;
    ip_address: string;
    location?: string;
    device_type?: string;
    browser?: string;
  }>;
  passwordLastChanged?: string;
  twoFactorEnabled?: boolean;
  twoFactorId?: string;
  twoFactorMethod?: string;
  lastVerified?: string;
  hasPassword?: boolean;
  identities?: any[];
}
