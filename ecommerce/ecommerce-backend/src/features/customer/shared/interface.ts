/**
 * Customer Profile Interfaces
 *
 * TypeScript interfaces for customer-related types.
 * Synced with Drizzle Schema.
 */

import { type CustomerProfile, type NewCustomerProfile } from './customer-profiles.schema';

export type { CustomerProfile, NewCustomerProfile };

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  amount: string | null;
  timestamp: string;
  category: string;
  raw_timestamp: Date;
}

// Aliases for backward compatibility
export type ICustomerProfile = CustomerProfile;
export type INewCustomerProfile = NewCustomerProfile;
