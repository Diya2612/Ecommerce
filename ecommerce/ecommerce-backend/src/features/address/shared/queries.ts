/**
 * Address Database Queries
 * All Drizzle ORM queries for the Address module.
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../../database';
import { userAddresses, UserAddress, NewUserAddress } from './addresses.schema';

/**
 * Get all active addresses for a user.
 */
export const findAddressesByUserId = async (userId: string): Promise<UserAddress[]> => {
  return db
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.user_id, userId), eq(userAddresses.is_deleted, false)));
};

/**
 * Find a specific address by ID belonging to a user.
 */
export const findAddressByIdAndUser = async (
  addressId: string,
  userId: string,
): Promise<UserAddress | undefined> => {
  const [address] = await db
    .select()
    .from(userAddresses)
    .where(
      and(
        eq(userAddresses.id, addressId),
        eq(userAddresses.user_id, userId),
        eq(userAddresses.is_deleted, false),
      ),
    );
  return address;
};

/**
 * Insert a new address.
 */
export const insertAddress = async (data: NewUserAddress): Promise<UserAddress> => {
  const [newAddress] = await db.insert(userAddresses).values(data).returning();
  return newAddress;
};

/**
 * Update an existing address.
 */
export const updateAddressById = async (
  addressId: string,
  updates: Partial<UserAddress>,
): Promise<UserAddress> => {
  const [updatedAddress] = await db
    .update(userAddresses)
    .set(updates)
    .where(eq(userAddresses.id, addressId))
    .returning();
  return updatedAddress;
};

/**
 * Remove default shipping status from all of a user's addresses.
 */
export const clearDefaultShippingForUser = async (userId: string): Promise<void> => {
  await db
    .update(userAddresses)
    .set({ is_default_shipping: false })
    .where(
      and(
        eq(userAddresses.user_id, userId),
        eq(userAddresses.is_deleted, false),
        eq(userAddresses.is_default_shipping, true),
      ),
    );
};

/**
 * Remove default billing status from all of a user's addresses.
 */
export const clearDefaultBillingForUser = async (userId: string): Promise<void> => {
  await db
    .update(userAddresses)
    .set({ is_default_billing: false })
    .where(
      and(
        eq(userAddresses.user_id, userId),
        eq(userAddresses.is_deleted, false),
        eq(userAddresses.is_default_billing, true),
      ),
    );
};
