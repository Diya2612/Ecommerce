"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Lock, Save, Trash2, Calendar as CalendarIcon, User } from 'lucide-react';
import { FormField, SelectField } from '@/components/forms/FormField';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { UserProfile } from '@/lib/data/profile/types';
import { useUser } from '@/hooks/queries/useUser';
import { motion } from 'motion/react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AccountFormProps {
    initialUser: UserProfile;
    onCancel?: () => void;
}

export function AccountForm({ initialUser, onCancel }: AccountFormProps) {
    const router = useRouter();
    const { updateProfile, isUpdating } = useUser();

    // Local state for form content
    const [formData, setFormData] = useState({
        name: initialUser.name,
        email: initialUser.email,
        phone: initialUser.phone || '',
        dob: initialUser.dob,
        gender: initialUser.gender
    });

    const handleSave = async () => {
        try {
            await updateProfile({
                name: formData.name,
                phone_number: formData.phone,
                date_of_birth: formData.dob,
                gender: formData.gender as any
            });
            // Success toast is handled in hook
            router.refresh(); // Sync server data
        } catch (error) {
            // Error toast handled in hook
            console.error(error);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // Mock delete for now, or call API if available
            toast.success("Account deletion request submitted.");
            // In real app: await api.delete('/user/profile');
            // router.push('/login');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <>
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange(e, 'name')}
                />

                <FormField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e, 'email')}
                    rightIcon={<Mail className="w-5 h-5" />}
                    disabled={true}
                />

                <FormField
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange(e, 'phone')}
                    rightIcon={<Phone className="w-5 h-5" />}
                />

                {/* Gender Field */}
                <SelectField
                    label="Gender"
                    labelIcon={<User className="w-4 h-4" />}
                    value={formData.gender || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, gender: value as any }))}
                    options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                    ]}
                    placeholder="Select gender"
                />

                {/* Date of Birth Field */}
                <div className="flex flex-col w-full">
                    <label className="flex items-center gap-2 text-[16px] font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <CalendarIcon className="w-4 h-4 text-[#00C4CC]" />
                        Date of Birth
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-14 px-6 rounded-input border-2 justify-start text-left font-normal bg-white dark:bg-slate-950",
                                    !formData.dob && "text-muted-foreground",
                                    "border-gray-200 dark:border-slate-700 hover:bg-transparent hover:text-inherit"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.dob ? format(new Date(formData.dob), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-0 shadow-none bg-transparent" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.dob ? new Date(formData.dob) : undefined}
                                onSelect={(date) => setFormData(prev => ({ ...prev, dob: date ? date.toISOString() : undefined }))}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <Button
                    variant="outline"
                    onClick={() => onCancel ? onCancel() : router.refresh()}
                    disabled={isUpdating}
                    className="border-2 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-input h-11 px-6 text-[15px] font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-[#0B1F51] dark:bg-blue-600 text-white hover:bg-[#00C4CC] rounded-input h-11 px-6 text-[15px] font-semibold"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/30 rounded-card p-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-input flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-[24px] font-semibold text-red-600 dark:text-red-400 tracking-[-0.01em]">
                        Danger Zone
                    </h3>
                </div>
                <p className="text-[16px] text-gray-700 dark:text-gray-300 mb-6 leading-[150%]">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="border-2 border-red-600 dark:border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-input h-11 px-6 text-[15px] font-semibold"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                </Button>
            </motion.div>
        </>
    );
}
