"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Calendar as CalendarIcon,
  Phone,
  Loader2,
  ChevronLeft,
  Sparkles,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserProfile } from "@/queries/users/types";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "@/hooks/queries/useUser";
import { triggerHaptic } from "@/hooks/gestures/useHaptic";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

// ============================================================================
// Schema
// ============================================================================

const profileFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  display_name: z.string().optional().or(z.literal("")),
  phone_number: z
    .string()
    .min(10, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  secondary_email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  secondary_phone_number: z.string().optional().or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  email: z.string().email(),
  preferred_language: z.string().optional(),
  preferred_currency: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// ============================================================================
// Props
// ============================================================================

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser: UserProfile;
}

// ============================================================================
// Styled Components (Reused from AddressFormModal)
// ============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormFieldWrapper({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const StyledInput = ({
  className,
  ...props
}: React.ComponentProps<typeof Input>) => (
  <Input
    className={cn(
      "h-12 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700",
      "focus:border-[#00C4CC] focus:ring-[#00C4CC]/20",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      className,
    )}
    {...props}
  />
);

export function EditProfileDialog({
  isOpen,
  onClose,
  initialUser,
}: EditProfileDialogProps) {
  const router = useRouter();
  const { updateProfile, isUpdating } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: initialUser.first_name || initialUser.name?.split(' ')[0] || "",
      last_name: initialUser.last_name || "",
      display_name: initialUser.display_name || "",
      email: initialUser.email,
      phone_number: initialUser.phone_number || initialUser.phone || "",
      secondary_email: initialUser.secondary_email || "",
      secondary_phone_number: initialUser.secondary_phone_number || "",
      dob: initialUser.date_of_birth || undefined,
      gender: initialUser.gender || undefined,
      preferred_language: initialUser.preferred_language || "en",
      preferred_currency: initialUser.preferred_currency || "INR",
      timezone: initialUser.timezone || "Asia/Kolkata",
    },
  });

  const selectedGender = watch("gender");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isOpen) {
      reset({
        first_name: initialUser.first_name || initialUser.name?.split(' ')[0] || "",
        last_name: initialUser.last_name || "",
        display_name: initialUser.display_name || "",
        email: initialUser.email,
        phone_number: initialUser.phone_number || initialUser.phone || "",
        secondary_email: initialUser.secondary_email || "",
        secondary_phone_number: initialUser.secondary_phone_number || "",
        dob: initialUser.date_of_birth || undefined,
        gender: initialUser.gender || undefined,
        preferred_language: initialUser.preferred_language || "en",
        preferred_currency: initialUser.preferred_currency || "INR",
        timezone: initialUser.timezone || "Asia/Kolkata",
      });
    }
  }, [isOpen, initialUser, reset]);

  const handleClose = () => {
    triggerHaptic("light");
    onClose();
  };

  const onSubmit = async (data: ProfileFormData) => {

    try {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        phone_number: data.phone_number,
        secondary_email: data.secondary_email,
        secondary_phone_number: data.secondary_phone_number,
        date_of_birth: data.dob,
        gender: data.gender,
        preferred_language: data.preferred_language,
        preferred_currency: data.preferred_currency,
        timezone: data.timezone,
      });
      triggerHaptic("success");
      router.refresh();
      onClose();
    } catch (error) {
      triggerHaptic("error");
      console.error(error);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Validation errors:", errors);
    triggerHaptic("error");
    const firstError = Object.values(errors)[0] as any;
    toast.error(firstError?.message || "Please check the form for errors");
  };

  const GenderButton = ({
    value,
    label,
  }: {
    value: NonNullable<ProfileFormData["gender"]>;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => {
        triggerHaptic("light");
        setValue("gender", value, { shouldValidate: true });
      }}
      className={cn(
        "h-12 px-4 rounded-xl border-2 transition-all text-sm font-medium",
        selectedGender === value
          ? "border-[#00C4CC] bg-[#00C4CC]/5 text-[#00C4CC]"
          : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-gray-500 hover:border-[#00C4CC]/50",
      )}
    >
      {label}
    </button>
  );

  const FormContent = () => (
    <div className="space-y-6">
      {/* Basic Info Group */}
      <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-[#00C4CC]" />
          Personal Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            label="First Name"
            error={errors.first_name?.message}
            required
          >
            <StyledInput placeholder="First Name" {...register("first_name")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Last Name" error={errors.last_name?.message}>
            <StyledInput placeholder="Last Name" {...register("last_name")} />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper label="Display Name">
          <StyledInput
            placeholder="Display Name (optional)"
            {...register("display_name")}
          />
        </FormFieldWrapper>
      </div>

      {/* Contact info */}
      <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <Phone className="w-4 h-4 text-[#00C4CC]" />
          Contact Information
        </h3>

        <FormFieldWrapper label="Email Address">
          <div className="relative">
            <StyledInput
              {...register("email")}
              disabled
              className="bg-gray-100 dark:bg-slate-800 text-gray-500 cursor-not-allowed pl-10"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </FormFieldWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            label="Phone Number"
            error={errors.phone_number?.message}
          >
            <div className="relative">
              <StyledInput
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                {...register("phone_number")}
                className="pl-10"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper label="Secondary Phone">
            <StyledInput
              type="tel"
              placeholder="Secondary Phone (optional)"
              {...register("secondary_phone_number")}
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          label="Secondary Email"
          error={errors.secondary_email?.message}
        >
          <StyledInput
            type="email"
            placeholder="Secondary Email (optional)"
            {...register("secondary_email")}
          />
        </FormFieldWrapper>
      </div>

      {/* Additional Info Group */}
      <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#00C4CC]" />
          Additional Details
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
              Date of Birth
            </Label>
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 rounded-xl border-gray-200 dark:border-slate-700 justify-start text-left font-normal bg-white dark:bg-slate-900 hover:bg-white",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[200]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Format as YYYY-MM-DD using local time to avoid timezone shifts
                          const offset = date.getTimezoneOffset();
                          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                          const dateString = localDate.toISOString().split('T')[0];
                          field.onChange(dateString);
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Preferences */}
          <FormFieldWrapper label="Preferred Language">
            <StyledInput placeholder="en" {...register("preferred_language")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Currency">
            <StyledInput
              placeholder="INR"
              {...register("preferred_currency")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Timezone">
            <StyledInput placeholder="Asia/Kolkata" {...register("timezone")} />
          </FormFieldWrapper>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900 dark:text-white">
            Gender
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <GenderButton value="male" label="Male" />
            <GenderButton value="female" label="Female" />
            <GenderButton value="other" label="Other" />
            <GenderButton value="prefer_not_to_say" label="Prefer not to say" />
          </div>
        </div>
      </div>
    </div>
  );

  // ... (onSubmit, onInvalid, GenderButton, FormContent implementation)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-90 bg-black/60 backdrop-blur-sm"
          />

          {!isDesktop ? (
            /* Mobile: Full Screen */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 top-0 z-100 bg-white dark:bg-slate-900 flex flex-col lg:hidden"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              {/* Mobile Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex-1 text-center pr-10">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Edit Profile
                  </h2>
                </div>
              </div>

              {/* Form Content */}
              <form
                ref={formRef}
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="flex-1 overflow-y-auto p-5 space-y-6"
              >
                <FormContent />
                <div className="pb-32" />
              </form>

              {/* Mobile Save Button */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 z-10 pb-[env(safe-area-inset-bottom)]">
                <Button
                  type="button"
                  onClick={() => formRef.current?.requestSubmit()}
                  disabled={isUpdating}
                  className="w-full h-14 bg-[#0B1F51] dark:bg-[#00C4CC] text-white dark:text-black rounded-2xl font-bold text-lg"
                >
                  {isUpdating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Desktop: Centered Modal */
            <div className="hidden lg:flex fixed inset-0 z-100 items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-white/20 dark:border-white/10"
              >
                {/* Desktop Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-6 h-6 text-[#00C4CC]" />
                      Edit Profile
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your personal information
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Desktop Form */}
                <form
                  onSubmit={handleSubmit(onSubmit, onInvalid)}
                  className="flex-1 overflow-y-auto p-8"
                >
                  <FormContent />
                </form>

                {/* Desktop Footer */}
                <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-gray-100 dark:border-slate-800 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="h-12 px-6 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }}
                    disabled={isUpdating}
                    className="h-12 px-8 bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-xl font-semibold transition-all"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
