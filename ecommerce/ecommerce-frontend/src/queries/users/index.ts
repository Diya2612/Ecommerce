/**
 * Users Query Module Index
 */

export { userKeys } from './keys';

export {
    clearUserCache,
    getCurrentUser,
    updateProfile,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    changePassword,
} from './queries';

export type {
    UserProfile,
    UserAddress,
    UpdateProfileData,
    AddressData,
} from './types';
