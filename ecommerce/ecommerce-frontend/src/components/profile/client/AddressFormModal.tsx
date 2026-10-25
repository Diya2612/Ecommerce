"use client";

import { useEffect, useRef, useState } from 'react';
import { X, MapPin, User, Home, Building, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Address } from '@/lib/data/profile/types';
import { motion, AnimatePresence } from 'motion/react';
import { useAddresses } from '@/hooks/queries/useAddresses';
import { triggerHaptic } from '@/hooks/gestures/useHaptic';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';
import { getIndianStates, getCitiesByState, type State } from '@/services/locationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ============================================================================
// Schema
// ============================================================================

// Form data type with all required fields for react-hook-form
type AddressFormData = {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    type: 'Home' | 'Office' | 'Other';
    isDefault: boolean;
};

const addressFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
    type: z.enum(['Home', 'Office', 'Other']),
    isDefault: z.boolean(),
}) satisfies z.ZodType<AddressFormData>;

// ============================================================================
// Props
// ============================================================================

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    address?: Address | null;
    onSuccess?: (newAddress?: any) => void;
}

// ============================================================================
// Styled Form Field Component
// ============================================================================

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

function FormFieldWrapper({ label, error, required, children }: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {children}
            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}

// Styled Input with current design
const StyledInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
    <Input
        className={cn(
            "h-12 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700",
            "focus:border-[#00C4CC] focus:ring-[#00C4CC]/20",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            className
        )}
        {...props}
    />
);

// ============================================================================
// Component
// ============================================================================

export function AddressFormModal({ isOpen, onClose, address, onSuccess }: AddressFormModalProps) {
    const isEditMode = !!address;
    const { createAddress, updateAddress, isCreating, isUpdating } = useAddresses();
    const isSubmitting = isCreating || isUpdating;
    const formRef = useRef<HTMLFormElement>(null);

    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            type: 'Home',
            isDefault: false,
        },
    });

    const selectedType = watch('type');
    const isDefault = watch('isDefault');
    const watchState = watch('state');

    // Fetch States on Mount
    useEffect(() => {
        const fetchStates = async () => {
            setLoadingStates(true);
            const data = await getIndianStates();
            setStates(data);
            setLoadingStates(false);
        };
        fetchStates();
    }, []);

    // Fetch Cities when State changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!watchState) {
                setCities([]);
                return;
            }
            // If editing, and we just set the state, don't clear city immediately if it's the same
            // Logic handled by the fact that if we just mounted, state is populated.

            setLoadingCities(true);
            const data = await getCitiesByState(watchState);
            setCities(data);
            setLoadingCities(false);
        };

        fetchCities();
    }, [watchState]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Populate form when editing
    useEffect(() => {
        if (address && isOpen) {
            reset({
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1 || address.addressLine || '',
                addressLine2: address.addressLine2 || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                type: address.type,
                isDefault: address.isDefault,
            });
        } else if (!isOpen) {
            reset({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                type: 'Home',
                isDefault: false,
            });
        }
    }, [address, isOpen, reset]);

    const handleClose = () => {
        triggerHaptic('light');
        onClose();
    };

    const onSubmit = async (data: AddressFormData) => {
        try {
            let result: any = null;
            if (isEditMode && address) {
                result = await updateAddress({
                    id: address.id,
                    data: {
                        name: data.name,
                        phone: data.phone,
                        addressLine1: data.addressLine1,
                        addressLine2: data.addressLine2 || undefined,
                        city: data.city,
                        state: data.state,
                        pincode: data.pincode,
                        type: data.type,
                        isDefault: data.isDefault,
                    },
                });
            } else {
                result = await createAddress({
                    name: data.name,
                    phone: data.phone,
                    addressLine1: data.addressLine1,
                    addressLine2: data.addressLine2 || undefined,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    type: data.type,
                    isDefault: data.isDefault,
                });
            }

            triggerHaptic('success');
            onSuccess?.(result);
            onClose();
        } catch (error: any) {
            triggerHaptic('error');
            console.error('Failed to save address:', error);
            toast.error(error?.message || "Failed to save address. Please try again.");
        }
    };

    const onInvalid = (errors: any) => {
        console.error('Validation errors:', errors);
        triggerHaptic('error');

        // Get first error message
        const firstError = Object.values(errors)[0] as any;
        toast.error(firstError?.message || "Please check the form for errors");
    };

    // Type selection buttons
    const TypeButton = ({ type, icon: Icon }: { type: 'Home' | 'Office' | 'Other'; icon: any }) => (
        <button
            type="button"
            onClick={() => {
                triggerHaptic('light');
                setValue('type', type, { shouldValidate: true });
            }}
            className={cn(
                "relative h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                selectedType === type
                    ? 'border-[#00C4CC] bg-[#00C4CC]/5 text-[#00C4CC]'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-gray-500 hover:border-[#00C4CC]/50'
            )}
        >
            <div className={cn(
                "p-2 rounded-full",
                selectedType === type ? 'bg-[#00C4CC] text-white' : 'bg-gray-100 dark:bg-slate-700'
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold">{type}</span>
        </button>
    );

    const FormContent = () => (
        <div className="space-y-6">
            {/* Type Selection */}
            <div>
                <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                    Address Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    <TypeButton type="Home" icon={Home} />
                    <TypeButton type="Office" icon={Building} />
                    <TypeButton type="Other" icon={MapPin} />
                </div>
                {errors.type && (
                    <p className="text-xs text-red-500 font-medium mt-2">{errors.type.message}</p>
                )}
            </div>

            {/* Personal Details Group */}
            <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-[#00C4CC]" />
                    Personal Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormFieldWrapper label="Full Name" error={errors.name?.message} required>
                        <StyledInput
                            placeholder="John Doe"
                            {...register('name')}
                            aria-invalid={!!errors.name}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Phone Number" error={errors.phone?.message} required>
                        <StyledInput
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            {...register('phone')}
                            aria-invalid={!!errors.phone}
                        />
                    </FormFieldWrapper>
                </div>
            </div>

            {/* Address Details Group */}
            <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#00C4CC]" />
                    Address Details
                </h3>
                <FormFieldWrapper label="Address Line 1" error={errors.addressLine1?.message} required>
                    <StyledInput
                        placeholder="House/Flat No., Building Name"
                        {...register('addressLine1')}
                        aria-invalid={!!errors.addressLine1}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper label="Address Line 2" error={errors.addressLine2?.message}>
                    <StyledInput
                        placeholder="Street, Landmark (Optional)"
                        {...register('addressLine2')}
                    />
                </FormFieldWrapper>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormFieldWrapper label="State" error={errors.state?.message} required>
                        <Controller
                            control={control}
                            name="state"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        // Reset city when state changes
                                        setValue('city', '');
                                    }}
                                    disabled={loadingStates}
                                >
                                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                                        <SelectValue placeholder={loadingStates ? "Loading..." : "Select State"} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        {states.map((state) => (
                                            <SelectItem key={state.name} value={state.name}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="City" error={errors.city?.message} required>
                         <Controller
                            control={control}
                            name="city"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={!watchState || loadingCities}
                                >
                                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                                        <SelectValue placeholder={
                                            !watchState 
                                                ? "Select State First" 
                                                : loadingCities 
                                                    ? "Loading..." 
                                                    : "Select City"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        {cities.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormFieldWrapper>
                    
                    <FormFieldWrapper label="PIN Code" error={errors.pincode?.message} required>
                        <StyledInput
                            placeholder="400001"
                            maxLength={6}
                            {...register('pincode')}
                            aria-invalid={!!errors.pincode}
                        />
                    </FormFieldWrapper>
                </div>
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30">
                <Controller
                    name="isDefault"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="isDefault"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 rounded-md border-2 data-[state=checked]:bg-[#00C4CC] data-[state=checked]:border-[#00C4CC]"
                        />
                    )}
                />
                <Label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Set as default address
                </Label>
            </div>
        </div>
    );

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
                        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Mobile: Full Screen */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-x-0 bottom-0 top-0 z-[100] bg-white dark:bg-slate-900 flex flex-col lg:hidden"
                        style={{ paddingTop: 'env(safe-area-inset-top)' }}
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
                                    {isEditMode ? 'Edit Address' : 'New Address'}
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
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 z-10 pb-[env(safe-area-inset-bottom)]">
                            <Button
                                type="button"
                                onClick={() => formRef.current?.requestSubmit()}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-[#0B1F51] dark:bg-[#00C4CC] text-white dark:text-black rounded-2xl font-bold text-lg"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    'Save Address'
                                )}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Desktop: Centered Modal */}
                    <div className="hidden lg:flex fixed inset-0 z-[100] items-center justify-center p-6">
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
                                        {isEditMode ? (
                                            <>
                                                <Sparkles className="w-5 h-5 text-[#00C4CC]" />
                                                Edit Address
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-6 h-6 text-[#00C4CC]" />
                                                Add New Address
                                            </>
                                        )}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Fill in the details below
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
                                    form="addressForm"
                                    onClick={() => {
                                        const form = document.querySelector('form');
                                        form?.requestSubmit();
                                    }}
                                    disabled={isSubmitting}
                                    className="h-12 px-8 bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-xl font-semibold transition-all"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Save Address'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
