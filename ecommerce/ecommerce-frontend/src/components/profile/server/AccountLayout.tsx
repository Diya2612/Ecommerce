"use client";

import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  Key,
  Bell,
  Smartphone,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Trash2,
  Edit,
} from "lucide-react";
import { EditProfileDialog } from "../client/EditProfileDialog";
import type { UserProfile } from "@/queries/users/types";
import { format } from "date-fns";

import { motion, AnimatePresence } from "motion/react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/MobileSheet";
import { triggerHaptic } from "@/hooks/gestures/useHaptic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResetPasswordForm } from "@/components/auth";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AccountLayoutProps {
  user: UserProfile;
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => {
        if (!disabled) {
          triggerHaptic("light");
          onToggle();
        }
      }}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${enabled ? "bg-[#00C4CC]" : "bg-gray-300 dark:bg-slate-600"
        } ${disabled ? "opacity-50" : ""}`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

// Settings Row Component
function SettingsRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  action,
  showChevron = false,
  onClick,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`w-9 h-9 lg:w-10 lg:h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
      {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={() => {
          triggerHaptic("light");
          onClick();
        }}
        className="w-full text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 -mx-3 px-3 rounded-xl transition-colors"
      >
        {content}
      </button>
    );
  }

  return content;
}

// Section Card Component
function SectionCard({
  children,
  title,
  icon: Icon,
  iconBg,
  iconColor,
  action,
  delay = 0,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  action?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 lg:p-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 lg:w-12 lg:h-12 ${iconBg} rounded-xl flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${iconColor}`} />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function AccountLayout({ user }: AccountLayoutProps) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    triggerHaptic("medium");
    // This will be handled by the LogoutButton
    setLogoutConfirmOpen(false);
  }, []);

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      // Mock delete for now, or call API if available
      toast.success("Account deletion request submitted.");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Personal Information Section */}
      <SectionCard
        title="Personal Information"
        icon={User}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        delay={0.1}
        action={
          <Button
            size="sm"
            onClick={() => {
              triggerHaptic("light");
              setEditProfileOpen(true);
            }}
            className="bg-[#0B1F51] hover:bg-[#00C4CC] text-white border-0 rounded-lg px-4 h-9 text-xs font-semibold shadow-md transition-all duration-300 gap-2"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
        }
      >
        <div className="space-y-3">
          {/* Name Row */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              First Name
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.first_name || "Not set"}
            </span>
          </div>
          {/* Last Name Row */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last Name
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.last_name || "Not set"}
            </span>
          </div>
          {/* Display Name Row */}
          {user.display_name && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Display Name
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.display_name}
              </span>
            </div>
          )}
          {/* Email Row */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Email
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate ml-4 max-w-[180px]">
              {user.email}
            </span>
          </div>
          {/* Secondary Email Row */}
          {user.secondary_email && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Secondary Email
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate ml-4 max-w-[180px]">
                {user.secondary_email}
              </span>
            </div>
          )}

          {/* Phone Row */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Phone
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.phone_number || user.phone || "Not set"}
            </span>
          </div>
          {/* Secondary Phone Row */}
          {user.secondary_phone_number && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Secondary Phone
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.secondary_phone_number}
              </span>
            </div>
          )}

          {/* Date of Birth */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Date of Birth
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.date_of_birth
                ? format(new Date(user.date_of_birth), "PPP")
                : "Not set"}
            </span>
          </div>

          {/* Gender */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Gender
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {user.gender ? user.gender.replace("_", " ") : "Not set"}
            </span>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Language
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.preferred_language || "en"}
            </span>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Currency
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.preferred_currency || "INR"}
            </span>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Timezone
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.timezone || "Asia/Kolkata"}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Notifications Section - Mobile Only */}
      <div className="lg:hidden">
        <SectionCard
          title="Notifications"
          icon={Bell}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          delay={0.15}
        >
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            <SettingsRow
              icon={Smartphone}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
              title="Push Notifications"
              subtitle="Order updates, offers & more"
              action={
                <ToggleSwitch
                  enabled={pushNotifications}
                  onToggle={() => setPushNotifications(!pushNotifications)}
                />
              }
            />
            <SettingsRow
              icon={Mail}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
              title="Email Notifications"
              subtitle="Invoice, newsletters"
              action={
                <ToggleSwitch
                  enabled={emailNotifications}
                  onToggle={() => setEmailNotifications(!emailNotifications)}
                />
              }
            />
          </div>
        </SectionCard>
      </div>

      {/* Security Section */}
      <SectionCard
        title="Security"
        icon={Shield}
        iconBg="bg-[#00C4CC]/10"
        iconColor="text-[#00C4CC]"
        delay={0.2}
      >
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {/* Password */}
          <SettingsRow
            icon={Key}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600"
            title="Change Password"
            subtitle="Last changed 3 months ago"
            showChevron
            onClick={() => setChangePasswordOpen(true)}
          />


        </div>
      </SectionCard>

      {/* App Preferences - Mobile Only */}
      <div className="lg:hidden">
        <SectionCard
          title="App Preferences"
          icon={Smartphone}
          iconBg="bg-gray-100 dark:bg-slate-700"
          iconColor="text-gray-600 dark:text-gray-400"
          delay={0.25}
        >
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            <SettingsRow
              icon={Moon}
              iconBg="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600"
              title="Dark Mode"
              subtitle="Toggle dark theme"
              action={<ToggleSwitch enabled={false} onToggle={() => { }} />}
            />
          </div>
        </SectionCard>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-2"
      >
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-500 mb-1">
                Danger Zone
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logout Confirmation Dialog - Mobile */}
      <AlertDialog
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        destructive
      />

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <ResetPasswordForm
            mode="change"
            hasPassword={user.hasPassword ?? true}
            onSuccess={async () => {
              setChangePasswordOpen(false);
              await signOut();
              router.push('/login');
              toast.success("Password changed successfully. Please log in again.");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        initialUser={user}
      />
    </div>
  );
}
