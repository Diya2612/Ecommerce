import { UserAddress } from '../shared/addresses.schema';
import { HttpException, parseE164 } from '../../../utils';
import type { CreateAddressBody, UpdateAddressBody } from '../shared/validation';
import type { AddressServiceContext } from '../shared/interface';
import {
  findAddressesByUserId,
  findAddressByIdAndUser,
  insertAddress,
  updateAddressById,
  clearDefaultShippingForUser,
  clearDefaultBillingForUser,
} from '../shared/queries';

/**
 * Get all active addresses for a user
 */
export const getAddresses = async (userId: string): Promise<UserAddress[]> => {
  return findAddressesByUserId(userId);
};

/**
 * Create a new address for a user
 */
export const createAddress = async (
  userId: string,
  data: CreateAddressBody,
  ctx: AddressServiceContext = {},
): Promise<UserAddress> => {
  const {
    address_type,
    address_name,
    name,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    isDefaultShipping,
    isDefaultBilling,
    deliveryInstructions,
  } = data;

  // Custom name is only relevant if type is 'other'
  const finalAddressName = address_type !== 'other' ? null : (address_name ?? null);

  const setAsDefaultShipping = isDefaultShipping ?? false;
  const setAsDefaultBilling = isDefaultBilling ?? false;

  if (setAsDefaultShipping) {
    await clearDefaultShippingForUser(userId);
  }

  if (setAsDefaultBilling) {
    await clearDefaultBillingForUser(userId);
  }

  const newAddress = await insertAddress({
    user_id: userId,
    address_type,
    address_name: finalAddressName,
    is_default_shipping: setAsDefaultShipping,
    is_default_billing: setAsDefaultBilling,
    recipient_name: name,
    phone_number: parseE164(phone),
    address_line1: addressLine1,
    address_line2: addressLine2,
    city,
    state_province: state,
    postal_code: pincode,
    country: country ?? 'India',
    country_code: country === 'India' || !country ? 'IN' : 'XX',
    delivery_instructions: deliveryInstructions,
    is_deleted: false,
  });


  return newAddress;
};

/**
 * Update an existing address
 */
export const updateAddress = async (
  userId: string,
  addressId: string,
  data: UpdateAddressBody,
  ctx: AddressServiceContext = {},
): Promise<UserAddress> => {
  const {
    address_type,
    address_name,
    name,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    isDefaultShipping,
    isDefaultBilling,
    deliveryInstructions,
  } = data;

  const existingAddress = await findAddressByIdAndUser(addressId, userId);

  if (!existingAddress) {
    throw new HttpException(404, 'Address not found');
  }

  const updateData: Partial<UserAddress> = { updated_at: new Date() };

  // Sync address_type and address_name
  if (address_type) {
    updateData.address_type = address_type;
    // Clear custom name if switching away from 'other'
    updateData.address_name = address_type !== 'other' ? null : (address_name ?? null);
  } else if (existingAddress.address_type === 'other' && address_name !== undefined) {
    updateData.address_name = address_name;
  }

  // Handle default toggles
  if (isDefaultShipping !== undefined) {
    if (isDefaultShipping) {
      await clearDefaultShippingForUser(userId);
    }
    updateData.is_default_shipping = isDefaultShipping;
  }

  if (isDefaultBilling !== undefined) {
    if (isDefaultBilling) {
      await clearDefaultBillingForUser(userId);
    }
    updateData.is_default_billing = isDefaultBilling;
  }

  if (country) {
    updateData.country = country;
    updateData.country_code = country === 'India' ? 'IN' : 'XX';
  }
  if (name) updateData.recipient_name = name;
  if (phone) updateData.phone_number = parseE164(phone);
  if (addressLine1) updateData.address_line1 = addressLine1;
  if (addressLine2 !== undefined) updateData.address_line2 = addressLine2;
  if (city) updateData.city = city;
  if (state) updateData.state_province = state;
  if (pincode) updateData.postal_code = pincode;
  if (deliveryInstructions !== undefined) updateData.delivery_instructions = deliveryInstructions;

  const updatedAddress = await updateAddressById(addressId, updateData);


  return updatedAddress;
};

/**
 * Soft-delete an address
 */
export const deleteAddress = async (
  userId: string,
  addressId: string,
  ctx: AddressServiceContext = {},
): Promise<void> => {
  const existingAddress = await findAddressByIdAndUser(addressId, userId);

  if (!existingAddress) {
    throw new HttpException(404, 'Address not found');
  }

  await updateAddressById(addressId, {
    is_deleted: true,
    updated_at: new Date(),
  });

};
