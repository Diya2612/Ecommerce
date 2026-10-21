'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/queries/useUser';

export interface ResetPasswordFormProps {
    /** 'reset' = forgot-password flow (new + confirm, Supabase); 'change' = in-app change (current + new + confirm, profile API) */
    mode?: 'reset' | 'change';
    /** Called after successful password change in 'change' mode (e.g. close dialog) */
    onSuccess?: () => void;
    /**
     * True when user has a password set. Drives current-password field visibility:
     * - OAuth + password exists  → true  → show current password
     * - OAuth + password absent  → false → hide current password
     * - No OAuth + password exists → true  → show current password
     * Default true.
     */
    hasPassword?: boolean;
}

export function ResetPasswordForm({ mode = 'reset', onSuccess, hasPassword = true }: ResetPasswordFormProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { changePassword: changePasswordMutation } = useUser();

    useEffect(() => {
        // Supabase includes the access token in the URL hash after password reset email click
        // The auth state will be automatically updated by onAuthStateChange
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'change') {
            // Show/require current password only when user has a password (OAuth+password or email/password)
            const requireCurrentPassword = hasPassword;
            if (requireCurrentPassword && !currentPassword?.trim()) {
                setError('Please enter your current password');
                return;
            }
            if (!password || !confirmPassword) {
                setError('Please fill in all fields');
                return;
            }
        } else {
            if (!password || !confirmPassword) {
                setError('Please fill in all fields');
                return;
            }
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'change') {
                await changePasswordMutation({
                    newPassword: password,
                    ...(hasPassword && currentPassword ? { currentPassword } : {}),
                });
                setSuccess(true);
                onSuccess?.();
            } else {
                const supabase = getSupabaseBrowserClient();

                if (!supabase) {
                    setError('Authentication service is not configured');
                    return;
                }

                const { error } = await supabase.auth.updateUser({
                    password: password,
                });

                if (error) throw error;

                setSuccess(true);

                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err: unknown) {
            setError((err as Error).message || (mode === 'change' ? 'Failed to change password' : 'Failed to reset password'));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-2">
                        Password Updated!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                </div>
                <Link href="/login">
                    <Button className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] rounded-xl">
                        Go to Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0B1F51] dark:text-white mb-2">
                    {mode === 'change'
                        ? hasPassword
                            ? 'Change Password'
                            : 'Set Password'
                        : 'Set New Password'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {mode === 'change'
                        ? hasPassword
                            ? 'Enter your current password and choose a new one'
                            : 'Create a password for your account to sign in with email later'
                        : 'Create a strong password for your account'}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Current password: show only when user has password (OAuth+password or email/password) */}
            {mode === 'change' && hasPassword && (
                <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                            disabled={isLoading}
                            className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                    </>
                ) : (
                    'Update Password'
                )}
            </Button>
        </form>
    );
}
