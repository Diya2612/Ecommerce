import React, { useState } from 'react';
import { MoreVertical, Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { type CustomerFormProps } from '@/features/customers/types/customer.types';
import { useCustomerForm } from '../hooks/useCustomerForm';
import { useCustomerFormHandlers } from '../hooks/useCustomerFormHandlers';
import {
    BasicInformationSection,
    ContactInformationSection,
    AddressesSection,
    ClassificationSection
} from './form-sections';
import {
    VerificationSection,
    // SecuritySection,
    OrderOverviewSection,
    ActivityTimelineSection,
    PaymentInfoSection,
} from './edit-sections';
import { NotesTags } from '@/features/notes/components';
import { AddressModal } from '../modals/AddressModal';
import { PageHeader } from '@/components/layouts/headers';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { useNavigate } from 'react-router-dom';

export const CustomerForm: React.FC<CustomerFormProps> = ({
    initialData,
    onSubmit,
    isEditMode = false,
    customerName,
    customerId,
    onDelete,
    breadcrumbs,
    orders,
    payments,
    ordersPagination,
    paymentsPagination,
    onNavigateToOrder,
    activities = [],
    isActivitiesLoading = false,
    activityFilter = 'all',
    onActivityFilterChange
}) => {
    const customerFormState = useCustomerForm(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const handleFormSubmit = (data: any) => {
        setIsSaving(true);
        setTimeout(() => onSubmit(data), 0);
    };

    const handlers = useCustomerFormHandlers({
        customerFormState,
        onSubmit: handleFormSubmit
    });

    const handleBack = () => {
        navigate(ROUTES.CUSTOMERS.LIST);
    };

    return (
        <UnsavedChangesGuard hasChanges={customerFormState.hasChanges && !isSaving}>
            <div className="flex-1 w-full">
                <PageHeader
                    title={isEditMode ? (customerName || 'Edit Customer') : 'Add Customer'}
                    subtitle={isEditMode ? `Customer ID: ${customerFormState.customerId || '---'}` : 'Create a new customer profile with comprehensive details'}
                    breadcrumbs={breadcrumbs || [
                        { label: 'Customers', onClick: handleBack },
                        { label: isEditMode ? 'Edit' : 'Add New', active: true }
                    ]}
                    backIcon="arrow"
                    onBack={handleBack}
                    actions={
                        <>
                            {/* Show Cancel and Save only when there are changes (in edit mode) or always in add mode */}
                            {(!isEditMode || customerFormState.hasChanges) && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="rounded-xl h-[44px] px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlers.handleSave}
                                        disabled={isSaving}
                                        className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm"
                                    >
                                        {isSaving ? "Saving..." : isEditMode ? 'Save Changes' : (
                                            <>
                                                <Plus className="size-[18px]" />
                                                Add Customer
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}

                            {isEditMode && onDelete && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10">
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                            <Trash2 className="size-4 mr-2" />
                                            Delete Customer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </>
                    }
                />

                <ConfirmationDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={() => {
                        setShowDeleteDialog(false);
                        onDelete?.();
                    }}
                    title="Delete Customer"
                    description="Are you sure you want to delete this customer? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />


                <div className="px-6 lg:px-8 pb-8">
                    {/* Main Layout: 2-Column */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* LEFT COLUMN - All Content (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 1. Basic Information */}
                            <BasicInformationSection
                                profilePreview={customerFormState.profilePreview}
                                firstName={customerFormState.firstName}
                                setFirstName={customerFormState.setFirstName}
                                lastName={customerFormState.lastName}
                                setLastName={customerFormState.setLastName}
                                displayName={customerFormState.displayName}
                                setDisplayName={customerFormState.setDisplayName}
                                fullName={customerFormState.fullName}
                                customerId={customerFormState.customerId}
                                gender={customerFormState.gender}
                                setGender={customerFormState.setGender}
                                dateOfBirth={customerFormState.dateOfBirth}
                                setDateOfBirth={customerFormState.setDateOfBirth}
                                handleProfileImageChange={customerFormState.handleProfileImageChange}
                                handleRemoveImage={customerFormState.handleRemoveImage}
                            />

                            {/* 2. Contact Information (Merged) */}
                            <ContactInformationSection
                                emails={customerFormState.emails}
                                handleAddEmail={customerFormState.handleAddEmail}
                                handleRemoveEmail={customerFormState.handleRemoveEmail}
                                handleEmailChange={customerFormState.handleEmailChange}
                                handleSetPrimaryEmail={customerFormState.handleSetPrimaryEmail}
                                handleVerifyEmail={customerFormState.handleVerifyEmail}
                                handleVerifyOtp={customerFormState.handleVerifyOtp}
                                phones={customerFormState.phones}
                                handleAddPhone={customerFormState.handleAddPhone}
                                handleRemovePhone={customerFormState.handleRemovePhone}
                                handlePhoneChange={customerFormState.handlePhoneChange}
                                handleSetPrimaryPhone={customerFormState.handleSetPrimaryPhone}
                                handleVerifyPhone={customerFormState.handleVerifyPhone}
                                handleVerifyPhoneOtp={customerFormState.handleVerifyPhoneOtp}
                            />

                            {/* 3. Customer Addresses */}
                            <AddressesSection
                                addresses={customerFormState.addresses}
                                handleOpenAddressModal={customerFormState.handleOpenAddressModal}
                                handleEditAddress={customerFormState.handleEditAddress}
                                handleDeleteAddress={customerFormState.handleDeleteAddress}
                            />



                            {/* Order Overview - Edit Mode Only */}
                            {isEditMode && (
                                <OrderOverviewSection
                                    orders={orders}
                                    pagination={ordersPagination}
                                    onNavigateToOrder={onNavigateToOrder}
                                />
                            )}

                            {/* Payment Information - Edit Mode Only */}
                            {isEditMode && (
                                <PaymentInfoSection transactions={payments} pagination={paymentsPagination} />
                            )}




                            {/* Cart Abandonment - Commented Out */}
                            {/* {isEditMode && (
                            <AbandonedCartsSection
                                cartId="CART-2024-789"
                                abandonedOn="2024-12-15 08:30 PM"
                                totalValue="₹47,498"
                                products={[
                                    { id: '1', name: 'Nintendo Switch OLED', quantity: 1, price: '₹34,999' },
                                    { id: '2', name: 'Joy-Con Controllers', quantity: 2, price: '₹5,999' },
                                    { id: '3', name: 'Screen Protector', quantity: 1, price: '₹499' },
                                    { id: '4', name: 'Carrying Case', quantity: 1, price: '₹1,999' },
                                    { id: '5', name: 'Nintendo eShop Card', quantity: 2, price: '₹4,002' },
                                ]}
                                onClearCart={() => console.log('Clear cart')}
                                onSendReminder={() => console.log('Send reminder')}
                                onDeleteProduct={(productId) => console.log('Delete product:', productId)}
                            />
                        )} */}

                        </div>


                        {/* RIGHT COLUMN (1/3 width) */}
                        <div className="space-y-6">

                            {/* Customer Classification & Control (Moved here) */}
                            <ClassificationSection
                                accountStatus={customerFormState.accountStatus}
                                setAccountStatus={customerFormState.setAccountStatus}
                            />


                            {/* Subscription - Commented Out */}
                            {/* <SubscriptionSection
                            formData={{
                                subscriptionPlan: customerFormState.subscriptionPlan,
                                subscriptionStatus: customerFormState.subscriptionStatus,
                                billingCycle: customerFormState.billingCycle,
                                subscriptionStartDate: customerFormState.subscriptionStartDate,
                                autoRenew: customerFormState.autoRenew
                            } as any}
                            setFormData={handlers.handleSubscriptionUpdate}
                            isEditing={true}
                        /> */}


                            {/* Loyalty Program - Commented Out */}
                            {/* <LoyaltySection
                            formData={{
                                loyaltyEnrolled: customerFormState.loyaltyEnrolled,
                                loyaltyTier: customerFormState.loyaltyTier,
                                loyaltyPoints: customerFormState.loyaltyPoints,
                                loyaltyEnrollmentDate: customerFormState.loyaltyEnrollmentDate
                            } as any}
                            setFormData={handlers.handleLoyaltyUpdate}
                            isEditing={true}
                        /> */}


                            {/* Preferences & Communication - Commented Out */}
                            {/* <PreferencesSection
                            marketingPreferences={customerFormState.marketingPreferences}
                            setMarketingPreferences={customerFormState.setMarketingPreferences}
                            emailNotifications={customerFormState.emailNotifications}
                            setEmailNotifications={customerFormState.setEmailNotifications}
                            smsNotifications={customerFormState.smsNotifications}
                            setSmsNotifications={customerFormState.setSmsNotifications}
                            whatsappNotifications={customerFormState.whatsappNotifications}
                            setWhatsappNotifications={customerFormState.setWhatsappNotifications}
                            emailSubscription={customerFormState.emailSubscription}
                            setEmailSubscription={customerFormState.setEmailSubscription}
                        /> */}




                            {/* Notes & Tags (Centralized) */}
                            <NotesTags
                                adminComment={customerFormState.internalNotes}
                                onAdminCommentChange={(val) => customerFormState.setInternalNotes(val)}
                                tags={customerFormState.internalTags}
                                onTagsChange={(tags) => customerFormState.setInternalTags(tags)}
                                availableTags={customerFormState.availableTags}
                                showCustomerNote={false}
                                tagType="customer"
                                onTagCreated={customerFormState.handleTagCreated}
                            />



                            {/* Verification (New) */}
                            <VerificationSection
                                formData={{
                                    emailVerified: customerFormState.emails.some(e => e.isVerified),
                                    phoneVerified: customerFormState.phones.some(p => p.isVerified),
                                    gdprStatus: customerFormState.gdprStatus,
                                    privacyPolicyVersion: customerFormState.privacyPolicyVersion,
                                    marketingConsentDate: customerFormState.marketingConsentDate
                                } as any}
                            />

                            {/* Security */}
                            {/* <SecuritySection
                            formData={{
                                lastLoginDate: customerFormState.lastLoginDate,
                                lastLoginIP: customerFormState.lastLoginIP,
                                lastLogoutDate: customerFormState.lastLogoutDate,
                                failedLoginAttempts: customerFormState.failedLoginAttempts,
                                accountLockedUntil: customerFormState.accountLockedUntil
                            } as any}
                        /> */}

                            {/* Activity Timeline - Edit Mode Only */}
                            {isEditMode && (
                                <ActivityTimelineSection
                                    activities={activities}
                                    isLoading={isActivitiesLoading}
                                    currentFilter={activityFilter}
                                    onFilterChange={onActivityFilterChange}
                                />
                            )}




                        </div>
                    </div>

                    {/* Address Modal */}
                    <AddressModal
                        isOpen={customerFormState.isAddressModalOpen}
                        onClose={() => customerFormState.setIsAddressModalOpen(false)}
                        editingAddressId={customerFormState.editingAddressId}
                        addressName={customerFormState.addressName}
                        setAddressName={customerFormState.setAddressName}
                        addressCountry={customerFormState.addressCountry}
                        setAddressCountry={customerFormState.setAddressCountry}
                        addressState={customerFormState.addressState}
                        setAddressState={customerFormState.setAddressState}
                        addressCity={customerFormState.addressCity}
                        setAddressCity={customerFormState.setAddressCity}
                        addressPincode={customerFormState.addressPincode}
                        setAddressPincode={customerFormState.setAddressPincode}
                        addressStreet1={customerFormState.addressStreet1}
                        setAddressStreet1={customerFormState.setAddressStreet1}
                        addressStreet2={customerFormState.addressStreet2}
                        setAddressStreet2={customerFormState.setAddressStreet2}
                        addressLandmark={customerFormState.addressLandmark}
                        setAddressLandmark={customerFormState.setAddressLandmark}
                        addressType={customerFormState.addressType}
                        setAddressType={customerFormState.setAddressType}
                        isDefaultBilling={customerFormState.isDefaultBilling}
                        setIsDefaultBilling={customerFormState.setIsDefaultBilling}
                        isDefaultShipping={customerFormState.isDefaultShipping}
                        setIsDefaultShipping={customerFormState.setIsDefaultShipping}
                        onSave={customerFormState.handleSaveAddress}
                    />
                </div>
            </div>
        </UnsavedChangesGuard>
    );
};
