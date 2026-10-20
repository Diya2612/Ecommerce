import type { CustomerFormData, Address, PaymentMethod } from './customer.types';

// ==================== Modal Props ====================

export interface ViewPaymentMethodsModalProps {
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}

export interface ViewAddressesModalProps {
  addresses: Address[];
  onClose: () => void;
}

export interface AddressModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address;
  onSave: (address: Address) => void;
}

// ==================== Form Section Props ====================

export interface PreferencesSectionProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: CustomerFormData[keyof CustomerFormData]) => void;
}

export interface PhoneNumbersSectionProps {
  phoneNumbers: string[];
  onPhoneNumbersChange: (phoneNumbers: string[]) => void;
}

export interface EmailAddressesSectionProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
}

export interface ContactInformationSectionProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: CustomerFormData[keyof CustomerFormData]) => void;
}

export interface ClassificationSectionProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: CustomerFormData[keyof CustomerFormData]) => void;
}

export interface BasicInformationSectionProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: CustomerFormData[keyof CustomerFormData]) => void;
}

export interface AddressesSectionProps {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
}

// ==================== Component Props ====================

export interface EditCustomerFormProps {
  customerId: string;
  onSave: (data: CustomerFormData) => void;
}

export interface CustomerImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

// ==================== Edit Section Props ====================

export interface VerificationSectionProps {
  isVerified: boolean;
  verificationDate?: string;
  onVerificationChange: (verified: boolean) => void;
}

export interface SubscriptionSectionProps {
  subscriptions: any[];
  onSubscriptionsChange: (subscriptions: any[]) => void;
}

export interface SecuritySectionProps {
  securitySettings: any;
  onSecurityChange: (settings: any) => void;
}

export interface OrdersOverviewSectionProps {
  orders: any[];
}

export interface MetricsCardsProps {
  metrics: any;
}

export interface LoyaltySectionProps {
  loyaltyPoints: number;
  tier: string;
  onLoyaltyUpdate: (points: number, tier: string) => void;
}


export interface BasicDetailsEditSectionProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export interface AddressPaymentSectionProps {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  onAddressesChange: (addresses: Address[]) => void;
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void;
}

export interface ActivityTimelineSectionProps {
  activities: any[];
}

export interface AbandonedCartsSectionProps {
  carts: any[];
}
