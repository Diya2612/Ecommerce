/**
 * Address Interfaces
 * TypeScript types inferred from the Drizzle schema.
 */

import { UserAddress, NewUserAddress } from './addresses.schema';

export type IUserAddress = UserAddress;
export type INewUserAddress = NewUserAddress;

export type IAddressUpdateInput = Partial<INewUserAddress>;

/**
 * DTO for creating a user address.
 */
export type IAddressCreateInput = INewUserAddress;

export interface AddressServiceContext {
  requestUserId?: string; // User performing the action (for audit)
  ipAddress?: string;
  userAgent?: string;
}

export interface AddressResponse {
  id: string;
  address_type: string;
  address_name: string | null;
  name: string;
  phone: string;
  addressLine: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  deliveryInstructions?: string;
}
