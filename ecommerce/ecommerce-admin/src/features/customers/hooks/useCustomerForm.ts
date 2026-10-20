import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import _ from "lodash";
import { customerService } from "../services/customerService";
import type {
  CustomerFormData,
  CustomerEmail,
  CustomerPhone,
  CustomerAddress,
} from "../types/customer.types";

export function useCustomerForm(initialData?: CustomerFormData) {
  // Basic Information
  // Profile Image State
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    initialData?.profileImage && typeof initialData.profileImage === "string"
      ? initialData.profileImage
      : null,
  );
  const [profilePreview, setProfilePreview] = useState<string | null>(
    initialData?.profileImage && typeof initialData.profileImage === "string"
      ? initialData.profileImage
      : null,
  );

  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [displayName, setDisplayName] = useState(
    initialData?.displayName || "",
  );
  const [gender, setGender] = useState(initialData?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData?.dateOfBirth || "",
  );
  const [language, setLanguage] = useState<string[]>(
    initialData?.language || [],
  );
  const [customerType, setCustomerType] = useState<
    "Distributor" | "Retail" | "Wholesale"
  >(initialData?.customerType || "Retail");
  const [customerSegment, setCustomerSegment] = useState<string[]>(
    initialData?.segment || [],
  );

  // New Fields for Edit Parity
  const [internalTags, setInternalTags] = useState<string[]>(
    initialData?.internalTags || [],
  );
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internalNotes || "",
  );
  const [availableTags] = useState<string[]>([]);

  const handleTagCreated = () => {};

  // Loyalty
  const [loyaltyEnrolled, setLoyaltyEnrolled] = useState(
    initialData?.loyaltyEnrolled || false,
  );
  const [loyaltyTier, setLoyaltyTier] = useState(
    initialData?.loyaltyTier || "Bronze",
  );
  const [loyaltyPoints, setLoyaltyPoints] = useState(
    initialData?.loyaltyPoints || 0,
  );
  const [loyaltyEnrollmentDate, setLoyaltyEnrollmentDate] = useState(
    initialData?.loyaltyEnrollmentDate || "",
  );

  // Subscription
  const [subscriptionPlan, setSubscriptionPlan] = useState(
    initialData?.subscriptionPlan || "",
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(
    initialData?.subscriptionStatus || "",
  );
  const [billingCycle, setBillingCycle] = useState<any>(
    initialData?.billingCycle || "",
  );
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    initialData?.subscriptionStartDate || "",
  );
  const [autoRenew, setAutoRenew] = useState(initialData?.autoRenew || false);

  /* Contact Tab */
  const [emails, setEmails] = useState<CustomerEmail[]>([
    {
      id: "1",
      email: initialData?.email || "",
      type: "work",
      isPrimary: true,
      isVerified: initialData?.emailVerified || false,
      showOtp: false,
      otpValue: "",
    },
  ]);
  const [phones, setPhones] = useState<CustomerPhone[]>([
    {
      id: "1",
      phone: initialData?.phone || "",
      type: "mobile",
      isPrimary: true,
      isVerified: initialData?.phoneVerified || false,
      showOtp: false,
      otpValue: "",
    },
  ]);

  // Address Tab
  const [addresses, setAddresses] = useState<CustomerAddress[]>(
    initialData?.addresses || [],
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form state
  const [addressName, setAddressName] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressPincode, setAddressPincode] = useState("");
  const [addressStreet1, setAddressStreet1] = useState("");
  const [addressStreet2, setAddressStreet2] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressType, setAddressType] = useState("home");
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);

  // Customer Classification & Control
  const [riskProfile, setRiskProfile] = useState("low");
  const [accountStatus, setAccountStatus] = useState<boolean>(
    initialData?.status ? initialData.status === "Active" : true,
  );

  // Preferences & Communication
  const [marketingPreferences, setMarketingPreferences] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [emailSubscription, setEmailSubscription] = useState(true);

  // Verification & Compliance
  const [gdprStatus, setGdprStatus] = useState(initialData?.gdprStatus || "");
  const [privacyPolicyVersion, setPrivacyPolicyVersion] = useState(
    initialData?.privacyPolicyVersion || "",
  );
  const [marketingConsentDate, setMarketingConsentDate] = useState(
    initialData?.marketingConsentDate || "",
  );

  // Security & Login
  const [lastLoginDate] = useState(initialData?.lastLoginDate || "");
  const [lastLoginIP] = useState(initialData?.lastLoginIP || "");
  const [lastLogoutDate] = useState(initialData?.lastLogoutDate || "");
  const [failedLoginAttempts] = useState(initialData?.failedLoginAttempts || 0);
  const [accountLockedUntil] = useState(
    initialData?.accountLockedUntil || null,
  );

  // Auto-generated fields
  const fullName = `${firstName} ${lastName}`.trim();
  const [customerId, setCustomerId] = useState<string>(
    initialData?.customerId || `CUST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  );

  // --- Change Detection ---
  const [initialSnapshot, setInitialSnapshot] = useState<any>(null);

  // Use a ref to track the last applied initialData to prevent loops/resets
  const lastInitialDataRef = useRef<string>("");

  useEffect(() => {
    if (initialData) {
      const dataString = JSON.stringify(initialData);
      if (lastInitialDataRef.current === dataString) {
        return; // Data hasn't changed, don't reset form
      }
      lastInitialDataRef.current = dataString;

      // First sync the form state
      // First sync the form state
      if (initialData.customerId) {
        setCustomerId(initialData.customerId);
      }
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setDisplayName(initialData.displayName || "");
      setGender(initialData.gender || "");
      setDateOfBirth(initialData.dateOfBirth || "");
      setLanguage(initialData.language || []);
      setCustomerType(initialData.customerType || "Retail");
      setCustomerSegment(initialData.segment || []);
      setInternalTags(initialData.internalTags || []);
      setInternalNotes(initialData.internalNotes || "");

      setLoyaltyEnrolled(initialData.loyaltyEnrolled || false);
      setLoyaltyTier(initialData.loyaltyTier || "Bronze");
      setLoyaltyPoints(initialData.loyaltyPoints || 0);
      setLoyaltyEnrollmentDate(initialData.loyaltyEnrollmentDate || "");

      setSubscriptionPlan(initialData.subscriptionPlan || "");
      setSubscriptionStatus(initialData.subscriptionStatus || "");
      setBillingCycle(initialData.billingCycle || "");
      setSubscriptionStartDate(initialData.subscriptionStartDate || "");
      setAutoRenew(initialData.autoRenew || false);

      setAccountStatus(initialData.status ? initialData.status === 'Active' : true);

      // Emails - include secondary email if present
      const emailsList: any[] = [
        {
          id: "1",
          email: initialData.email || "",
          type: (initialData.emailType as any) || "personal",
          isPrimary: true,
          isVerified: initialData.emailVerified || false,
          showOtp: false,
          otpValue: "",
        },
      ];
      if (initialData.secondaryEmail) {
        emailsList.push({
          id: "2",
          email: initialData.secondaryEmail,
          type: (initialData.secondaryEmailType as any) || "work",
          isPrimary: false,
          isVerified: initialData.secondaryEmailVerified || false,
          showOtp: false,
          otpValue: "",
        });
      }
      setEmails(emailsList);

      // Phones - include secondary phone if present
      const phonesList: any[] = [
        {
          id: "1",
          phone: initialData.phone || "",
          type: (initialData.phoneType as any) || "mobile",
          isPrimary: true,
          isVerified: initialData.phoneVerified || false,
          showOtp: false,
          otpValue: "",
        },
      ];
      if (initialData.secondaryPhone) {
        phonesList.push({
          id: "2",
          phone: initialData.secondaryPhone,
          type: (initialData.secondaryPhoneType as any) || "work",
          isPrimary: false,
          isVerified: false,
          showOtp: false,
          otpValue: "",
        });
      }
      setPhones(phonesList);

      setAddresses(initialData.addresses || []);

      setProfileImageUrl(
        typeof initialData.profileImage === "string"
          ? initialData.profileImage
          : null,
      );
      setProfilePreview(
        typeof initialData.profileImage === "string"
          ? initialData.profileImage
          : null,
      );
      setProfileImageFile(null); // Reset pending file on load

      setGdprStatus(initialData.gdprStatus || "");
      setPrivacyPolicyVersion(initialData.privacyPolicyVersion || "");
      setMarketingConsentDate(initialData.marketingConsentDate || "");

      // Then capture the snapshot (so hasChanges starts as false)
      setInitialSnapshot({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        displayName: initialData.displayName || "",
        customerType: initialData.customerType || "Retail",
        segment: initialData.segment || [],
        internalTags: initialData.internalTags || [],
        internalNotes: initialData.internalNotes || "",
        gender: initialData.gender || "",
        dateOfBirth: initialData.dateOfBirth || "",
        language: initialData.language || [],
        loyaltyEnrolled: initialData.loyaltyEnrolled || false,
        loyaltyTier: initialData.loyaltyTier || "Bronze",
        loyaltyPoints: initialData.loyaltyPoints || 0,
        loyaltyEnrollmentDate: initialData.loyaltyEnrollmentDate || "",
        subscriptionPlan: initialData.subscriptionPlan || "",
        subscriptionStatus: initialData.subscriptionStatus || "",
        billingCycle: initialData.billingCycle || "",
        subscriptionStartDate: initialData.subscriptionStartDate || "",
        autoRenew: initialData.autoRenew || false,
        accountStatus: initialData.status
          ? initialData.status === "Active"
          : true,
        emails: emailsList.map((e) => ({
          email: e.email,
          type: e.type,
          isPrimary: e.isPrimary,
        })),
        phones: phonesList.map((p) => ({
          phone: p.phone,
          type: p.type,
          isPrimary: p.isPrimary,
        })),
        profileImageUrl:
          typeof initialData.profileImage === "string"
            ? initialData.profileImage
            : null,
        addresses: (initialData.addresses || []).map((addr: any) => ({
          name: addr.name,
          country: addr.country,
          state: addr.state,
          city: addr.city,
          pincode: addr.pincode,
          streetAddress1: addr.streetAddress1,
          streetAddress2: addr.streetAddress2,
          landmark: addr.landmark,
          addressType: addr.addressType,
          isDefaultBilling: addr.isDefaultBilling,
          isDefaultShipping: addr.isDefaultShipping,
        })),
      });
    } else {
      // Add Mode: Set default snapshot matches initial state
      setInitialSnapshot({
        firstName: "",
        lastName: "",
        displayName: "",
        customerType: "Retail",
        segment: [],
        internalTags: [],
        internalNotes: "",
        gender: "",
        dateOfBirth: "",
        language: [],
        loyaltyEnrolled: false,
        loyaltyTier: "Bronze",
        loyaltyPoints: 0,
        loyaltyEnrollmentDate: "",
        subscriptionPlan: "",
        subscriptionStatus: "",
        billingCycle: "",
        subscriptionStartDate: "",
        autoRenew: false,
        accountStatus: true,
        // Match default state: one empty email/phone
        emails: [
          {
            email: "",
            type: "work",
            isPrimary: true,
          },
        ],
        phones: [
          {
            phone: "",
            type: "mobile",
            isPrimary: true,
          },
        ],
        profileImageUrl: null,
        addresses: [],
      });
    }
  }, [initialData]);

  // Check for changes - Expanded to detect changes in all form fields using lodash
  const hasChanges = (() => {
    if (!initialSnapshot) return false;

    const current = {
      firstName,
      lastName,
      displayName,
      customerType,
      segment: customerSegment,
      internalTags,
      internalNotes,
      gender,
      dateOfBirth,
      language,
      loyaltyEnrolled,
      loyaltyTier,
      loyaltyPoints,
      loyaltyEnrollmentDate,
      subscriptionPlan,
      subscriptionStatus,
      billingCycle,
      subscriptionStartDate,
      autoRenew,
      accountStatus,
      emails: emails.map((e) => ({
        email: e.email,
        type: e.type,
        isPrimary: e.isPrimary,
      })),
      phones: phones.map((p) => ({
        phone: p.phone,
        type: p.type,
        isPrimary: p.isPrimary,
      })),
      addresses: addresses.map(addr => ({
        name: addr.name,
        country: addr.country,
        state: addr.state,
        city: addr.city,
        pincode: addr.pincode,
        streetAddress1: addr.streetAddress1,
        streetAddress2: addr.streetAddress2,
        landmark: addr.landmark,
        addressType: addr.addressType,
        isDefaultBilling: addr.isDefaultBilling,
        isDefaultShipping: addr.isDefaultShipping,
      })),
      profileImageUrl,
    };

    // Use lodash for deep comparison
    return !_.isEqual(current, initialSnapshot) || profileImageFile !== null;
  })();

  // Profile Image Handlers
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Store file for deferred upload
      setProfileImageFile(file);

      // 2. Create immediate local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setProfileImageUrl(null);
    setProfilePreview(null);
  };

  // Email Handlers
  const handleAddEmail = () => {
    setEmails((prev) => {
      if (prev.length >= 2) return prev;
      return [
        ...prev,
        {
          id: Date.now().toString(),
          email: "",
          type: "work",
          isPrimary: false,
          isVerified: false,
          showOtp: false,
          otpValue: "",
        },
      ];
    });
  };

  const handleRemoveEmail = (id: string) => {
    setEmails((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.id !== id);
    });
  };

  const handleEmailChange = (
    id: string,
    field: keyof CustomerEmail,
    value: any,
  ) => {
    setEmails((prevEmails) =>
      prevEmails.map((e) => {
        if (e.id !== id) return e;

        // If email changes, unverify
        if (field === "email") {
          return { ...e, [field]: value, isVerified: false };
        }
        return { ...e, [field]: value };
      }),
    );
  };

  const handleSetPrimaryEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => ({ ...e, isPrimary: e.id === id })));
  };

  const handleVerifyEmail = async (id: string) => {
    const emailItem = emails.find((e) => e.id === id);
    if (!emailItem || !emailItem.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // 1. Check if email already exists
      const checkResult = await customerService.checkEmailExists(emailItem.email);
      if (checkResult?.data?.exists) {
        toast.error("Email already exists. Please use a different email address.");
        return;
      }

      // 2. Call real API to send OTP
      await customerService.sendEmailOtp(emailItem.email);

      handleEmailChange(id, "showOtp", true);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to send verification code";
      toast.error(message);
    }
  };

  const handleVerifyOtp = async (id: string) => {
    const emailItem = emails.find((e) => e.id === id);
    if (!emailItem || emailItem.otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // Call real API to verify OTP
      const result = await customerService.verifyEmailOtp(
        emailItem.email,
        emailItem.otpValue,
      );

      if (result.verified) {
        handleEmailChange(id, "isVerified", true);
        handleEmailChange(id, "showOtp", false);
        toast.success("Email verified successfully!");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "OTP verification failed";
      toast.error(message);
    }
  };

  // Phone Handlers
  const handleAddPhone = () => {
    setPhones((prev) => {
      if (prev.length >= 2) return prev;
      return [
        ...prev,
        {
          id: Date.now().toString(),
          phone: "",
          type: "mobile",
          isPrimary: false,
          isVerified: false,
          showOtp: false,
          otpValue: "",
        },
      ];
    });
  };

  const handleRemovePhone = (id: string) => {
    setPhones((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  };

  const handlePhoneChange = (
    id: string,
    field: keyof CustomerPhone,
    value: any,
  ) => {
    let newValue = value;

    if (field === 'phone') {
      // Remove all non-numeric characters
      newValue = value.replace(/\D/g, '');

      // Limit to 10 digits (local number without country code)
      if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }
    }

    setPhones((prevPhones) =>
      prevPhones.map((p) => (p.id === id ? { ...p, [field]: newValue } : p)),
    );
  };

  const handleSetPrimaryPhone = (id: string) => {
    setPhones((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })));
  };

  const handleVerifyPhone = (id: string) => {
    const phone = phones.find((p) => p.id === id);
    if (!phone || phone.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    handlePhoneChange(id, "showOtp", true);
    toast.success("Verification code sent to your phone");
  };

  const handleVerifyPhoneOtp = (id: string) => {
    const phone = phones.find((p) => p.id === id);
    if (!phone || phone.otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    handlePhoneChange(id, "isVerified", true);
    handlePhoneChange(id, "showOtp", false);
    toast.success("Phone number verified successfully!");
  };

  // Address Handlers
  const handleOpenAddressModal = () => {
    setEditingAddressId(null);
    clearAddressForm();
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddressId(address.id);
    setAddressName(address.name || "");
    setAddressCountry(address.country);
    setAddressState(address.state);
    setAddressCity(address.city);
    setAddressPincode(address.pincode);
    setAddressStreet1(address.streetAddress1);
    setAddressStreet2(address.streetAddress2);
    setAddressLandmark(address.landmark);
    setAddressType(address.addressType);
    setIsDefaultBilling(address.isDefaultBilling);
    setIsDefaultShipping(address.isDefaultShipping);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.success("Address removed");
  };

  const clearAddressForm = () => {
    setAddressName("");
    setAddressCountry("");
    setAddressState("");
    setAddressCity("");
    setAddressPincode("");
    setAddressStreet1("");
    setAddressStreet2("");
    setAddressLandmark("");
    setAddressType("home");
    setIsDefaultBilling(false);
    setIsDefaultShipping(false);
  };

  const handleSaveAddress = () => {
    if (!addressStreet1 || !addressCity || !addressPincode) {
      toast.error("Please fill in required address fields");
      return;
    }

    if (addressPincode.length !== 6) {
      toast.error("Pincode must be exactly 6 digits");
      return;
    }

    // Check for duplicate address
    const duplicate = addresses.find(
      (addr) =>
        addr.id !== editingAddressId &&
        addr.streetAddress1?.toLowerCase() === addressStreet1.toLowerCase() &&
        addr.pincode === addressPincode,
    );

    if (duplicate) {
      toast.error("This address already exists");
      return;
    }

    const newAddress: CustomerAddress = {
      id: editingAddressId || `addr-${Date.now()}`,
      name: addressName,
      country: addressCountry,
      state: addressState,
      city: addressCity,
      pincode: addressPincode,
      streetAddress1: addressStreet1,
      streetAddress2: addressStreet2,
      landmark: addressLandmark,
      addressType,
      isDefaultBilling,
      isDefaultShipping,
    };

    let updatedAddresses = [...addresses];

    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map((addr) =>
        addr.id === editingAddressId ? newAddress : addr,
      );
      toast.success("Address updated successfully");
    } else {
      updatedAddresses.push(newAddress);
      toast.success("Address added successfully");
    }

    // Ensure unique defaults
    if (isDefaultBilling) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefaultBilling: addr.id === newAddress.id,
      }));
    }

    if (isDefaultShipping) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefaultShipping: addr.id === newAddress.id,
      }));
    }

    setAddresses(updatedAddresses);
    setIsAddressModalOpen(false);
    clearAddressForm();
  };

  // Build form data for submission
  const getFormData = (): CustomerFormData => {
    const primaryEmail =
      emails.find((e) => e.isPrimary)?.email || emails[0]?.email || "";
    const primaryPhone =
      phones.find((p) => p.isPrimary)?.phone || phones[0]?.phone || "";

    // Secondary contacts: find any non-primary entry with a valid value
    // If all entries are primary (shouldn't happen), use the 2nd entry if it exists and has a value
    const secondaryEmailEntry =
      emails.find((e) => !e.isPrimary && e.email && e.email.trim() !== "") ||
      (emails.length > 1 &&
        emails[1]?.email &&
        emails[1]?.email !== primaryEmail
        ? emails[1]
        : undefined);
    const secondaryPhoneEntry =
      phones.find((p) => !p.isPrimary && p.phone && p.phone.trim() !== "") ||
      (phones.length > 1 &&
        phones[1]?.phone &&
        phones[1]?.phone !== primaryPhone
        ? phones[1]
        : undefined);

    const billing = addresses.find((a) => a.isDefaultBilling) || addresses[0];
    const shipping = addresses.find((a) => a.isDefaultShipping) || addresses[0];

    return {
      firstName,
      lastName,
      displayName,
      email: primaryEmail,
      emailType: emails.find((e) => e.isPrimary)?.type || emails[0]?.type || 'personal',
      phone: primaryPhone,
      phoneType: phones.find((p) => p.isPrimary)?.type || phones[0]?.type || 'mobile',
      secondaryEmail: secondaryEmailEntry?.email || null,
      secondaryEmailType: secondaryEmailEntry?.type || 'work',
      secondaryPhone: secondaryPhoneEntry?.phone || null,
      secondaryPhoneType: secondaryPhoneEntry?.type || 'work',
      // Include verification status for primary/secondary swap support
      emailVerified: emails.find((e) => e.isPrimary)?.isVerified || false,
      secondaryEmailVerified: secondaryEmailEntry?.isVerified || false,
      customerType: customerType,
      status: accountStatus ? 'Active' : 'Inactive',
      sameAsShipping: false,
      profileImage: profileImageUrl, // Send current URL (if any). If null, it means deleted.
      profileImageFile: profileImageFile || undefined, // Send pending file
      gender: gender,
      dateOfBirth: dateOfBirth,
      language: language,

      // New Fields
      internalTags,
      internalNotes,
      loyaltyEnrolled,
      loyaltyTier,
      loyaltyPoints,
      loyaltyEnrollmentDate,
      subscriptionPlan,
      subscriptionStatus,
      billingCycle,
      subscriptionStartDate,
      autoRenew,

      billingAddress: billing
        ? {
          addressLine1: billing.streetAddress1,
          addressLine2: billing.streetAddress2,
          city: billing.city,
          state: billing.state,
          postalCode: billing.pincode,
          country: billing.country,
          landmark: billing.landmark,
        }
        : undefined,
      shippingAddress: shipping
        ? {
          addressLine1: shipping.streetAddress1,
          addressLine2: shipping.streetAddress2,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.pincode,
          country: shipping.country,
          landmark: shipping.landmark,
        }
        : undefined,
      addresses: addresses,
      metadata: {
        phone_types: {
          primary: phones.find((p) => p.isPrimary)?.type || 'mobile',
          secondary: (phones.find((p) => !p.isPrimary) || phones[1])?.type || 'work',
        }
      }
    };
  };

  // Account Status Handler
  const handleAccountStatusChange = (isActive: boolean) => {
    setAccountStatus(isActive);
  };

  return {
    // Basic Information
    profilePreview,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    displayName,
    setDisplayName,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    language,
    setLanguage,
    customerType,
    setCustomerType,
    fullName,
    customerId,

    // Status
    accountStatus,
    setAccountStatus: handleAccountStatusChange, // Use enhanced setter

    // Profile Image
    handleProfileImageChange,
    handleRemoveImage,

    // Emails
    emails,
    handleAddEmail,
    handleRemoveEmail,
    handleEmailChange,
    handleSetPrimaryEmail,
    handleVerifyEmail,
    handleVerifyOtp,

    // Phones
    phones,
    handleAddPhone,
    handleRemovePhone,
    handlePhoneChange,
    handleSetPrimaryPhone,
    handleVerifyPhone,
    handleVerifyPhoneOtp,

    // Addresses
    addresses,
    isAddressModalOpen,
    setIsAddressModalOpen,
    editingAddressId,
    handleOpenAddressModal,
    handleEditAddress,
    handleDeleteAddress,
    handleSaveAddress,

    // Address Form
    addressName,
    setAddressName,
    addressCountry,
    setAddressCountry,
    addressState,
    setAddressState,
    addressCity,
    setAddressCity,
    addressPincode,
    setAddressPincode,
    addressStreet1,
    setAddressStreet1,
    addressStreet2,
    setAddressStreet2,
    addressLandmark,
    setAddressLandmark,
    addressType,
    setAddressType,
    isDefaultBilling,
    setIsDefaultBilling,
    isDefaultShipping,
    setIsDefaultShipping,

    // Classification
    customerSegment,
    setCustomerSegment,
    riskProfile,
    setRiskProfile,

    // Preferences
    marketingPreferences,
    setMarketingPreferences,
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    whatsappNotifications,
    setWhatsappNotifications,
    emailSubscription,
    setEmailSubscription,

    // Verification & Compliance
    gdprStatus,
    setGdprStatus,
    privacyPolicyVersion,
    setPrivacyPolicyVersion,
    marketingConsentDate,
    setMarketingConsentDate,

    // Security & Login
    lastLoginDate,
    lastLoginIP,
    lastLogoutDate,
    failedLoginAttempts,
    accountLockedUntil,

    // Utility
    // Utility
    getFormData,

    // New Fields State (Exposed for wrapper)
    internalTags,
    setInternalTags,
    internalNotes,
    setInternalNotes,
    availableTags,
    handleTagCreated,
    loyaltyEnrolled,
    setLoyaltyEnrolled,
    loyaltyTier,
    setLoyaltyTier,
    loyaltyPoints,
    setLoyaltyPoints,
    loyaltyEnrollmentDate,
    setLoyaltyEnrollmentDate,
    subscriptionPlan,
    setSubscriptionPlan,
    subscriptionStatus,
    setSubscriptionStatus,
    billingCycle,
    setBillingCycle,
    subscriptionStartDate,
    setSubscriptionStartDate,
    autoRenew,
    setAutoRenew,

    // Change Detection
    hasChanges,
  };
}
