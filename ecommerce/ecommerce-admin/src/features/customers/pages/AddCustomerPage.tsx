import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError, notifyInfo } from '@/utils';
import { logger } from '@/utils/logger';
import { CustomerForm } from '../components';
import { ROUTES } from '@/lib/constants';
import { customerService } from '../services/customerService';
import type { CustomerFormData, CreateCustomerPayload } from '../types/customer.types';
import { extractLocalPhoneNumber } from '../utils/phoneUtils';
import { uploadService } from '@/services/uploadService';

// Helper function to convert empty strings to undefined
const sanitizeValue = <T,>(value: T): NonNullable<T> | undefined => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (Array.isArray(value) && value.length === 0) return undefined;
  return value as NonNullable<T>;
};



// Helper function to map segment to backend enum format
const mapSegment = (segment?: string[]): ('new' | 'regular' | 'vip' | 'at_risk')[] | undefined => {
  if (!segment || segment.length === 0) return undefined;
  const normalized = segment[0].toLowerCase().replace(/\s+/g, '_');
  const validSegments = ['new', 'regular', 'vip', 'at_risk'] as const;
  return validSegments.includes(normalized as any) ? [normalized as any] : undefined;
};

export default function AddCustomerPage() {
  const navigate = useNavigate();

  const handleSubmit = async (_data: CustomerFormData) => {
    try {
      // 0. Handle Image Upload (Offline-First)
      let finalProfileImageUrl = typeof _data.profileImage === "string" ? _data.profileImage : undefined;

      if (_data.profileImageFile) {
        notifyInfo("Uploading profile image...");
        // Use a generic folder as we don't have ID yet
        const folder = `customers/new`;
        try {
          const response = await uploadService.uploadFile(_data.profileImageFile, { folder });
          if (response?.file_url) {
            finalProfileImageUrl = response.file_url;
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          notifyError("Failed to upload profile image. Creating customer without image...");
        }
      }



      // Map frontend form data to backend API payload
      const payload: CreateCustomerPayload = {
        first_name: _data.firstName.trim(), // First name
        last_name: _data.lastName.trim(), // Last name (required)
        display_name: sanitizeValue(_data.displayName),
        email: _data.email,
        phone_number: sanitizeValue(extractLocalPhoneNumber(_data.phone)),
        // Business fields have been deprecated in the backend createCustomerSchema.
        // They should be handled via a separate business profile API if needed.

        // Profile fields
        profile_image_url: finalProfileImageUrl,
        segments: mapSegment(_data.segment),
        notes: sanitizeValue(_data.internalNotes),

        // Secondary contacts (limit of 2 emails/phones)
        secondary_email: sanitizeValue(_data.secondaryEmail),
        secondary_phone_number: sanitizeValue(_data.secondaryPhone ? extractLocalPhoneNumber(_data.secondaryPhone) : undefined),
      };

      // Remove undefined values from payload
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      ) as CreateCustomerPayload;

      const response = await customerService.createCustomer(cleanPayload);

      // Save addresses if customer was created successfully and has addresses
      if (response?.id && _data.addresses && _data.addresses.length > 0) {
        const addressPromises = _data.addresses.map(async (addr) => {
          // Map frontend address type to backend format
          const mapAddressType = (type?: string): 'home' | 'office' | 'other' => {
            if (!type) return 'home';
            const lower = type.toLowerCase();
            if (lower === 'home') return 'home';
            if (lower === 'office') return 'office';
            return 'other';
          };

          try {
            const mappedType = mapAddressType(addr.addressType);
            await customerService.createAddress(response.id, {
              address_type: mappedType,
              address_name: mappedType === 'other' ? (addr.name || 'Custom Address') : undefined,
              name: addr.name || `${_data.firstName} ${_data.lastName}`.trim() || 'Customer',
              phone: extractLocalPhoneNumber(_data.phone) || 'N/A',
              addressLine1: addr.streetAddress1 || 'Address',
              addressLine2: addr.streetAddress2 || undefined,
              city: addr.city || 'City',
              state: addr.state || 'State',
              pincode: addr.pincode || '000000',
              country: addr.country || 'India',
              isDefaultBilling: addr.isDefaultBilling,
              isDefaultShipping: addr.isDefaultShipping,
            });
          } catch (addrError) {
            console.error('Failed to create address:', addrError);
            // Continue with other addresses even if one fails
          }
        });

        await Promise.all(addressPromises);
      }

      notifySuccess('Customer created successfully');

      // Navigate to the new customer's detail page
      if (response?.id) {
        navigate(ROUTES.CUSTOMERS.DETAIL(response.id));
      } else {
        navigate(ROUTES.CUSTOMERS.LIST);
      }
    } catch (error: any) {
      logger.error('Error creating customer:', error);

      // Extract error message, ensuring it's a string
      const rawMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || '';
      const errorMessage = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
      const errorLower = errorMessage.toLowerCase();

      // Check for duplicate email error
      const isDuplicateEmail =
        (errorLower.includes('email') || errorLower.includes('unique_email') || errorLower.includes('users_email_key')) &&
        (errorLower.includes('exist') || errorLower.includes('duplicate') || errorLower.includes('unique') || errorLower.includes('already') || errorLower.includes('constraint'));

      if (isDuplicateEmail || error?.response?.status === 409) {
        notifyError('Email already exists');
      } else {
        notifyError(errorMessage || 'Failed to create customer');
      }
    }
  };

  return <CustomerForm onSubmit={handleSubmit} />;
}

