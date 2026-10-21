'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signUp, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        // Split name into first_name and last_name
        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ') || '';

        // Pass detailed name info to signUp
        const { error, needsEmailConfirmation, emailAlreadyExists } = await signUp(email, password, {
            name, // Keep full name for display/fallback
            first_name,
            last_name
        });

        if (error) {
            setError(error.message);
            return;
        }

        // Check if email already exists (OAuth or verified email/password account)
        if (emailAlreadyExists) {
            setError('This email is already registered. Please log in or use "Forgot Password" to reset your password.');
            return;
        }

        if (needsEmailConfirmation) {
            // Redirect to confirmation page with email
            router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
        } else {
            // Auto-login successful, redirect to profile
            router.push('/profile');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        disabled={isLoading}
                        className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
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
                    Confirm Password
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

            <div className="flex items-start">
                <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-[#31CDD4] focus:ring-[#31CDD4]"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#31CDD4] hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-[#31CDD4] hover:underline">
                        Privacy Policy
                    </Link>
                </label>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    'Create Account'
                )}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-[#31CDD4] hover:text-[#28b8bf] transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
}
