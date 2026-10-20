import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layouts/headers";
import { UnsavedChangesGuard } from "@/components/guards/UnsavedChangesGuard";
import PersonalInformation from "../components/PersonalInformation";
import SecurityLogin from "../components/SecurityLogin";
import NotificationPreferences from "../components/NotificationPreferences";
import useProfile from "../hooks/useProfile";
import { uploadService } from "@/services/uploadService";
import type { ProfileFormData } from "../types";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("personal");

  const {
    profile,
    securitySettings,
    notificationPreferences,
    appearanceSettings,
    activeSessions,
    loginHistory,
    updateProfile,
    updateNotificationPreferences,
    logoutAllSessions,
    logoutSession,
    changePassword,
    enrollMfa,
    verifyMfa,
    disableMfa,
  } = useProfile();

  // Lifted state
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Store initial values to compare for dirty state
  const initialValuesRef = useRef<Partial<ProfileFormData>>({});
  const initialImageUrlRef = useRef<string | null>(null);

  // Unsaved changes handling
  // Handled by UnsavedChangesGuard

  // Initialize form data once when profile loads
  useEffect(() => {
    if (profile && Object.keys(formData).length === 0) {
      const initialData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: (profile as any).phoneNumber || (profile as any).phone_number || '',
        timezone: profile.timezone || appearanceSettings?.timezone || 'Asia/Kolkata',
        preferredLanguage: profile.preferredLanguage || appearanceSettings?.preferredLanguage || 'en',
        dateTimeFormat: profile.dateTimeFormat || appearanceSettings?.dateTimeFormat || 'MM/DD/YYYY',
      };
      setFormData(initialData);
      initialValuesRef.current = initialData;

      const imageUrl = profile.profileImageUrl || null;
      setImagePreview(imageUrl);
      initialImageUrlRef.current = imageUrl;
    }
  }, [profile, appearanceSettings]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDiscardChanges = () => {
    // Reset the form first
    resetForm();
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    let newValue = value;
    // For phone number, only allow numeric input
    if (field === 'phoneNumber') {
      newValue = value.replace(/\D/g, ''); // Remove all non-digit characters
      if (newValue.length > 10) return; // Limit to 10 digits
    }

    setFormData(prev => {
      const updated = { ...prev, [field]: newValue };
      // Simple dirty check (can be improved with deep comparison if needed, but here flat fields work)
      // Actually, comparing against profile is better. But useEffect resets it.
      // Let's set isDirty to true on any change for now, or check against initial.
      // For simplicity in this phase, we assume any change makes it dirty. 
      // Ideally we check: newValue !== originalValue.
      // But we don't have easy access to original value inside this callback unless we use ref or closure.
      // We'll set isDirty(true). The cancel button resets it.
      return updated;
    });
    setIsDirty(true);

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      // Revoke previous blob URL to prevent memory leak
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setIsDirty(true);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    // Revoke blob URL if exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData(initialValuesRef.current);
    setImageFile(null);
    setImagePreview(initialImageUrlRef.current);
    setIsDirty(false);
    setErrors({});
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSaveProfile = async () => {
    try {
      const newErrors: Record<string, string> = {};

      if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
      if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
        newErrors.phoneNumber = "Phone number must be 10 digits";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      let profileImageUrl = profile?.profileImageUrl;

      if (imageFile) {
        try {
          const response = await uploadService.uploadFile(imageFile, { folder: 'profile-images' });
          profileImageUrl = response.file_url || undefined;
        } catch (uploadError) {
          console.error("Image upload failed", uploadError);
          return;
        }
      }

      await updateProfile({
        ...formData,
        timezone: formData.timezone,
        preferredLanguage: formData.preferredLanguage,
        profileImageUrl: profileImageUrl ?? undefined,
      });

      // Update initial values ref after successful save
      initialValuesRef.current = { ...formData };
      initialImageUrlRef.current = profileImageUrl || null;

      if (formData.firstName || profileImageUrl) {
        window.dispatchEvent(new CustomEvent('profileNameUpdated', {
          detail: {
            firstName: formData.firstName,
            name: `${formData.firstName} ${formData.lastName || ''}`.trim(),
            profileImageUrl
          }
        }));
      }

      // Clean up blob URL if exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(null);
      setImagePreview(profileImageUrl || null);
      setIsDirty(false);
      setErrors({});
    } catch (err) {
      console.error("Validation error", err);
    }
  };

  // ... (loading/error checks) 

  const tabs = [
    { id: "personal", label: "Personal Information" },
    { id: "security", label: "Security & Login" },
    { id: "notifications", label: "Notification Preferences" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <PersonalInformation
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              imagePreview={imagePreview}
            />
          </div>
        );
      case "security":
        return (
          <div className="">
            <SecurityLogin
              securitySettings={securitySettings}
              activeSessions={activeSessions}
              loginHistory={loginHistory}
              onLogoutAllSessions={logoutAllSessions}
              onLogoutSession={logoutSession}
              onChangePassword={changePassword}
              onEnrollMfa={enrollMfa}
              onVerifyMfa={verifyMfa}
              onDisableMfa={disableMfa}
            />
          </div>
        );
      case "notifications":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <NotificationPreferences
              preferences={notificationPreferences}
              onUpdate={updateNotificationPreferences}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <UnsavedChangesGuard hasChanges={isDirty} onDiscard={handleDiscardChanges}>
      <div className="flex flex-col min-h-screen bg-slate-50">

        {/* Header */}
        <PageHeader
          title="Profile"
          subtitle="Manage your personal details, security, and preferences"
          breadcrumbs={[
            { label: "Dashboard", onClick: handleBack },
            { label: "Profile", active: true }
          ]}
          backIcon="arrow"
          onBack={handleBack}
          actions={
            activeTab === 'personal' && isDirty ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="rounded-xl h-[44px] px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm"
                >
                  Save Changes
                </Button>
              </>
            ) : null
          }
          className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm mb-0"
        />


        <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-2 pb-6 space-y-6">
          <div className="flex gap-2 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 transition-all border-b-2 ${activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 font-medium"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  }`}
              >
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </UnsavedChangesGuard>
  );
};

export default ProfilePage;