import { useNavigate } from 'react-router-dom';
import { notifyError } from '@/utils';
import { ROUTES } from '@/lib/constants';
import type { CustomerFormData } from '../types/customer.types';

interface UseCustomerFormHandlersProps {
  customerFormState: any;
  onSubmit: (data: CustomerFormData) => void;
}

export const useCustomerFormHandlers = ({
  customerFormState,
  onSubmit
}: UseCustomerFormHandlersProps) => {
  const navigate = useNavigate();
  const onBack = () => navigate(ROUTES.CUSTOMERS.LIST);

  const scrollToField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const handleSave = () => {
    // Validation checks
    const errors: string[] = [];

    // 1. First Name
    if (!customerFormState.firstName.trim()) {
      errors.push('First name is required');
      scrollToField('field-firstName');
      notifyError('First name is required');
      return;
    }

    // 2. Last Name (Optional but good to add if we marked it required in UI)
    // The UI shows a red asterisk, so let's validate it
    if (!customerFormState.lastName.trim()) {
      errors.push('Last name is required');
      scrollToField('field-lastName');
      notifyError('Last name is required');
      return;
    }

    // 3. Email
    const primaryEmailObj = customerFormState.emails?.find((e: any) => e.isPrimary) || customerFormState.emails?.[0];
    const primaryEmail = primaryEmailObj?.email;

    if (!primaryEmail || !primaryEmail.includes('@')) {
      errors.push('A valid email address is required');
      scrollToField('field-email');
      notifyError('A valid email address is required');
      return;
    }

    if (!primaryEmailObj?.isVerified) {
      errors.push('Primary email must be verified');
      scrollToField('field-email');
      notifyError('Primary email must be verified before proceeding');
      return;
    }

    // 4. Phone
    const primaryPhoneObj = customerFormState.phones?.find((p: any) => p.isPrimary) || customerFormState.phones?.[0];
    const primaryPhone = primaryPhoneObj?.phone;

    if (primaryPhone && primaryPhone.length !== 10) {
      errors.push('Phone number must be exactly 10 digits');
      scrollToField('field-phone');
      notifyError('Phone number must be exactly 10 digits');
      return;
    }

    // 4. Customer Segment - Commented out (no longer required)
    // if (!customerFormState.customerSegment || customerFormState.customerSegment.length === 0) {
    //   errors.push('Customer segment is required');
    //   scrollToField('field-customerSegment');
    //   toast.error('Customer segment is required');
    //   return;
    // }

    // If we have any errors (though returns above handle them one by one)
    if (errors.length > 0) {
      notifyError('Please fill in all required fields');
      return;
    }

    const formData = customerFormState.getFormData();
    onSubmit(formData);
    // Note: Success/error toast is handled in the onSubmit callback
  };

  // Adapter for SubscriptionSection
  const handleSubscriptionUpdate = (updater: any) => {
    const current = {
      subscriptionPlan: customerFormState.subscriptionPlan,
      subscriptionStatus: customerFormState.subscriptionStatus,
      billingCycle: customerFormState.billingCycle,
      subscriptionStartDate: customerFormState.subscriptionStartDate,
      subscriptionEndDate: customerFormState.subscriptionEndDate,
      autoRenew: customerFormState.autoRenew
    };
    const updated = typeof updater === 'function' ? updater(current as any) : updater;

    if (updated.autoRenew !== current.autoRenew) customerFormState.setAutoRenew(updated.autoRenew || false);
    if (updated.subscriptionPlan !== current.subscriptionPlan) customerFormState.setSubscriptionPlan(updated.subscriptionPlan || '');
    if (updated.subscriptionStatus !== current.subscriptionStatus) customerFormState.setSubscriptionStatus(updated.subscriptionStatus || '');
    if (updated.billingCycle !== current.billingCycle) customerFormState.setBillingCycle(updated.billingCycle || '');
    if (updated.subscriptionStartDate !== current.subscriptionStartDate) customerFormState.setSubscriptionStartDate(updated.subscriptionStartDate || '');
    if (updated.subscriptionEndDate !== current.subscriptionEndDate) customerFormState.setSubscriptionEndDate(updated.subscriptionEndDate || '');
  };

  // Adapter for LoyaltySection
  const handleLoyaltyUpdate = (updater: any) => {
    const current = {
      loyaltyEnrolled: customerFormState.loyaltyEnrolled,
      loyaltyTier: customerFormState.loyaltyTier,
      loyaltyPoints: customerFormState.loyaltyPoints,
      loyaltyEnrollmentDate: customerFormState.loyaltyEnrollmentDate
    };
    const updated = typeof updater === 'function' ? updater(current as any) : updater;

    if (updated.loyaltyEnrolled !== current.loyaltyEnrolled) customerFormState.setLoyaltyEnrolled(updated.loyaltyEnrolled || false);
    if (updated.loyaltyTier !== current.loyaltyTier) customerFormState.setLoyaltyTier(updated.loyaltyTier || '');
    if (updated.loyaltyEnrollmentDate !== current.loyaltyEnrollmentDate) customerFormState.setLoyaltyEnrollmentDate(updated.loyaltyEnrollmentDate || '');
    // Points are typically read-only/calculated, but if editable:
    if (updated.loyaltyPoints !== current.loyaltyPoints) customerFormState.setLoyaltyPoints(updated.loyaltyPoints || 0);
  };

  return {
    onBack,
    handleSave,
    handleSubscriptionUpdate,
    handleLoyaltyUpdate
  };
};
